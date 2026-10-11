import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight, Download, ExternalLink, Search } from "lucide-react";
import {
  OLY, CWG, ASIAN, sumEditions, total, isPlayed, type Edition, OLY_MEDALS, OLY_SPORTS, CWG_SPORTS, ASIAN_SPORTS_2026, OLY_MILESTONES, CWG_MILESTONES,
  OLY_STARS, CWG_STARS, MEDAL_SOURCES, IMG, TALLY_ALL_ASIAN, MEDAL_LABEL, type MedalCode, PEOPLE, UPDATED,
} from "@/data";
import { Container, Kicker, SectionHead, MedalTriplet, MedalDot, CountUp, PageHero, Reveal, StackBar, Tabs } from "@/components/site";
import { EditionChart, EditionSheet, EditionStrip, SportBars, ord } from "@/components/charts";
import { API_BASE } from "@/lib/queryClient";
import NotFound from "./not-found";
import { cn } from "@/lib/utils";

type G = "oly" | "cwg" | "asian";
const META: Record<G, { name: string; slug: string; data: Edition[]; img: string; sports: { rows: [string, number, number, number][]; label: string }; milestones?: [string, string, string][] }> = {
  oly: { name: "Olympic Games", slug: "olympics", data: OLY, img: IMG.hockey, sports: { rows: OLY_SPORTS, label: "All Olympic medals by sport" }, milestones: OLY_MILESTONES },
  cwg: { name: "Commonwealth Games", slug: "commonwealth", data: CWG, img: IMG.weightlifting, sports: { rows: CWG_SPORTS, label: "All Commonwealth medals by sport" }, milestones: CWG_MILESTONES },
  asian: { name: "Asian Games", slug: "asian-games", data: ASIAN, img: IMG.cricket, sports: { rows: ASIAN_SPORTS_2026, label: "Aichi-Nagoya 2026 medals by sport" } },
};
const bySlug = (s: string) => (Object.keys(META) as G[]).find(k => META[k].slug === s);

const Exports = ({ sets }: { sets: [string, string][] }) => (
  <div className="flex flex-wrap gap-2">
    {sets.map(([name, label]) => (
      <a key={name} href={`${API_BASE}/api/export/${name}.csv`} target="_blank" rel="noopener noreferrer" data-testid={`link-export-${name}`}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:border-primary hover:text-primary"><Download className="h-4 w-4" />{label}</a>
    ))}
  </div>
);

