import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, ExternalLink, GraduationCap, Handshake, HeartHandshake, Landmark, Loader2, MapPin, Medal, School, ShieldCheck, Sparkles, Star, Trophy, Users, Building2, Megaphone, CalendarDays } from "lucide-react";
import { Container, Kicker, SectionHead, Img, PageHero, Tabs, Reveal, StackBar, MedalTriplet, CountUp, Logo } from "@/components/site";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { SuccessWall } from "@/pages/community";

/* ---------------- sources ---------------- */
const S = {
  paris: "https://www.olympics.com/en/olympic-games/paris-2024/medals",
  usCollege: "https://www.seattletimes.com/sports/olympics/75-of-us-olympians-played-in-college-future-of-games-hinges-on-fallout-from-ncaa-athlete-payouts/",
  cnPlan: "https://english.www.gov.cn/policies/latestreleases/202607/24/content_WS6a62db6cc6d00ca5f9a0c64f.html",
  cnSchools: "https://www.kompas.id/artikel/message-four-decades-of-china-dominance",
  nlClubs: "https://www.sportenbewegenincijfers.nl/kaarten/sportlidmaatschappen",
  nlPop: "https://www.olympics.com/ioc/news/a-turning-point-for-dutch-sport",
  pib: "https://www.pib.gov.in/PressNoteDetails.aspx?NoteId=157446&ModuleId=3&reg=48&lang=1",
  kia: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2004017",
  csr: "https://csrxchange.gov.in/frontend_assets/documents/DEVELOPMENT_SECTORS_IN_CSR.pdf",
  g80: "https://www.incometaxindia.gov.in/w/section-80g-61",
};
export const Src = ({ href, children }: { href: string; children: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline decoration-border underline-offset-2 hover:text-primary">{children}<ExternalLink className="h-3 w-3" /></a>
);

export const STATES_UT = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const AGES = ["Under 12", "12–14", "15–17", "18–21", "22+"] as const;
const MINOR = new Set(["Under 12", "12–14", "15–17"]);
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

/* ---------------- benchmark data ---------------- */
const BENCH = [
  { code: "USA", name: "United States", g: 40, s: 44, b: 42, color: "#3B82F6" },
  { code: "CHN", name: "China", g: 40, s: 27, b: 24, color: "#EF4444" },
  { code: "NED", name: "Netherlands", g: 15, s: 7, b: 12, color: "#F97316" },
  { code: "IND", name: "India", g: 0, s: 1, b: 5, color: "#138808" },
];

const SYSTEMS: { k: string; flag: string; name: string; title: string; img: string; facts: [string, ReactNode][]; lesson: string; india: string[]; caution?: string }[] = [
  {
    k: "usa", flag: "USA", name: "United States", title: "The campus is the pipeline", img: "./img/relay.webp",
    facts: [
      ["75%", <>of the nearly 600 US athletes at Paris 2024 played college sport, per <Src href={S.usCollege}>AP via Seattle Times</Src></>],
      ["$5bn+", <>a year spent by NCAA schools on Olympic, non-revenue sports (<Src href={S.usCollege}>AP</Src>)</>],
    ],
    lesson: "School and university sport is the engine. Competition every week, scholarships that reward results, and coaches paid as professionals.",
    india: ["Inter-school leagues every term, not one sports day a year", "University sports scholarships tied to Khelo India University Games results", "Count sport achievement in admissions and placements"],
  },
  {
    k: "chn", flag: "CHN", name: "China", title: "Find talent early, build space to play", img: "./img/weightlifting.webp",
    facts: [
      ["~3,000", <>sports schools training about 400,000 young athletes, as reported by <Src href={S.cnSchools}>Kompas</Src></>],
      ["40%", <>of residents exercising regularly by 2030, with 4 m² of sports space per person and 3.3 instructors per 1,000 people (<Src href={S.cnPlan}>State Council, July 2026</Src>)</>],
    ],
    lesson: "Screen at scale and put places to play within reach of every child, backed by trained instructors in every neighbourhood.",
    india: ["Simple fitness and aptitude tests in every government school", "A play space and a trained instructor in every block", "Publish national targets for participation, not just medals"],
    caution: "Copy the reach, not the pressure. Children should play many sports and stay in school, with safeguarding built in.",
  },
  {
    k: "ned", flag: "NED", name: "Netherlands", title: "Sport belongs to the neighbourhood club", img: "./img/hockey.webp",
    facts: [
      ["24.3%", <>of the Dutch population, 4.4 million people, are members of a sports federation across 21,300 clubs in 2025 (<Src href={S.nlClubs}>Sport en bewegen in cijfers</Src>)</>],
      ["34", <>Paris 2024 medals, 15 of them gold, from a country of about 17.5 million (<Src href={S.paris}>Olympics.com</Src>, <Src href={S.nlPop}>IOC</Src>)</>],
    ],
    lesson: "Volunteer-run community clubs with shared grounds, where children try several sports and adults keep playing for life.",
    india: ["Registered community clubs that use school grounds after hours", "Parents and alumni as trained volunteer coaches and officials", "Clubs for adults too, so sport is a family habit"],
  },
];

/* ---------------- playbook ---------------- */
type Role = "parent" | "school" | "community" | "company" | "fan";
const ROLES: [Role, string][] = [["parent", "Parents"], ["school", "Schools"], ["community", "Panchayats and RWAs"], ["company", "Companies"], ["fan", "Fans"]];
const PLAY: Record<Role, { icon: typeof Users; head: string; acts: string[] }> = {
  parent: { icon: HeartHandshake, head: "Make play a daily habit at home", acts: ["Give my child one hour of active play every day", "Let them try at least three sports before choosing one", "Take them to a district or block event this season", "Learn the safe-sport basics and talk about them at home", "Volunteer once a month as a helper, scorer or driver"] },
  school: { icon: School, head: "Turn PE periods into a sports system", acts: ["Protect PE periods so they are never swapped for exams", "Run an inter-house league every term, for girls and boys", "Open our ground to a community club after school hours", "Screen every student once a year with a simple fitness test", "Name a safeguarding lead and publish how to raise concerns"] },
  community: { icon: Landmark, head: "Build places to play in every block", acts: ["Keep one open ground in our area free and maintained", "Light it in the evenings so girls and working youth can play", "Host a village or ward tournament every year", "Use local funds for basic kit: balls, nets, mats, cones", "Celebrate local winners at gram sabha and RWA meetings"] },
  company: { icon: Building2, head: "Back athletes, not just billboards", acts: ["Ring-fence part of our CSR budget for sports training", "Sponsor at least one district-level athlete for a full year", "Offer flexible jobs to athletes in training", "Fund a coach for a government school near our site", "Match employee donations to athletes and local clubs"] },
  fan: { icon: Megaphone, head: "Show up for the next generation", acts: ["Watch one local or state-level event in person this year", "Share a local athlete's result with my network", "Follow a non-cricket sport through a full season", "Buy tickets and merchandise from Indian leagues", "Nominate a local star on this page"] },
};

/* ---------------- helpers ---------------- */
type Summary = {
  pledges: { role: string; n: number }[];
  stars: { id: number; first: string; sport: string; district: string; state: string; age_band: string; achievement: string; created: string }[];
  competitions: { id: number; name: string; sport: string; city: string; state: string; date: string; ages: string; level: string; link: string | null }[];
  requests: { id: number; sport: string; state: string; age_band: string; level: string; need: string; amount: number; story: string; created: string; backers: number }[];
  offers: number; nominations: number;
};
const useSummary = () => useQuery<Summary>({ queryKey: ["/api/nation/summary"] });

export function useSubmit(url: string, invalidate = "/api/nation/summary") {
  const m = useMutation({
    mutationFn: async (body: unknown) => (await apiRequest("POST", url, body)).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [invalidate] }),
  });
  const error = m.error ? (() => { const msg = String((m.error as Error).message); const j = msg.match(/^\d{3}: (.*)$/s)?.[1]; try { return JSON.parse(j ?? "").message as string; } catch { return "We couldn't reach the server. Try again in a moment."; } })() : null;
  return { ...m, errorMsg: error };
}

