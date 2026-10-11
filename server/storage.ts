import { subscribers } from "@shared/schema";
import type { Subscriber, InsertSubscriber } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, count } from "drizzle-orm";

import fs from "node:fs";
import path from "node:path";

// DATA_DIR should point at a persistent disk in production (e.g. /var/data on Render).
const DATA_DIR = process.env.DATA_DIR || ".";
fs.mkdirSync(DATA_DIR, { recursive: true });
export const DB_PATH = path.resolve(DATA_DIR, "data.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("busy_timeout = 5000");
sqlite.exec(`CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  interests TEXT NOT NULL DEFAULT '[]',
  lang TEXT NOT NULL DEFAULT 'en'
)`);

export const db = drizzle(sqlite);

export interface IStorage {
  findSubscriber(email: string): Promise<Subscriber | undefined>;
  upsertSubscriber(s: InsertSubscriber): Promise<{ subscriber: Subscriber; existed: boolean }>;
  removeSubscriber(email: string): Promise<boolean>;
  countSubscribers(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async findSubscriber(email: string) {
    return db.select().from(subscribers).where(eq(subscribers.email, email)).get();
  }
  async upsertSubscriber(s: InsertSubscriber) {
    const found = await this.findSubscriber(s.email);
    if (found) {
      const subscriber = db.update(subscribers).set({ interests: s.interests, lang: s.lang }).where(eq(subscribers.email, s.email)).returning().get();
      return { subscriber, existed: true };
    }
    return { subscriber: db.insert(subscribers).values(s).returning().get(), existed: false };
  }
  async removeSubscriber(email: string) {
    return db.delete(subscribers).where(eq(subscribers.email, email)).run().changes > 0;
  }
  async countSubscribers() {
    return db.select({ n: count() }).from(subscribers).get()?.n ?? 0;
  }
}

export const storage = new DatabaseStorage();

/* ---------- follows and listing claims ---------- */
sqlite.exec(`CREATE TABLE IF NOT EXISTS follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL, kind TEXT NOT NULL, key TEXT NOT NULL, label TEXT NOT NULL,
  created TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(email, kind, key)
);
CREATE TABLE IF NOT EXISTS alert_prefs (
  email TEXT PRIMARY KEY, whatsapp TEXT, channels TEXT NOT NULL DEFAULT '["email"]'
);
CREATE TABLE IF NOT EXISTS listing_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL,
  email TEXT NOT NULL, phone TEXT NOT NULL, fees TEXT, coaches TEXT, website TEXT, notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);`);

export type FollowRow = { kind: string; key: string; label: string; created: string };
export const follows = {
  list: (email: string) => sqlite.prepare("SELECT kind, key, label, created FROM follows WHERE email = ? ORDER BY created DESC").all(email) as FollowRow[],
  add: (email: string, items: { kind: string; key: string; label: string }[]) => {
    const st = sqlite.prepare("INSERT OR IGNORE INTO follows (email, kind, key, label) VALUES (?, ?, ?, ?)");
    let n = 0; sqlite.transaction(() => { for (const i of items) n += st.run(email, i.kind, i.key, i.label).changes; })(); return n;
  },
  remove: (email: string, kind: string, key: string) => sqlite.prepare("DELETE FROM follows WHERE email = ? AND kind = ? AND key = ?").run(email, kind, key).changes > 0,
  prefs: (email: string) => sqlite.prepare("SELECT whatsapp, channels FROM alert_prefs WHERE email = ?").get(email) as { whatsapp: string | null; channels: string } | undefined,
  setPrefs: (email: string, whatsapp: string | null, channels: string[]) =>
    sqlite.prepare("INSERT INTO alert_prefs (email, whatsapp, channels) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET whatsapp = excluded.whatsapp, channels = excluded.channels").run(email, whatsapp, JSON.stringify(channels)),
  count: () => (sqlite.prepare("SELECT COUNT(DISTINCT email) n FROM follows").get() as { n: number }).n,
};
export const claims = {
  add: (c: Record<string, string | null>) => Number(sqlite.prepare(`INSERT INTO listing_claims (listing, kind, name, role, email, phone, fees, coaches, website, notes)
    VALUES (@listing, @kind, @name, @role, @email, @phone, @fees, @coaches, @website, @notes)`).run(c).lastInsertRowid),
  count: () => (sqlite.prepare("SELECT COUNT(*) n FROM listing_claims").get() as { n: number }).n,
};

sqlite.exec(`CREATE TABLE IF NOT EXISTS corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT, page TEXT NOT NULL, detail TEXT NOT NULL, source TEXT, email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', created TEXT NOT NULL DEFAULT (datetime('now'))
)`);
export const corrections = {
  add: (c: { page: string; detail: string; source: string | null; email: string }) => Number(sqlite.prepare("INSERT INTO corrections (page, detail, source, email) VALUES (@page, @detail, @source, @email)").run(c).lastInsertRowid),
};

/* ---------- sporting nation: pledges, local stars, competitions, sponsorship ---------- */
sqlite.exec(`CREATE TABLE IF NOT EXISTS nation_pledges (
  id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, actions TEXT NOT NULL, state TEXT, created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS nation_nominations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, athlete TEXT NOT NULL, sport TEXT NOT NULL, district TEXT NOT NULL, state TEXT NOT NULL,
  age_band TEXT NOT NULL, achievement TEXT NOT NULL, link TEXT, nominator TEXT NOT NULL, email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS nation_competitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, sport TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL,
  date TEXT NOT NULL, ages TEXT NOT NULL, level TEXT NOT NULL, link TEXT, email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS nation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT, sport TEXT NOT NULL, state TEXT NOT NULL, age_band TEXT NOT NULL, level TEXT NOT NULL,
  need TEXT NOT NULL, amount INTEGER NOT NULL, story TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS nation_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT, org TEXT NOT NULL, kind TEXT NOT NULL, budget TEXT NOT NULL, sports TEXT NOT NULL, states TEXT NOT NULL,
  request_id INTEGER, contact TEXT NOT NULL, email TEXT NOT NULL, csr INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);`);

// Light migrations for databases created by earlier versions.
const cols = (t: string) => (sqlite.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]).map(c => c.name);
for (const t of ["nation_competitions", "nation_offers"]) if (!cols(t).includes("status")) sqlite.exec(`ALTER TABLE ${t} ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`);
sqlite.exec("UPDATE nation_requests SET status = 'pending' WHERE status = 'open'");

const q = (sql: string) => sqlite.prepare(sql);
export const nation = {
  pledge: (role: string, actions: string[], state: string | null) => Number(q("INSERT INTO nation_pledges (role, actions, state) VALUES (?, ?, ?)").run(role, JSON.stringify(actions), state).lastInsertRowid),
  nominate: (n: Record<string, string | null>) => Number(q(`INSERT INTO nation_nominations (athlete, sport, district, state, age_band, achievement, link, nominator, email)
    VALUES (@athlete, @sport, @district, @state, @age_band, @achievement, @link, @nominator, @email)`).run(n).lastInsertRowid),
  addCompetition: (c: Record<string, string | null>) => Number(q(`INSERT INTO nation_competitions (name, sport, city, state, date, ages, level, link, email)
    VALUES (@name, @sport, @city, @state, @date, @ages, @level, @link, @email)`).run(c).lastInsertRowid),
  addRequest: (r: Record<string, string | number | null>) => Number(q(`INSERT INTO nation_requests (sport, state, age_band, level, need, amount, story, name, email, phone)
    VALUES (@sport, @state, @age_band, @level, @need, @amount, @story, @name, @email, @phone)`).run(r).lastInsertRowid),
  addOffer: (o: Record<string, string | number | null>) => Number(q(`INSERT INTO nation_offers (org, kind, budget, sports, states, request_id, contact, email, csr)
    VALUES (@org, @kind, @budget, @sports, @states, @request_id, @contact, @email, @csr)`).run(o).lastInsertRowid),
  requestExists: (id: number) => !!q("SELECT 1 FROM nation_requests WHERE id = ? AND status = 'approved'").get(id),
  summary: () => {
    const pledges = q("SELECT role, COUNT(*) n FROM nation_pledges GROUP BY role").all() as { role: string; n: number }[];
    // Public views never include names, emails or phone numbers. Minors are shown only by age band, sport and state.
    const stars = q(`SELECT id, substr(athlete, 1, instr(athlete || ' ', ' ') - 1) first, sport, district, state, age_band, achievement, created
      FROM nation_nominations WHERE status = 'approved' ORDER BY id DESC LIMIT 12`).all();
    const competitions = q(`SELECT id, name, sport, city, state, date, ages, level, link FROM nation_competitions WHERE status = 'approved' AND date >= date('now', '-1 day') ORDER BY date ASC LIMIT 40`).all();
    const requests = q(`SELECT r.id, r.sport, r.state, r.age_band, r.level, r.need, r.amount, r.story, r.created,
      (SELECT COUNT(*) FROM nation_offers o WHERE o.request_id = r.id) backers FROM nation_requests r WHERE r.status = 'approved' ORDER BY r.id DESC LIMIT 24`).all();
    const offers = (q("SELECT COUNT(*) n FROM nation_offers").get() as { n: number }).n;
    const nominations = (q("SELECT COUNT(*) n FROM nation_nominations").get() as { n: number }).n;
    return { pledges, stars, competitions, requests, offers, nominations };
  },
};

/* ---------- admin ---------- */
// Whitelisted tables only. `moderated` tables have a status the admin can change.
const MOD = ["pending", "approved", "rejected"];
export const ADMIN_TABLES: Record<string, { table: string; label: string; statuses: string[]; content?: boolean; create?: AdminField[]; edit?: AdminField[] }> = {
  nominations: { table: "nation_nominations", label: "Local star nominations", statuses: MOD },
  requests: { table: "nation_requests", label: "Sponsorship requests", statuses: MOD },
  offers: { table: "nation_offers", label: "Sponsor offers", statuses: ["pending", "introduced", "rejected"] },
  competitions: { table: "nation_competitions", label: "Community competitions", statuses: MOD },
  claims: { table: "listing_claims", label: "Facility listing claims", statuses: MOD },
  corrections: { table: "corrections", label: "Corrections", statuses: ["open", "resolved"] },
  pledges: { table: "nation_pledges", label: "Pledges", statuses: [] },
  subscribers: { table: "subscribers", label: "Newsletter subscribers", statuses: [] },
  follows: { table: "follows", label: "Follows", statuses: [] },
};
export const admin = {
  overview: () => Object.entries(ADMIN_TABLES).map(([k, t]) => {
    const has = t.statuses.length > 0 && cols(t.table).includes("status");
    const total = (q(`SELECT COUNT(*) n FROM ${t.table}`).get() as { n: number }).n;
    const pending = has ? (q(`SELECT COUNT(*) n FROM ${t.table} WHERE status = ?`).get(t.statuses[0]) as { n: number }).n : 0;
    return { key: k, label: t.label, statuses: has ? t.statuses : [], total, pending: t.content ? 0 : pending, content: !!t.content, create: t.create ?? null, edit: t.edit ?? null };
  }),
  list: (k: string, status?: string, limit = 200) => {
    const t = ADMIN_TABLES[k]; const has = cols(t.table).includes("status");
    return status && has ? q(`SELECT * FROM ${t.table} WHERE status = ? ORDER BY id DESC LIMIT ?`).all(status, limit) : q(`SELECT * FROM ${t.table} ORDER BY id DESC LIMIT ?`).all(limit);
  },
  setStatus: (k: string, id: number, status: string) => q(`UPDATE ${ADMIN_TABLES[k].table} SET status = ? WHERE id = ?`).run(status, id).changes > 0,
  remove: (k: string, id: number) => q(`DELETE FROM ${ADMIN_TABLES[k].table} WHERE id = ?`).run(id).changes > 0,
  all: (k: string) => q(`SELECT * FROM ${ADMIN_TABLES[k].table} ORDER BY id`).all() as Record<string, unknown>[],
  backup: (dest: string) => sqlite.backup(dest),
};

/* ---------- live results, leagues, fan zone, community (v3) ---------- */
sqlite.exec(`CREATE TABLE IF NOT EXISTS live_medals (
  id INTEGER PRIMARY KEY AUTOINCREMENT, games TEXT NOT NULL DEFAULT 'apg2026', date TEXT NOT NULL, athlete TEXT NOT NULL, sport TEXT NOT NULL,
  event TEXT NOT NULL, medal TEXT NOT NULL CHECK (medal IN ('G','S','B')), state TEXT, link TEXT, ext_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'published', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS fixtures (
  id INTEGER PRIMARY KEY AUTOINCREMENT, league TEXT NOT NULL, date TEXT NOT NULL, time TEXT, home TEXT NOT NULL, away TEXT NOT NULL, venue TEXT,
  home_score INTEGER, away_score INTEGER, status TEXT NOT NULL DEFAULT 'scheduled', ext_id TEXT UNIQUE, created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL, options TEXT NOT NULL, closes_at TEXT NOT NULL, answer TEXT, points INTEGER NOT NULL DEFAULT 10,
  topic TEXT, status TEXT NOT NULL DEFAULT 'open', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT, qid INTEGER NOT NULL, nickname TEXT NOT NULL, email TEXT NOT NULL, choice TEXT NOT NULL,
  created TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(qid, email)
);
CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, kind TEXT NOT NULL, sport TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL,
  ages TEXT, fees TEXT, timings TEXT, girls_only INTEGER NOT NULL DEFAULT 0, about TEXT, contact_name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, website TEXT,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS grounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, place TEXT NOT NULL, district TEXT NOT NULL, state TEXT NOT NULL, sport TEXT NOT NULL,
  need TEXT NOT NULL, budget INTEGER NOT NULL, story TEXT NOT NULL, users TEXT, contact_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS adoptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ground_id INTEGER NOT NULL, org TEXT NOT NULL, kind TEXT NOT NULL, amount TEXT NOT NULL, contact TEXT NOT NULL, email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS gear (
  id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL, sport TEXT NOT NULL, size TEXT, condition TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL,
  donor TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS gear_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT, gear_id INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS successes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, athlete TEXT NOT NULL, sport TEXT NOT NULL, state TEXT NOT NULL, backed_year INTEGER NOT NULL, via TEXT NOT NULL,
  result TEXT NOT NULL, link TEXT, status TEXT NOT NULL DEFAULT 'published', created TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS feed_log (id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT NOT NULL, medals INTEGER NOT NULL, fixtures INTEGER NOT NULL, error TEXT, created TEXT NOT NULL DEFAULT (datetime('now')));`);

/* Seeds: first-phase ISL fixtures as announced, and opening fan-zone questions. Only run on an empty table. */
if ((q("SELECT COUNT(*) n FROM fixtures").get() as { n: number }).n === 0) {
  const isl: [string, string, string, string, string][] = [
    ["2026-10-10", "17:00", "Bengaluru FC", "Sporting Club Delhi", "Kanteerava Stadium, Bengaluru"],
    ["2026-10-10", "19:30", "FC Goa", "Chennaiyin FC", "Fatorda Stadium, Goa"],
    ["2026-10-11", "17:00", "Inter Kashi", "Kerala Blasters FC", "To be confirmed"],
    ["2026-10-11", "19:30", "Churchill Brothers", "Mumbai City FC", "Fatorda Stadium, Goa"],
    ["2026-10-12", "19:30", "NorthEast United FC", "Mohun Bagan Super Giant", "Sarusajai Stadium, Guwahati"],
    ["2026-10-14", "19:30", "Punjab FC", "Odisha FC", "JLN Stadium, Delhi"],
    ["2026-10-16", "19:30", "Sporting Club Delhi", "Mohun Bagan Super Giant", "JLN Stadium, Delhi"],
    ["2026-10-17", "17:00", "Inter Kashi", "Odisha FC", "To be confirmed"],
    ["2026-10-17", "19:30", "Bengaluru FC", "Chennaiyin FC", "Kanteerava Stadium, Bengaluru"],
    ["2026-10-18", "17:00", "Churchill Brothers", "East Bengal FC", "Fatorda Stadium, Goa"],
    ["2026-10-18", "19:30", "NorthEast United FC", "Kerala Blasters FC", "Sarusajai Stadium, Guwahati"],
    ["2026-10-19", "19:30", "Punjab FC", "Mumbai City FC", "JLN Stadium, Delhi"],
    ["2026-10-23", "17:00", "Inter Kashi", "East Bengal FC", "To be confirmed"],
    ["2026-10-24", "19:30", "Odisha FC", "NorthEast United FC", "Kalinga Stadium, Bhubaneswar"],
    ["2026-10-25", "17:00", "Churchill Brothers", "Punjab FC", "Fatorda Stadium, Goa"],
    ["2026-10-25", "19:30", "Kerala Blasters FC", "Mumbai City FC", "JLN Stadium, Kochi"],
    ["2026-10-26", "19:30", "Mohun Bagan Super Giant", "Chennaiyin FC", "VYBK, Kolkata"],
  ];
  const st = q("INSERT INTO fixtures (league, date, time, home, away, venue, ext_id) VALUES ('isl', ?, ?, ?, ?, ?, ?)");
  sqlite.transaction(() => { for (const [d, t, h, a, v] of isl) st.run(d, t, h, a, v, `isl-${d}-${h}-${a}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")); })();
}
if ((q("SELECT COUNT(*) n FROM predictions").get() as { n: number }).n === 0) {
  const ps: [string, string[], string, string, number][] = [
    ["ISL opener, 10 October: Bengaluru FC vs Sporting Club Delhi. Who wins?", ["Bengaluru FC", "Draw", "Sporting Club Delhi"], "2026-10-10T17:00:00+05:30", "ISL", 10],
    ["How many medals will India win at the Aichi-Nagoya 2026 Asian Para Games?", ["Under 80", "80 to 99", "100 to 119", "120 or more"], "2026-10-18T00:00:00+09:00", "Asian Para Games", 20],
    ["How many gold medals will India win at the Asian Para Games?", ["Under 20", "20 to 29", "30 to 39", "40 or more"], "2026-10-18T00:00:00+09:00", "Asian Para Games", 20],
    ["Which sport will give India the most medals in Aichi-Nagoya?", ["Para athletics", "Para badminton", "Para shooting", "Para swimming", "Para archery"], "2026-10-18T00:00:00+09:00", "Asian Para Games", 10],
    ["Will Sumit Antil win men's javelin F64 gold?", ["Yes", "No"], "2026-10-18T00:00:00+09:00", "Asian Para Games", 10],
    ["Will Sheetal Devi win a gold medal in para archery?", ["Yes", "No"], "2026-10-18T00:00:00+09:00", "Asian Para Games", 10],
  ];
  const st = q("INSERT INTO predictions (question, options, closes_at, topic, points) VALUES (?, ?, ?, ?, ?)");
  sqlite.transaction(() => { for (const [qq, o, c, t, p] of ps) st.run(qq, o.join(" | "), c, t, p); })();
}

const n = (sql: string, ...a: unknown[]) => (q(sql).get(...a) as { n: number }).n;
const splitOpts = (s: string) => s.split("|").map(x => x.trim()).filter(Boolean);

export const live = {
  medals: (games: string) => {
    const rows = q("SELECT id, date, athlete, sport, event, medal, state, link FROM live_medals WHERE games = ? AND status = 'published' ORDER BY date DESC, id DESC").all(games) as { medal: string }[];
    const tally = { G: 0, S: 0, B: 0 } as Record<string, number>; rows.forEach(r => tally[r.medal]++);
    const last = q("SELECT MAX(created) t FROM live_medals WHERE games = ?").get(games) as { t: string | null };
    return { tally, medals: rows, updated: last.t };
  },
  fixtures: (league?: string) => (league ? q("SELECT id, league, date, time, home, away, venue, home_score, away_score, status FROM fixtures WHERE league = ? ORDER BY date, time").all(league)
    : q("SELECT id, league, date, time, home, away, venue, home_score, away_score, status FROM fixtures WHERE date >= date('now', '-1 day') ORDER BY date, time LIMIT 60").all()),
  ingest: (data: { medals?: any[]; fixtures?: any[] }, source: string) => {
    let m = 0, f = 0;
    const um = q(`INSERT INTO live_medals (games, date, athlete, sport, event, medal, state, link, ext_id) VALUES (@games, @date, @athlete, @sport, @event, @medal, @state, @link, @ext_id)
      ON CONFLICT(ext_id) DO UPDATE SET date = excluded.date, athlete = excluded.athlete, sport = excluded.sport, event = excluded.event, medal = excluded.medal, state = excluded.state, link = excluded.link`);
    const uf = q(`INSERT INTO fixtures (league, date, time, home, away, venue, home_score, away_score, status, ext_id) VALUES (@league, @date, @time, @home, @away, @venue, @home_score, @away_score, @status, @ext_id)
      ON CONFLICT(ext_id) DO UPDATE SET date = excluded.date, time = excluded.time, venue = excluded.venue, home_score = excluded.home_score, away_score = excluded.away_score, status = excluded.status`);
    const key = (...p: unknown[]) => p.map(x => String(x ?? "")).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    sqlite.transaction(() => {
      for (const x of data.medals ?? []) { um.run({ games: x.games ?? "apg2026", date: x.date, athlete: x.athlete, sport: x.sport, event: x.event, medal: x.medal, state: x.state ?? null, link: x.link ?? null, ext_id: x.ext_id ?? key(x.games ?? "apg2026", x.event, x.athlete, x.medal) }); m++; }
      for (const x of data.fixtures ?? []) { uf.run({ league: x.league, date: x.date, time: x.time ?? null, home: x.home, away: x.away, venue: x.venue ?? null, home_score: x.home_score ?? null, away_score: x.away_score ?? null, status: x.status ?? "scheduled", ext_id: x.ext_id ?? key(x.league, x.date, x.home, x.away) }); f++; }
    })();
    q("INSERT INTO feed_log (source, medals, fixtures) VALUES (?, ?, ?)").run(source, m, f);
    return { medals: m, fixtures: f };
  },
  logError: (source: string, error: string) => q("INSERT INTO feed_log (source, medals, fixtures, error) VALUES (?, 0, 0, ?)").run(source, error.slice(0, 400)),
  lastFeed: () => q("SELECT source, medals, fixtures, error, created FROM feed_log ORDER BY id DESC LIMIT 5").all(),
};

export const fan = {
  questions: () => {
    const qs = q("SELECT id, question, options, closes_at, answer, points, topic, status FROM predictions WHERE status != 'hidden' ORDER BY closes_at ASC, id").all() as any[];
    const counts = q("SELECT qid, choice, COUNT(*) n FROM picks GROUP BY qid, choice").all() as { qid: number; choice: string; n: number }[];
    return qs.map(x => ({ ...x, options: splitOpts(x.options), votes: Object.fromEntries(counts.filter(c => c.qid === x.id).map(c => [c.choice, c.n])) }));
  },
  question: (id: number) => q("SELECT * FROM predictions WHERE id = ?").get(id) as { id: number; options: string; closes_at: string; status: string } | undefined,
  pick: (qid: number, nickname: string, email: string, choice: string) =>
    q("INSERT INTO picks (qid, nickname, email, choice) VALUES (?, ?, ?, ?) ON CONFLICT(qid, email) DO UPDATE SET choice = excluded.choice, nickname = excluded.nickname").run(qid, nickname, email, choice),
  mine: (email: string) => q("SELECT qid, choice FROM picks WHERE email = ?").all(email),
  leaderboard: () => q(`SELECT (SELECT nickname FROM picks p2 WHERE p2.email = p.email ORDER BY p2.id DESC LIMIT 1) nickname,
      SUM(CASE WHEN pr.answer IS NOT NULL AND pr.answer = p.choice THEN pr.points ELSE 0 END) points, SUM(CASE WHEN pr.answer IS NOT NULL AND pr.answer = p.choice THEN 1 ELSE 0 END) correct, COUNT(*) picks
    FROM picks p JOIN predictions pr ON pr.id = p.qid GROUP BY p.email ORDER BY points DESC, correct DESC, MIN(p.id) ASC LIMIT 25`).all(),
  players: () => n("SELECT COUNT(DISTINCT email) n FROM picks"),
};

export const community = {
  clubs: () => q("SELECT id, name, kind, sport, city, state, ages, fees, timings, girls_only, about, contact_name, phone, website FROM clubs WHERE status = 'approved' ORDER BY state, city, name").all(),
  addClub: (c: Record<string, unknown>) => Number(q(`INSERT INTO clubs (name, kind, sport, city, state, ages, fees, timings, girls_only, about, contact_name, phone, email, website)
    VALUES (@name, @kind, @sport, @city, @state, @ages, @fees, @timings, @girls_only, @about, @contact_name, @phone, @email, @website)`).run(c).lastInsertRowid),
  grounds: () => q(`SELECT g.id, g.name, g.place, g.district, g.state, g.sport, g.need, g.budget, g.story, g.users, g.created,
    (SELECT COUNT(*) FROM adoptions a WHERE a.ground_id = g.id AND a.status != 'rejected') adopters FROM grounds g WHERE g.status = 'approved' ORDER BY g.id DESC LIMIT 60`).all(),
  addGround: (g: Record<string, unknown>) => Number(q(`INSERT INTO grounds (name, place, district, state, sport, need, budget, story, users, contact_name, email, phone)
    VALUES (@name, @place, @district, @state, @sport, @need, @budget, @story, @users, @contact_name, @email, @phone)`).run(g).lastInsertRowid),
  groundOpen: (id: number) => !!q("SELECT 1 FROM grounds WHERE id = ? AND status = 'approved'").get(id),
  adopt: (a: Record<string, unknown>) => Number(q("INSERT INTO adoptions (ground_id, org, kind, amount, contact, email) VALUES (@ground_id, @org, @kind, @amount, @contact, @email)").run(a).lastInsertRowid),
  gear: () => q(`SELECT g.id, g.item, g.sport, g.size, g.condition, g.city, g.state, g.created,
    (SELECT COUNT(*) FROM gear_requests r WHERE r.gear_id = g.id AND r.status != 'rejected') requests FROM gear g WHERE g.status = 'approved' ORDER BY g.id DESC LIMIT 80`).all(),
  addGear: (g: Record<string, unknown>) => Number(q("INSERT INTO gear (item, sport, size, condition, city, state, donor, email, phone) VALUES (@item, @sport, @size, @condition, @city, @state, @donor, @email, @phone)").run(g).lastInsertRowid),
  gearOpen: (id: number) => !!q("SELECT 1 FROM gear WHERE id = ? AND status = 'approved'").get(id),
  requestGear: (r: Record<string, unknown>) => Number(q("INSERT INTO gear_requests (gear_id, name, email, phone, note) VALUES (@gear_id, @name, @email, @phone, @note)").run(r).lastInsertRowid),
  successes: () => q("SELECT id, athlete, sport, state, backed_year, via, result, link FROM successes WHERE status = 'published' ORDER BY id DESC LIMIT 24").all(),
  districts: () => q(`SELECT state, district, COUNT(*) n, GROUP_CONCAT(DISTINCT sport) sports FROM nation_nominations WHERE status = 'approved' GROUP BY state, district ORDER BY n DESC, state LIMIT 60`).all(),
  stats: () => ({ clubs: n("SELECT COUNT(*) n FROM clubs WHERE status = 'approved'"), grounds: n("SELECT COUNT(*) n FROM grounds WHERE status = 'approved'"), gear: n("SELECT COUNT(*) n FROM gear WHERE status = 'approved'"), successes: n("SELECT COUNT(*) n FROM successes WHERE status = 'published'") }),
};

/* Admin: tables that the dashboard can create and edit, with field specs. */
export type AdminField = { name: string; label: string; type: "text" | "textarea" | "date" | "number" | "select" | "datetime"; options?: string[]; required?: boolean; max?: number; hint?: string };
const PUB = ["published", "hidden"];
Object.assign(ADMIN_TABLES, {
  live_medals: { table: "live_medals", label: "Live medals (Games)", statuses: PUB, content: true, create: [
    { name: "games", label: "Games", type: "select", options: ["apg2026"], required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "medal", label: "Medal", type: "select", options: ["G", "S", "B"], required: true },
    { name: "athlete", label: "Athlete or team", type: "text", required: true, max: 120 },
    { name: "sport", label: "Sport", type: "text", required: true, max: 60 },
    { name: "event", label: "Event and class", type: "text", required: true, max: 160, hint: "For example: Men's javelin F64" },
    { name: "state", label: "Home state", type: "text", max: 60 },
    { name: "link", label: "Source link", type: "text", max: 300 },
  ] },
  fixtures: { table: "fixtures", label: "League fixtures and results", statuses: ["scheduled", "live", "final", "postponed"], content: true, create: [
    { name: "league", label: "League", type: "select", options: ["isl", "pkl", "hil", "whil"], required: true },
    { name: "date", label: "Date", type: "date", required: true }, { name: "time", label: "Start (IST, HH:MM)", type: "text", max: 5 },
    { name: "home", label: "Home team", type: "text", required: true, max: 80 }, { name: "away", label: "Away team", type: "text", required: true, max: 80 },
    { name: "venue", label: "Venue", type: "text", max: 120 },
  ], edit: [{ name: "home_score", label: "Home score", type: "number" }, { name: "away_score", label: "Away score", type: "number" }, { name: "time", label: "Start (IST)", type: "text", max: 5 }, { name: "venue", label: "Venue", type: "text", max: 120 }] },
  predictions: { table: "predictions", label: "Fan zone predictions", statuses: ["open", "settled", "hidden"], content: true, create: [
    { name: "question", label: "Question", type: "text", required: true, max: 200 },
    { name: "options", label: "Options, separated by |", type: "text", required: true, max: 400, hint: "For example: Yes | No" },
    { name: "closes_at", label: "Picks close at", type: "datetime", required: true },
    { name: "topic", label: "Topic", type: "text", max: 60 }, { name: "points", label: "Points", type: "number" },
  ], edit: [{ name: "answer", label: "Correct answer (exactly as an option)", type: "text", max: 120 }, { name: "closes_at", label: "Picks close at", type: "datetime" }] },
  picks: { table: "picks", label: "Prediction picks", statuses: [] },
  clubs: { table: "clubs", label: "Clubs and coaches", statuses: MOD },
  grounds: { table: "grounds", label: "Adopt a ground: listings", statuses: MOD },
  adoptions: { table: "adoptions", label: "Adopt a ground: offers", statuses: ["pending", "introduced", "rejected"] },
  gear: { table: "gear", label: "Gear donations", statuses: ["pending", "approved", "given", "rejected"] },
  gear_requests: { table: "gear_requests", label: "Gear requests", statuses: ["pending", "introduced", "rejected"] },
  successes: { table: "successes", label: "Success wall", statuses: PUB, content: true, create: [
    { name: "athlete", label: "Athlete (first name only for minors)", type: "text", required: true, max: 80 },
    { name: "sport", label: "Sport", type: "text", required: true, max: 60 }, { name: "state", label: "State", type: "text", required: true, max: 60 },
    { name: "backed_year", label: "Year backed here", type: "number", required: true },
    { name: "via", label: "How we helped", type: "select", options: ["Sponsored", "Local star spotlight", "Gear exchange", "Club directory", "Adopted ground"], required: true },
    { name: "result", label: "Result", type: "text", required: true, max: 200, hint: "For example: State U-17 champion, 2027" },
    { name: "link", label: "Source link", type: "text", max: 300 },
  ] },
});
export const adminX = {
  create: (k: string, row: Record<string, unknown>) => {
    const t = ADMIN_TABLES[k] as any; const keys = Object.keys(row);
    return Number(q(`INSERT INTO ${t.table} (${keys.join(", ")}) VALUES (${keys.map(x => "@" + x).join(", ")})`).run(row).lastInsertRowid);
  },
  update: (k: string, id: number, row: Record<string, unknown>) => {
    const t = ADMIN_TABLES[k] as any; const keys = Object.keys(row); if (!keys.length) return false;
    return q(`UPDATE ${t.table} SET ${keys.map(x => `${x} = @${x}`).join(", ")} WHERE id = @id`).run({ ...row, id }).changes > 0;
  },
};
