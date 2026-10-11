import type { Express } from "express";
import type { Server } from "node:http";
import { storage, follows, claims, corrections, nation, admin, ADMIN_TABLES, DB_PATH } from "./storage";
import { registerLiveRoutes, startFeedPoller } from "./routes-live";
import { timingSafeEqual } from "node:crypto";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";
import { insertSubscriberSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import content from "../client/src/data/content.json";

const C: any = content;
const csv = (rows: (string | number)[][]) => rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");

const DATASETS: Record<string, () => (string | number)[][]> = {
  "india-olympic-editions": () => [["Year", "Host", "Athletes", "Gold", "Silver", "Bronze", "Total", "Rank"],
    ...C.OLY_HISTORY.map((r: any) => r.dnp ? [r.y, r.host, "", "", "", "", "", "Did not take part"] : [r.y, r.host, r.ath, r.g, r.s, r.b, r.g + r.s + r.b, r.rank])],
  "india-olympic-medals": () => [["Year", "Medal", "Athlete", "Sport", "Event", "Date"],
    ...C.OLY_MEDALLISTS_RAW.split("\n").map((l: string) => { const [y, m, n, sp, ev, d] = l.split("|"); return [y, ({ G: "Gold", S: "Silver", B: "Bronze" } as any)[m], n, sp, ev, d]; })],
  "india-commonwealth-editions": () => [["Year", "Host", "Gold", "Silver", "Bronze", "Total", "Rank"],
    ...C.CWG_HISTORY.map((r: any) => r.dnp ? [r.y, r.host, "", "", "", "", "Did not take part"] : r.upcoming ? [r.y, r.host, "", "", "", "", "Upcoming"] : [r.y, r.host, r.g, r.s, r.b, r.g + r.s + r.b, r.rank])],
  "asian-games-2026-medal-table": () => [["Rank", "NOC", "Nation", "Gold", "Silver", "Bronze", "Total"],
    ...C.TALLY26.map((r: any[]) => [r[0], r[1], C.NOC[r[1]]?.[0] ?? r[1], r[2], r[3], r[4], r[5]])],
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/subscribe", async (req, res) => {
    const parsed = insertSubscriberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: fromZodError(parsed.error).details[0]?.message ?? "Invalid request" });
    const { subscriber, existed } = await storage.upsertSubscriber(parsed.data);
    res.status(existed ? 200 : 201).json({ email: subscriber.email, existed, total: await storage.countSubscribers() });
  });

  app.get("/api/subscribe/:email", async (req, res) => {
    const s = await storage.findSubscriber(String(req.params.email).toLowerCase());
    if (!s) return res.status(404).json({ message: "Not subscribed" });
    res.json({ email: s.email, interests: JSON.parse(s.interests), lang: s.lang });
  });

  app.delete("/api/subscribe/:email", async (req, res) => {
    const ok = await storage.removeSubscriber(String(req.params.email).toLowerCase());
    res.status(ok ? 200 : 404).json({ removed: ok });
  });

  app.get("/api/stats", async (_req, res) => res.json({ subscribers: await storage.countSubscribers() }));

  app.get("/api/export/:name", (req, res) => {
    const name = String(req.params.name).replace(/\.csv$/, "");
    const make = DATASETS[name];
    if (!make) return res.status(404).json({ message: "Unknown dataset" });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${name}.csv"`);
    res.send(csv(make()));
  });

  const Email = z.string().trim().toLowerCase().email("Enter a valid email address, like name@example.com");
  const Item = z.object({ kind: z.enum(["athlete", "sport", "games", "trials"]), key: z.string().min(1).max(80), label: z.string().min(1).max(120) });
  const err = (e: z.ZodError) => fromZodError(e).details[0]?.message ?? "Invalid request";

  app.post("/api/follow", (req, res) => {
    const p = z.object({ email: Email, items: z.array(Item).min(1).max(50) }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const added = follows.add(p.data.email, p.data.items);
    res.status(201).json({ added, follows: follows.list(p.data.email) });
  });
  app.get("/api/follow/:email", (req, res) => {
    const e = Email.safeParse(req.params.email);
    if (!e.success) return res.status(400).json({ message: err(e.error) });
    const pr = follows.prefs(e.data);
    res.json({ email: e.data, follows: follows.list(e.data), whatsapp: pr?.whatsapp ?? null, channels: pr ? JSON.parse(pr.channels) : ["email"] });
  });
  app.delete("/api/follow/:email/:kind/:key", (req, res) => {
    const removed = follows.remove(String(req.params.email).toLowerCase(), String(req.params.kind), String(req.params.key));
    res.status(removed ? 200 : 404).json({ removed });
  });
  app.put("/api/follow/:email/prefs", (req, res) => {
    const p = z.object({
      whatsapp: z.string().trim().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number, like 98765 43210").nullable().or(z.literal("").transform(() => null)),
      channels: z.array(z.enum(["email", "whatsapp"])).min(1, "Pick at least one way to get alerts"),
    }).safeParse({ ...req.body, whatsapp: typeof req.body?.whatsapp === "string" ? req.body.whatsapp.replace(/[\s-]/g, "") : req.body?.whatsapp });
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    if (p.data.channels.includes("whatsapp") && !p.data.whatsapp) return res.status(400).json({ message: "Add a mobile number to get WhatsApp alerts" });
    const e = String(req.params.email).toLowerCase();
    follows.setPrefs(e, p.data.whatsapp, p.data.channels);
    res.json({ ok: true });
  });

  app.post("/api/claims", (req, res) => {
    const p = z.object({
      listing: z.string().min(1).max(160), kind: z.enum(["sai", "academy"]),
      name: z.string().trim().min(2, "Enter your full name").max(80), role: z.string().trim().min(2, "Tell us your role at the centre").max(80),
      email: Email, phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a phone number with area code, like 011 2338 3336"),
      fees: z.string().max(200).optional().nullable(), coaches: z.string().max(400).optional().nullable(),
      website: z.string().max(200).optional().nullable(), notes: z.string().max(800).optional().nullable(),
    }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const d = p.data;
    const id = claims.add({ listing: d.listing, kind: d.kind, name: d.name, role: d.role, email: d.email, phone: d.phone, fees: d.fees ?? null, coaches: d.coaches ?? null, website: d.website ?? null, notes: d.notes ?? null });
    res.status(201).json({ id, ref: `MI-${String(id).padStart(5, "0")}`, total: claims.count() });
  });
  app.post("/api/corrections", (req, res) => {
    const p = z.object({ page: z.string().trim().min(2, "Tell us which page").max(160), detail: z.string().trim().min(10, "Describe the error in a sentence or two").max(2000),
      source: z.string().trim().max(400).optional().nullable(), email: Email }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const id = corrections.add({ page: p.data.page, detail: p.data.detail, source: p.data.source || null, email: p.data.email });
    res.status(201).json({ id, ref: `MC-${String(id).padStart(5, "0")}` });
  });
  app.get("/api/claims/stats", (_req, res) => res.json({ total: claims.count() }));

  /* ---------- sporting nation ---------- */
  const T = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max);
  const opt = (max: number) => z.string().trim().max(max).optional().nullable().transform(v => v || null);
  const AGE = z.enum(["Under 12", "12–14", "15–17", "18–21", "22+"]);
  app.get("/api/nation/summary", (_req, res) => res.json(nation.summary()));
  app.post("/api/nation/pledge", (req, res) => {
    const p = z.object({ role: z.enum(["parent", "school", "community", "company", "fan"]), actions: z.array(z.string().max(160)).min(1, "Tick at least one action to pledge").max(12), state: opt(60) }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const id = nation.pledge(p.data.role, p.data.actions, p.data.state);
    res.status(201).json({ id, summary: nation.summary().pledges });
  });
  app.post("/api/nation/nominate", (req, res) => {
    const p = z.object({
      athlete: T(2, 80, "Enter the athlete's name"), sport: T(2, 60, "Which sport?"), district: T(2, 60, "Enter the district or town"), state: T(2, 60, "Pick a state"),
      age_band: AGE, achievement: T(20, 600, "Tell us what they have achieved, in at least a sentence"), link: opt(300),
      nominator: T(2, 80, "Enter your name"), email: Email, consent: z.literal(true, { message: "Confirm the athlete, or a parent if under 18, agrees to be featured" }),
    }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const { consent, ...d } = p.data;
    const id = nation.nominate(d as any);
    res.status(201).json({ id, ref: `MS-${String(id).padStart(5, "0")}` });
  });
  app.post("/api/nation/competitions", (req, res) => {
    const p = z.object({
      name: T(4, 120, "Give the event a name"), sport: T(2, 60, "Which sport?"), city: T(2, 60, "Enter the town or city"), state: T(2, 60, "Pick a state"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date").refine(d => new Date(d) >= new Date(Date.now() - 864e5), "The date must be today or later"),
      ages: T(2, 60, "Who can enter? For example, Under 14 boys and girls"), level: z.enum(["Village or block", "District", "State", "Open"]),
      link: opt(300), email: Email,
    }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const id = nation.addCompetition(p.data as any);
    res.status(201).json({ id, ref: `MT-${String(id).padStart(5, "0")}` });
  });
  app.post("/api/nation/requests", (req, res) => {
    const p = z.object({
      sport: T(2, 60, "Which sport?"), state: T(2, 60, "Pick a state"), age_band: AGE, level: z.enum(["District", "State", "National", "International"]),
      need: z.enum(["Equipment and kit", "Coaching fees", "Travel to competitions", "Nutrition and physio", "Full season support"]),
      amount: z.coerce.number().int().min(5000, "Ask for at least ₹5,000").max(1000000, "Keep requests under ₹10 lakh"),
      story: T(30, 800, "Describe recent results and what the money would change, in a few sentences"),
      name: T(2, 80, "Enter the athlete's or parent's name"), email: Email, phone: z.string().trim().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
      guardian: z.boolean().optional(),
    }).safeParse({ ...req.body, phone: typeof req.body?.phone === "string" ? req.body.phone.replace(/[\s-]/g, "") : req.body?.phone });
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    if (["Under 12", "12–14", "15–17"].includes(p.data.age_band) && !p.data.guardian) return res.status(400).json({ message: "A parent or guardian must submit requests for athletes under 18" });
    const { guardian, ...d } = p.data;
    const id = nation.addRequest(d as any);
    res.status(201).json({ id, ref: `MR-${String(id).padStart(5, "0")}` });
  });
  app.post("/api/nation/offers", (req, res) => {
    const p = z.object({
      org: T(2, 120, "Enter your name or organisation"), kind: z.enum(["Individual", "Company", "Foundation or trust", "Club or alumni group"]),
      budget: z.enum(["Under ₹25,000", "₹25,000 to ₹1.2 lakh", "₹1.2 lakh to ₹6.28 lakh", "Over ₹6.28 lakh"]),
      sports: z.string().trim().max(200).default("Any"), states: z.string().trim().max(200).default("Any"),
      request_id: z.number().int().positive().optional().nullable(), contact: T(2, 80, "Who should we speak to?"), email: Email, csr: z.boolean().default(false),
    }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    if (p.data.request_id && !nation.requestExists(p.data.request_id)) return res.status(404).json({ message: "That request is no longer open" });
    const id = nation.addOffer({ ...p.data, request_id: p.data.request_id ?? null, csr: p.data.csr ? 1 : 0 } as any);
    res.status(201).json({ id, ref: `MB-${String(id).padStart(5, "0")}` });
  });

  /* ---------- admin (moderation) ---------- */
  // Set ADMIN_TOKEN (a long random string) to enable. Without it the admin API is switched off.
  const fails = new Map<string, { n: number; at: number }>();
  const requireAdmin = (req: any, res: any, next: any) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token || token.length < 16) return res.status(503).json({ message: "Admin is switched off. Set ADMIN_TOKEN (16+ characters) on the server." });
    const ip = req.ip ?? "?"; const f = fails.get(ip);
    if (f && f.n >= 10 && Date.now() - f.at < 15 * 60e3) return res.status(429).json({ message: "Too many wrong attempts. Try again in 15 minutes." });
    const given = String(req.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const a = Buffer.from(given), b = Buffer.from(token);
    if (a.length !== b.length || !timingSafeEqual(a, b)) { fails.set(ip, { n: (f && Date.now() - f.at < 15 * 60e3 ? f.n : 0) + 1, at: Date.now() }); return res.status(401).json({ message: "Wrong admin token" }); }
    fails.delete(ip); res.set("Cache-Control", "no-store"); next();
  };
  const tableKey = (req: any, res: any) => { const k = String(req.params.table); if (!ADMIN_TABLES[k]) { res.status(404).json({ message: "Unknown table" }); return null; } return k; };
  app.get("/api/admin/overview", requireAdmin, (_req, res) => res.json({ tables: admin.overview(), db: DB_PATH }));
  app.get("/api/admin/:table", requireAdmin, (req, res) => { const k = tableKey(req, res); if (!k) return; res.json({ rows: admin.list(k, typeof req.query.status === "string" ? req.query.status : undefined) }); });
  app.post("/api/admin/:table/:id/status", requireAdmin, (req, res) => {
    const k = tableKey(req, res); if (!k) return;
    const st = String(req.body?.status ?? "");
    if (!ADMIN_TABLES[k].statuses.includes(st)) return res.status(400).json({ message: `Status must be one of: ${ADMIN_TABLES[k].statuses.join(", ") || "none"}` });
    res.json({ ok: admin.setStatus(k, Number(req.params.id), st) });
  });
  app.delete("/api/admin/:table/:id", requireAdmin, (req, res) => { const k = tableKey(req, res); if (!k) return; res.json({ ok: admin.remove(k, Number(req.params.id)) }); });
  app.get("/api/admin/export/:table", requireAdmin, (req, res) => {
    const k = tableKey(req, res); if (!k) return;
    const rows = admin.all(k); const head = rows[0] ? Object.keys(rows[0]) : ["id"];
    res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename="${k}.csv"`);
    res.send(csv([head, ...rows.map(r => head.map(h => r[h] as string))]));
  });
  app.get("/api/admin-backup", requireAdmin, async (_req, res) => {
    const dest = path.join(os.tmpdir(), `momentum-backup-${Date.now()}.db`);
    await admin.backup(dest);
    res.download(dest, `momentum-india-${new Date().toISOString().slice(0, 10)}.db`, () => fs.rm(dest, () => {}));
  });

  registerLiveRoutes(app, requireAdmin);
  startFeedPoller();
  return httpServer;
}
