import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { live, fan, community, ADMIN_TABLES, adminX, type AdminField } from "./storage";

const err = (e: z.ZodError) => fromZodError(e).details[0]?.message ?? "Invalid request";
const Email = z.string().trim().toLowerCase().email("Enter a valid email address, like name@example.com");
const T = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max);
const opt = (max: number) => z.string().trim().max(max).optional().nullable().transform(v => v || null);
const Phone = z.string().trim().transform(v => v.replace(/[\s-]/g, "")).pipe(z.string().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number, like 98765 43210"));
const ref = (p: string, id: number) => `${p}-${String(id).padStart(5, "0")}`;

/* ---------- results feed (item 12: automatic updates) ---------- */
const MedalIn = z.object({ ext_id: z.string().max(120).optional(), games: z.string().max(20).default("apg2026"), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  athlete: z.string().min(1).max(120), sport: z.string().min(1).max(60), event: z.string().min(1).max(160), medal: z.enum(["G", "S", "B"]), state: z.string().max(60).optional().nullable(), link: z.string().max(300).optional().nullable() });
const FixtureIn = z.object({ ext_id: z.string().max(120).optional(), league: z.enum(["isl", "pkl", "hil", "whil"]), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  home: z.string().min(1).max(80), away: z.string().min(1).max(80), venue: z.string().max(120).optional().nullable(),
  home_score: z.number().int().min(0).max(999).optional().nullable(), away_score: z.number().int().min(0).max(999).optional().nullable(), status: z.enum(["scheduled", "live", "final", "postponed"]).default("scheduled") });
export const Feed = z.object({ medals: z.array(MedalIn).max(2000).optional(), fixtures: z.array(FixtureIn).max(2000).optional() });

export function startFeedPoller() {
  const url = process.env.RESULTS_FEED_URL; if (!url) return;
  const mins = Math.max(2, Number(process.env.RESULTS_FEED_MINUTES) || 10);
  const run = async () => {
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error(`Feed returned ${r.status}`);
      const p = Feed.safeParse(await r.json());
      if (!p.success) throw new Error(`Feed format: ${err(p.error)}`);
      const n = live.ingest(p.data, "feed");
      console.log(`[feed] ${n.medals} medals, ${n.fixtures} fixtures`);
    } catch (e: any) { live.logError("feed", String(e?.message ?? e)); console.error("[feed]", e?.message ?? e); }
  };
  run(); setInterval(run, mins * 60e3).unref();
}

/* ---------- admin create/edit from field specs ---------- */
function coerce(fields: AdminField[], body: any, partial: boolean): { row?: Record<string, unknown>; error?: string } {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    let v = body?.[f.name];
    if (v === undefined) { if (!partial && f.required) return { error: `${f.label} is required` }; continue; }
    if (v === "" || v === null) { if (f.required) return { error: `${f.label} is required` }; row[f.name] = null; continue; }
    if (f.type === "number") { v = Number(v); if (!Number.isFinite(v)) return { error: `${f.label} must be a number` }; }
    else {
      v = String(v).trim();
      if ((v as string).length > (f.max ?? 2000)) return { error: `${f.label} is too long` };
      if (f.type === "select" && !f.options!.includes(v as string)) return { error: `${f.label} must be one of ${f.options!.join(", ")}` };
      if (f.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(v as string)) return { error: `${f.label} must be a date` };
      if (f.type === "datetime") { const d = new Date(v as string); if (isNaN(+d)) return { error: `${f.label} must be a date and time` }; v = d.toISOString(); }
    }
    row[f.name] = v;
  }
  return { row };
}

