import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, List, Mail, Map as MapIcon, MapPin, Navigation, Pause, Phone, Play, RotateCcw, Search, Youtube } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePrefs } from "@/lib/prefs";
import { Container, Kicker, SectionHead, Img, PageHero, Tabs, useCountdown, MoreLink, Reveal } from "@/components/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ClaimDialog, CalButton, KEY_EVENTS, FollowButton } from "@/pages/plus";
import {
  RIMG, SRC, SAI, ACADEMIES, STATES, FAC_SPORTS, stateCounts, sportCount, baseSport, KIC_TOTAL, KIC_STATES, FAC_DATE, finderPrefill,
  STORIES, MOMENTS, REGIONS, HELPLINES, TRIALS, TRIALS_PAGE, TRIALS_DATE, SAI_DATA, mapsDir, mapsSearch, type SaiCentre, LA_OPEN, LA_TIMELINE, LA_NEW, LA_WATCH, LADDER, SCHEMES, PARENT_FAQ, QUIZ, scoreQuiz, type Trait,
} from "@/data/rise";

const Src = ({ href, children }: { href: string; children: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline decoration-border underline-offset-2 hover:text-primary">{children}<ExternalLink className="h-3 w-3" /></a>
);
const Stat = ({ v, l, className }: { v: string | number; l: string; className?: string }) => (
  <div className={cn("rounded-lg border border-border bg-card p-4", className)}><p className="font-display text-3xl font-semibold tnum md:text-4xl">{v}</p><p className="mt-1 text-sm text-muted-foreground">{l}</p></div>
);

/* ===================================================== Road to LA 2028 */
export function RoadToLA() {
  const cd = useCountdown(LA_OPEN);
  return (
    <>
      <PageHero kicker="Olympic Games · Los Angeles" img={RIMG.celebration} title="Road to LA 2028"
        dek="Where India stands, who to watch, and how athletes qualify for the Olympics and Paralympics.">
        <div className="mt-6 flex flex-wrap gap-2"><CalButton evs={KEY_EVENTS.slice(1)} name="la-2028" className="text-paper" /><FollowButton kind="games" k="la28" label="Olympic Games, Los Angeles 2028" tone="dark" /></div>
        {cd && <div className="mt-8 flex flex-wrap gap-2 tnum" aria-label="Countdown to the opening ceremony" data-testid="la-countdown">
          {([["days", cd.d], ["hours", cd.h], ["min", cd.m], ["sec", cd.s]] as const).map(([l, v]) => (
            <div key={l} className="min-w-[4.5rem] rounded-lg bg-paper/10 px-3 py-2 text-center backdrop-blur"><p className="font-display text-3xl font-semibold">{String(v).padStart(2, "0")}</p><p className="text-xs uppercase tracking-[0.14em] text-paper/70">{l}</p></div>))}
        </div>}
      </PageHero>
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat v="14–30 Jul" l="Olympic Games, 2028" /><Stat v="15–27 Aug" l="Paralympic Games, 2028" /><Stat v="351" l="Olympic medal events, the most ever" /><Stat v="13" l="India's medals at Tokyo and Paris combined" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Sources: <Src href={SRC.la28Dates}>LA28</Src> · <Src href={SRC.la28Events}>Britannica</Src> · <Src href={SRC.para28}>IPC</Src></p>

        <SectionHead className="mt-16" kicker="Watchlist" title="India's medal hopes by sport" dek="Based on results at the last two Olympics and the 2026 Asian and Commonwealth Games. A guide to form, not a prediction." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LA_WATCH.map((w, i) => (
            <Reveal key={w.sport} delay={i * 0.04}>
              <div className="group h-full overflow-hidden rounded-lg border border-border bg-card" data-testid={`watch-${i}`}>
                <div className="h-32 overflow-hidden"><Img src={w.img} alt="" className="transition-transform duration-700 group-hover:scale-105" /></div>
                <div className="p-4"><p className="font-display text-xl font-semibold">{w.sport}</p><p className="mt-1 text-sm text-muted-foreground">{w.why}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Names to follow</p>
                  {w.slug ? <Link href={`/athletes/${w.slug}`} className="text-sm font-bold hover:text-primary">{w.names}</Link> : <p className="text-sm font-bold">{w.names}</p>}
                </div>
              </div>
            </Reveal>))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHead kicker="Qualification" title="The road, step by step" />
            <ol className="relative space-y-6 border-l-2 border-border pl-6">
              {LA_TIMELINE.map(([d, t, x]) => (
                <li key={t} className="relative"><span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary" />
                  <p className="text-sm font-bold text-primary tnum">{d}</p><p className="font-display text-xl font-semibold">{t}</p><p className="text-muted-foreground">{x}</p></li>))}
            </ol>
            <p className="mt-6 text-sm text-muted-foreground">Each sport's governing body sets its own rules. Read the official <Src href={SRC.la28Qual}>LA28 qualification overview</Src> or an example such as <Src href={SRC.feiQual}>equestrian</Src>.</p>
          </div>
          <div>
            <SectionHead kicker="New at LA28" title="Five sports join the programme" />
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {LA_NEW.map(([n, d]) => <li key={n} className="p-4"><p className="font-bold">{n}</p><p className="text-sm text-muted-foreground">{d}</p></li>)}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">Source: <Src href={SRC.la28New}>Olympics.com</Src></p>
            <div className="mt-8 rounded-lg bg-ink p-6 text-paper">
              <Kicker className="text-paper/70">How India backs its contenders</Kicker>
              <p className="mt-3 font-display text-2xl font-semibold">Target Olympic Podium Scheme</p>
              <p className="mt-2 text-paper/80">Running since 2014. A recent Lok Sabha reply lists 162 athletes plus the men's and women's hockey teams in the core group, and 254 athletes in the development group. Core group athletes receive ₹50,000 a month.</p>
              <p className="mt-3 text-xs text-paper/60"><Src href={SRC.topsLs}>Lok Sabha reply</Src> · <Src href={SRC.tops}>SAI</Src></p>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap gap-4"><MoreLink href="/pathway">How young athletes get here</MoreLink><MoreLink href="/athletes">Track every athlete</MoreLink><MoreLink href="/schedule">All countdowns</MoreLink></div>
      </Container>
    </>
  );
}

/* ===================================================== Pathway, quiz and parents */
function SportQuiz() {
  const [, nav] = useLocation();
  const [ans, setAns] = useState<(Trait | null)[]>(QUIZ.map(() => null));
  const done = ans.every(Boolean);
  const res = useMemo(() => (done ? scoreQuiz(ans as Trait[]) : []), [ans, done]);
  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-8" data-testid="sport-quiz">
      <div className="grid gap-6 md:grid-cols-2">
        {QUIZ.map((q, i) => (
          <fieldset key={q.q}><legend className="mb-2 font-bold">{i + 1}. {q.q}</legend>
            <div className="flex flex-wrap gap-2">{q.opts.map(([l, v]) => (
              <button key={v} type="button" data-testid={`quiz-${i}-${v}`} aria-pressed={ans[i] === v} onClick={() => setAns(a => a.map((x, j) => (j === i ? v : x)))}
                className={cn("rounded-full border px-3 py-1.5 text-sm transition", ans[i] === v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>{l}</button>))}
            </div>
          </fieldset>))}
      </div>
      <div className="mt-8 border-t border-border pt-6" aria-live="polite">
        {!done ? <p className="text-muted-foreground">Answer all four to see three sports worth trying. {ans.filter(Boolean).length} of 4 done.</p> : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-display text-2xl font-semibold">Three sports to try first</p>
              <button onClick={() => setAns(QUIZ.map(() => null))} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"><RotateCcw className="h-4 w-4" />Start again</button></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">{res.map((s, i) => (
              <div key={s.n} className="rounded-lg border border-border p-4" data-testid={`quiz-result-${i}`}>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Match {i + 1}</p><p className="mt-1 font-display text-xl font-semibold">{s.n}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                <button onClick={() => { finderPrefill.sport = s.fac; nav("/facilities"); }} className="mt-3 inline-flex items-center gap-1 text-sm font-bold hover:text-primary">
                  {sportCount(s.fac)} facilities offer it<ArrowRight className="h-4 w-4" /></button>
              </div>))}</div>
            <p className="mt-4 text-xs text-muted-foreground">This is a starting point for a conversation, not a talent test. Ask a qualified coach to assess your child.</p>
          </>)}
      </div>
    </div>
  );
}

export function Pathway() {
  return (
    <>
      <PageHero kicker="For young athletes and parents" img={RIMG.youth} title="From the school ground to the podium"
        dek="How talent is found in India, the support available at each stage, and how to find the right sport and the right centre." />
      <Container className="py-12 md:py-16">
        <SectionHead kicker="The pathway" title="Six steps most Indian medallists took" />
        <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {LADDER.map((s, i) => (
            <li key={s.t} className="relative rounded-lg border border-border bg-card p-4">
              <span className="font-display text-4xl font-semibold text-primary tnum">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{s.age}</p>
              <p className="font-display text-lg font-semibold leading-tight">{s.t}</p><p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </li>))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">Sources: <Src href={SRC.kiHow}>Khelo India guide</Src> · <Src href={SRC.kiScholar}>Lok Sabha reply on Khelo India support</Src> · <Src href={SRC.topsLs}>Lok Sabha reply on TOPS</Src></p>

        <SectionHead className="mt-16" kicker="Find my sport" title="Which sport suits your child?" dek="Four quick questions. The results link to centres that offer each sport." />
        <SportQuiz />

        <SectionHead className="mt-16" kicker="Support" title="Schemes worth knowing" />
        <div className="mb-6"><TrialsPanel compact /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SCHEMES.map(s => (
            <div key={s.t} className="flex flex-col rounded-lg border border-border bg-card p-5">
              <p className="font-display text-xl font-semibold">{s.t}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{s.who}</p>
              <p className="mt-3 flex-1 text-muted-foreground">{s.what}</p><p className="mt-4 text-xs text-muted-foreground"><Src href={s.href}>{s.src}</Src></p>
            </div>))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]" id="parents">
          <div className="overflow-hidden rounded-xl"><div className="aspect-[4/3]"><Img src={RIMG.academy} alt="A parent and child walking into an indoor sports academy (illustrative image)" /></div></div>
          <div>
            <Kicker className="text-gold-ink">Parents' corner</Kicker>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,1.1rem+1.8vw,2.6rem)] font-semibold leading-tight">Questions parents ask most</h2>
            <Accordion type="single" collapsible className="mt-4">
              {PARENT_FAQ.map(([q, a, s], i) => (
                <AccordionItem key={q} value={`p${i}`}><AccordionTrigger className="text-left font-bold" data-testid={`parent-q-${i}`}>{q}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">{a}{s && <span className="mt-2 block text-xs"><Src href={s[1]}>{s[0]}</Src></span>}</AccordionContent></AccordionItem>))}
            </Accordion>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap gap-4"><MoreLink href="/facilities">Find facilities in your state</MoreLink><MoreLink href="/stories">Read how champions started</MoreLink></div>
      </Container>
    </>
  );
}

/* ===================================================== Facilities finder */
const TYPE_LABEL = { NCOE: "National Centre of Excellence", STC: "SAI Training Centre", Extension: "SAI extension centre" } as const;
const TYPE_COLOR = { NCOE: "#FF7A1A", STC: "#2F6BFF", Extension: "#14A06A" } as const;

function CentreMap({ list, onPick, theme }: { list: SaiCentre[]; onPick: (c: SaiCentre) => void; theme: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false, attributionControl: true, zoomControl: false }).setView([22.6, 80.5], 4.6);
    L.control.zoom({ position: "topright" }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current) return;
    tiles.current?.remove();
    tiles.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18, className: theme === "dark" ? "map-dark" : "",
    }).addTo(map.current);
  }, [theme]);
  useEffect(() => {
    if (!layer.current || !map.current) return;
    layer.current.clearLayers();
    const pts = list.filter(c => c.ll);
    pts.forEach(c => {
      const m = L.circleMarker(c.ll!, { radius: c.t === "NCOE" ? 8 : 6, color: "#fff", weight: 1.5, fillColor: TYPE_COLOR[c.t], fillOpacity: 0.95 });
      m.bindTooltip(`<b>${c.n}</b><br/>${TYPE_LABEL[c.t]} · ${c.s}`, { direction: "top", offset: [0, -6] });
      m.on("click", () => onPick(c));
      m.addTo(layer.current!);
    });
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts.map(c => c.ll!)).pad(0.15), { maxZoom: 9 });
  }, [list, onPick]);
  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border">
      <style>{`.map-dark{filter:invert(1) hue-rotate(180deg) brightness(.85) contrast(.9)}`}</style>
      <div ref={el} className="h-[520px] w-full bg-muted" data-testid="centre-map" role="region" aria-label="Map of SAI centres" />
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-1 rounded-md bg-background/90 p-2 text-xs shadow">
        {(Object.keys(TYPE_COLOR) as (keyof typeof TYPE_COLOR)[]).map(k => <span key={k} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[k] }} />{TYPE_LABEL[k]}</span>)}
      </div>
    </div>
  );
}