export const field = "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:ring-2 focus:ring-primary";
export function F({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return <label className={cn("block", className)}><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}</label>;
}
export const StateSelect = ({ value, onChange, any, testid }: { value: string; onChange: (v: string) => void; any?: boolean; testid?: string }) => (
  <select className={field} value={value} onChange={e => onChange(e.target.value)} data-testid={testid}>
    <option value="">{any ? "Any state" : "Choose a state or UT"}</option>
    {STATES_UT.map(s => <option key={s}>{s}</option>)}
  </select>
);
export function Done({ title, children, onReset }: { title: string; children: ReactNode; onReset: () => void }) {
  return (
    <div role="status" className="rounded-lg border border-indgreen/40 bg-indgreen/10 p-5">
      <p className="flex items-center gap-2 font-display text-xl font-semibold"><CheckCircle2 className="h-5 w-5 text-indgreen" />{title}</p>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
      <button onClick={onReset} className="mt-4 text-sm font-bold text-primary hover:underline">Submit another</button>
    </div>
  );
}
export const Err = ({ msg }: { msg: string | null }) => msg ? <p role="alert" className="text-sm font-bold text-[hsl(2_75%_55%)]">{msg}</p> : null;
export const SubmitBtn = ({ busy, children, testid }: { busy: boolean; children: ReactNode; testid?: string }) => (
  <button type="submit" disabled={busy} data-testid={testid} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-70">
    {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Sending</> : <>{children}<ArrowRight className="h-4 w-4" /></>}
  </button>
);

const SECTIONS: [string, string][] = [["benchmark", "Benchmark"], ["playbook", "Grassroots playbook"], ["stars", "Local stars"], ["compete", "Competitions"], ["sponsor", "Sponsor talent"]];
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ===================================================== page */
export default function SportingNation() {
  const params = useParams<{ section?: string }>();
  useEffect(() => { if (params.section) setTimeout(() => go(params.section!), 120); }, [params.section]);
  return (
    <>
      <PageHero kicker="Sporting culture · Grassroots to podium" img="./img/youth-training.webp" accent="#FF9933"
        title={<>Build a <span className="tri-text">sporting nation</span></>}
        dek="The United States, China and the Netherlands each built a system, not just champions. Here is what India can borrow, and how you can help from your own street.">
        <div className="mt-7 flex flex-wrap gap-2">
          {SECTIONS.map(([id, l]) => (
            <button key={id} onClick={() => go(id)} data-testid={`jump-${id}`} className="rounded-full border border-paper/25 bg-paper/5 px-4 py-2 text-sm font-bold text-paper backdrop-blur hover:bg-paper/15">{l}</button>
          ))}
        </div>
      </PageHero>
      <Benchmark />
      <Systems />
      <Playbook />
      <LocalStars />
      <Competitions />
      <Sponsor />
      <SuccessWall />
      <ClosingBand />
    </>
  );
}

