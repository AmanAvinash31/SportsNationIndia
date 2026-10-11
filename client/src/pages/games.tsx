import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUp, ArrowRight, Search, MapPin, Ticket, Users, Plane, Utensils, Camera, CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import {
  TALLY26, NOC, flag, type TallyRow, PEOPLE, ASIAN_SPORTS_2026, VS2023, SPLITS, DAILY, DAY_NOTES, IMG, GLASGOW_TOP, GLASGOW_DAYS, CWG, total, VENUES, CITY, ARTICLES, FAQS,
} from "@/data";
import { Container, SectionHead, MedalTriplet, PageHero, Tabs, MedalDot, Kicker, NewsletterForm, StackBar } from "@/components/site";
import { DailyChart, SportBars } from "@/components/charts";
import { StoryCard } from "./home";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/* ================= Asian Games 2026 ================= */
type SortKey = "rank" | "g" | "s" | "b" | "t" | "name";
function MedalTable() {
  const [q, setQ] = useState(""); const [region, setRegion] = useState("all");
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: "rank", dir: 1 });
  const regions = [...new Set(Object.values(NOC).map(n => n[1]))].sort();
  const rows = useMemo(() => {
    const idx: Record<SortKey, (r: TallyRow) => number | string> = { rank: r => r[0], g: r => r[2], s: r => r[3], b: r => r[4], t: r => r[5], name: r => NOC[r[1]]?.[0] ?? r[1] };
    return TALLY26.filter(r => (region === "all" || NOC[r[1]]?.[1] === region) && (!q || (NOC[r[1]]?.[0] ?? r[1]).toLowerCase().includes(q.toLowerCase()) || r[1].toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => { const x = idx[sort.k](a), y = idx[sort.k](b); const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number); return (sort.k === "rank" || sort.k === "name" ? c : -c) * sort.dir; });
  }, [q, region, sort]);
  const th = (k: SortKey, l: React.ReactNode, cls = "text-right") => (
    <th className={cn("p-3", cls)}><button onClick={() => setSort(s => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : 1 }))} data-testid={`sort-${k}`} className="inline-flex items-center gap-1 font-bold uppercase">{l}{sort.k === k && (sort.dir === 1 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}</button></th>
  );
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search nations</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a nation" data-testid="input-nation-search" className="h-11 w-full rounded-full border border-input bg-background pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary" /></label>
        <select value={region} onChange={e => setRegion(e.target.value)} aria-label="Region" data-testid="select-region" className="h-11 rounded-full border border-input bg-background px-4 font-bold"><option value="all">All regions</option>{regions.map(r => <option key={r}>{r}</option>)}</select>
      </div>
      {rows.length === 0 ? <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No nation matches "{q}".</p> : <>
        <div className="mt-6 hidden overflow-hidden rounded-lg border border-border md:block">
          <table className="w-full text-sm tnum" data-testid="table-medals">
            <thead className="bg-muted text-xs tracking-[0.08em] text-muted-foreground"><tr>{th("rank", "#", "w-16 text-left")}{th("name", "Nation", "text-left")}{th("g", <><MedalDot m="G" className="ring-0" />Gold</>)}{th("s", <><MedalDot m="S" className="ring-0" />Silver</>)}{th("b", <><MedalDot m="B" className="ring-0" />Bronze</>)}{th("t", "Total")}</tr></thead>
            <tbody className="divide-y divide-border">{rows.map(r => (
              <tr key={r[1]} className={cn(r[1] === "IND" ? "mi-india-row font-bold" : "hover:bg-muted/50")}>
                <td className="p-3">{r[0]}</td><td className="p-3"><span className="mr-2" aria-hidden="true">{flag(r[1])}</span>{NOC[r[1]]?.[0] ?? r[1]} {r[1] === "IND" ? <span className="ml-1 rounded-md bg-gold/20 px-1.5 py-0.5 font-mono text-[0.62rem] font-bold tracking-[0.12em] text-gold-ink">BHARAT</span> : <span className="text-xs text-muted-foreground">{r[1]}</span>}</td>
                <td className="p-3 text-right font-semibold text-gold-ink">{r[2]}</td><td className="p-3 text-right">{r[3]}</td><td className="p-3 text-right text-bronze">{r[4]}</td><td className="p-3 text-right font-bold">{r[5]}</td>
              </tr>))}</tbody>
          </table>
        </div>
        <ul className="mt-6 space-y-2 md:hidden">{rows.map(r => (
          <li key={r[1]} className={cn("flex items-center gap-3 rounded-lg border p-3", r[1] === "IND" ? "mi-india-row border-gold/60" : "border-border bg-card")}>
            <span className="w-7 text-center font-display text-lg font-semibold tnum">{r[0]}</span><span className="text-xl" aria-hidden="true">{flag(r[1])}</span>
            <span className="min-w-0 flex-1"><span className="block truncate font-bold">{NOC[r[1]]?.[0] ?? r[1]}</span><MedalTriplet g={r[2]} s={r[3]} b={r[4]} size="sm" className="gap-3" /></span>
            <span className="font-display text-2xl font-semibold tnum">{r[5]}</span>
          </li>))}</ul>
      </>}
    </div>
  );
}