export function registerLiveRoutes(app: Express, requireAdmin: RequestHandler) {
  /* live Games and leagues */
  app.get("/api/live/:games", (req, res) => { res.set("Cache-Control", "no-cache"); res.json(live.medals(String(req.params.games))); });
  app.get("/api/fixtures", (req, res) => { res.set("Cache-Control", "no-cache"); res.json({ fixtures: live.fixtures(typeof req.query.league === "string" ? req.query.league : undefined) }); });

  /* fan zone */
  app.get("/api/fan", (_req, res) => res.json({ questions: fan.questions(), leaderboard: fan.leaderboard(), players: fan.players() }));
  app.get("/api/fan/mine/:email", (req, res) => { const e = Email.safeParse(req.params.email); if (!e.success) return res.status(400).json({ message: err(e.error) }); res.json({ picks: fan.mine(e.data) }); });
  app.post("/api/fan/pick", (req, res) => {
    const p = z.object({ qid: z.number().int().positive(), choice: z.string().min(1).max(120), nickname: T(2, 24, "Pick a nickname of 2 to 24 characters").regex(/^[\p{L}\p{N} ._-]+$/u, "Use letters, numbers and spaces in your nickname"), email: Email }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const qn = fan.question(p.data.qid);
    if (!qn || qn.status !== "open") return res.status(404).json({ message: "That question is closed" });
    if (new Date(qn.closes_at).getTime() <= Date.now()) return res.status(409).json({ message: "Picks for this question have closed" });
    if (!qn.options.split("|").map(s => s.trim()).includes(p.data.choice)) return res.status(400).json({ message: "Pick one of the options" });
    fan.pick(p.data.qid, p.data.nickname, p.data.email, p.data.choice);
    res.status(201).json({ ok: true, questions: fan.questions() });
  });

  /* community: clubs, grounds, gear, successes, districts */
  app.get("/api/community", (_req, res) => res.json({ ...community.stats(), successes: community.successes(), districts: community.districts() }));
  app.get("/api/clubs", (_req, res) => res.json({ clubs: community.clubs() }));
  app.post("/api/clubs", (req, res) => {
    const p = z.object({
      name: T(3, 120, "Enter the club or coach's name"), kind: z.enum(["Club", "Coach", "Academy"]), sport: T(2, 60, "Which sport?"),
      city: T(2, 60, "Enter the town or city"), state: T(2, 60, "Pick a state"), ages: opt(80), fees: opt(120), timings: opt(120), girls_only: z.boolean().default(false),
      about: opt(600), contact_name: T(2, 80, "Who should families contact?"), phone: Phone, email: Email, website: opt(200),
      consent: z.literal(true, { message: "Confirm we may show the contact name, phone and website publicly" }),
    }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const { consent, ...d } = p.data;
    const id = community.addClub({ ...d, girls_only: d.girls_only ? 1 : 0 });
    res.status(201).json({ id, ref: ref("MCL", id) });
  });
  app.get("/api/grounds", (_req, res) => res.json({ grounds: community.grounds() }));
  app.post("/api/grounds", (req, res) => {
    const p = z.object({
      name: T(3, 120, "Name the ground, for example: Government school ground, Rampur"), place: T(2, 80, "Village, ward or town"), district: T(2, 60, "Enter the district"), state: T(2, 60, "Pick a state"),
      sport: T(2, 60, "Main sports played"), need: z.enum(["Levelling and maintenance", "Floodlights", "Equipment", "Toilets and changing rooms", "Drinking water", "Fencing and security"]),
      budget: z.coerce.number().int().min(5000, "Estimate at least ₹5,000").max(5000000, "Keep estimates under ₹50 lakh"),
      story: T(30, 800, "Tell sponsors who plays here and what the money would change"), users: opt(120),
      contact_name: T(2, 80, "Enter your name"), email: Email, phone: Phone,
    }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const id = community.addGround(p.data as any);
    res.status(201).json({ id, ref: ref("MG", id) });
  });
  app.post("/api/grounds/:id/adopt", (req, res) => {
    const id = Number(req.params.id);
    if (!community.groundOpen(id)) return res.status(404).json({ message: "That ground is no longer listed" });
    const p = z.object({ org: T(2, 120, "Enter your name or organisation"), kind: z.enum(["Individual", "Company (CSR)", "Alumni or club", "Panchayat or RWA"]),
      amount: z.enum(["Part of the cost", "The full cost", "Upkeep for a year", "Equipment or labour in kind"]), contact: T(2, 80, "Who should we speak to?"), email: Email }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const aid = community.adopt({ ground_id: id, ...p.data });
    res.status(201).json({ id: aid, ref: ref("MA", aid) });
  });
  app.get("/api/gear", (_req, res) => res.json({ gear: community.gear() }));
  app.post("/api/gear", (req, res) => {
    const p = z.object({ item: T(3, 120, "What are you giving? For example: Running spikes"), sport: T(2, 60, "Which sport?"), size: opt(40),
      condition: z.enum(["Like new", "Good", "Used but working"]), city: T(2, 60, "Enter your town or city"), state: T(2, 60, "Pick a state"),
      donor: T(2, 80, "Enter your name"), email: Email, phone: Phone }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const id = community.addGear(p.data as any);
    res.status(201).json({ id, ref: ref("MK", id) });
  });
  app.post("/api/gear/:id/request", (req, res) => {
    const id = Number(req.params.id);
    if (!community.gearOpen(id)) return res.status(404).json({ message: "That item has already found a home" });
    const p = z.object({ name: T(2, 80, "Enter the athlete's or parent's name"), email: Email, phone: Phone, note: T(20, 500, "Tell the donor who will use it and for which sport"),
      guardian: z.literal(true, { message: "Confirm you are the athlete, or their parent or coach" }) }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ message: err(p.error) });
    const { guardian, ...d } = p.data;
    const rid = community.requestGear({ gear_id: id, ...d });
    res.status(201).json({ id: rid, ref: ref("MQ", rid) });
  });

  /* admin: create, edit, ingest */
  const tk = (req: any, res: any) => { const k = String(req.params.table); const t = (ADMIN_TABLES as any)[k]; if (!t) { res.status(404).json({ message: "Unknown table" }); return null; } return { k, t }; };
  app.post("/api/admin/:table", requireAdmin, (req, res) => {
    const x = tk(req, res); if (!x) return;
    if (!x.t.create) return res.status(405).json({ message: "Entries in this table come from the public site" });
    const { row, error } = coerce(x.t.create, req.body, false); if (error) return res.status(400).json({ message: error });
    if (x.k === "predictions" && splitCount(String(row!.options)) < 2) return res.status(400).json({ message: "Give at least two options separated by |" });
    try { res.status(201).json({ id: adminX.create(x.k, row!) }); } catch (e: any) { res.status(400).json({ message: String(e.message).includes("UNIQUE") ? "That entry already exists" : "Could not save" }); }
  });
  app.patch("/api/admin/:table/:id", requireAdmin, (req, res) => {
    const x = tk(req, res); if (!x) return;
    if (!x.t.edit) return res.status(405).json({ message: "This table can't be edited" });
    const { row, error } = coerce(x.t.edit, req.body, true); if (error) return res.status(400).json({ message: error });
    if (x.k === "predictions" && row!.answer) row!.status = "settled";
    if (x.k === "fixtures" && row!.home_score != null && row!.away_score != null) row!.status = "final";
    res.json({ ok: adminX.update(x.k, Number(req.params.id), row!) });
  });
  app.post("/api/admin-ingest", requireAdmin, (req, res) => {
    const p = Feed.safeParse(req.body); if (!p.success) return res.status(400).json({ message: err(p.error) });
    res.json(live.ingest(p.data, "api"));
  });
  app.get("/api/admin-feed", requireAdmin, (_req, res) => res.json({ url: process.env.RESULTS_FEED_URL ? "set" : null, log: live.lastFeed() }));
}
const splitCount = (s: string) => s.split("|").map(x => x.trim()).filter(Boolean).length;
