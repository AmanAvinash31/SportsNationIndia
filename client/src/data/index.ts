import raw from "./content.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const D: any = raw;

export type MedalCode = "G" | "S" | "B";
export type GamesKey = "oly" | "cwg" | "asian";
export interface Edition {
  y: number; host: string; g: number; s: number; b: number;
  ath?: number; rank?: string; note?: string; dnp?: boolean; upcoming?: boolean;
}
export const total = (e: { g: number; s: number; b: number }) => e.g + e.s + e.b;
export const isPlayed = (e: Edition) => !e.dnp && !e.upcoming;

/* ---------- images ---------- */
export const IMG = {
  hero: "./img/hero-javelin.webp", hockey: "./img/hockey.webp", boxing: "./img/boxing.webp", weightlifting: "./img/weightlifting.webp",
  wrestling: "./img/wrestling.webp", shooting: "./img/shooting.webp", relay: "./img/relay.webp", cricket: "./img/cricket.webp",
  archery: "./img/archery.webp", stadium: "./img/stadium.webp", badminton: "./img/badminton.webp", crowd: "./img/crowd.webp",
} as const;
export const sportImage = (sport: string): string => {
  const s = sport.toLowerCase();
  if (s.includes("hockey")) return IMG.hockey;
  if (s.includes("box")) return IMG.boxing;
  if (s.includes("weight") || s.includes("powerlift")) return IMG.weightlifting;
  if (s.includes("wrest") || s.includes("judo") || s.includes("kurash") || s.includes("martial") || s.includes("wushu")) return IMG.wrestling;
  if (s.includes("shoot")) return IMG.shooting;
  if (s.includes("cricket")) return IMG.cricket;
  if (s.includes("arch")) return IMG.archery;
  if (s.includes("badminton") || s.includes("squash") || s.includes("tennis") || s.includes("table")) return IMG.badminton;
  if (s.includes("javelin")) return IMG.hero;
  if (s.includes("athlet") || s.includes("steeple") || s.includes("relay")) return IMG.relay;
  return IMG.crowd;
};

/* ---------- Games meta ---------- */
export const GAMES: Record<string, { label: string; short: string; color: string }> = {
  asian: { label: "Asian Games", short: "Asian Games", color: "hsl(var(--saffron))" },
  cwg: { label: "Commonwealth Games", short: "CWG", color: "hsl(226 80% 60%)" },
  oly: { label: "Olympics", short: "Olympics", color: "hsl(var(--indgreen))" },
  policy: { label: "Policy", short: "Policy", color: "hsl(var(--muted-foreground))" },
  blog: { label: "Analysis", short: "Analysis", color: "hsl(var(--muted-foreground))" },
};

/* ---------- articles ---------- */
export interface Article { slug: string; g: string; date: string; title: string; body: string; paras: string[]; lead?: boolean; kind: "news" | "analysis"; img: string; tr?: any; hi?: any; gu?: any; }
const articleImage = (a: any): string => {
  const t = (a.slug + " " + a.title).toLowerCase();
  if (t.includes("cricket")) return IMG.cricket;
  if (t.includes("hockey") || t.includes("olympic hockey")) return IMG.hockey;
  if (t.includes("boxing")) return IMG.boxing;
  if (t.includes("mirabai") || t.includes("weightlift")) return IMG.weightlifting;
  if (t.includes("trap") || t.includes("shooting")) return IMG.shooting;
  if (t.includes("athletics") || t.includes("relay") || t.includes("six-medals") || t.includes("para")) return IMG.relay;
  if (t.includes("ahmedabad")) return IMG.stadium;
  if (t.includes("los-angeles") || t.includes("olympic")) return IMG.hero;
  if (t.includes("khelo")) return IMG.archery;
  if (t.includes("closes") || t.includes("fourth")) return IMG.crowd;
  return IMG.crowd;
};
export const ARTICLES: Article[] = [
  ...D.ARTICLES.map((a: any) => ({ ...a, kind: "news" as const, img: articleImage(a) })),
  ...D.BLOGS.map((a: any) => ({ ...a, kind: "analysis" as const, img: articleImage(a) })),
].sort((a, b) => b.date.localeCompare(a.date));
export const LEAD = ARTICLES.find(a => a.lead) ?? ARTICLES[0];
export const readTime = (a: Article) => Math.max(1, Math.round(a.paras.join(" ").split(/\s+/).length / 200));
export const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ---------- medal history ---------- */
export const OLY: Edition[] = D.OLY_HISTORY.map((r: any) => ({ g: 0, s: 0, b: 0, ...r }));
export const CWG: Edition[] = D.CWG_HISTORY.map((r: any) => ({ g: 0, s: 0, b: 0, ...r }));
export const ASIAN: Edition[] = D.HISTORY["Asian Games"].map((r: any) => {
  const m = String(r.y).match(/^(.*) (\d{4})$/)!;
  return { y: +m[2], host: m[1], g: r.g, s: r.sv, b: r.b, note: r.s === "Held in 2023" ? "Held in 2023 after a one-year delay. India's record haul: 107 medals." : r.s === "Asian Games, 4th" ? "India finish fourth with 85 medals, the second-best haul in their history." : undefined, rank: r.y.includes("2026") ? "4th" : undefined };
}).sort((a: Edition, b: Edition) => a.y - b.y);
export const sumEditions = (list: Edition[]) => list.filter(isPlayed).reduce((t, r) => ({ g: t.g + r.g, s: t.s + r.s, b: t.b + r.b }), { g: 0, s: 0, b: 0 });