export function MedalsOverview() {
  const rows: [G, { g: number; s: number; b: number }, string][] = [
    ["oly", sumEditions(OLY), "Since Paris 1900, all at the Summer Games"],
    ["asian", { g: TALLY_ALL_ASIAN[2], s: TALLY_ALL_ASIAN[3], b: TALLY_ALL_ASIAN[4] }, `All-time since 1951, ranked ${TALLY_ALL_ASIAN[0]}`],
    ["cwg", sumEditions(CWG), "19 Games since 1934, fourth all-time"],
  ];
  const all = rows.reduce((t, [, m]) => t + total(m), 0);
  const timeline = [...OLY_MILESTONES.map(m => [...m, "Olympics"]), ...CWG_MILESTONES.map(m => [...m, "Commonwealth"])].sort((a, b) => a[0].localeCompare(b[0]));
  return (
    <>
      <PageHero kicker="Medal history" title={<>India's medal record, <span className="text-saffron">in full.</span></>} img={IMG.crowd}
        dek={<>{all.toLocaleString("en-IN")} medals across the Olympics, Asian Games and Commonwealth Games. Pick a Games to explore every edition.</>} />
      <Container className="-mt-10 relative z-10">
        <div className="grid gap-4 md:grid-cols-3">
          {rows.map(([k, m, sub]) => (
            <Link key={k} href={`/medals/${META[k].slug}`} data-testid={`card-games-${k}`} className="group rounded-lg border border-border bg-card p-6 shadow-xl shadow-black/5 transition hover:-translate-y-0.5 hover:border-primary">
              <p className="font-bold">{META[k].name}</p>
              <p className="mt-2 font-display text-6xl font-semibold leading-none"><CountUp to={total(m)} /></p>
              <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
              <StackBar g={m.g} s={m.s} b={m.b} className="mt-5" />
              <MedalTriplet g={m.g} s={m.s} b={m.b} size="sm" className="mt-3" />
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">Explore every edition<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </Container>
      <Container className="py-16 md:py-24">
        <SectionHead kicker="Timeline" title="Milestones that shaped Indian sport" />
        <ol className="relative space-y-0 border-l-2 border-border pl-6 md:ml-24">
          {timeline.map(([y, h, t, g], i) => (
            <Reveal key={i}><li className="relative pb-8">
              <span className={cn("absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-4 border-background", g === "Olympics" ? "bg-indgreen" : "bg-[hsl(226_80%_60%)]")} />
              <span className="font-display text-xl font-semibold text-primary md:absolute md:-left-[7.5rem] md:top-0 md:w-20 md:text-right">{y}</span>
              <p className="font-bold">{h} <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{g}</span></p>
              <p className="mt-1 max-w-2xl text-muted-foreground">{t}</p>
            </li></Reveal>
          ))}
        </ol>
      </Container>
    </>
  );
}

function MedallistExplorer() {
  const [q, setQ] = useState(""); const [m, setM] = useState<"all" | MedalCode>("all"); const [sp, setSp] = useState("all");
  const sports = [...new Set(OLY_MEDALS.map(x => x.sp))].sort();
  const list = useMemo(() => OLY_MEDALS.filter(x => (m === "all" || x.m === m) && (sp === "all" || x.sp === sp) && (!q || `${x.n} ${x.ev} ${x.y}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.y - a.y), [q, m, sp]);
  const slug = (n: string) => PEOPLE.find(p => p.name.toLowerCase() === n.toLowerCase())?.slug;
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search medallists</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a name, event or year" data-testid="input-medallist-search" className="h-11 w-full rounded-full border border-input bg-background pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary" /></label>
        <select value={sp} onChange={e => setSp(e.target.value)} data-testid="select-medallist-sport" aria-label="Sport" className="h-11 rounded-full border border-input bg-background px-4 font-bold">
          <option value="all">All sports</option>{sports.map(s => <option key={s}>{s}</option>)}</select>
        <div className="flex rounded-full border border-border p-1" role="radiogroup" aria-label="Medal">
          {(["all", "G", "S", "B"] as const).map(k => <button key={k} role="radio" aria-checked={m === k} onClick={() => setM(k)} data-testid={`filter-medal-${k}`} className={cn("flex items-center gap-1.5 rounded-full px-3 text-sm font-bold", m === k ? "bg-foreground text-background" : "text-muted-foreground")}>{k !== "all" && <MedalDot m={k} className="ring-0" />}{k === "all" ? "All" : MEDAL_LABEL[k]}</button>)}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{list.length} of {OLY_MEDALS.length} medals</p>
      {list.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No medals match. Clear the search or pick another sport.</p> : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((x, i) => { const s = slug(x.n); return (
            <li key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4">
              <span className="flex w-14 shrink-0 flex-col items-center"><MedalDot m={x.m} className="h-5 w-5" /><span className="mt-1.5 font-display text-lg font-semibold tnum">{x.y}</span></span>
              <div className="min-w-0">{s ? <Link href={`/athletes/${s}`} className="font-bold hover:text-primary">{x.n}</Link> : <p className="font-bold">{x.n}</p>}
                <p className="text-sm text-muted-foreground">{x.sp} · {x.ev}</p><p className="text-xs text-muted-foreground">{x.d}</p></div>
            </li>); })}
        </ul>
      )}
    </div>
  );
}

function EditionsTable({ data, onPick }: { data: Edition[]; onPick: (e: Edition) => void }) {
  const rows = [...data].reverse();
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="p-3">Games</th><th className="p-3 text-right">Gold</th><th className="p-3 text-right">Silver</th><th className="p-3 text-right">Bronze</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Rank</th><th className="w-48 p-3"><span className="sr-only">Share</span></th></tr></thead>
          <tbody className="divide-y divide-border">
            {rows.map(e => (
              <tr key={e.y} onClick={() => isPlayed(e) && onPick(e)} className={cn("tnum", isPlayed(e) ? "cursor-pointer hover:bg-muted/60" : "text-muted-foreground")} data-testid={`row-edition-${e.y}`}>
                <td className="p-3"><b>{e.y}</b> <span className="text-muted-foreground">{e.host}</span></td>
                {e.dnp ? <td colSpan={5} className="p-3 text-right italic">Did not take part</td> : e.upcoming ? <td colSpan={5} className="p-3 text-right italic">Upcoming</td> : <>
                  <td className="p-3 text-right">{e.g}</td><td className="p-3 text-right">{e.s}</td><td className="p-3 text-right">{e.b}</td><td className="p-3 text-right font-bold">{total(e)}</td><td className="p-3 text-right">{e.rank ? ord(e.rank) : "–"}</td></>}
                <td className="p-3">{isPlayed(e) && <StackBar g={e.g} s={e.s} b={e.b} max={Math.max(...data.filter(isPlayed).map(total))} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden">
        {rows.filter(e => !e.dnp).map(e => (
          <li key={e.y}><button disabled={!isPlayed(e)} onClick={() => onPick(e)} className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left">
            <span className="w-14 font-display text-2xl font-semibold tnum">{e.y}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{e.host}</span>{isPlayed(e) ? <MedalTriplet g={e.g} s={e.s} b={e.b} size="sm" className="mt-1 gap-3" /> : <span className="text-sm text-muted-foreground">Upcoming</span>}</span>
            {isPlayed(e) && <span className="text-right"><span className="block font-display text-2xl font-semibold tnum">{total(e)}</span><span className="text-xs text-muted-foreground">{e.rank ? ord(e.rank) : ""}</span></span>}
          </button></li>
        ))}
      </ul>
    </>
  );
}

export function MedalsGames() {
  const { games } = useParams<{ games: string }>();
  const k = bySlug(games);
  const [pick, setPick] = useState<Edition | null>(null);
  const [view, setView] = useState<"chart" | "table">("chart");
  if (!k) return <NotFound />;
  const M = META[k];
  const s = k === "asian" ? { g: TALLY_ALL_ASIAN[2], s: TALLY_ALL_ASIAN[3], b: TALLY_ALL_ASIAN[4] } : sumEditions(M.data);
  const played = M.data.filter(isPlayed);
  const best = played.reduce((a, b) => (total(b) > total(a) ? b : a));
  const topSport = [...M.sports.rows].sort((a, b) => (b[1] + b[2] + b[3]) - (a[1] + a[2] + a[3]))[0];
  const last = played[played.length - 1];
  const stars = k === "oly" ? OLY_STARS.map(r => ({ n: r[0], sp: r[1], t: r[2] })) : k === "cwg" ? CWG_STARS.map(r => ({ n: r[0], sp: r[1], t: r[2] })) : [];
  const exportSets: [string, string][] = k === "oly" ? [["india-olympic-editions", "Editions CSV"], ["india-olympic-medals", "All 41 medals CSV"]] : k === "cwg" ? [["india-commonwealth-editions", "Editions CSV"]] : [["asian-games-2026-medal-table", "2026 medal table CSV"]];
  const otherKeys = (Object.keys(META) as G[]).filter(x => x !== k);
  return (
    <>
      <PageHero kicker={`India at the ${M.name}`} img={M.img} accent={k === "oly" ? "hsl(var(--indgreen))" : k === "cwg" ? "hsl(226 80% 60%)" : undefined}
        title={<><CountUp to={total(s)} /> medals.</>}
        dek={k === "oly" ? "Ten golds, ten silvers and 21 bronzes, from Norman Pritchard in 1900 to Paris 2024." : k === "cwg" ? "India's 602 medals rank fourth all-time, behind Australia, England and Canada." : `India rank ${TALLY_ALL_ASIAN[0]} on the all-time Asian Games table. This page covers the last five editions in depth.`}>
        <MedalTriplet g={s.g} s={s.s} b={s.b} size="lg" className="mt-8 text-paper" />
      </PageHero>

      <div className="sticky top-[67px] z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <Container className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          <Link href="/medals" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">Overview</Link>
          {(Object.keys(META) as G[]).map(x => <Link key={x} href={`/medals/${META[x].slug}`} data-testid={`subnav-${x}`} className={cn("shrink-0 rounded-full px-3 py-1.5 text-sm font-bold", x === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{META[x].name}</Link>)}
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {[["Best Games", `${best.host.split(",")[0]} ${best.y}`, `${total(best)} medals`], [k === "asian" ? "Top sport in 2026" : "Top sport", topSport[0], `${topSport[1] + topSport[2] + topSport[3]} medals, ${topSport[1]} gold`], ["Latest", `${last.host.split(",")[0]} ${last.y}`, `${total(last)} medals${last.rank ? `, ${ord(last.rank)}` : ""}`], ["Games attended", String(played.length), k === "asian" ? "editions shown" : `of ${M.data.filter(e => !e.upcoming).length} held`]].map(([a, b, c]) => (
            <div key={a} className="bg-card p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{a}</p><p className="mt-2 font-display text-2xl font-semibold leading-tight">{b}</p><p className="text-sm text-muted-foreground">{c}</p></div>
          ))}
        </div>
      </Container>

      <Container>
        <SectionHead kicker="Edition by edition" title="Every Games, one view" dek="Hover a column for the haul. Click any Games for its details." action={<Tabs tabs={[["chart", "Chart"], ["table", "Table"]]} value={view} onChange={setView} className="border-0" />} />
        {view === "chart" ? <div className="rounded-lg border border-border bg-card p-4 md:p-6"><EditionChart data={M.data} games={k} onPick={setPick} height={340} /></div> : <EditionsTable data={M.data} onPick={setPick} />}
        <div className="mt-8"><EditionStrip data={M.data} onPick={setPick} active={pick?.y} /></div>
      </Container>

      <Container className="grid gap-16 py-16 md:py-24 lg:grid-cols-[1.2fr_1fr]">
        <div><SectionHead kicker="Sports" title={M.sports.label} /><SportBars rows={M.sports.rows} limit={10} testid={`sports-${k}`} /></div>
        {stars.length > 0 ? <div><SectionHead kicker="Greats" title="India's standout performers" />
          <ul className="divide-y divide-border">{stars.map(st => { const p = PEOPLE.find(x => x.name.toLowerCase() === st.n.toLowerCase()); return (
            <li key={st.n} className="py-4">{p ? <Link href={`/athletes/${p.slug}`} className="font-bold hover:text-primary">{st.n}</Link> : <p className="font-bold">{st.n}</p>}<p className="text-sm text-muted-foreground">{st.sp} · {st.t}</p></li>); })}</ul></div>
          : <div className="rounded-lg bg-ink p-8 text-paper"><Kicker className="text-paper/70">Aichi-Nagoya 2026</Kicker><p className="mt-3 font-display text-3xl font-semibold">India's second-best Asian Games, with golds in cricket and hockey for both men and women.</p><Link href="/games/asian-games-2026" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground">Open the 2026 hub<ArrowRight className="h-4 w-4" /></Link></div>}
      </Container>

      {M.milestones && <Container className="pb-16">
        <SectionHead kicker="Milestones" title="Moments that defined the record" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{M.milestones.map(([y, h, t]) => (
          <div key={y + h} className="rounded-lg border border-border bg-card p-5"><p className="font-display text-3xl font-semibold text-primary tnum">{y}</p><p className="mt-2 font-bold">{h}</p><p className="mt-1 text-sm text-muted-foreground">{t}</p></div>
        ))}</div>
      </Container>}

      {k === "oly" && <Container className="pb-16"><SectionHead kicker="All 41" title="Every Indian Olympic medal" /><MedallistExplorer /></Container>}

      <Container className="pb-8">
        <div className="flex flex-col gap-6 rounded-lg border border-border p-6 md:flex-row md:items-center md:justify-between">
          <div><p className="font-bold">Download the data</p><p className="text-sm text-muted-foreground">Updated {UPDATED}. Free to use with credit to the original sources.</p></div>
          <Exports sets={exportSets} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div><p className="mb-2 text-sm font-bold">Sources</p><ul className="space-y-1.5">{MEDAL_SOURCES.map(([l, u]) => <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">{l}<ExternalLink className="h-3 w-3" /></a></li>)}</ul></div>
          <div><p className="mb-2 text-sm font-bold">Compare</p><div className="flex flex-wrap gap-2">{otherKeys.map(x => <Link key={x} href={`/medals/${META[x].slug}`} className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-4 text-sm font-bold hover:border-primary">{META[x].name}<ArrowRight className="h-3.5 w-3.5" /></Link>)}</div></div>
        </div>
      </Container>
      <EditionSheet edition={pick} games={k} onClose={() => setPick(null)} />
    </>
  );
}