function Squad() {
  const [sp, setSp] = useState("all");
  const meds = PEOPLE.filter(p => p.asian26);
  const sports = [...new Set(meds.map(p => p.sport))].sort();
  const list = meds.filter(p => sp === "all" || p.sport === sp).sort((a, b) => (b.asian26!.G - a.asian26!.G) || (b.asian26!.S - a.asian26!.S) || a.name.localeCompare(b.name));
  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {["all", ...sports].map(s => <button key={s} onClick={() => setSp(s)} data-testid={`chip-sport-${s}`} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold", sp === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground")}>{s === "all" ? `All (${meds.length})` : s}</button>)}
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map(p => (
        <li key={p.slug}><Link href={`/athletes/${p.slug}`} data-testid={`squad-${p.slug}`} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md"><img src={p.img} alt="" className="h-full w-full object-cover" loading="lazy" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate font-bold group-hover:text-primary">{p.name}</span><span className="block truncate text-xs text-muted-foreground">{p.sport} · {p.asian26!.event}</span></span>
          <span className="flex gap-1">{(["G", "S", "B"] as const).flatMap(m => Array.from({ length: p.asian26![m] }, (_, i) => <MedalDot key={m + i} m={m} />))}</span>
        </Link></li>))}</ul>
    </div>
  );
}