export interface OlyMedal { y: number; m: MedalCode; n: string; sp: string; ev: string; d: string }
export const OLY_MEDALS: OlyMedal[] = D.OLY_MEDALLISTS_RAW.split("\n").map((l: string) => { const [y, m, n, sp, ev, d] = l.split("|"); return { y: +y, m: m as MedalCode, n, sp, ev, d }; });
export const OLY_SQUADS: Record<string, string> = D.OLY_HOCKEY_SQUADS;
export type SportRow = [string, number, number, number];
export const OLY_SPORTS: SportRow[] = D.OLY_SPORTS;
export const CWG_SPORTS: SportRow[] = D.CWG_SPORTS;
export const ASIAN_SPORTS_2026: SportRow[] = D.SPORT26;
export const OLY_MILESTONES: [string, string, string][] = D.OLY_MILESTONES;
export const CWG_MILESTONES: [string, string, string][] = D.CWG_MILESTONES;
export const OLY_STARS: [string, string, string, number, number, number][] = D.OLY_STARS;
export const CWG_STARS: [string, string, string][] = D.CWG_STARS;
export const MEDAL_SOURCES: [string, string][] = D.MEDAL_SOURCES;
export const TALLY_ALL_ASIAN = D.TALLYALL.find((r: any[]) => r[1] === "IND");

export const MEDAL_LABEL: Record<MedalCode, string> = { G: "Gold", S: "Silver", B: "Bronze" };

/* ---------- Asian Games 2026 ---------- */
export const NOC: Record<string, [string, string, string]> = D.NOC;
export type TallyRow = [number, string, number, number, number, number];
export const TALLY26: TallyRow[] = D.TALLY26;
export const DAILY: [string, string, number, number, number][] = D.DAILY;
export const VS2023: [string, number, number, number, number][] = D.VS2023;
export const SPLITS = D.SPLITS as { gender: [string, number][]; kind: [string, number][] };
export const flag = (code: string) => { const n = NOC[code]; if (!n || !n[2]) return "🏳️"; return String.fromCodePoint(...[...n[2]].map(c => 127397 + c.charCodeAt(0))); };

/* ---------- Glasgow ---------- */
export const GLASGOW_TOP: [number, string, number, number, number][] = D.GLASGOW_TOP;
export const GLASGOW_DAYS: [string, string][] = D.GLASGOW_DAYS;