/* ---------------- benchmark ---------------- */
function Benchmark() {
  const max = 126;
  return (
    <section id="benchmark" className="scroll-mt-24 py-14 md:py-20">
      <Container>
        <SectionHead kicker="Paris 2024 benchmark" title="The gap we are closing" dek="Olympic medals at Paris 2024. India's six medals were one silver and five bronze, with several fourth-place finishes just off the podium." />
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5" role="list">
            {BENCH.map((r, i) => (
              <Reveal key={r.code} delay={i * 0.06}>
                <div role="listitem" data-testid={`bench-${r.code}`} className={cn("rounded-lg border p-4", r.code === "IND" ? "border-saffron/50 bg-saffron/5" : "border-border bg-card")}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-3"><span className="grid h-8 w-12 place-items-center rounded font-mono text-xs font-bold text-white" style={{ background: r.color }}>{r.code}</span><span className="font-display text-xl font-semibold">{r.name}</span></p>
                    <div className="flex items-center gap-5"><MedalTriplet g={r.g} s={r.s} b={r.b} size="sm" /><span className="font-display text-2xl font-semibold tnum"><CountUp to={r.g + r.s + r.b} /></span></div>
                  </div>
                  <StackBar g={r.g} s={r.s} b={r.b} max={max} className="h-3" />
                </div>
              </Reveal>
            ))}
            <p className="text-xs text-muted-foreground">Source: <Src href={S.paris}>Olympics.com, Paris 2024 medal table</Src></p>
          </div>
          <div className="rounded-xl bg-ink p-6 text-paper md:p-8">
            <Kicker color="#FF9933" className="text-paper/70">India's stated goal</Kicker>
            <p className="mt-4 font-display text-[clamp(2rem,1.4rem+2vw,3rem)] font-semibold leading-[1]">Top 10 by 2036.<br /><span className="text-saffron">Top 5 by 2047.</span></p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div><dt className="text-xs uppercase tracking-[0.12em] text-paper/60">Sports ministry, 2026–27</dt><dd className="mt-1 font-display text-2xl font-semibold">₹4,479.88 cr</dd><dd className="text-xs text-paper/60">Highest ever</dd></div>
              <div><dt className="text-xs uppercase tracking-[0.12em] text-paper/60">Khelo India, 2026–27</dt><dd className="mt-1 font-display text-2xl font-semibold">₹924.35 cr</dd><dd className="text-xs text-paper/60">Plus a new 10-year Khelo India Mission</dd></div>
              <div className="col-span-2"><dt className="text-xs uppercase tracking-[0.12em] text-paper/60">Khelo India athletes</dt><dd className="mt-1 text-paper/85">Close to 3,000 athletes receive ₹6.28 lakh a year each, including ₹1.2 lakh as a cash allowance.</dd></div>
            </dl>
            <p className="mt-5 text-xs text-paper/55"><Src href={S.pib}>PIB budget note, Feb 2026</Src> · <Src href={S.kia}>PIB on Khelo India scholarships</Src></p>
            <p className="mt-5 border-t border-white/10 pt-5 text-sm text-paper/75">Money at the top is rising. The missing piece is the base: how many children play, how often they compete, and who pays for the talented ones before they are famous.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- systems ---------------- */
function Systems() {
  const [k, setK] = useState("usa");
  const sys = SYSTEMS.find(s => s.k === k)!;
  return (
    <section className="border-y border-border bg-muted/40 py-14 md:py-20">
      <Container>
        <SectionHead kicker="Three systems, three lessons" title="What the leading sporting nations do differently" dek="Different politics, different budgets. Each still answers the same question: where does a talented 10-year-old get to play, compete and be noticed?" />
        <Tabs tabs={SYSTEMS.map(s => [s.k, s.name] as [string, string])} value={k} onChange={setK} className="mb-8" />
        <motion.div key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid gap-8 lg:grid-cols-[1fr_1.2fr]" data-testid={`system-${k}`}>
          <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-ink text-paper">
            <Img src={sys.img} alt="" className="absolute inset-0 opacity-80" /><div className="scrim-b absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-mono text-xs font-bold text-saffron">{sys.flag}</span>
              <p className="mt-1 font-display text-3xl font-semibold leading-tight">{sys.title}</p>
              <p className="mt-2 max-w-md text-sm text-paper/80">{sys.lesson}</p>
            </div>
          </div>
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {sys.facts.map(([v, d], i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4"><p className="font-display text-4xl font-semibold tnum">{v}</p><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indgreen"><Sparkles className="h-4 w-4" />What India can borrow</p>
              <ul className="mt-3 space-y-2.5">{sys.india.map(x => <li key={x} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-indgreen" /><span>{x}</span></li>)}</ul>
              {sys.caution && <p className="mt-4 flex gap-2 border-t border-border pt-4 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />{sys.caution}</p>}
            </div>
          </div>
        </motion.div>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[[GraduationCap, "Schools and colleges", "From the US: weekly competition and scholarships inside education."], [Trophy, "Reach and space", "From China: every child screened, a place to play in every block."], [Users, "Clubs and community", "From the Netherlands: volunteer clubs where the whole family plays."]].map(([I, t, d]: any) => (
            <div key={t} className="flex gap-4 rounded-lg border border-border bg-background p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><I className="h-5 w-5" /></span><div><p className="font-bold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- playbook ---------------- */
function Playbook() {
  const [role, setRole] = useState<Role>("parent");
  const [picked, setPicked] = useState<Record<Role, string[]>>({ parent: [], school: [], community: [], company: [], fan: [] });
  const [state, setState] = useState("");
  const { data } = useSummary();
  const sub = useSubmit("/api/nation/pledge");
  const p = PLAY[role]; const mine = picked[role];
  const total = (data?.pledges ?? []).reduce((a, x) => a + x.n, 0);
  const byRole = (r: Role) => data?.pledges.find(x => x.role === r)?.n ?? 0;
  const toggle = (a: string) => setPicked({ ...picked, [role]: mine.includes(a) ? mine.filter(x => x !== a) : [...mine, a] });
  return (
    <section id="playbook" className="scroll-mt-24 py-14 md:py-20">
      <Container>
        <SectionHead kicker="Grassroots playbook" title="Start from the ground up" dek="Champions come from places where lots of children play. Pick your role, tick what you will do this year, and take the pledge."
          action={<div className="text-right"><p className="font-display text-3xl font-semibold tnum" data-testid="pledge-total">{total.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">pledges so far</p></div>} />
        <Tabs tabs={ROLES} value={role} onChange={r => { setRole(r); sub.reset(); }} className="mb-6" />
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold"><p.icon className="h-6 w-6 text-primary" />{p.head}</p>
            <ul className="space-y-2">
              {p.acts.map((a, i) => {
                const on = mine.includes(a);
                return (
                  <li key={a}><button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(a)} data-testid={`act-${role}-${i}`}
                    className={cn("flex w-full items-center gap-3 rounded-lg border p-4 text-left transition", on ? "border-indgreen bg-indgreen/10" : "border-border bg-card hover:border-foreground/40")}>
                    <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition", on ? "border-indgreen bg-indgreen text-white" : "border-border")}>{on && <Check className="h-4 w-4" />}</span>
                    <span className="font-medium">{a}</span>
                  </button></li>
                );
              })}
            </ul>
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-bold">Your pledge as {ROLES.find(r => r[0] === role)![1].toLowerCase()}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="tricolour h-full transition-all duration-500" style={{ width: `${(mine.length / p.acts.length) * 100}%` }} /></div>
              <p className="mt-2 text-sm text-muted-foreground">{mine.length} of {p.acts.length} actions ticked</p>
              {sub.isSuccess ? (
                <div className="mt-4"><Done title="Pledge recorded" onReset={() => { sub.reset(); setPicked({ ...picked, [role]: [] }); }}>Thank you. You are one of {byRole(role).toLocaleString("en-IN")} {ROLES.find(r => r[0] === role)![1].toLowerCase()} who have pledged. Share this page to bring one more.</Done></div>
              ) : (
                <form className="mt-4 space-y-4" onSubmit={e => { e.preventDefault(); sub.mutate({ role, actions: mine, state: state || null }); }}>
                  <F label="Your state (optional)"><StateSelect value={state} onChange={setState} testid="pledge-state" /></F>
                  <Err msg={sub.errorMsg} />
                  <SubmitBtn busy={sub.isPending} testid="button-pledge">Take the pledge</SubmitBtn>
                </form>
              )}
              <div className="mt-5 grid grid-cols-5 gap-1 border-t border-border pt-4 text-center">
                {ROLES.map(([r, l]) => <div key={r}><p className="font-display text-lg font-semibold tnum">{byRole(r)}</p><p className="text-[0.65rem] leading-tight text-muted-foreground">{l}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- local stars ---------------- */
function LocalStars() {
  const { data } = useSummary();
  const sub = useSubmit("/api/nation/nominate");
  const blank = { athlete: "", sport: "", district: "", state: "", age_band: "15–17", achievement: "", link: "", nominator: "", email: "", consent: false };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e });
  const stars = data?.stars ?? [];
  return (
    <section id="stars" className="scroll-mt-24 bg-ink py-14 text-paper md:py-20">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div className="max-w-3xl">
            <Kicker color="#FF9933" className="mb-2 text-paper/70">Promote local stars</Kicker>
            <h2 className="text-balance font-display text-[clamp(1.6rem,1.1rem+1.8vw,2.6rem)] font-semibold leading-[1.02]">Every district has a champion waiting to be noticed</h2>
            <p className="mt-2 max-w-2xl text-paper/70">Nominate a young athlete from your town. We verify results with coaches and associations, then feature them in the briefing and share them with sponsors.</p>
          </div>
          <p className="text-right"><span className="block font-display text-3xl font-semibold tnum">{(data?.nominations ?? 0).toLocaleString("en-IN")}</span><span className="text-xs text-paper/60">nominations</span></p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-paper/60">Community spotlight</p>
            {stars.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
                <Star className="mx-auto h-8 w-8 text-saffron" />
                <p className="mt-3 font-display text-xl font-semibold">Be the first to nominate</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-paper/65">The block champion, the girl who outruns everyone at school, the wrestler from your akhara. Tell us about them.</p>
                <Link href="/stories" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-saffron hover:underline">See where today's champions began<ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {stars.map(s => (
                  <li key={s.id} className="rounded-lg border border-white/10 bg-white/5 p-4" data-testid={`star-${s.id}`}>
                    <div className="flex items-center justify-between gap-2"><p className="font-display text-lg font-semibold">{s.first}</p><span className="rounded-full bg-saffron/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-saffron">Verified</span></div>
                    <p className="text-sm text-paper/70">{s.sport} · {s.age_band}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-paper/60"><MapPin className="h-3 w-3" />{s.district}, {s.state}</p>
                    <p className="mt-2 line-clamp-3 text-sm text-paper/85">{s.achievement}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-paper/50">We only show a first name, sport, age band and district. Full names appear after the athlete, or a parent for under-18s, confirms.</p>
          </div>
          <div className="rounded-xl bg-card p-5 text-card-foreground md:p-6">
            {sub.isSuccess ? (
              <Done title={`Nomination ${sub.data?.ref} received`} onReset={() => { sub.reset(); setF(blank); }}>We will check the results with the coach or association and email {f.email}. Once verified, they appear in the community spotlight.</Done>
            ) : (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, link: f.link || null }); }} noValidate>
                <p className="font-display text-2xl font-semibold sm:col-span-2">Nominate a local star</p>
                <F label="Athlete's name"><input className={field} value={f.athlete} onChange={set("athlete")} data-testid="nom-athlete" /></F>
                <F label="Sport"><input className={field} value={f.sport} onChange={set("sport")} placeholder="Kabaddi, archery, athletics…" data-testid="nom-sport" /></F>
                <F label="District or town"><input className={field} value={f.district} onChange={set("district")} data-testid="nom-district" /></F>
                <F label="State or UT"><StateSelect value={f.state} onChange={v => setF({ ...f, state: v })} testid="nom-state" /></F>
                <F label="Age group"><select className={field} value={f.age_band} onChange={set("age_band")}>{AGES.map(a => <option key={a}>{a}</option>)}</select></F>
                <F label="Results link (optional)"><input className={field} value={f.link} onChange={set("link")} placeholder="News report, results sheet" /></F>
                <F label="What have they achieved?" className="sm:col-span-2"><textarea className={cn(field, "h-24 py-2")} value={f.achievement} onChange={set("achievement")} placeholder="Won the district U-16 100 m in 11.4 s, trains on a mud track before school…" data-testid="nom-achievement" /></F>
                <F label="Your name"><input className={field} value={f.nominator} onChange={set("nominator")} data-testid="nom-name" /></F>
                <F label="Your email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="nom-email" /></F>
                <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" checked={f.consent} onChange={set("consent")} data-testid="nom-consent" /><span>The athlete, or a parent or guardian if they are under 18, agrees to be featured.</span></label>
                <div className="space-y-2 sm:col-span-2"><Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="button-nominate">Send nomination</SubmitBtn></div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- competitions ---------------- */
const PYRAMID: [string, string, string][] = [
  ["Village, ward and school", "Inter-house days, panchayat and RWA tournaments, club leagues", "Everyone plays"],
  ["Block and district", "District association championships and school games", "Results get noticed"],
  ["State", "State championships and state school games", "Selection for nationals"],
  ["Khelo India Games", "Youth, University, Para, Winter and Beach Games", "National scouting"],
  ["National and international", "National championships, Asian Games, Commonwealth Games, Olympics", "The podium"],
];
function Competitions() {
  const { data } = useSummary();
  const sub = useSubmit("/api/nation/competitions");
  const [filter, setFilter] = useState("");
  const blank = { name: "", sport: "", city: "", state: "", date: "", ages: "", level: "District", link: "", email: "" };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.value });
  const list = useMemo(() => (data?.competitions ?? []).filter(c => !filter || c.state === filter), [data, filter]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section id="compete" className="scroll-mt-24 py-14 md:py-20">
      <Container>
        <SectionHead kicker="Competition" title="More matches, more often, closer to home" dek="Talent grows through regular competition. List a local tournament so young athletes can find it, and see the ladder from the village ground to the podium." />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <ol className="space-y-2" aria-label="Competition ladder">
              {PYRAMID.map(([t, d, tag], i) => (
                <Reveal key={t} delay={i * 0.05}>
                  <li className="flex items-center gap-4 rounded-lg border border-border bg-card p-4" style={{ marginLeft: `${(PYRAMID.length - 1 - i) * 0}rem` }}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-white" style={{ background: ["#138808", "#3F8F2A", "#9A8A2A", "#E07A1F", "#FF9933"][i] }}>{i + 1}</span>
                    <div className="min-w-0 flex-1"><p className="font-bold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                    <span className="hidden shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground sm:block">{tag}</span>
                  </li>
                </Reveal>
              ))}
            </ol>
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-5">
              <p className="font-bold">Hosting a local event? A quick checklist</p>
              <ul className="mt-3 space-y-2 text-sm">
                {["Tell the district sports officer and the local association so results can count", "Run separate girls' and boys' categories with fair age groups", "Have first aid, drinking water and a named safeguarding contact on site", "Publish results within 48 hours and send them to us for the spotlight"].map(x => <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-indgreen" />{x}</li>)}
              </ul>
              <Link href="/facilities" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">Find grounds and centres near you<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-display text-2xl font-semibold"><CalendarDays className="h-5 w-5 text-primary" />Community calendar</p>
              <div className="w-full sm:w-60"><StateSelect value={filter} onChange={setFilter} any testid="comp-filter" /></div>
            </div>
            {list.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{filter ? `No events listed in ${filter} yet.` : "No upcoming events listed yet."} Add the first one below.</div>
            ) : (
              <ul className="max-h-[420px] divide-y divide-border overflow-y-auto rounded-lg border border-border bg-card">
                {list.map(c => (
                  <li key={c.id} className="flex gap-4 p-4" data-testid={`comp-${c.id}`}>
                    <div className="w-14 shrink-0 text-center"><p className="font-display text-2xl font-semibold leading-none tnum">{new Date(c.date).getDate()}</p><p className="text-xs uppercase text-muted-foreground">{new Date(c.date).toLocaleString("en-IN", { month: "short" })}</p></div>
                    <div className="min-w-0"><p className="font-bold">{c.name}</p><p className="text-sm text-muted-foreground">{c.sport} · {c.ages} · {c.level}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{c.city}, {c.state}{c.link && <> · <a href={c.link} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">Details</a></>}</p></div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Listed by organisers and checked by our team. Confirm details with the organiser before you travel.</p>
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              {sub.isSuccess ? (
                <Done title={`Event ${sub.data?.ref} listed`} onReset={() => { sub.reset(); setF(blank); }}>It will appear in the community calendar after a quick check, usually within two days. Send results to the same email after the event.</Done>
              ) : (
                <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, link: f.link || null }); }}>
                  <p className="font-display text-xl font-semibold sm:col-span-2">List a tournament</p>
                  <F label="Event name" className="sm:col-span-2"><input className={field} value={f.name} onChange={set("name")} placeholder="Ranchi Block U-14 Archery Open" data-testid="comp-name" /></F>
                  <F label="Sport"><input className={field} value={f.sport} onChange={set("sport")} data-testid="comp-sport" /></F>
                  <F label="Date"><input type="date" min={today} className={field} value={f.date} onChange={set("date")} data-testid="comp-date" /></F>
                  <F label="Town or city"><input className={field} value={f.city} onChange={set("city")} data-testid="comp-city" /></F>
                  <F label="State or UT"><StateSelect value={f.state} onChange={v => setF({ ...f, state: v })} testid="comp-state" /></F>
                  <F label="Who can enter"><input className={field} value={f.ages} onChange={set("ages")} placeholder="U-14 girls and boys" data-testid="comp-ages" /></F>
                  <F label="Level"><select className={field} value={f.level} onChange={set("level")}>{["Village or block", "District", "State", "Open"].map(x => <option key={x}>{x}</option>)}</select></F>
                  <F label="Entry link (optional)"><input className={field} value={f.link} onChange={set("link")} /></F>
                  <F label="Organiser email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="comp-email" /></F>
                  <div className="space-y-2 sm:col-span-2"><Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="button-comp">Add to calendar</SubmitBtn></div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- sponsor ---------------- */
const TIERS = [
  { k: "Under ₹25,000", t: "Kit starter", v: 25000, d: "Shoes, kit and basic equipment for a season. Often the first thing that stops a child from continuing." },
  { k: "₹25,000 to ₹1.2 lakh", t: "Season pass", v: 120000, d: "Coaching fees, travel to district and state meets, and nutrition. ₹1.2 lakh matches the yearly Khelo India cash allowance." },
  { k: "₹1.2 lakh to ₹6.28 lakh", t: "Full year", v: 628000, d: "Training, coaching, diet, kit, insurance and allowance. ₹6.28 lakh is what Khelo India spends per athlete a year." },
];
function Sponsor() {
  const { data } = useSummary();
  const [mode, setMode] = useState<"back" | "ask">("back");
  const [target, setTarget] = useState<number | null>(null);
  const requests = data?.requests ?? [];
  const back = (id: number) => { setTarget(id); setMode("back"); setTimeout(() => document.getElementById("sponsor-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); };
  return (
    <section id="sponsor" className="scroll-mt-24 border-t border-border bg-muted/40 py-14 md:py-20">
      <Container>
        <SectionHead kicker="Find sponsors for budding talent" title="Back an athlete before they are famous" dek="The hardest years to fund are the early ones, before medals bring brand deals. We match sponsors with verified young athletes. No money passes through Momentum India; you pay the academy, coach or family directly after we introduce you."
          action={<div className="text-right"><p className="font-display text-3xl font-semibold tnum">{(data?.offers ?? 0).toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">sponsor offers</p></div>} />
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.k} delay={i * 0.06}>
              <div className={cn("h-full rounded-xl border p-5", i === 2 ? "border-transparent bg-ink text-paper" : "border-border bg-card")}>
                <p className={cn("text-xs font-bold uppercase tracking-[0.14em]", i === 2 ? "text-saffron" : "text-primary")}>{t.t}</p>
                <p className="mt-2 font-display text-3xl font-semibold tnum">{i === 0 ? "up to " : ""}{inr(t.v)}</p>
                <p className={cn("mt-2 text-sm", i === 2 ? "text-paper/75" : "text-muted-foreground")}>{t.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Benchmarks from <Src href={S.kia}>PIB on Khelo India scholarships</Src>.</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold"><Medal className="h-5 w-5 text-primary" />Athletes looking for backing</p>
            {requests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">No open requests yet. Athletes and parents can add one with the form, and sponsors can register interest now so we can match them as requests arrive.</div>
            ) : (
              <ul className="grid max-h-[560px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {requests.map(r => (
                  <li key={r.id} className={cn("flex flex-col rounded-lg border bg-card p-4", target === r.id ? "border-primary ring-2 ring-primary/30" : "border-border")} data-testid={`req-${r.id}`}>
                    <div className="flex items-start justify-between gap-2"><p className="font-bold">{r.sport}</p><span className="font-mono text-xs text-muted-foreground">MR-{String(r.id).padStart(5, "0")}</span></div>
                    <p className="text-sm text-muted-foreground">{r.age_band} · {r.level} level · {r.state}</p>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm">{r.story}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <div><p className="text-xs text-muted-foreground">{r.need}</p><p className="font-display text-xl font-semibold tnum">{inr(r.amount)}</p></div>
                      <button onClick={() => back(r.id)} data-testid={`back-${r.id}`} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">Back this athlete</button>
                    </div>
                    {r.backers > 0 && <p className="mt-2 text-xs font-bold text-indgreen">{r.backers} sponsor{r.backers > 1 ? "s" : ""} interested</p>}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 space-y-3 rounded-lg border border-border bg-background p-5 text-sm">
              <p className="flex gap-2"><Handshake className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><b>Companies:</b> training to promote rural sports, nationally recognised sports, Paralympic and Olympic sports is an eligible CSR activity under Schedule VII of the Companies Act (<Src href={S.csr}>CSRXchange</Src>).</span></p>
              <p className="flex gap-2"><Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><b>Individuals:</b> donations to the government's National Sports Development Fund qualify for a full deduction under Section 80G (<Src href={S.g80}>Income Tax Department</Src>). Direct sponsorship of an athlete does not, so check with your tax adviser.</span></p>
              <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indgreen" /><span><b>Safety:</b> we never publish a minor's name or contact details. Requests for under-18s must come from a parent or guardian, and every introduction happens with them present.</span></p>
            </div>
          </div>
          <div id="sponsor-form" className="scroll-mt-28">
            <div role="tablist" className="mb-4 grid grid-cols-2 rounded-full border border-border bg-background p-1">
              {([["back", "I want to sponsor"], ["ask", "I need a sponsor"]] as const).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} data-testid={`mode-${k}`} className={cn("h-10 rounded-full text-sm font-bold transition", mode === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{l}</button>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">{mode === "back" ? <OfferForm target={target} clear={() => setTarget(null)} /> : <RequestForm />}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function OfferForm({ target, clear }: { target: number | null; clear: () => void }) {
  const sub = useSubmit("/api/nation/offers");
  const blank = { org: "", kind: "Company", budget: "₹25,000 to ₹1.2 lakh", sports: "", states: "", contact: "", email: "", csr: false };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  if (sub.isSuccess) return <Done title={`Offer ${sub.data?.ref} received`} onReset={() => { sub.reset(); setF(blank); clear(); }}>{target ? `We will contact the family behind MR-${String(target).padStart(5, "0")} and set up an introduction.` : "We will email you a shortlist of verified athletes who match your sports and states."} Watch for an email at {f.email}.</Done>;
  return (
    <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, sports: f.sports || "Any", states: f.states || "Any", request_id: target }); }}>
      <p className="font-display text-2xl font-semibold sm:col-span-2">Become a talent sponsor</p>
      {target && <p className="flex items-center justify-between gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm sm:col-span-2"><span>Backing request <b>MR-{String(target).padStart(5, "0")}</b></span><button type="button" onClick={clear} className="font-bold text-primary hover:underline">Remove</button></p>}
      <F label="Name or organisation"><input className={field} value={f.org} onChange={set("org")} data-testid="off-org" /></F>
      <F label="You are"><select className={field} value={f.kind} onChange={set("kind")}>{["Individual", "Company", "Foundation or trust", "Club or alumni group"].map(x => <option key={x}>{x}</option>)}</select></F>
      <F label="Yearly budget" className="sm:col-span-2"><select className={field} value={f.budget} onChange={set("budget")} data-testid="off-budget">{["Under ₹25,000", "₹25,000 to ₹1.2 lakh", "₹1.2 lakh to ₹6.28 lakh", "Over ₹6.28 lakh"].map(x => <option key={x}>{x}</option>)}</select></F>
      <F label="Sports you'd like to back" hint="Leave blank for any"><input className={field} value={f.sports} onChange={set("sports")} placeholder="Archery, para athletics" /></F>
      <F label="States you'd like to back" hint="Leave blank for any"><input className={field} value={f.states} onChange={set("states")} placeholder="Odisha, Manipur" /></F>
      <F label="Contact person"><input className={field} value={f.contact} onChange={set("contact")} data-testid="off-contact" /></F>
      <F label="Email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="off-email" /></F>
      {f.kind !== "Individual" && <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-1 h-4 w-4" checked={f.csr} onChange={set("csr")} /><span>We plan to fund this through our CSR budget</span></label>}
      <div className="space-y-2 sm:col-span-2"><Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="button-offer">Register as a sponsor</SubmitBtn></div>
    </form>
  );
}

function RequestForm() {
  const sub = useSubmit("/api/nation/requests");
  const blank = { sport: "", state: "", age_band: "15–17", level: "District", need: "Equipment and kit", amount: "40000", story: "", name: "", email: "", phone: "", guardian: false };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const minor = MINOR.has(f.age_band);
  if (sub.isSuccess) return <Done title={`Request ${sub.data?.ref} received`} onReset={() => { sub.reset(); setF(blank); }}>We will call to verify results with your coach. Once verified, your request is listed without your name or contact details.</Done>;
  return (
    <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, amount: Number(f.amount) }); }}>
      <p className="font-display text-2xl font-semibold sm:col-span-2">Ask for sponsorship</p>
      <F label="Sport"><input className={field} value={f.sport} onChange={set("sport")} data-testid="req-sport" /></F>
      <F label="State or UT"><StateSelect value={f.state} onChange={v => setF({ ...f, state: v })} testid="req-state" /></F>
      <F label="Athlete's age group"><select className={field} value={f.age_band} onChange={set("age_band")} data-testid="req-age">{AGES.map(a => <option key={a}>{a}</option>)}</select></F>
      <F label="Highest level competed"><select className={field} value={f.level} onChange={set("level")}>{["District", "State", "National", "International"].map(x => <option key={x}>{x}</option>)}</select></F>
      <F label="What is the money for"><select className={field} value={f.need} onChange={set("need")}>{["Equipment and kit", "Coaching fees", "Travel to competitions", "Nutrition and physio", "Full season support"].map(x => <option key={x}>{x}</option>)}</select></F>
      <F label="Amount needed (₹)"><input inputMode="numeric" className={field} value={f.amount} onChange={e => setF({ ...f, amount: e.target.value.replace(/\D/g, "") })} data-testid="req-amount" /></F>
      <F label="Recent results and what this would change" className="sm:col-span-2"><textarea className={cn(field, "h-24 py-2")} value={f.story} onChange={set("story")} placeholder="State U-17 silver in 2026. Training with a borrowed bow; my own would let me practise daily." data-testid="req-story" /></F>
      <F label={minor ? "Parent or guardian's name" : "Your name"}><input className={field} value={f.name} onChange={set("name")} data-testid="req-name" /></F>
      <F label="Mobile number"><input inputMode="tel" className={field} value={f.phone} onChange={set("phone")} placeholder="98765 43210" data-testid="req-phone" /></F>
      <F label="Email" className="sm:col-span-2"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="req-email" /></F>
      {minor && <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-1 h-4 w-4" checked={f.guardian} onChange={set("guardian")} data-testid="req-guardian" /><span>I am the athlete's parent or legal guardian.</span></label>}
      <p className="text-xs text-muted-foreground sm:col-span-2">Only the sport, state, age group, level, need, amount and story are shown publicly.</p>
      <div className="space-y-2 sm:col-span-2"><Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="button-request">Submit request</SubmitBtn></div>
    </form>
  );
}

/* ---------------- closing ---------------- */
function ClosingBand() {
  return (
    <section className="grain relative isolate overflow-hidden bg-ink py-16 text-paper md:py-24">
      <div className="absolute inset-0 -z-10 opacity-40"><Img src="./img/crowd.webp" alt="" /></div><div className="scrim-l absolute inset-0 -z-10" />
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <Logo className="h-16 w-16 shrink-0" />
          <div><p className="font-display text-[clamp(1.8rem,1.2rem+2vw,3rem)] font-semibold leading-[1]">Celebrating the rise of a <span className="tri-text">sporting nation</span></p>
            <p className="mt-2 max-w-xl text-paper/75">The next Neeraj Chopra is playing on a dusty ground somewhere today. Help them get to the next match.</p></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => go("stars")} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground hover:brightness-110">Nominate a local star<ArrowRight className="h-4 w-4" /></button>
          <Link href="/pathway" className="inline-flex h-12 items-center rounded-full border border-paper/30 px-6 font-bold hover:bg-paper/10">Pathway for parents</Link>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- home band ---------------- */
export function NationBand() {
  return (
    <section className="py-6 md:py-10">
      <Container>
        <Link href="/sporting-nation" data-testid="nation-band" className="group grain relative isolate block overflow-hidden rounded-2xl bg-ink text-paper">
          <div className="absolute inset-0 -z-10"><Img src="./img/youth-training.webp" alt="" className="opacity-70 transition-transform duration-1000 group-hover:scale-105" /></div>
          <div className="scrim-l absolute inset-0 -z-10" />
          <div className="tricolour absolute inset-x-0 top-0 h-1" />
          <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
            <div>
              <Kicker color="#FF9933" className="text-paper/80">New · Build a sporting nation</Kicker>
              <p className="mt-3 max-w-2xl text-balance font-display text-[clamp(1.8rem,1.2rem+2.2vw,3.2rem)] font-semibold leading-[1]">What the US, China and the Netherlands do differently, and how India <span className="tri-text">catches up</span></p>
              <p className="mt-3 max-w-xl text-paper/75">A grassroots playbook, a spotlight for local stars, a community competition calendar and a way to sponsor budding talent.</p>
              <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground">Explore the plan<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
            </div>
            <div className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-lg border border-paper/15 bg-paper/15 backdrop-blur">
              {[["126", "US medals, Paris 2024"], ["91", "China"], ["34", "Netherlands"], ["6", "India"]].map(([v, l]) => (
                <div key={l} className="bg-ink/60 p-4"><p className="font-display text-3xl font-semibold tnum">{v}</p><p className="text-xs text-paper/65">{l}</p></div>
              ))}
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
