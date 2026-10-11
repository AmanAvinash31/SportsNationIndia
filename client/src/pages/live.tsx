import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, MapPin, Radio, Trophy, Tv, Users } from "lucide-react";
import { Container, Kicker, SectionHead, PageHero, Tabs, MedalTriplet, MedalDot, useCountdown, StackBar } from "@/components/site";
import { CalButton, FollowButton, type CalEvent } from "@/pages/plus";
import { Src, STATES_UT } from "@/pages/nation";
import { APG, APG_WATCH, APG_VENUES, LSRC, WATCH, LEAGUES, KIYG25, NG25, type LeagueKey, type StateRow } from "@/data/live";
import { PEOPLE } from "@/data";
import { cn } from "@/lib/utils";

/* ---------- shared ---------- */
type LiveMedal = { id: number; date: string; athlete: string; sport: string; event: string; medal: "G" | "S" | "B"; state: string | null; link: string | null };
type Fixture = { id: number; league: string; date: string; time: string | null; home: string; away: string; venue: string | null; home_score: number | null; away_score: number | null; status: string };
const slugOf = (name: string) => PEOPLE.find(p => p.name.toLowerCase() === name.toLowerCase())?.slug;
const istDate = (d: string) => new Date(d + "T00:00:00+05:30").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const fixtureEvent = (f: Fixture): CalEvent => {
  const start = `${f.date}T${f.time ?? "19:30"}:00+05:30`;
  const end = new Date(new Date(start).getTime() + (f.league === "pkl" ? 1 : 2) * 36e5).toISOString();
  return { id: `fx-${f.id}`, title: `${f.home} vs ${f.away}`, start, end, where: f.venue ?? "", note: `${LEAGUES[f.league as LeagueKey]?.name ?? f.league}. Watch: ${f.league === "isl" ? "Sony Sports Network, SonyLIV, YouTube" : "see Momentum India"}` };
};
function Countdown({ at, dark }: { at: string; dark?: boolean }) {
  const cd = useCountdown(at);
  if (!cd || cd.done) return null;
  return <div className="flex gap-2 tnum">{([["days", cd.d], ["hrs", cd.h], ["min", cd.m], ["sec", cd.s]] as const).map(([l, v]) => (
    <span key={l} className={cn("min-w-[4.25rem] rounded-lg px-2 py-2 text-center", dark ? "bg-white/10" : "bg-muted")}><b className="block font-display text-3xl leading-none">{String(v).padStart(2, "0")}</b><span className={cn("text-[0.65rem] font-bold uppercase tracking-[0.12em]", dark ? "text-paper/60" : "text-muted-foreground")}>{l}</span></span>))}</div>;
}
const phase = (start: string, end: string) => { const n = Date.now(); return n < +new Date(start) ? "before" : n < +new Date(end) ? "live" : "after"; };

