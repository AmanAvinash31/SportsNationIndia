import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Newspaper, PlayCircle, Search, Trophy } from "lucide-react";
import { PEOPLE, findPerson, personMedals, SPORT_LIST, ARTICLES, MEDAL_LABEL, type Person } from "@/data";
import { NEXT_EVENTS, PARA_NAMES } from "@/data/live";
import { Container, Kicker, MedalTriplet, MedalDot, Img, SectionHead, useCountdown } from "@/components/site";
import { StoryCard } from "./home";
import NotFound from "./not-found";
import { cn } from "@/lib/utils";
import { FollowButton } from "@/pages/plus";

export function AthletesIndex() {
  const [q, setQ] = useState(""); const [sp, setSp] = useState("all"); const [gm, setGm] = useState("all"); const [g, setG] = useState("all");
  const list = useMemo(() => PEOPLE.filter(p => (sp === "all" || p.sport.startsWith(sp)) && (gm === "all" || p.games.includes(gm)) && (g === "all" || p.gender === g) && (!q || `${p.name} ${p.sport}`.toLowerCase().includes(q.toLowerCase()))), [q, sp, gm, g]);
  const featured = list.filter(p => p.featured), rest = list.filter(p => !p.featured);
  const reset = () => { setQ(""); setSp("all"); setGm("all"); setG("all"); };
  return (
    <Container className="py-12 md:py-16">
      <Kicker className="text-gold-ink">Athletes</Kicker>
      <h1 className="mt-3 font-display text-[clamp(2.4rem,1.2rem+4vw,4.5rem)] font-semibold leading-[0.95]">India's medallists</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{PEOPLE.length} athletes and teams with medals at the Olympics, Asian Games and Commonwealth Games.</p>
      <div className="sticky top-[67px] z-20 -mx-4 mt-8 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-2 lg:flex-row">
          <label className="relative flex-1"><span className="sr-only">Search athletes</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or sport" data-testid="input-athlete-search" className="h-11 w-full rounded-full border border-input bg-background pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary" /></label>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <select value={sp} onChange={e => setSp(e.target.value)} aria-label="Sport" data-testid="select-athlete-sport" className="h-11 min-w-0 rounded-full border border-input bg-background px-3 text-sm font-bold"><option value="all">All sports</option>{SPORT_LIST.map(s => <option key={s}>{s}</option>)}</select>
            <select value={gm} onChange={e => setGm(e.target.value)} aria-label="Games" data-testid="select-athlete-games" className="h-11 min-w-0 rounded-full border border-input bg-background px-3 text-sm font-bold"><option value="all">All Games</option><option>Olympics</option><option>Asian Games</option><option>Commonwealth Games</option></select>
            <select value={g} onChange={e => setG(e.target.value)} aria-label="Category" data-testid="select-athlete-gender" className="h-11 min-w-0 rounded-full border border-input bg-background px-3 text-sm font-bold"><option value="all">All</option><option value="M">Men</option><option value="F">Women</option><option value="X">Mixed</option></select>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{list.length} {list.length === 1 ? "result" : "results"}</p>
      {list.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center"><p className="font-bold">No athletes match those filters.</p><button onClick={reset} data-testid="button-reset-filters" className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-bold hover:border-primary">Clear all filters</button></div>
      ) : <>
        {featured.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{featured.map(p => { const m = personMedals(p); return (
          <Link key={p.slug} href={`/athletes/${p.slug}`} data-testid={`card-athlete-${p.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-ink text-paper">
            <Img src={p.img} alt="" className="transition-transform duration-1000 group-hover:scale-105" /><div className="scrim-b absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-4"><p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-saffron">{p.sport}</p><p className="mt-1 font-display text-xl font-semibold leading-tight md:text-2xl">{p.name}</p><MedalTriplet g={m.G} s={m.S} b={m.B} size="sm" className="mt-2 gap-3" /></div>
          </Link>); })}</div>}
        {rest.length > 0 && <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{rest.map(p => { const m = personMedals(p); return (
          <li key={p.slug} className="min-w-0"><Link href={`/athletes/${p.slug}`} data-testid={`row-athlete-${p.slug}`} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted font-display font-semibold">{p.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span>
            <span className="min-w-0 flex-1"><span className="block truncate font-bold group-hover:text-primary">{p.name}</span><span className="block truncate text-xs text-muted-foreground">{p.sport} · {p.games.join(", ")}</span></span>
            <MedalTriplet g={m.G} s={m.S} b={m.B} size="sm" className="gap-2 text-sm" />
          </Link></li>); })}</ul>}
      </>}
    </Container>
  );
}

export function AthleteProfile() {
  const { slug } = useParams<{ slug: string }>();
  const p = findPerson(slug);
  if (!p) return <NotFound />;
  const m = personMedals(p);
  const needle = p.name.toLowerCase();
  const stories = ARTICLES.filter(a => (a.title + " " + a.body + " " + a.paras.join(" ")).toLowerCase().includes(needle)).slice(0, 3);
  const similar = PEOPLE.filter(x => x.slug !== p.slug && x.sport.split(",")[0] === p.sport.split(",")[0]).slice(0, 6);
  return (
    <>
      <section className="grain relative isolate overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 -z-10"><Img src={p.img} alt="" eager /></div><div className="scrim-l absolute inset-0 -z-10" /><div className="scrim-b absolute inset-0 -z-10 opacity-70" />
        <Container className="flex min-h-[420px] flex-col justify-end pb-10 pt-20 md:min-h-[520px] md:pb-14">
          <Link href="/athletes" className="mb-auto inline-flex w-fit items-center gap-1.5 text-sm font-bold text-paper/80 hover:text-paper"><ArrowLeft className="h-4 w-4" />All athletes</Link>
          <Kicker className="text-paper/80">{p.sport}</Kicker>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,1.2rem+5vw,6rem)] font-semibold leading-[0.92]">{p.name}</h1>
          {p.tagline && <p className="mt-4 max-w-2xl text-lg text-paper/80">{p.tagline}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MedalTriplet g={m.G} s={m.S} b={m.B} size="lg" className="text-paper" />
            {!p.isTeam && <FollowButton kind="athlete" k={p.slug} label={p.name} tone="dark" />}
            <div className="flex flex-wrap gap-2">{p.games.map(g => <span key={g} className="rounded-full border border-paper/30 px-3 py-1 text-xs font-bold">{g}</span>)}</div>
          </div>
        </Container>
      </section>
      <Container className="grid gap-12 py-12 md:py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHead kicker="Career" title="Medal timeline" />
          {p.career.length === 0 ? <p className="rounded-lg border border-dashed border-border p-8 text-muted-foreground">No medals recorded in our data yet.</p> : (
            <ol className="relative border-l-2 border-border pl-6">{p.career.map((c, i) => (
              <li key={i} className="relative pb-8">
                <span className={cn("absolute -left-[35px] top-0.5 grid h-5 w-5 place-items-center rounded-full ring-4 ring-background", c.medal ? { G: "bg-gold", S: "bg-silver", B: "bg-bronze" }[c.medal] : "bg-muted")} />
                <p className="flex flex-wrap items-baseline gap-x-3"><span className="font-display text-2xl font-semibold tnum">{c.year}</span><span className="text-sm font-bold">{c.games}</span>{c.medal && <span className="text-sm text-muted-foreground">{MEDAL_LABEL[c.medal]}</span>}</p>
                <p className="mt-1 text-muted-foreground">{c.event}</p>
              </li>))}</ol>
          )}
        </div>
        <aside className="space-y-6">
          <NextUp p={p} />
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-bold">Recent form</p>
            {p.career.length ? <ul className="mt-3 space-y-2 text-sm">{p.career.slice(0, 3).map((c, i) => <li key={i} className="flex items-start gap-2">{c.medal ? <MedalDot m={c.medal} className="mt-1" /> : <span className="mt-1.5 h-2 w-2 rounded-full bg-muted" />}<span><b>{c.games} {c.year}</b> · {c.event}</span></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No recent results in our data.</p>}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 text-sm">
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${p.name} ${p.sport.split(",")[0]} highlights`)}`} target="_blank" rel="noreferrer" data-testid="link-highlights" className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(2_75%_55%)] px-3 py-1.5 font-bold text-white"><PlayCircle className="h-4 w-4" />Watch highlights</a>
              <a href={`https://news.google.com/search?q=${encodeURIComponent(`"${p.name}"`)}&hl=en-IN&gl=IN&ceid=IN:en`} target="_blank" rel="noreferrer" data-testid="link-latest-news" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-bold hover:bg-muted"><Newspaper className="h-4 w-4" />Latest news</a>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Opens a YouTube or Google News search in a new tab.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="flex items-center gap-2 font-bold"><Trophy className="h-4 w-4 text-primary" />Honours</p>
            {p.honours.length ? <ul className="mt-4 space-y-2 text-sm">{p.honours.map(h => <li key={h} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{h}</li>)}</ul> :
              <ul className="mt-4 space-y-2 text-sm">{p.career.map((c, i) => <li key={i} className="flex items-center gap-2">{c.medal && <MedalDot m={c.medal} />}{c.games} {c.year}: {c.event}</li>)}</ul>}
          </div>
          {similar.length > 0 && <div className="rounded-lg border border-border bg-card p-6"><p className="font-bold">More in {p.sport.split(",")[0]}</p>
            <ul className="mt-3 divide-y divide-border">{similar.map(s => <li key={s.slug}><Link href={`/athletes/${s.slug}`} className="block py-2.5 text-sm font-bold hover:text-primary">{s.name}</Link></li>)}</ul></div>}
          <p className="text-xs text-muted-foreground">Photography is illustrative of the sport and does not depict {p.name}.</p>
        </aside>
      </Container>
      {stories.length > 0 && <Container><SectionHead kicker="In the news" title={`Stories featuring ${p.name.split(" ")[0]}`} /><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{stories.map(a => <StoryCard key={a.slug} a={a} />)}</div></Container>}
    </>
  );
}

function NextUp({ p }: { p: Person }) {
  const para = PARA_NAMES.has(p.name.toLowerCase());
  const ev = para ? NEXT_EVENTS.apg : NEXT_EVENTS.la28;
  const cd = useCountdown(ev.at);
  if (!cd || cd.done) return null;
  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-6" data-testid="next-up">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Next up</p>
      <p className="mt-1 font-display text-2xl font-semibold">{ev.label}</p>
      <p className="text-sm text-muted-foreground">{ev.where}{!para && " · if selected"}</p>
      <p className="mt-3 font-display text-4xl font-semibold tnum">{cd.d.toLocaleString("en-IN")}<span className="ml-1 text-base font-bold text-muted-foreground">days</span> <span className="tnum">{String(cd.h).padStart(2, "0")}</span><span className="text-base font-bold text-muted-foreground">h</span></p>
      <Link href={ev.href} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">{para ? "Open the live hub" : "Road to LA 2028"}<ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}