function Analytics() {
  const vs = VS2023.map(v => ({ sport: v[0], y26: v[1], y23: v[3] })).sort((a, b) => b.y26 - a.y26).slice(0, 12);
  return (
    <div className="space-y-16">
      <div><SectionHead kicker="Day by day" title="How the 85 medals arrived" /><DailyChart /></div>
      <div className="grid gap-12 lg:grid-cols-2">
        <div><SectionHead kicker="By sport" title="20 sports on the podium" /><SportBars rows={ASIAN_SPORTS_2026} limit={10} testid="sports-asian26" /></div>
        <div><SectionHead kicker="Comparison" title="2026 against Hangzhou" />
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={vs} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="sport" width={96} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="y23" name="Hangzhou 2023" fill="hsl(var(--muted-foreground))" fillOpacity={0.45} radius={[0, 3, 3, 0]} />
              <Bar dataKey="y26" name="Aichi-Nagoya 2026" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{([["By gender", SPLITS.gender], ["Individual or team", SPLITS.kind]] as const).map(([h, rows]) => { const t = rows.reduce((a, r) => a + r[1], 0); return (
        <div key={h} className="rounded-lg border border-border bg-card p-6"><p className="font-bold">{h}</p>
          <div className="mt-4 flex h-4 overflow-hidden rounded-full">{rows.map((r, i) => <span key={r[0]} style={{ width: `${(r[1] / t) * 100}%`, background: ["hsl(var(--primary))", "hsl(var(--indgreen))", "hsl(226 80% 60%)"][i] }} />)}</div>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">{rows.map((r, i) => <li key={r[0]} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ["hsl(var(--primary))", "hsl(var(--indgreen))", "hsl(226 80% 60%)"][i] }} />{r[0]} <b className="tnum">{r[1]}</b></li>)}</ul></div>); })}</div>
      <div><SectionHead kicker="Timeline" title="Day-by-day log" />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{DAILY.map(d => { const t = d[2] + d[3] + d[4]; return (
          <li key={d[0]} className={cn("rounded-lg border p-4", t >= 10 ? "border-primary bg-primary/10" : "border-border bg-card")}>
            <p className="flex items-baseline justify-between"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{d[0]} · {d[1]}</span><span className="font-display text-2xl font-semibold tnum">{t || "–"}</span></p>
            {t > 0 && <StackBar g={d[2]} s={d[3]} b={d[4]} max={12} className="mt-2 h-1.5" />}
            <p className="mt-2 text-sm text-muted-foreground">{DAY_NOTES[d[0]] ?? `${d[2]} gold, ${d[3]} silver, ${d[4]} bronze.`}</p>
          </li>); })}</ol></div>
    </div>
  );
}

export function AsianGames2026() {
  const [tab, setTab] = useState<"overview" | "table" | "squad" | "analytics">("overview");
  const ind = TALLY26.find(r => r[1] === "IND")!;
  const stories = ARTICLES.filter(a => a.g === "asian").slice(0, 3);
  return (
    <>
      <PageHero kicker="20th Asian Games · Aichi-Nagoya, Japan · 19 Sep to 4 Oct 2026" img={IMG.hockey} title={<>India finish <span className="text-saffron">fourth</span> with 85 medals.</>}
        dek="The second-best Asian Games in India's history, with golds for both men's and women's cricket and hockey teams.">
        <div className="mt-8 flex flex-wrap items-center gap-6"><MedalTriplet g={ind[2]} s={ind[3]} b={ind[4]} size="lg" className="text-paper" /><span className="rounded-full border border-paper/30 px-3 py-1 text-sm font-bold">Final · Rank {ind[0]}</span></div>
      </PageHero>
      <div className="sticky top-[67px] z-30 border-b border-border bg-background/90 backdrop-blur-xl"><Container><Tabs className="border-0" tabs={[["overview", "Overview"], ["table", "Medal table"], ["squad", "India's medallists"], ["analytics", "Analytics"]]} value={tab} onChange={t => { setTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></Container></div>
      <Container className="py-12 md:py-16">
        {tab === "overview" && <div className="space-y-16">
          <div className="grid gap-4 md:grid-cols-3">{TALLY26.slice(0, 6).map(r => (
            <div key={r[1]} className={cn("flex items-center gap-4 rounded-lg border p-5", r[1] === "IND" ? "mi-india-row border-gold/60" : "border-border bg-card")}>
              <span className="font-display text-4xl font-semibold text-muted-foreground tnum">{r[0]}</span>
              <div className="flex-1"><p className="font-bold"><span aria-hidden="true">{flag(r[1])} </span>{NOC[r[1]][0]}</p><MedalTriplet g={r[2]} s={r[3]} b={r[4]} size="sm" className="mt-1 gap-3" /></div>
              <span className="font-display text-3xl font-semibold tnum">{r[5]}</span>
            </div>))}</div>
          <div className="flex flex-wrap gap-3"><button onClick={() => setTab("table")} data-testid="button-open-table" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground">Full medal table, all {TALLY26.length} nations<ArrowRight className="h-4 w-4" /></button><button onClick={() => setTab("analytics")} className="inline-flex h-11 items-center rounded-full border border-border px-5 font-bold hover:border-primary">See the analytics</button></div>
          <div><SectionHead kicker="Coverage" title="Stories from Aichi-Nagoya" /><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{stories.map(a => <StoryCard key={a.slug} a={a} />)}</div></div>
          <div><SectionHead kicker="Peak day" title="Day 14: twelve medals, six gold" /><DailyChart /></div>
        </div>}
        {tab === "table" && <MedalTable />}
        {tab === "squad" && <Squad />}
        {tab === "analytics" && <Analytics />}
      </Container>
    </>
  );
}

/* ================= Glasgow 2026 ================= */
export function Glasgow2026() {
  const g = CWG.find(e => e.y === 2026)!;
  const stories = ARTICLES.filter(a => a.g === "cwg" && !a.slug.includes("ahmedabad")).slice(0, 6);
  const max = Math.max(...GLASGOW_TOP.map(r => r[2] + r[3] + r[4]));
  return (
    <>
      <PageHero kicker="Commonwealth Games · Glasgow, Scotland · 23 Jul to 2 Aug 2026" img={IMG.boxing} accent="hsl(226 80% 60%)" title={<>Boxing leads India to <span className="text-saffron">39 medals.</span></>}
        dek="A streamlined ten-sport Games without shooting, wrestling, badminton, hockey or table tennis. India still finished fourth.">
        <MedalTriplet g={g.g} s={g.s} b={g.b} size="lg" className="mt-8 text-paper" />
      </PageHero>
      <Container className="grid gap-16 py-12 md:py-16 lg:grid-cols-[1fr_1.2fr]">
        <div><SectionHead kicker="Final table" title="Top of the standings" />
          <ol className="space-y-3">{GLASGOW_TOP.map(r => { const t = r[2] + r[3] + r[4]; return (
            <li key={r[1]} className={cn("rounded-lg border p-4", r[1] === "India" ? "border-primary bg-primary/10" : "border-border bg-card")}>
              <div className="flex items-center gap-3"><span className="w-6 font-display text-xl font-semibold text-muted-foreground tnum">{r[0]}</span><span className="flex-1 font-bold">{r[1]}</span><MedalTriplet g={r[2]} s={r[3]} b={r[4]} size="sm" className="hidden gap-3 sm:flex" /><span className="w-10 text-right font-display text-2xl font-semibold tnum">{t}</span></div>
              <StackBar g={r[2]} s={r[3]} b={r[4]} max={max} className="ml-9 mt-2 h-1.5 w-[calc(100%-2.25rem)]" />
            </li>); })}</ol></div>
        <div><SectionHead kicker="Diary" title="India's Glasgow, day by day" />
          <ol className="relative border-l-2 border-border pl-6">{GLASGOW_DAYS.map(([d, t]) => (
            <li key={d} className="relative pb-8"><span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary" /><p className="font-display text-xl font-semibold">{d}</p><p className="mt-1 text-muted-foreground">{t}</p></li>))}</ol></div>
      </Container>
      <Container><SectionHead kicker="Coverage" title="Glasgow 2026 stories" /><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{stories.map(a => <StoryCard key={a.slug} a={a} />)}</div></Container>
      <Container className="pt-16"><Link href="/medals/commonwealth" className="flex items-center justify-between rounded-lg bg-ink p-6 text-paper md:p-8"><span><span className="text-sm text-paper/70">All-time record</span><span className="block font-display text-2xl font-semibold md:text-3xl">India's 602 Commonwealth Games medals</span></span><ArrowRight className="h-6 w-6 text-saffron" /></Link></Container>
    </>
  );
}

/* ================= Ahmedabad 2030 ================= */
export function Ahmedabad2030() {
  const [tab, setTab] = useState<"guide" | "venues" | "city" | "tickets">("guide");
  const city = CITY.ahm;
  const venues = VENUES["Ahmedabad 2030 (proposed)"];
  const faqs = FAQS.filter(([q]) => /2030|ahmedabad|ticket|volunteer/i.test(q));
  return (
    <>
      <PageHero kicker="Centenary Commonwealth Games · Ahmedabad, India · 2030" img={IMG.stadium} accent="hsl(var(--indgreen))" title={<>The Games are <span className="text-saffron">coming home.</span></>}
        dek="Ahmedabad hosts the 2030 Commonwealth Games, 100 years after the first edition in Hamilton. Here's what we know so far." />
      <div className="sticky top-[67px] z-30 border-b border-border bg-background/90 backdrop-blur-xl"><Container><Tabs className="border-0" tabs={[["guide", "Guide"], ["venues", "Venues"], ["city", "City guide"], ["tickets", "Tickets and volunteers"]]} value={tab} onChange={setTab} /></Container></div>
      <Container className="py-12 md:py-16">
        {tab === "guide" && <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 text-lg leading-relaxed">
            <p>Ahmedabad was confirmed as host of the 2030 Commonwealth Games, the Centenary edition. It will be India's second Commonwealth Games after Delhi 2010, where India finished second with 101 medals.</p>
            <p>Dates, the sport programme and ticketing have not been announced. The venue plan centres on the Sardar Vallabhbhai Patel Sports Enclave and the Narendra Modi Stadium in Motera.</p>
            <div className="grid gap-3 sm:grid-cols-3">{[["2nd", "Commonwealth Games in India"], ["101", "medals at Delhi 2010"], ["100", "years since Hamilton 1930"]].map(([n, l]) => <div key={l} className="rounded-lg border border-border bg-card p-4"><p className="font-display text-4xl font-semibold text-primary">{n}</p><p className="text-sm text-muted-foreground">{l}</p></div>)}</div>
          </div>
          <div>{faqs.length > 0 && <Accordion type="single" collapsible className="rounded-lg border border-border px-4">{faqs.map(([q, a], i) => <AccordionItem key={i} value={`f${i}`}><AccordionTrigger className="text-left font-bold">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion>}</div>
        </div>}
        {tab === "venues" && <div className="grid gap-4 md:grid-cols-2">{venues.map(([n, d], i) => (
          <div key={n} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="h-40 overflow-hidden"><img src={[IMG.stadium, IMG.crowd, IMG.relay, IMG.badminton][i % 4]} alt="" className="h-full w-full object-cover" loading="lazy" /></div>
            <div className="p-5"><p className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-primary" />{n}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
          </div>))}
          <p className="text-sm text-muted-foreground md:col-span-2">The venue list is provisional until organisers confirm it.</p>
        </div>}
        {tab === "city" && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {([["Know the city", city.facts, CalendarDays], ["Getting there", city.go, Plane], ["Must-see", city.see, Camera], ["Must-eat", city.eat, Utensils]] as const).map(([h, items, Icon]) => (
            <div key={h} className="rounded-lg border border-border bg-card p-6"><Icon className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-xl font-semibold">{h}</p><ul className="mt-3 space-y-2 text-muted-foreground">{(items as string[]).map(x => <li key={x}>{x}</li>)}</ul></div>))}
          <div className="rounded-lg bg-ink p-6 text-paper"><p className="font-display text-xl font-semibold">When to visit</p><p className="mt-3 text-paper/80">{city.when}</p></div>
        </div>}
        {tab === "tickets" && <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6"><Ticket className="h-6 w-6 text-primary" /><p className="mt-3 font-display text-2xl font-semibold">Tickets are not on sale yet</p><p className="mt-2 text-muted-foreground">No ticketing partner or dates have been announced. Sign up and we'll email you as soon as official sales open.</p></div>
          <div className="rounded-lg border border-border bg-card p-6"><Users className="h-6 w-6 text-primary" /><p className="mt-3 font-display text-2xl font-semibold">No volunteer programme yet</p><p className="mt-2 text-muted-foreground">There is no official volunteer registration at the moment. We'll remind you to check official channels when one opens.</p></div>
          <div className="rounded-lg bg-ink p-6 text-paper lg:col-span-2 md:p-8"><Kicker className="text-paper/70">Alerts</Kicker><p className="mb-4 mt-2 font-display text-2xl font-semibold">Get Ahmedabad 2030 ticket and volunteer alerts</p><NewsletterForm id="tickets" /></div>
        </div>}
      </Container>
    </>
  );
}