/* ===================================================== Asian Para Games live hub */
export function ParaGames2026() {
  const ph = phase(APG.start, APG.end);
  const { data } = useQuery<{ tally: Record<"G" | "S" | "B", number>; medals: LiveMedal[]; updated: string | null }>({ queryKey: ["/api/live/apg2026"], refetchInterval: ph === "live" ? 60_000 : false });
  const t = data?.tally ?? { G: 0, S: 0, B: 0 }; const tot = t.G + t.S + t.B;
  const [sport, setSport] = useState("All");
  const medals = data?.medals ?? [];
  const sports = ["All", ...new Set(medals.map(m => m.sport))];
  const shown = sport === "All" ? medals : medals.filter(m => m.sport === sport);
  const bySport = useMemo(() => { const m = new Map<string, { g: number; s: number; b: number }>(); for (const x of medals) { const r = m.get(x.sport) ?? { g: 0, s: 0, b: 0 }; r[x.medal.toLowerCase() as "g"]++; m.set(x.sport, r); } return [...m.entries()].sort((a, b) => b[1].g - a[1].g || (b[1].g + b[1].s + b[1].b) - (a[1].g + a[1].s + a[1].b)); }, [medals]);
  const cal: CalEvent[] = [{ id: "apg2026", title: "Asian Para Games 2026", start: "2026-10-18", end: "2026-10-25", where: APG.where, note: `India's flag bearers: ${APG.flagBearers}` }];
  return (
    <>
      <PageHero kicker={ph === "live" ? "Live now · Aichi-Nagoya 2026" : ph === "before" ? "Live hub · Opens 18 October" : "Final results · Aichi-Nagoya 2026"} img="./img/relay.webp" accent="#FF9933"
        title={<>Asian Para Games <span className="tri-text">2026</span></>}
        dek={<>{APG.sports} sports, {APG.events} medal events and {APG.athletes} athletes from {APG.npcs} nations in Japan, {APG.dates}. India sends {APG.india.squad} athletes, led by flag bearers {APG.flagBearers}.</>}>
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
          {ph === "before" ? <Countdown at={APG.start} dark /> : (
            <div className="flex items-center gap-4"><span className="font-display text-6xl font-semibold tnum">{tot}</span><MedalTriplet g={t.G} s={t.S} b={t.B} size="lg" className="text-paper" /></div>)}
          <div className="flex flex-wrap gap-2">
            <FollowButton kind="games" k="asian-para-games-2026" label="Asian Para Games 2026" tone="dark" />
            <CalButton evs={cal} name="asian-para-games-2026" className="text-paper" />
            <Link href="/fan-zone" className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-sm font-bold text-ink hover:brightness-110" data-testid="link-apg-predict">Predict India's haul<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </PageHero>

      <Container className="py-12 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat v={`${APG.hangzhou.t}`} l={`medals at Hangzhou 2022, India's best: ${APG.hangzhou.g} gold, ${APG.hangzhou.s} silver, ${APG.hangzhou.b} bronze`} src={[LSRC.hangzhou, "Scroll"]} />
          <Stat v={`${APG.india.squad}`} l={`Indian athletes listed so far, ${APG.india.men} men and ${APG.india.women} women`} src={[LSRC.apgIndiaWiki, "Wikipedia"]} />
          <Stat v={`${APG.events}`} l={`medal events across ${APG.sports} sports`} src={[LSRC.apgWiki, "Wikipedia"]} />
          <Stat v="105" l="medal events on 20 October, up from 63 on the first medal day" src={[LSRC.apgWiki, "Games calendar"]} />
        </div>
      </Container>

      <section className="border-y border-border bg-card/40 py-12 md:py-16">
        <Container>
          <SectionHead kicker={ph === "live" ? "Updated every minute" : "Medal feed"} title="India's medallists" dek={data?.updated ? `Last update ${new Date(data.updated + "Z").toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST` : undefined}
            action={ph === "live" ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(2_75%_55%)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white"><Radio className="h-3.5 w-3.5 animate-pulse" />Live</span> : undefined} />
          {medals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Trophy className="mx-auto h-8 w-8 text-saffron" />
              <p className="mt-3 font-display text-2xl font-semibold">{ph === "before" ? "The first medals are decided on 19 October" : "No medals recorded yet"}</p>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">Every Indian medal appears here with the athlete, event and class. Follow the Games to get an alert, or make your picks in the fan zone before the opening ceremony.</p>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div>
                {sports.length > 2 && <div className="mb-4 flex flex-wrap gap-1">{sports.map(s => <button key={s} onClick={() => setSport(s)} className={cn("rounded-full px-3 py-1.5 text-sm font-bold", sport === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{s}</button>)}</div>}
                <ul className="grid gap-3 sm:grid-cols-2">{shown.map(m => { const slug = slugOf(m.athlete); const inner = (
                  <><div className="flex items-center justify-between gap-2"><span className={cn("rounded-full px-2 py-0.5 text-xs font-bold text-ink", { G: "bg-gold", S: "bg-silver", B: "bg-bronze" }[m.medal])}>{{ G: "Gold", S: "Silver", B: "Bronze" }[m.medal]}</span><span className="text-xs text-muted-foreground">{istDate(m.date)}</span></div>
                    <p className="mt-2 font-display text-xl font-semibold leading-tight">{m.athlete}</p><p className="text-sm text-muted-foreground">{m.sport} · {m.event}</p>{m.state && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{m.state}</p>}</>);
                  return <li key={m.id} className="min-w-0">{slug ? <Link href={`/athletes/${slug}`} className="block h-full rounded-lg border border-border bg-card p-4 hover:border-primary">{inner}</Link> : <div className="h-full rounded-lg border border-border bg-card p-4">{inner}</div>}</li>; })}</ul>
              </div>
              <aside className="rounded-lg border border-border bg-card p-5">
                <p className="font-bold">Medals by sport</p>
                <ul className="mt-4 space-y-3">{bySport.map(([s, r]) => <li key={s}><div className="flex justify-between text-sm"><span className="font-bold">{s}</span><MedalTriplet g={r.g} s={r.s} b={r.b} size="sm" className="gap-2" /></div><StackBar g={r.g} s={r.s} b={r.b} max={Math.max(...bySport.map(([, x]) => x.g + x.s + x.b))} className="mt-1.5" /></li>)}</ul>
              </aside>
            </div>
          )}
        </Container>
      </section>

      <Container className="grid gap-12 py-12 md:py-16 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionHead kicker="Who to watch" title="India's medal contenders" dek={<>Picked from the para-athletics outlook by <Src href={LSRC.apgContenders}>RevSportz</Src> and the archery squad named by <Src href={LSRC.apgArchery}>World Archery</Src>.</>} />
          <ul className="divide-y divide-border rounded-lg border border-border">{APG_WATCH.map(a => { const slug = slugOf(a.name); return (
            <li key={a.name} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="font-bold">{slug ? <Link href={`/athletes/${slug}`} className="hover:text-primary">{a.name}</Link> : a.name}</p><p className="truncate text-sm text-muted-foreground">{a.sport} · {a.event}</p></div>
              <FollowButton kind="athlete" k={a.name.toLowerCase().replace(/[^a-z]+/g, "-")} label={a.name} className="shrink-0" /></li>); })}</ul>
        </div>
        <div className="space-y-8">
          <div>
            <SectionHead kicker="Squad" title="India by sport" dek={<>As listed by <Src href={LSRC.apgIndiaWiki}>Wikipedia</Src>. Para table tennis, with flag bearer Bhavina Patel (<Src href={LSRC.apgFlag}>DD News</Src>), is not yet in that list, so the final squad may be larger.</>} />
            <ul className="space-y-2">{APG.india.bySport.map(([s, n]) => <li key={s} className="grid grid-cols-[9.5rem_1fr_2rem] items-center gap-3 text-sm"><span className="font-bold">{s}</span><span className="h-2.5 rounded-full bg-primary" style={{ width: `${(n / 44) * 100}%` }} /><span className="text-right tnum">{n}</span></li>)}</ul>
          </div>
          <WatchCard w={WATCH.find(w => w.comp.startsWith("Asian Para"))!} />
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-primary" />Key venues</p>
            <ul className="mt-3 space-y-1.5 text-sm">{APG_VENUES.map(([v, s]) => <li key={v} className="flex justify-between gap-3"><span>{v}</span><span className="text-right text-muted-foreground">{s}</span></li>)}</ul>
            <p className="mt-3 text-xs text-muted-foreground">Japan is 3.5 hours ahead of India: a 10 am session in Nagoya is 6:30 am IST.</p>
          </div>
          <Link href="/para" className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline">Para sport hub: classes explained and how to get started<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </Container>
    </>
  );
}
const Stat = ({ v, l, src }: { v: string; l: ReactNode; src: [string, string] }) => <div className="rounded-lg border border-border bg-card p-5"><p className="font-display text-4xl font-semibold tnum">{v}</p><p className="mt-1 text-sm text-muted-foreground">{l}</p><p className="mt-2 text-xs text-muted-foreground">Source: <Src href={src[0]}>{src[1]}</Src></p></div>;

/* ===================================================== where to watch */
const STATUS_LABEL = { live: "On now", soon: "Starts soon", tbc: "To be confirmed", done: "Replays" } as const;
function WatchCard({ w }: { w: typeof WATCH[number] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5" data-testid={`watch-${w.comp.slice(0, 12)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 font-bold"><Tv className="h-4 w-4 text-primary" />{w.comp}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", w.status === "soon" ? "bg-indgreen/15 text-indgreen" : w.status === "tbc" ? "bg-saffron/15 text-saffron" : "bg-muted text-muted-foreground")}>{STATUS_LABEL[w.status]}</span></div>
      <p className="mt-1 text-sm text-muted-foreground">{w.when}</p>
      <dl className="mt-3 grid gap-1.5 text-sm"><div><dt className="inline font-bold">TV: </dt><dd className="inline">{w.tv}</dd></div><div><dt className="inline font-bold">Streaming: </dt><dd className="inline">{w.stream}</dd></div>{w.free && <div><dt className="inline font-bold">Free: </dt><dd className="inline">{w.free}</dd></div>}</dl>
      <p className="mt-3 text-xs text-muted-foreground">Source: <Src href={w.src}>{new URL(w.src).hostname.replace(/^www\./, "")}</Src></p>
    </div>
  );
}
export function WhereToWatch() {
  const { data } = useQuery<{ fixtures: Fixture[] }>({ queryKey: ["/api/fixtures"] });
  const up = (data?.fixtures ?? []).filter(f => f.status !== "final").slice(0, 14);
  const days = [...new Set(up.map(f => f.date))];
  return (
    <>
      <PageHero kicker="Where to watch · Times in IST" img="./img/crowd.webp" title="Never miss India in action" dek="TV channels, streaming apps and start times for every competition we cover, with one-tap calendar reminders." />
      <Container className="py-12 md:py-16">
        <SectionHead kicker="Broadcasters" title="Who shows what in India" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{WATCH.map(w => <div key={w.comp} className="flex flex-col"><WatchCard w={w} />{w.href && <Link href={w.href} className="mt-2 inline-flex items-center gap-1 self-start text-sm font-bold text-primary hover:underline">Open the hub<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>)}</div>
        <p className="mt-4 text-sm text-muted-foreground">Broadcasters change between seasons. We check these before each event; tell us about a change on the <Link href="/about/standards" className="font-bold text-primary hover:underline">corrections page</Link>.</p>

        <SectionHead className="mt-16" kicker="Coming up" title="Next matches" action={up.length > 0 ? <CalButton evs={up.map(fixtureEvent)} name="momentum-india-fixtures" label="Add all to calendar" /> : undefined} />
        {up.length === 0 ? <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No fixtures scheduled right now.</p> : (
          <div className="space-y-6">{days.map(d => (
            <div key={d}><p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">{istDate(d)}</p>
              <ul className="divide-y divide-border rounded-lg border border-border">{up.filter(f => f.date === d).map(f => <FixtureRow key={f.id} f={f} />)}</ul></div>
          ))}</div>
        )}
      </Container>
    </>
  );
}
function FixtureRow({ f, showLeague = true }: { f: Fixture; showLeague?: boolean }) {
  const done = f.home_score != null && f.away_score != null;
  return (
    <li className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 p-3 sm:grid-cols-[4rem_1fr_auto_auto]" data-testid={`fixture-${f.id}`}>
      <span className="font-bold tnum">{f.time ?? "TBC"}</span>
      <div className="min-w-0"><p className="font-bold">{f.home} <span className="font-normal text-muted-foreground">{done ? <b className="text-foreground tnum">{f.home_score}–{f.away_score}</b> : "vs"}</span> {f.away}</p>
        <p className="truncate text-xs text-muted-foreground">{showLeague && <>{LEAGUES[f.league as LeagueKey]?.name ?? f.league.toUpperCase()} · </>}{f.venue ?? "Venue to be confirmed"}{f.league === "isl" && " · Sony Sports, SonyLIV, YouTube"}</p></div>
      {f.status === "live" ? <span className="rounded-full bg-[hsl(2_75%_55%)] px-2 py-0.5 text-xs font-bold text-white">Live</span> : done ? <span className="text-xs font-bold text-muted-foreground">Full time</span> : <CalButton evs={[fixtureEvent(f)]} name={`fixture-${f.id}`} label="Remind me" className="hidden px-3 py-1.5 text-xs sm:inline-flex" />}
      <span className="hidden sm:block" />
    </li>
  );
}

/* ===================================================== leagues */
type Standing = { team: string; p: number; w: number; d: number; l: number; f: number; a: number; pts: number };
function standings(teams: string[], fx: Fixture[], pts: [number, number, number]): Standing[] {
  const m = new Map<string, Standing>(teams.map(t => [t, { team: t, p: 0, w: 0, d: 0, l: 0, f: 0, a: 0, pts: 0 }]));
  for (const x of fx) {
    if (x.home_score == null || x.away_score == null) continue;
    const h = m.get(x.home) ?? (m.set(x.home, { team: x.home, p: 0, w: 0, d: 0, l: 0, f: 0, a: 0, pts: 0 }), m.get(x.home)!);
    const a = m.get(x.away) ?? (m.set(x.away, { team: x.away, p: 0, w: 0, d: 0, l: 0, f: 0, a: 0, pts: 0 }), m.get(x.away)!);
    h.p++; a.p++; h.f += x.home_score; h.a += x.away_score; a.f += x.away_score; a.a += x.home_score;
    if (x.home_score > x.away_score) { h.w++; a.l++; h.pts += pts[0]; a.pts += pts[2]; } else if (x.home_score < x.away_score) { a.w++; h.l++; a.pts += pts[0]; h.pts += pts[2]; } else { h.d++; a.d++; h.pts += pts[1]; a.pts += pts[1]; }
  }
  return [...m.values()].sort((x, y) => y.pts - x.pts || (y.f - y.a) - (x.f - x.a) || y.f - x.f || x.team.localeCompare(y.team));
}
export function Leagues() {
  const [k, setK] = useState<LeagueKey>("isl");
  const L = LEAGUES[k];
  const { data } = useQuery<{ fixtures: Fixture[] }>({ queryKey: [`/api/fixtures?league=${k}`] });
  const fx = data?.fixtures ?? [];
  const table = standings(L.teams, fx, L.points);
  const played = fx.filter(f => f.home_score != null);
  const next = fx.filter(f => f.home_score == null).slice(0, 10);
  return (
    <>
      <PageHero kicker="Leagues · Week in, week out" img={L.img} title="India's leagues" dek="Football, kabaddi and hockey between the big Games: fixtures, results, tables and where to watch." />
      <Container className="py-10 md:py-14">
        <Tabs tabs={[["isl", "Indian Super League"], ["pkl", "Pro Kabaddi"], ["hil", "Hockey India League"]]} value={k} onChange={setK} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <Kicker className="text-gold-ink">{L.sport} · {L.season}</Kicker>
            <h2 className="mt-2 text-balance break-words font-display text-[clamp(1.9rem,1.3rem+2vw,2.6rem)] font-bold leading-tight">{L.name}</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{L.status}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{L.facts.map(([v, l]) => <div key={l} className="rounded-lg border border-border bg-card p-4"><p className="font-display text-2xl font-semibold tnum">{v}</p><p className="mt-1 text-sm text-muted-foreground">{l}</p></div>)}</div>
            {next.length > 0 && <>
              <SectionHead className="mt-12" kicker="Fixtures" title="Coming up" action={<CalButton evs={next.map(fixtureEvent)} name={`${k}-fixtures`} label="Add to calendar" />} />
              <ul className="divide-y divide-border rounded-lg border border-border">{next.map(f => <FixtureRow key={f.id} f={{ ...f, venue: `${istDate(f.date)} · ${f.venue ?? "Venue TBC"}` }} showLeague={false} />)}</ul>
            </>}
            {played.length > 0 && <>
              <SectionHead className="mt-12" kicker="Results" title="Latest scores" />
              <ul className="divide-y divide-border rounded-lg border border-border">{played.slice(-10).reverse().map(f => <FixtureRow key={f.id} f={{ ...f, venue: `${istDate(f.date)} · ${f.venue ?? ""}` }} showLeague={false} />)}</ul>
            </>}
            {fx.length === 0 && <p className="mt-10 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">Fixtures appear here as soon as the league publishes them. Follow {L.sport.toLowerCase()} to get an alert.</p>}
          </div>
          <aside className="min-w-0 space-y-6">
            {L.teams.length > 0 && <div className="overflow-hidden rounded-lg border border-border bg-card">
              <p className="flex items-center justify-between border-b border-border p-4 font-bold"><span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" />Table</span><span className="text-xs font-normal text-muted-foreground">{played.length ? `${played.length} played` : "Before kick-off"}</span></p>
              <div className="overflow-x-auto"><table className="w-full text-sm tnum">
                <thead className="text-xs text-muted-foreground"><tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Team</th><th className="p-2">P</th><th className="p-2">W</th><th className="p-2">D</th><th className="p-2">L</th><th className="p-2">+/-</th><th className="p-2">Pts</th></tr></thead>
                <tbody>{table.map((r, i) => <tr key={r.team} className="border-t border-border"><td className="p-2 text-muted-foreground">{i + 1}</td><td className="whitespace-nowrap p-2 font-bold">{r.team}</td><td className="p-2 text-center">{r.p}</td><td className="p-2 text-center">{r.w}</td><td className="p-2 text-center">{r.d}</td><td className="p-2 text-center">{r.l}</td><td className="p-2 text-center">{r.f - r.a}</td><td className="p-2 text-center font-bold">{r.pts}</td></tr>)}</tbody>
              </table></div>
              <p className="border-t border-border p-3 text-xs text-muted-foreground">Calculated from results on this site: {L.points[0]} points for a win, {L.points[1]} for a draw{k === "pkl" ? " or tie" : ""}. The official table may apply extra rules.</p>
            </div>}
            <WatchCard w={WATCH.find(w => w.comp.toLowerCase().includes(L.name.split(" ")[0].toLowerCase().slice(0, 5)))!} />
            <div className="flex flex-wrap gap-2"><FollowButton kind="sport" k={L.sport.toLowerCase()} label={L.sport} /></div>
            <p className="text-xs text-muted-foreground">Sources: {L.src.map(([l, h], i) => <span key={h}>{i > 0 && ", "}<Src href={h}>{l}</Src></span>)}.</p>
          </aside>
        </div>
      </Container>
    </>
  );
}

/* ===================================================== state leaderboards */
type District = { state: string; district: string; n: number; sports: string };
export function StateLeaderboards() {
  const [which, setWhich] = useState<"kiyg" | "ng">("kiyg");
  const [mine, setMine] = useState("");
  const rows: StateRow[] = which === "kiyg" ? KIYG25 : NG25;
  const max = Math.max(...rows.map(r => r[4]));
  const { data } = useQuery<{ districts: District[] }>({ queryKey: ["/api/community"] });
  const districts = data?.districts ?? [];
  const pos = rows.findIndex(r => r[0] === mine);
  return (
    <>
      <PageHero kicker="State leaderboards · Back your state" img="./img/youth-training.webp" title="Which state makes champions?" dek="Medal tables from the Khelo India Youth Games and the National Games, and the districts producing local stars on this site." />
      <Container className="py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs tabs={[["kiyg", "Khelo India Youth Games 2025"], ["ng", "National Games 2025"]]} value={which} onChange={setWhich} />
          <label className="text-sm"><span className="mb-1 block font-bold">Highlight my state</span><select className="h-10 rounded-md border border-input bg-background px-3" value={mine} onChange={e => setMine(e.target.value)} data-testid="select-my-state"><option value="">Choose a state</option>{STATES_UT.map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <p className="mt-4 max-w-3xl text-muted-foreground">{which === "kiyg" ? <>Bihar hosted the seventh Khelo India Youth Games, 4 to 15 May 2025, across 27 sports. Ranked by gold medals. Source: <Src href={LSRC.kiyg}>Wikipedia</Src>, matching the <Src href={LSRC.kiygOfficial}>official medal tally</Src>.</>
          : <>The 38th National Games in Uttarakhand, January to February 2025. Ranked by gold medals; Services is the armed forces team. Source: <Src href={LSRC.ng}>Olympics.com</Src>.</>}</p>
        {mine && <p className="mt-3 rounded-md bg-primary/10 p-3 text-sm font-bold" role="status">{pos >= 0 ? `${mine} finished ${pos + 1}${["st", "nd", "rd"][pos] ?? "th"} with ${rows[pos][1]} gold and ${rows[pos][4]} medals in total.` : `${mine} finished outside the top 12. Find a club near you or nominate a local star to help it climb.`}</p>}
        <ol className="mt-6 space-y-2">{rows.map((r, i) => (
          <li key={r[0]} className={cn("grid grid-cols-[2rem_8.5rem_1fr_auto] items-center gap-3 rounded-lg border p-3 sm:grid-cols-[2rem_11rem_1fr_auto]", r[0] === mine ? "border-primary bg-primary/5" : "border-border bg-card")} data-testid={`state-row-${i}`}>
            <span className="font-display text-xl font-semibold tnum text-muted-foreground">{i + 1}</span>
            <span className="truncate font-bold">{r[0]}</span>
            <StackBar g={r[1]} s={r[2]} b={r[3]} max={max} />
            <span className="flex items-center gap-3"><MedalTriplet g={r[1]} s={r[2]} b={r[3]} size="sm" className="hidden gap-2 sm:flex" /><b className="w-10 text-right tnum">{r[4]}</b></span>
          </li>))}</ol>

        <SectionHead className="mt-16" kicker="From this site" title="Districts producing local stars" dek="Counts of verified local-star nominations by district. Every approved nomination moves a district up." />
        {districts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center"><Users className="mx-auto h-7 w-7 text-saffron" /><p className="mt-2 font-display text-xl font-semibold">No verified local stars yet</p>
            <Link href="/sporting-nation/stars" className="mt-3 inline-flex items-center gap-1.5 font-bold text-primary hover:underline">Nominate the first one<ArrowRight className="h-4 w-4" /></Link></div>
        ) : <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{districts.map(d => <li key={d.state + d.district} className="flex items-center justify-between rounded-lg border border-border bg-card p-3"><span><b>{d.district}</b><span className="block text-xs text-muted-foreground">{d.state} · {d.sports.split(",").slice(0, 3).join(", ")}</span></span><b className="font-display text-2xl tnum">{d.n}</b></li>)}</ul>}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/clubs" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">Find a club or coach<ArrowRight className="h-4 w-4" /></Link>
          <Link href="/facilities" className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 font-bold hover:bg-muted">Facilities by state</Link>
        </div>
      </Container>
    </>
  );
}

/* Small "live now" strip for the home page. */
export function LiveStrip() {
  const ph = phase(APG.start, APG.end);
  return (
    <Container className="py-10">
      <div className="grid gap-3 md:grid-cols-4">
        {([
          ["/games/asian-para-games-2026", ph === "live" ? "Live now" : "From 18 Oct", "Asian Para Games hub", "Medal feed, contenders, squad", Radio],
          ["/watch", "Times in IST", "Where to watch", "Channels, apps and reminders", Tv],
          ["/leagues", "ISL from 10 Oct", "Leagues", "ISL, Pro Kabaddi, Hockey India League", CalendarClock],
          ["/fan-zone", "Play", "Fan zone", "Predictions, quiz, on this day", Trophy],
        ] as const).map(([h, k, t, d, I]) => (
          <Link key={h} href={h} className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary" data-testid={`live-strip-${h.slice(1).replace(/\//g, "-")}`}>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-saffron"><I className="h-4 w-4" />{k}</span>
            <p className="mt-2 font-display text-xl font-semibold group-hover:text-primary">{t}</p><p className="text-sm text-muted-foreground">{d}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
