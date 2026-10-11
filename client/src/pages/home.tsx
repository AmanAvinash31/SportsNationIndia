import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { ARTICLES, LEAD, IMG, OLY, CWG, ASIAN, sumEditions, total, TALLY_ALL_ASIAN, PEOPLE, personMedals, COUNTDOWNS, HALL, fmtDate, readTime, GAMES, type Edition, type Article } from "@/data";
import { Container, Img, Kicker, SectionHead, MoreLink, MedalTriplet, CountUp, Reveal, useCountdown, NewsletterForm, Tabs } from "@/components/site";
import { EditionChart, EditionSheet } from "@/components/charts";
import { usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import { RiseBand } from "@/pages/rise";
import { PlusBand } from "@/pages/plus";
import { NationBand } from "@/pages/nation";
import { LiveStrip } from "@/pages/live";

export const localized = (a: Article, lang: string) => (lang !== "en" && (a as any)[lang] ? { ...a, ...(a as any)[lang] } : a);

export function StoryCard({ a, size = "md", className }: { a: Article; size?: "lg" | "md" | "sm"; className?: string }) {
  const { lang } = usePrefs();
  const l = localized(a, lang);
  if (size === "sm") return (
    <Link href={`/news/${a.slug}`} data-testid={`card-story-${a.slug}`} className={cn("group flex gap-4", className)}>
      <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md"><Img src={a.img} alt="" className="transition-transform duration-700 group-hover:scale-105" /></span>
      <span className="min-w-0">
        <span className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: GAMES[a.g]?.color }}>{GAMES[a.g]?.short}</span>
        <span className="mt-1 line-clamp-3 block font-bold leading-snug group-hover:text-primary">{l.title}</span>
      </span>
    </Link>
  );
  return (
    <Link href={`/news/${a.slug}`} data-testid={`card-story-${a.slug}`} className={cn("group block", className)}>
      <span className={cn("relative block overflow-hidden rounded-lg", size === "lg" ? "aspect-[16/10]" : "aspect-[16/10]")}>
        <Img src={a.img} alt="" className="transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-paper backdrop-blur">{GAMES[a.g]?.short}</span>
      </span>
      <span className={cn("mt-4 block text-balance font-display font-semibold leading-[1.08] group-hover:text-primary", size === "lg" ? "text-[clamp(1.6rem,1rem+1.6vw,2.4rem)]" : "text-xl")}>{l.title}</span>
      {size === "lg" && <span className="mt-3 line-clamp-2 block text-pretty text-muted-foreground">{l.body}</span>}
      <span className="mt-3 flex items-center gap-3 text-xs text-muted-foreground"><span>{fmtDate(a.date)}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(a)} min read</span></span>
    </Link>
  );
}