function CentreSheet({ c, onClose }: { c: SaiCentre | null; onClose: () => void }) {
  const r = c?.rg ? REGIONS[c.rg] : undefined;
  const seats = c?.seats ?? [];
  const tb = seats.reduce((t, [, b]) => t + b, 0), tg = seats.reduce((t, [, , g]) => t + g, 0);
  return (
    <Sheet open={!!c} onOpenChange={o => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg" data-testid="centre-sheet">
        {c && <>
          <SheetHeader className="text-left">
            <span className="w-fit rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: TYPE_COLOR[c.t] }}>{TYPE_LABEL[c.t]}</span>
            <SheetTitle className="font-display text-3xl">{c.n}</SheetTitle>
            <SheetDescription className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.s}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <a href={mapsDir(c)} target="_blank" rel="noreferrer" data-testid="link-directions" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Navigation className="h-4 w-4" />Directions</a>
            <a href={TRIALS_PAGE} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-bold hover:border-foreground"><CalendarDays className="h-4 w-4" />Selection trials</a>
          </div>

          <section className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Who to contact</h3>
            {r ? <div className="mt-2 rounded-lg border border-border p-4">
              <p className="font-bold">{r.name}</p><p className="mt-1 text-sm text-muted-foreground">{r.addr}</p>
              {r.states && <p className="mt-1 text-xs text-muted-foreground">Covers {r.states}</p>}
              <a href={r.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold hover:text-primary">Regional centre page<ExternalLink className="h-3.5 w-3.5" /></a>
            </div> : <p className="mt-2 text-sm text-muted-foreground">Regional office not listed. Use SAI's head office contact below.</p>}
            <ul className="mt-3 space-y-2">{HELPLINES.map(h => (
              <li key={h.t}><a href={h.href} target={h.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary">
                {h.href.startsWith("tel") ? <Phone className="h-4 w-4 shrink-0 text-primary" /> : h.href.startsWith("mailto") ? <Mail className="h-4 w-4 shrink-0 text-primary" /> : <Building2 className="h-4 w-4 shrink-0 text-primary" />}
                <span className="min-w-0"><span className="block text-sm font-bold">{h.v}</span><span className="block text-xs text-muted-foreground">{h.t} · {h.note}</span></span></a></li>))}</ul>
            <p className="mt-3 text-xs text-muted-foreground">SAI does not publish a phone number or email for individual centres. The regional centre manages admissions for the centres in its area.</p>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Sports and sanctioned places</h3>
            {seats.length ? <>
              <table className="mt-2 w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-2 font-bold">Sport</th><th className="py-2 text-right font-bold">Boys</th><th className="py-2 text-right font-bold">Girls</th></tr></thead>
                <tbody>{seats.map(([d, b, g]) => <tr key={d} className="border-b border-border/60"><td className="py-2">{d}</td><td className="py-2 text-right tnum">{b}</td><td className="py-2 text-right tnum">{g}</td></tr>)}</tbody>
                <tfoot><tr className="font-bold"><td className="py-2">Total</td><td className="py-2 text-right tnum">{tb}</td><td className="py-2 text-right tnum">{tg}</td></tr></tfoot>
              </table>
              <p className="mt-2 text-xs text-muted-foreground">Places approved by SAI for each sport. Source: <Src href={SAI_DATA}>SAI centre data, 2025</Src>.</p>
            </> : <div className="mt-2 flex flex-wrap gap-1">{c.d.map(d => <span key={d} className="rounded bg-muted px-2 py-0.5 text-xs">{d}</span>)}</div>}
          </section>

          <ClaimCta listing={`SAI ${TYPE_LABEL[c.t]}, ${c.n}, ${c.s}`} kind="sai" />
          <section className="mt-8 rounded-lg bg-muted p-4 text-sm">
            <p className="font-bold">How to get in</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
              <li>Watch SAI's selection trials page for your sport and age group.</li>
              <li>Attend the trial with proof of age, ID and your competition certificates.</li>
              <li>Selected athletes are offered a place, many of them residential.</li>
            </ol>
          </section>
        </>}
      </SheetContent>
    </Sheet>
  );
}

function ClaimCta({ listing, kind, inline }: { listing: string; kind: "sai" | "academy"; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  return (<>
    {inline ? <button onClick={() => setOpen(true)} data-testid="button-claim" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary">Run this academy? Add contacts</button>
      : <div className="mt-8 rounded-lg border border-dashed border-border p-4 text-sm"><p className="font-bold">Coach or administrator here?</p><p className="mt-1 text-muted-foreground">Add a direct phone, email, fees and coaches. We verify every update before it's published.</p>
        <button onClick={() => setOpen(true)} data-testid="button-claim" className="mt-3 rounded-full border border-border px-4 py-2 font-bold hover:border-primary">Update this listing</button></div>}
    <ClaimDialog listing={listing} kind={kind} open={open} setOpen={setOpen} />
  </>);
}

export function TrialsPanel({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4" data-testid="trials-panel">
      <div className="flex items-center justify-between gap-2"><h3 className="font-display text-xl font-semibold">Open selection trials</h3><span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">{TRIALS.length} notices</span></div>
      <ul className="mt-3 divide-y divide-border">{TRIALS.slice(0, compact ? 3 : undefined).map(t => (
        <li key={t.href} className="py-2.5"><a href={t.href} target="_blank" rel="noreferrer" className="group block">
          <span className="flex items-center justify-between gap-2"><span className="text-sm font-bold group-hover:text-primary">{t.sport}</span><span className="text-xs text-muted-foreground tnum">{t.d}</span></span>
          <span className="block text-xs text-muted-foreground">{t.t}</span></a></li>))}</ul>
      <p className="mt-2 text-xs text-muted-foreground">From <Src href={TRIALS_PAGE}>SAI selection trials</Src>, checked {TRIALS_DATE}. Open each notice for dates, venues and age limits.</p>
    </div>
  );
}

export function Facilities() {
  const { theme } = usePrefs();
  const [state, setState] = useState<string>(finderPrefill.state ?? "all");
  const [sport, setSport] = useState<string>(finderPrefill.sport ?? "all");
  const [kind, setKind] = useState<"all" | "sai" | "ki">("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<SaiCentre | null>(null);
  useEffect(() => { finderPrefill.sport = undefined; finderPrefill.state = undefined; }, []);
  const hasSport = (d: string[]) => sport === "all" || d.some(x => baseSport(x) === sport);
  const match = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase());
  const sai = useMemo(() => SAI.filter(x => x.st === "open" && (state === "all" || x.s === state) && hasSport(x.d) && (match(x.n) || match(x.s))).sort((a, b) => a.t.localeCompare(b.t) || a.s.localeCompare(b.s)), [state, sport, q]);
  const ki = ACADEMIES.filter(x => (state === "all" || x.s === state) && hasSport(x.d) && (match(x.n) || match(x.dist) || match(x.s)));
  const ranking = STATES.map(s => ({ s, ...stateCounts(s) })).map(r => ({ ...r, tot: r.ncoe + r.stc + r.ext + r.acad })).sort((a, b) => b.tot - a.tot);
  const max = ranking[0].tot;
  const champs = STORIES.filter(s => state === "all" || s.state === state);
  const c = state === "all" ? null : stateCounts(state);
  const onPick = useCallback((x: SaiCentre) => setPick(x), []);
  return (
    <>
      <PageHero kicker="Facilities" img={RIMG.academy} title="Find a training centre near you"
        dek={`Every SAI centre and Khelo India academy in one place, with directions, regional contacts and open selection trials. Official lists as of ${FAC_DATE}.`} />
      <Container className="py-10 md:py-14">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat v={SAI.filter(x => x.t === "NCOE" && x.st === "open").length} l="SAI National Centres of Excellence open" />
          <Stat v={SAI.filter(x => x.t !== "NCOE" && x.st === "open").length} l="SAI training and extension centres open" />
          <Stat v={ACADEMIES.length} l="Khelo India academies (state-wise list)" />
          <Stat v={KIC_TOTAL.toLocaleString("en-IN")} l={`Khelo India Centres across ${KIC_STATES} states and UTs`} />
        </div>

        <div className="sticky top-16 z-20 mt-8 grid gap-3 rounded-xl border border-border bg-background/95 p-3 backdrop-blur md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_auto_auto]">
          <label className="text-sm"><span className="sr-only">State</span>
            <select data-testid="select-state" value={state} onChange={e => setState(e.target.value)} className="h-10 w-full rounded-md border border-border bg-card px-3"><option value="all">All states and UTs</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="text-sm"><span className="sr-only">Sport</span>
            <select data-testid="select-sport" value={sport} onChange={e => setSport(e.target.value)} className="h-10 w-full rounded-md border border-border bg-card px-3"><option value="all">All sports</option>{FAC_SPORTS.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="relative text-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search by city or name</span>
            <input data-testid="input-facility" value={q} onChange={e => setQ(e.target.value)} placeholder="City, district or centre" className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3" /></label>
          <div className="flex gap-1 rounded-md bg-muted p-1 text-sm">{([["all", "All"], ["sai", "SAI"], ["ki", "Khelo India"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={cn("flex-1 whitespace-nowrap rounded px-3 py-1.5 font-bold", kind === k ? "bg-background shadow-sm" : "text-muted-foreground")}>{l}</button>))}</div>
          <div className="flex gap-1 rounded-md bg-muted p-1 text-sm">{([["list", "List", List], ["map", "Map", MapIcon]] as const).map(([k, l, I]) => (
            <button key={k} data-testid={`view-${k}`} onClick={() => setView(k)} aria-pressed={view === k} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 font-bold", view === k ? "bg-background shadow-sm" : "text-muted-foreground")}><I className="h-4 w-4" />{l}</button>))}</div>
        </div>

        {c && <div className="mt-6 flex flex-wrap gap-2 text-sm" data-testid="state-summary"><span className="font-bold">{state}:</span>
          <span className="rounded-full bg-muted px-3 py-1">{c.ncoe} NCOE</span><span className="rounded-full bg-muted px-3 py-1">{c.stc} training centres</span><span className="rounded-full bg-muted px-3 py-1">{c.ext} extension centres</span><span className="rounded-full bg-muted px-3 py-1">{c.acad} Khelo India academies</span></div>}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <p className="mb-4 text-sm text-muted-foreground" data-testid="facility-count">{view === "map" ? `${sai.filter(x => x.ll).length} SAI centres on the map` : `${(kind !== "ki" ? sai.length : 0) + (kind !== "sai" ? ki.length : 0)} results`}{sport !== "all" && <> for <b className="text-foreground">{sport}</b></>}</p>
            {view === "map" ? <>
              <CentreMap list={sai} onPick={onPick} theme={theme} />
              <p className="mt-2 text-xs text-muted-foreground">Tap a dot for contacts, places and directions. Khelo India academies are not on the map because the official list has no coordinates. Base map from OpenStreetMap; international boundaries are not authenticated by the Survey of India and are shown for orientation only.</p>
            </> : <>
            {kind !== "ki" && sai.length > 0 && <>
              <h3 className="mb-3 font-display text-xl font-semibold">Sports Authority of India centres</h3>
              <ul className="grid gap-3 sm:grid-cols-2">{sai.map(x => {
                const seats = x.seats?.reduce((t, [, b, g]) => t + b + g, 0);
                return (
                <li key={x.t + x.n + x.s} className="flex flex-col rounded-lg border border-border bg-card p-4">
                  <span className="w-fit rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: TYPE_COLOR[x.t] }}>{TYPE_LABEL[x.t]}</span>
                  <p className="mt-2 font-display text-lg font-semibold">{x.n}</p><p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{x.s}{x.rg && REGIONS[x.rg] && <> · {REGIONS[x.rg].name.replace(/^(Netaji Subhash |SAI )/, "")}</>}</p>
                  <div className="mt-2 flex flex-wrap gap-1">{x.d.map(d => <span key={d} className={cn("rounded px-1.5 py-0.5 text-xs", baseSport(d) === sport ? "bg-primary/15 font-bold text-foreground" : "bg-muted text-muted-foreground")}>{d}</span>)}</div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
                    {seats ? <span className="text-xs text-muted-foreground tnum">{seats} sanctioned places</span> : <span />}
                    <span className="flex gap-3">
                      <a href={mapsDir(x)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold hover:text-primary"><Navigation className="h-3.5 w-3.5" />Directions</a>
                      <button data-testid={`contact-${x.n.replace(/\W+/g, "-")}`} onClick={() => setPick(x)} className="inline-flex items-center gap-1 font-bold text-primary hover:underline"><Phone className="h-3.5 w-3.5" />Contact</button>
                    </span>
                  </div>
                </li>); })}</ul></>}
            {kind !== "sai" && ki.length > 0 && <>
              <h3 className="mb-3 mt-8 font-display text-xl font-semibold">Khelo India academies</h3>
              <ul className="divide-y divide-border rounded-lg border border-border bg-card">{ki.map(x => (
                <li key={x.s + x.dist + x.n} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><p className="font-bold">{x.n}</p><p className="text-sm text-muted-foreground">{x.dist}, {x.s}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">{x.d.map(d => <span key={d} className={cn("rounded px-1.5 py-0.5 text-xs", baseSport(d) === sport ? "bg-primary/15 font-bold" : "bg-muted text-muted-foreground")}>{d}</span>)}</div></div>
                  <a href={mapsSearch(`${x.n.replace(/\(.*?\)/g, "")} ${x.dist} ${x.s}`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold hover:text-primary sm:justify-self-end"><Navigation className="h-3.5 w-3.5" />Find on map</a>
                  <span className="sm:col-span-2"><ClaimCta inline listing={`Khelo India academy: ${x.n}, ${x.dist}, ${x.s}`} kind="academy" /></span>
                </li>))}</ul>
              <p className="mt-2 text-xs text-muted-foreground">For academy admissions, contact Khelo India on <a className="font-bold hover:text-primary" href="tel:+911123383336">011 2338 3336</a> or <a className="font-bold hover:text-primary" href="mailto:kheloindia@gov.in">kheloindia@gov.in</a>.</p></>}
            {sai.length + ki.length === 0 && <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No listed centre matches. Try another sport, or ask about your nearest Khelo India Centre at the district sports office.</div>}
            </>}
            <p className="mt-6 text-xs text-muted-foreground">Sources: <Src href={SRC.saiList}>SAI centres list 2025–26</Src> · <Src href={SAI_DATA}>SAI centre finder data</Src> · <Src href={SRC.kiAcademies}>Khelo India state-wise academies</Src> · <Src href={SRC.kic}>Khelo India Centres</Src> · <Src href={SRC.kiTalent}>Khelo India contact</Src>. Inactive centres are hidden. Map pins use SAI's coordinates and may mark the city rather than the exact gate, so confirm before you travel.</p>
          </div>
          <aside className="space-y-8">
            <TrialsPanel />
            <div><h3 className="mb-3 font-display text-xl font-semibold">Facilities by state</h3>
              <ol className="space-y-1.5">{ranking.slice(0, 15).map(r => (
                <li key={r.s}><button onClick={() => setState(r.s)} className={cn("grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-muted", state === r.s && "bg-muted font-bold")}>
                  <span className="truncate">{r.s}</span><span className="tnum text-muted-foreground">{r.tot}</span>
                  <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(r.tot / max) * 100}%` }} /></span></button></li>))}</ol>
              {state !== "all" && <button onClick={() => setState("all")} className="mt-3 text-sm font-bold hover:text-primary">Show all states</button>}
            </div>
            {champs.length > 0 && <div><h3 className="mb-3 font-display text-xl font-semibold">{state === "all" ? "Champions and where they started" : `Champions from ${state}`}</h3>
              <ul className="space-y-2">{champs.map(s => <li key={s.slug}><Link href="/stories" className="flex items-center gap-3 rounded-lg border border-border p-2 hover:border-primary"><span className="h-10 w-10 shrink-0 overflow-hidden rounded"><img src={s.img} alt="" className="h-full w-full object-cover" /></span><span className="min-w-0"><span className="block truncate font-bold">{s.n}</span><span className="block truncate text-xs text-muted-foreground">{s.from}, {s.state}</span></span></Link></li>)}</ul></div>}
          </aside>
        </div>
      </Container>
      <CentreSheet c={pick} onClose={() => setPick(null)} />
    </>
  );
}

/* ===================================================== Success stories */
export function Stories() {
  const [, nav] = useLocation();
  const [open, setOpen] = useState<string>(STORIES[0].slug);
  const s = STORIES.find(x => x.slug === open)!;
  return (
    <>
      <PageHero kicker="Success stories" img={IMG_FALLBACK} title="Where champions began"
        dek="Seven Indian medallists, the places they grew up and the moments that set them on their way. Every detail links to its source." />
      <Container className="py-12 md:py-16">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
          {STORIES.map(x => (
            <button key={x.slug} role="tab" aria-selected={open === x.slug} data-testid={`story-${x.slug}`} onClick={() => setOpen(x.slug)}
              className={cn("flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm font-bold transition", open === x.slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>
              <span className="h-8 w-8 overflow-hidden rounded-full"><img src={x.img} alt="" className="h-full w-full object-cover" /></span>{x.n}</button>))}
        </div>
        <AnimatePresence mode="wait">
          <motion.article key={s.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            className="mt-8 grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[1fr_1.3fr]" data-testid="story-card">
            <div className="relative min-h-[280px] bg-ink"><Img src={s.img} alt="" className="absolute inset-0" /><div className="scrim-b absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-paper"><p className="text-xs font-bold uppercase tracking-[0.14em] text-paper/70">{s.sport}</p><h2 className="font-display text-4xl font-semibold">{s.n}</h2>
                <p className="mt-1 flex items-center gap-1 text-paper/80"><MapPin className="h-4 w-4" />{s.from}, {s.state}</p></div></div>
            <div className="p-6 md:p-8">
              <ol className="space-y-5">{([["Where it started", s.start], ["The turning point", s.turn], ["The podium", s.peak]] as const).map(([h, t], i) => (
                <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-3"><span className="font-display text-3xl font-semibold text-primary tnum">{i + 1}</span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{h}</p><p className="mt-1 text-lg">{t}</p></div></li>))}</ol>
              <div className="mt-6 rounded-lg bg-muted p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">For young athletes and parents</p><p className="mt-1 font-bold">{s.lesson}</p></div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Sources: {s.src.map(([n, u], i) => <span key={u}>{i > 0 && " · "}<Src href={u}>{n}</Src></span>)}</span>
                <div className="flex gap-4 text-sm"><Link href={`/athletes/${s.slug}`} className="font-bold text-foreground hover:text-primary">Athlete profile</Link><button onClick={() => { finderPrefill.state = s.state; nav("/facilities"); }} className="font-bold text-foreground hover:text-primary">Facilities in {s.state}</button></div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
        <div className="mt-12 rounded-xl border border-dashed border-border p-6 md:p-8">
          <p className="font-display text-2xl font-semibold">Interviews are coming</p>
          <p className="mt-2 max-w-2xl text-muted-foreground">We are recording our own conversations with medallists, coaches and parents. Subscribe to the briefing to hear when the first one goes live. Know an athlete with a story to tell? Write to us from the About page.</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-4"><MoreLink href="/golden-moments">Relive the golden moments</MoreLink><MoreLink href="/pathway">Follow the pathway</MoreLink></div>
      </Container>
    </>
  );
}
const IMG_FALLBACK = "./img/crowd.webp";

/* ===================================================== Golden moments slideshow */
export function GoldenMoments() {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(true);
  const [filter, setFilter] = useState<"all" | "Olympics" | "Asian Games" | "Commonwealth Games">("all");
  const list = MOMENTS.filter(m => filter === "all" || m.games === filter);
  const m = list[Math.min(i, list.length - 1)];
  const go = (d: number) => setI(x => (x + d + list.length) % list.length);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => { setI(0); }, [filter]);
  useEffect(() => { if (!play || reduce) return; const id = setInterval(() => go(1), 6000); return () => clearInterval(id); }, [play, list.length, reduce]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (!ref.current?.contains(document.activeElement) && document.activeElement !== document.body) return; if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [list.length]);
  return (
    <>
      <section ref={ref} className="relative isolate h-[min(86vh,760px)] min-h-[520px] overflow-hidden bg-ink text-paper" aria-roledescription="carousel" aria-label="Golden moments" data-testid="moments-show">
        <AnimatePresence mode="sync">
          <motion.div key={m.y + m.t} className="absolute inset-0 -z-10" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.8 }, scale: { duration: 7, ease: "linear" } }}>
            <img src={m.img} alt="" className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="scrim-l absolute inset-0 -z-10" /><div className="scrim-b absolute inset-0 -z-10" />
        <Container className="flex h-full flex-col justify-end pb-24 pt-20">
          <AnimatePresence mode="wait">
            <motion.div key={m.y + m.t} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }} aria-live="polite">
              <Kicker className="text-paper/80">{m.games} · {m.where}</Kicker>
              <p className="mt-2 font-display text-[clamp(4rem,2rem+8vw,9rem)] font-semibold leading-[0.85] text-primary tnum">{m.y}</p>
              <h1 className="mt-2 max-w-3xl font-display text-[clamp(2rem,1.2rem+3vw,3.75rem)] font-semibold leading-[0.95]">{m.t}</h1>
              <p className="mt-3 max-w-xl text-lg text-paper/85">{m.d}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={m.href} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm font-bold text-ink hover:bg-primary">Read the story<ArrowRight className="h-4 w-4" /></Link>
                {m.watch && <a href={m.watch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-paper/40 px-4 py-2 text-sm font-bold hover:border-paper"><Youtube className="h-4 w-4" />Watch on the Olympics channel</a>}
              </div>
            </motion.div>
          </AnimatePresence>
        </Container>
        <div className="absolute inset-x-0 bottom-0"><Container className="flex items-center gap-3 pb-6">
          <button aria-label="Previous moment" data-testid="moment-prev" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-paper/40 hover:bg-paper/10"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label={play ? "Pause slideshow" : "Play slideshow"} data-testid="moment-play" onClick={() => setPlay(p => !p)} className="grid h-10 w-10 place-items-center rounded-full border border-paper/40 hover:bg-paper/10">{play ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <button aria-label="Next moment" data-testid="moment-next" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full border border-paper/40 hover:bg-paper/10"><ChevronRight className="h-5 w-5" /></button>
          <div className="ml-2 flex flex-1 gap-1.5">{list.map((x, j) => (
            <button key={x.y + x.t} aria-label={`${x.y}: ${x.t}`} onClick={() => setI(j)} className="group h-6 flex-1"><span className="relative block h-1 overflow-hidden rounded-full bg-paper/25">
              {j < i && <span className="absolute inset-0 bg-paper" />}
              {j === i && <motion.span key={`${i}-${play}`} className="absolute inset-y-0 left-0 bg-primary" initial={{ width: play && !reduce ? "0%" : "100%" }} animate={{ width: "100%" }} transition={{ duration: play && !reduce ? 6 : 0, ease: "linear" }} />}
            </span></button>))}</div>
          <span className="hidden text-sm text-paper/70 tnum sm:block">{i + 1} / {list.length}</span>
        </Container></div>
      </section>
      <Container className="py-12 md:py-16">
        <Tabs tabs={[["all", "All moments"], ["Olympics", "Olympics"], ["Asian Games", "Asian Games"], ["Commonwealth Games", "Commonwealth"]]} value={filter} onChange={setFilter} />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{list.map((x, j) => (
          <li key={x.y + x.t}><button onClick={() => { setI(j); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={cn("group w-full overflow-hidden rounded-lg border bg-card text-left transition", j === i ? "border-primary" : "border-border hover:border-foreground")}>
            <div className="h-32 overflow-hidden"><img src={x.img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
            <div className="p-4"><p className="font-display text-2xl font-semibold text-primary tnum">{x.y}</p><p className="font-bold">{x.t}</p><p className="text-xs text-muted-foreground">{x.games} · {x.where}</p></div></button></li>))}</ol>
        <p className="mt-6 text-xs text-muted-foreground">Images are illustrative and do not show the athletes. Video links open the official Olympics YouTube channel.</p>
      </Container>
    </>
  );
}

/* ===================================================== Home band */
export function RiseBand() {
  const cards = [
    ["/road-to-la-2028", "Road to LA 2028", "Watchlist, qualification and countdown", RIMG.celebration],
    ["/pathway", "Pathway and parents", "Find my sport quiz, schemes and safety", RIMG.youth],
    ["/facilities", "Facilities by state", `${SAI.filter(x => x.st === "open").length + ACADEMIES.length} centres and academies`, RIMG.academy],
    ["/stories", "Where champions began", "Seven origin stories, all sourced", "./img/wrestling.webp"],
    ["/golden-moments", "Golden moments", "A slideshow of India's greatest wins", "./img/hockey.webp"],
  ] as const;
  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHead kicker="Next generation" title="Building India's next champions" dek="Tools for young athletes, parents and coaches, plus the road to Los Angeles." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([h, t, d, img], i) => (
          <Reveal key={h} delay={i * 0.05}><Link href={h} data-testid={`rise-${i}`} className="group relative block h-72 overflow-hidden rounded-xl bg-ink text-paper">
            <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" /><div className="scrim-b absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-4"><p className="font-display text-xl font-semibold leading-tight">{t}</p><p className="mt-1 text-sm text-paper/75">{d}</p></div>
          </Link></Reveal>))}</div>
      </Container>
    </section>
  );
}
