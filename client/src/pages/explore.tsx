import { useState } from "react";
import { Link, useParams } from "wouter";
import { ExternalLink, Search } from "lucide-react";
import { HALL, FAQS, CAL, COUNTDOWNS, SPORTS, COMMONWEALTH_ALL, NOC, TALLY26, flag, MEDAL_SOURCES, IMG, PEOPLE, sportImage, UPDATED } from "@/data";
import { Container, Kicker, SectionHead, Img, Tabs, useCountdown, PageHero } from "@/components/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { StandardsBody, CalButton, KEY_EVENTS } from "@/pages/plus";

const Title = ({ k, t, d }: { k: string; t: string; d?: string }) => (
  <div className="mb-10"><Kicker className="text-gold-ink">{k}</Kicker><h1 className="mt-3 font-display text-[clamp(2.4rem,1.2rem+4vw,4.5rem)] font-semibold leading-[0.95]">{t}</h1>{d && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{d}</p>}</div>
);

function Row({ c }: { c: typeof COUNTDOWNS[number] }) {
  const cd = useCountdown(c.at);
  return (
    <li className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
      <div className="h-28 overflow-hidden rounded-md sm:h-20"><Img src={c.img} alt="" /></div>
      <div><p className="font-display text-2xl font-semibold">{c.t}</p><p className="text-sm text-muted-foreground">{c.where} · {c.d}</p></div>
      {cd ? <div className="flex gap-2 tnum">{[["d", cd.d], ["h", cd.h], ["m", cd.m], ["s", cd.s]].map(([l, v]) => <span key={l as string} className="min-w-14 rounded-md bg-muted px-2 py-1.5 text-center"><b className="font-display text-xl">{String(v).padStart(2, "0")}</b><span className="ml-0.5 text-xs text-muted-foreground">{l as string}</span></span>)}</div>
        : <span className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">Dates to be announced</span>}
    </li>
  );
}

export function Schedule() {
  return (
    <Container className="py-12 md:py-16">
      <Title k="Schedule" t="The road ahead" d="Live countdowns to India's next multi-sport Games." />
      <ul className="space-y-3">{COUNTDOWNS.map(c => <Row key={c.t} c={c} />)}</ul>
      <p className="mt-4 text-sm"><Link href="/watch" className="font-bold text-primary hover:underline">Where to watch: channels, apps and match times in IST</Link> · <Link href="/leagues" className="font-bold text-primary hover:underline">League fixtures</Link></p>
      <SectionHead className="mt-16" kicker="Calendar" title="Key dates" action={<CalButton evs={KEY_EVENTS} name="momentum-india-key-dates" />} />
      <ul className="divide-y divide-border rounded-lg border border-border">{CAL.map(([d, t]) => <li key={t} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6"><span className="w-40 shrink-0 font-bold tnum">{d}</span><span className="text-muted-foreground">{t}</span></li>)}</ul>
    </Container>
  );
}

export function HallOfFame() {
  return (
    <>
      <PageHero kicker="Hall of fame" img={IMG.hero} title="The legends of Indian sport" dek="The athletes who set the standard at the Olympics, Asian Games and Commonwealth Games." />
      <Container className="py-12 md:py-16">
        <ol className="grid gap-4 md:grid-cols-2">{HALL.map((h, i) => { const p = PEOPLE.find(x => x.name === h.n); const inner = (
          <div className="flex gap-5 rounded-lg border border-border bg-card p-5 transition hover:border-primary">
            <span className="font-display text-5xl font-semibold leading-none text-primary tnum">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0"><p className="font-display text-2xl font-semibold">{h.n}</p><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{h.sp}</p><p className="mt-2 text-muted-foreground">{h.t}</p></div>
            <div className="ml-auto hidden h-20 w-20 shrink-0 overflow-hidden rounded-md sm:block"><img src={sportImage(h.sp)} alt="" className="h-full w-full object-cover grayscale" loading="lazy" /></div>
          </div>); return <li key={h.n}>{p ? <Link href={`/athletes/${p.slug}`}>{inner}</Link> : inner}</li>; })}</ol>
      </Container>
    </>
  );
}

export function Sports() {
  const [f, setF] = useState<"all" | "Olympics" | "Asian Games" | "Commonwealth Games">("all");
  const list = SPORTS.filter(s => f === "all" || s.gm.includes(f));
  return (
    <Container className="py-12 md:py-16">
      <Title k="Sports" t="Where India wins" d="Every sport where India has made a recent podium, and which Games it featured at." />
      <Tabs tabs={[["all", "All"], ["Olympics", "Olympics"], ["Asian Games", "Asian Games"], ["Commonwealth Games", "Commonwealth"]]} value={f} onChange={setF} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => (
        <div key={s.n} className="group overflow-hidden rounded-lg border border-border bg-card">
          <div className="h-36 overflow-hidden"><img src={sportImage(s.n)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" /></div>
          <div className="p-5"><p className="font-display text-2xl font-semibold">{s.n}</p><div className="mt-2 flex flex-wrap gap-1.5">{s.gm.map(g => <span key={g} className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{g}</span>)}</div><p className="mt-3 text-sm text-muted-foreground">{s.t}</p></div>
        </div>))}</div>
    </Container>
  );
}

export function Nations() {
  const [tab, setTab] = useState<"asia" | "cw">("asia");
  const [q, setQ] = useState("");
  const asia = TALLY26.map(r => r[1]).filter(c => NOC[c]);
  const ql = q.toLowerCase();
  return (
    <Container className="py-12 md:py-16">
      <Title k="Nations" t="India's rivals and neighbours" d="Every nation at the Asian Games and in the Commonwealth." />
      <Tabs tabs={[["asia", `Asian Games (${asia.length})`], ["cw", `Commonwealth (${Object.values(COMMONWEALTH_ALL).flat().length})`]]} value={tab} onChange={setTab} />
      <label className="relative mt-6 block max-w-md"><span className="sr-only">Search nations</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a nation" data-testid="input-nations-search" className="h-11 w-full rounded-full border border-input bg-background pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary" /></label>
      {tab === "asia" ? (
        <div className="mt-8 space-y-10">{[...new Set(asia.map(c => NOC[c][1]))].sort().map(region => { const items = asia.filter(c => NOC[c][1] === region && NOC[c][0].toLowerCase().includes(ql)); if (!items.length) return null; return (
          <div key={region}><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{region}</p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{items.map(c => <li key={c} className={cn("flex items-center gap-2 rounded-md border p-3 text-sm font-bold", c === "IND" ? "border-primary bg-primary/10" : "border-border bg-card")}><span aria-hidden="true" className="text-lg">{flag(c)}</span>{NOC[c][0]}</li>)}</ul></div>); })}</div>
      ) : (
        <div className="mt-8 space-y-10">{Object.entries(COMMONWEALTH_ALL).map(([region, list]) => { const items = list.filter(n => n.toLowerCase().includes(ql)); if (!items.length) return null; return (
          <div key={region}><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{region}</p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{items.map(n => <li key={n} className={cn("rounded-md border p-3 text-sm font-bold", n === "India" ? "border-primary bg-primary/10" : "border-border bg-card")}>{n}</li>)}</ul></div>); })}</div>
      )}
    </Container>
  );
}

export function Faq() {
  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <Title k="Help" t="Frequently asked questions" />
      <Accordion type="single" collapsible defaultValue="f0" className="rounded-lg border border-border px-5">
        {FAQS.map(([q, a], i) => <AccordionItem key={i} value={`f${i}`}><AccordionTrigger data-testid={`faq-${i}`} className="text-left text-base font-bold">{q}</AccordionTrigger><AccordionContent className="text-base leading-relaxed text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
      </Accordion>
    </Container>
  );
}

export function About() {
  const { tab } = useParams<{ tab?: string }>();
  const [t, setT] = useState<"about" | "standards" | "credits" | "legal">(tab === "credits" || tab === "legal" || tab === "standards" ? tab : "about");
  return (
    <Container className="max-w-4xl py-12 md:py-16">
      <Title k="About" t="About Momentum India" />
      <Tabs tabs={[["about", "About"], ["standards", "Standards and corrections"], ["credits", "Data credits"], ["legal", "Privacy and terms"]]} value={t} onChange={setT} />
      <div className="mt-8 space-y-5 text-lg leading-relaxed">
        {t === "about" && <>
          <p>Momentum India is an independent fan publication covering India at the Olympic Games, the Asian Games and the Commonwealth Games. We bring results, medal history and athlete stories together in one place, in English, Hindi and Gujarati.</p>
          <p>We are not affiliated with the Indian Olympic Association, the Olympic Council of Asia, Commonwealth Sport or the International Olympic Committee.</p>
          <p className="text-base text-muted-foreground">Sport photography on this site is AI-generated and illustrative. It does not depict the athletes named alongside it.</p>
        </>}
        {t === "standards" && <StandardsBody />}
        {t === "credits" && <>
          <p>Medal counts and historical results are compiled from public records and reporting. Data was last updated {UPDATED}. Always check official results for records of note.</p>
          <ul className="space-y-2 text-base">{MEDAL_SOURCES.map(([l, u]) => <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold hover:text-primary">{l}<ExternalLink className="h-3.5 w-3.5" /></a></li>)}</ul>
          <p className="text-base text-muted-foreground">Birmingham 2022 figures reflect the 2023 disqualification of a para powerlifting gold. Manchester 2002 totals follow the Indian Olympic Association record.</p>
        </>}
        {t === "legal" && <>
          <p><b>Privacy.</b> If you subscribe to the briefing, we store your email address, chosen topics and language on our server, only to send the newsletter. If you follow athletes or sports, we store your email, what you follow and, if you choose WhatsApp alerts, your mobile number, only to send those alerts. We do not sell or share it. You can unfollow at any time on My Momentum, or ask us to delete everything.</p>
          <p><b>Terms.</b> Content is provided for information. Medal data may contain errors; official sources take precedence. Team and event names belong to their respective owners.</p>
        </>}
      </div>
    </Container>
  );
}