function Hero() {
  const { lang, t } = usePrefs();
  const l = localized(LEAD, lang);
  return (
    <section className="grain relative isolate overflow-hidden bg-ink text-paper">
      <motion.div className="absolute inset-0 -z-10" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}>
        <Img src={IMG.hero} alt="A javelin thrower releases under stadium floodlights" eager className="object-[70%_center]" />
      </motion.div>
      <div className="scrim-l absolute inset-0 -z-10" /><div className="scrim-b absolute inset-0 -z-10 opacity-80 md:opacity-50" />
      <Container className="flex min-h-[calc(100svh-6.5rem)] flex-col justify-end pb-10 pt-20 md:pb-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl">
          <p className="mb-6 flex w-fit max-w-full items-center gap-2.5 rounded-full border border-paper/15 bg-ink/40 py-1.5 pl-1.5 pr-4 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-paper/85 backdrop-blur" data-testid="hero-tagline">
            <span className="tricolour h-5 w-8 rounded-full" aria-hidden="true" /><span className="tri-text">Celebrating the rise of a sporting nation</span>
          </p>
          <Kicker className="text-paper/85">Asian Games 2026 · Final standings</Kicker>
          <h1 className="mt-4 text-balance font-display text-[clamp(2.6rem,1rem+5vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.03em]">{l.title}</h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-paper/80">{l.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/news/${LEAD.slug}`} data-testid="button-hero-story" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground hover:brightness-110">{t("readStory")}<ArrowRight className="h-4 w-4" /></Link>
            <Link href="/games/asian-games-2026" data-testid="button-hero-table" className="inline-flex h-12 items-center rounded-full border border-paper/30 px-6 font-bold text-paper backdrop-blur hover:bg-paper/10">Full medal table</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-paper/15 bg-paper/15 backdrop-blur-md md:grid-cols-4">
          {[["Final rank", "4th", "behind China, Japan, Korea"], ["Total medals", "85", "second-best ever"], ["Gold", "21", "incl. cricket and hockey doubles"], ["Medal days", "14", "of 16 competition days"]].map(([k, v, s]) => (
            <div key={k} className="bg-ink/70 p-4 md:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-paper/60">{k}</p>
              <p className="mt-1 font-display text-4xl font-semibold tnum md:text-5xl">{v}</p>
              <p className="mt-1 text-xs text-paper/60">{s}</p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function TopStories() {
  const rest = ARTICLES.filter(a => a.slug !== LEAD.slug && a.kind === "news");
  const [big, ...side] = rest;
  return (
    <Container className="py-16 md:py-24">
      <SectionHead kicker="Latest" title="Top stories" action={<MoreLink href="/news" testid="link-all-news">All news</MoreLink>} />
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <Reveal><StoryCard a={big} size="lg" /></Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
          {side.slice(0, 2).map((a, i) => <Reveal key={a.slug} delay={0.08 * i}><StoryCard a={a} size="md" className="lg:hidden" /><StoryCard a={a} size="sm" className="hidden lg:flex" /></Reveal>)}
          <div className="hidden space-y-6 border-t border-border pt-6 lg:block">{side.slice(2, 5).map(a => <StoryCard key={a.slug} a={a} size="sm" />)}</div>
        </div>
      </div>
    </Container>
  );
}

function Numbers() {
  const o = sumEditions(OLY), c = sumEditions(CWG);
  const a = { g: TALLY_ALL_ASIAN[2], s: TALLY_ALL_ASIAN[3], b: TALLY_ALL_ASIAN[4] };
  const items = [
    { k: "Olympic Games", n: total(o), m: o, sub: "since Paris 1900", href: "/medals/olympics", testid: "stat-oly" },
    { k: "Asian Games", n: total(a), m: a, sub: `all-time, rank ${TALLY_ALL_ASIAN[0]}`, href: "/medals/asian-games", testid: "stat-asian" },
    { k: "Commonwealth Games", n: total(c), m: c, sub: "fourth all-time", href: "/medals/commonwealth", testid: "stat-cwg" },
  ];
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(hsl(var(--paper))_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
      <Container className="relative py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-end">
          <div>
            <Kicker className="text-paper/70">India's medal count</Kicker>
            <h2 className="mt-3 text-balance font-display text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] font-semibold leading-[0.98]">Every medal, every Games, since 1900.</h2>
            <p className="mt-4 max-w-md text-paper/70">Explore India's full record at the three multi-sport Games that matter most, edition by edition and sport by sport.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg bg-paper/10 sm:grid-cols-3">
            {items.map(i => (
              <Link key={i.k} href={i.href} data-testid={i.testid} className="group bg-ink p-6 transition-colors hover:bg-[hsl(230_40%_9%)]">
                <p className="text-sm font-bold text-paper/70">{i.k}</p>
                <p className="mt-2 font-display text-[clamp(3rem,2rem+3vw,4.75rem)] font-semibold leading-none"><CountUp to={i.n} /></p>
                <p className="mt-1 text-xs text-paper/50">{i.sub}</p>
                <MedalTriplet g={i.m.g} s={i.m.s} b={i.m.b} size="sm" className="mt-5 text-paper" />
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-saffron">Explore<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Hubs() {
  const hubs = [
    { k: "Asian Games 2026", where: "Aichi-Nagoya, Japan", line: "4th · 21 gold, 27 silver, 37 bronze", img: IMG.hockey, href: "/games/asian-games-2026", tag: "Complete" },
    { k: "Glasgow 2026", where: "Commonwealth Games, Scotland", line: "4th · 13 gold, 17 silver, 9 bronze", img: IMG.boxing, href: "/games/glasgow-2026", tag: "Complete" },
    { k: "Ahmedabad 2030", where: "Centenary Commonwealth Games", line: "India hosts. Venues, city guide and tickets", img: IMG.stadium, href: "/games/ahmedabad-2030", tag: "Host city" },
  ];
  return (
    <Container className="py-16 md:py-24">
      <SectionHead kicker="Games hubs" title="Follow India, Games by Games" />
      <div className="grid gap-4 md:grid-cols-3">
        {hubs.map((h, i) => (
          <Reveal key={h.k} delay={i * 0.06}>
            <Link href={h.href} data-testid={`hub-${h.href.split("/").pop()}`} className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-ink text-paper md:aspect-[3/4]">
              <Img src={h.img} alt="" className="transition-transform duration-[1.2s] group-hover:scale-105" />
              <div className="scrim-b absolute inset-0" />
              <span className="absolute left-4 top-4 rounded-full bg-paper/15 px-3 py-1 text-xs font-bold backdrop-blur">{h.tag}</span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="flex items-center gap-1.5 text-sm text-paper/70"><MapPin className="h-3.5 w-3.5" />{h.where}</p>
                <h3 className="mt-1 font-display text-3xl font-semibold leading-none md:text-4xl">{h.k}</h3>
                <p className="mt-3 text-sm text-paper/85">{h.line}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-saffron">Open hub<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

function HistoryTeaser() {
  const [tab, setTab] = useState<"oly" | "cwg" | "asian">("oly");
  const [pick, setPick] = useState<Edition | null>(null);
  const data = tab === "oly" ? OLY : tab === "cwg" ? CWG : ASIAN;
  const s = sumEditions(data);
  const best = data.filter(e => !e.dnp && !e.upcoming).reduce((a, b) => (total(b) > total(a) ? b : a));
  return (
    <section className="border-y border-border bg-card">
      <Container className="py-16 md:py-24">
        <SectionHead kicker="Medal history" title="A century of Indian medals" dek="Hover a column for the haul, or click it to open that Games." action={<MoreLink href="/medals" testid="link-medal-history">Full medal history</MoreLink>} />
        <Tabs tabs={[["oly", "Olympics"], ["cwg", "Commonwealth Games"], ["asian", "Asian Games (since 2010)"]]} value={tab} onChange={setTab} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_3fr]">
          <div className="space-y-6">
            <div><p className="text-sm text-muted-foreground">Total medals</p><p className="font-display text-6xl font-semibold leading-none tnum">{total(s)}</p><MedalTriplet g={s.g} s={s.s} b={s.b} size="sm" className="mt-3" /></div>
            <div className="border-t border-border pt-5"><p className="text-sm text-muted-foreground">Best Games</p><p className="mt-1 font-display text-2xl font-semibold">{best.host} {best.y}</p><p className="text-sm text-muted-foreground">{total(best)} medals · {best.g} gold</p></div>
            <Link href={tab === "oly" ? "/medals/olympics" : tab === "cwg" ? "/medals/commonwealth" : "/medals/asian-games"} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:border-primary hover:text-primary">Open the {tab === "oly" ? "Olympic" : tab === "cwg" ? "Commonwealth" : "Asian Games"} record<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <EditionChart data={data} games={tab} onPick={setPick} height={320} />
        </div>
      </Container>
      <EditionSheet edition={pick} games={tab} onClose={() => setPick(null)} />
    </section>
  );
}

function Athletes() {
  const featured = PEOPLE.filter(p => p.featured).slice(0, 10);
  return (
    <Container className="py-16 md:py-24">
      <SectionHead kicker="Athletes" title="The faces of Indian sport" action={<MoreLink href="/athletes" testid="link-all-athletes">All {PEOPLE.length} athletes</MoreLink>} />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        {featured.map(p => { const m = personMedals(p); return (
          <Link key={p.slug} href={`/athletes/${p.slug}`} data-testid={`card-athlete-${p.slug}`} className="group relative aspect-[3/4] w-60 shrink-0 snap-start overflow-hidden rounded-lg bg-ink text-paper sm:w-64">
            <Img src={p.img} alt="" className="transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="scrim-b absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-saffron">{p.sport}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-none">{p.name}</h3>
              <MedalTriplet g={m.G} s={m.S} b={m.B} size="sm" className="mt-3" />
            </div>
          </Link>); })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Sport photography is illustrative and does not depict the named athlete.</p>
    </Container>
  );
}

function CountdownCard({ c }: { c: typeof COUNTDOWNS[number] }) {
  const cd = useCountdown(c.at);
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative h-36 overflow-hidden"><Img src={c.img} alt="" /><div className="scrim-b absolute inset-0 opacity-60" /></div>
      <div className="p-5">
        <h3 className="font-display text-2xl font-semibold">{c.t}</h3>
        <p className="text-sm text-muted-foreground">{c.where} · {c.d}</p>
        {cd ? (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center" aria-live="off">
            {[["days", cd.d], ["hrs", cd.h], ["min", cd.m], ["sec", cd.s]].map(([l, v]) => (
              <div key={l as string} className="rounded-md bg-muted py-2"><p className="font-display text-2xl font-semibold tnum">{String(v).padStart(2, "0")}</p><p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">{l as string}</p></div>
            ))}
          </div>
        ) : <p className="mt-4 rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">Countdown starts once official dates are confirmed.</p>}
      </div>
    </div>
  );
}

function Upcoming() {
  return (
    <Container className="pb-16 md:pb-24">
      <SectionHead kicker="Coming up" title="What's next for India" action={<MoreLink href="/schedule" testid="link-schedule">Full schedule</MoreLink>} />
      <div className="grid gap-4 md:grid-cols-3">{COUNTDOWNS.map(c => <CountdownCard key={c.t} c={c} />)}</div>
    </Container>
  );
}

function AnalysisAndHall() {
  const analysis = ARTICLES.filter(a => a.kind === "analysis");
  return (
    <Container className="grid gap-16 pb-16 md:pb-24 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <SectionHead kicker="Analysis" title="Deeper reads" />
        <div className="space-y-6">{analysis.map(a => <StoryCard key={a.slug} a={a} size="sm" />)}</div>
      </div>
      <div>
        <SectionHead kicker="Legends" title="Hall of fame" action={<MoreLink href="/hall-of-fame" testid="link-hall">See all</MoreLink>} />
        <ol className="divide-y divide-border">
          {HALL.slice(0, 5).map((h, i) => (
            <li key={h.n} className="flex gap-4 py-4">
              <span className="font-display text-2xl font-semibold text-primary tnum">{String(i + 1).padStart(2, "0")}</span>
              <div><p className="font-bold">{h.n} <span className="font-normal text-muted-foreground">· {h.sp}</span></p><p className="text-sm text-muted-foreground">{h.t}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </Container>
  );
}

function NewsletterBand() {
  return (
    <section className="grain relative isolate overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 -z-10"><Img src={IMG.crowd} alt="" /></div>
      <div className="absolute inset-0 -z-10 bg-ink/80" />
      <Container className="grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <Kicker className="text-paper/80">The Momentum briefing</Kicker>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] font-semibold leading-[0.98]">Never miss an Indian medal again.</h2>
          <p className="mt-4 max-w-md text-paper/75">A short email after every big day: results, the medal table and the stories behind them.</p>
        </div>
        <NewsletterForm id="home" />
      </Container>
    </section>
  );
}

export default function Home() {
  return (<><Hero /><LiveStrip /><TopStories /><Numbers /><Hubs /><HistoryTeaser /><Athletes /><Upcoming /><NationBand /><RiseBand />
      <PlusBand /><AnalysisAndHall /><NewsletterBand /></>);
}