/* ---------- people ---------- */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const titleCase = (s: string) => (s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s'-])([a-z])/g, (_m, a, b) => a + b.toUpperCase()) : s);

export interface CareerItem { games: string; year: number; medal: MedalCode | null; event: string }
export interface Person {
  slug: string; name: string; sport: string; gender: string; tagline?: string; games: string[];
  asian26?: { event: string; G: number; S: number; B: number };
  career: CareerItem[]; honours: string[]; isTeam: boolean; featured: boolean; img: string;
}
const PROFILES: any[] = D.ATHLETES;
const MED26 = D.MEDALLISTS_RAW.split("\n").map((l: string) => { const [n, g, k, sp, ev, m] = l.split("|"); const [G, S, B] = m.split(",").map(Number); return { n, name: titleCase(n), g, k, sp, ev, G, S, B }; });

const map = new Map<string, Person>();
const ensure = (name: string, sport: string, gender = "") => {
  const key = norm(name);
  const prof = PROFILES.find(p => norm(p.n) === key || (p.aka && norm(p.aka) === key));
  const slug = prof ? prof.slug : slugify(name);
  if (!map.has(slug)) map.set(slug, {
    slug, name: prof ? prof.n : name, sport: prof ? prof.sp : sport, gender, tagline: prof?.t, games: prof ? [...prof.gm] : [],
    career: [], honours: prof?.honours ?? [], isTeam: /team$/i.test(name), featured: !!prof, img: sportImage(prof ? prof.sp : sport),
  });
  return map.get(slug)!;
};
PROFILES.forEach(p => ensure(p.n, p.sp));
MED26.forEach((m: any) => {
  const p = ensure(m.name, m.sp, m.g);
  p.gender = p.gender || m.g;
  p.asian26 = { event: m.ev, G: m.G, S: m.S, B: m.B };
  if (!p.games.includes("Asian Games")) p.games.push("Asian Games");
  const best: MedalCode = m.G ? "G" : m.S ? "S" : "B";
  p.career.push({ games: "Asian Games", year: 2026, medal: best, event: `${m.ev}${m.G + m.S + m.B > 1 ? ` (${[m.G && `${m.G} gold`, m.S && `${m.S} silver`, m.B && `${m.B} bronze`].filter(Boolean).join(", ")})` : ""}` });
});
OLY_MEDALS.forEach(m => {
  if (/team$/i.test(m.n) || m.n.includes(" and ")) return;
  const p = map.get(slugify(m.n)) ?? [...map.values()].find(x => norm(x.name) === norm(m.n));
  const person = p ?? ensure(m.n, m.sp);
  person.career.push({ games: "Olympics", year: m.y, medal: m.m, event: m.ev });
  if (!person.games.includes("Olympics")) person.games.push("Olympics");
});
/* Commonwealth highlights for profiled athletes, from honours text */
map.forEach(p => {
  p.honours.forEach(h => {
    const m = h.match(/Commonwealth Games (gold|silver|bronze), ([A-Za-z ]+) (\d{4})/i);
    if (m) p.career.push({ games: "Commonwealth Games", year: +m[3], medal: (m[1][0].toUpperCase()) as MedalCode, event: h.replace(/^Commonwealth Games (gold|silver|bronze), /i, "") });
  });
  p.career.sort((a, b) => b.year - a.year);
});
export const PEOPLE: Person[] = [...map.values()].sort((a, b) => Number(b.featured) - Number(a.featured) || b.career.length - a.career.length || a.name.localeCompare(b.name));
export const findPerson = (slug: string) => PEOPLE.find(p => p.slug === slug);
export const personMedals = (p: Person) => p.career.reduce((t, c) => { if (c.medal) t[c.medal]++; return t; }, { G: 0, S: 0, B: 0 } as Record<MedalCode, number>);
export const SPORT_LIST = [...new Set(PEOPLE.map(p => p.sport.split(",")[0]))].sort();

/* ---------- misc content ---------- */
export const HALL: { n: string; sp: string; t: string }[] = D.HALL;
export const FAQS: [string, string][] = D.FAQS.map(([q, a]: [string, string]) =>
  q === "Is the newsletter live?" ? [q, "Yes. Your address is stored on our server and used only for the Momentum briefing. You can unsubscribe at any time."]
  : q.startsWith("Can I use the site in Hindi") ? [q, "Yes. Use the EN, हिं and ગુ switch in the header. Menus, headings and most news stories are translated; athlete profiles are English for now."] : [q, a]);
export const VENUES: Record<string, [string, string][]> = D.VENUES;
export const CITY: any = D.CITY;
export const CAL: [string, string][] = D.CAL;
export const COMMONWEALTH_ALL: Record<string, string[]> = D.COMMONWEALTH_ALL;
export const CWG_EDITION_HOSTS: [string, string][] = D.CWG_EDITIONS;
export const SPORTS: { n: string; gm: string[]; t: string }[] = D.SPORTS;
export const I18N: Record<string, Record<string, string>> = D.I18N;

export const COUNTDOWNS = [
  { t: "Asian Para Games", where: "Aichi-Nagoya, Japan", d: "18 to 24 October 2026", at: "2026-10-18T00:00:00+09:00", img: IMG.relay },
  { t: "Los Angeles 2028", where: "Olympic Games, USA", d: "14 to 30 July 2028", at: "2028-07-14T00:00:00-07:00", img: IMG.hero },
  { t: "Ahmedabad 2030", where: "Commonwealth Games, India", d: "Dates to be announced", at: null as string | null, img: IMG.stadium },
];

export const TICKER = [
  ["Asian Games 2026", "India finish 4th · 21 gold, 27 silver, 37 bronze"],
  ["Cricket", "Men's T20 gold: India beat Pakistan by 19 runs"],
  ["Hockey", "Gold in both men's and women's events at Aichi-Nagoya"],
  ["Glasgow 2026", "India 4th · 13 gold, 17 silver, 9 bronze"],
  ["Boxing", "10 Commonwealth medals in Glasgow, a record for any nation"],
  ["Next up", "Asian Para Games open 18 October in Aichi-Nagoya"],
  ["Football", "ISL 2026-27 kicks off 10 October: Bengaluru FC vs Sporting Club Delhi"],
  ["Olympics", "41 medals all-time · next stop Los Angeles 2028"],
  ["Ahmedabad 2030", "India hosts the Centenary Commonwealth Games"],
] as const;

export const UPDATED = "4 October 2026";

export const DAY_NOTES: Record<string, string> = {
  D1: "Opening ceremony in Nagoya.", D2: "India's first two medals: silvers in shooting.", D3: "MMA debut brings India's first bronze in the sport.",
  D4: "Women's cricket final: India beat Sri Lanka for gold.", D8: "Two golds in a day.", D11: "Trap gold for Neeru Dhanda and the women's 4x400m relay gold.",
  D12: "Four golds.", D14: "Peak day: 12 medals, six of them gold.", D15: "Men's cricket beats Pakistan for gold and hockey completes the double.",
  D16: "Closing ceremony at Nagoya City Mizuho Park Athletic Stadium.",
};
