import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, Brain, CalendarHeart, Check, Crown, Lock, RotateCcw, Share2, Target, X } from "lucide-react";
import { Container, Kicker, SectionHead, PageHero, Tabs } from "@/components/site";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePrefs } from "@/lib/prefs";
import { OLY_MEDALS, OLY, ASIAN, CWG, isPlayed, total, MEDAL_LABEL, type OlyMedal } from "@/data";
import { field, Err } from "@/pages/nation";
import { cn } from "@/lib/utils";

const wa = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
const siteUrl = () => (typeof window !== "undefined" ? window.location.origin : "");
const ShareWA = ({ text, label = "Share on WhatsApp", testid }: { text: string; label?: string; testid?: string }) => (
  <a href={wa(text)} target="_blank" rel="noreferrer" data-testid={testid} className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-[#0b2e17] hover:brightness-105"><Share2 className="h-4 w-4" />{label}</a>
);

export default function FanZone() {
  const [tab, setTab] = useState<"predict" | "quiz" | "today">("predict");
  return (
    <>
      <PageHero kicker="Fan zone · Play along" img="./img/celebration.webp" accent="#FF9933" title={<>Call it before it <span className="tri-text">happens</span></>}
        dek="Predict results, climb the leaderboard, test your memory of India's great days and find out what happened on this day." />
      <Container className="py-10 md:py-14">
        <Tabs tabs={[["predict", "Predictions"], ["quiz", "Quiz"], ["today", "On this day"]]} value={tab} onChange={setTab} />
        <div className="mt-8">{tab === "predict" ? <Predictions /> : tab === "quiz" ? <Quiz /> : <OnThisDay />}</div>
      </Container>
    </>
  );
}

/* ===================================================== predictions */
type Q = { id: number; question: string; options: string[]; closes_at: string; answer: string | null; points: number; topic: string | null; status: string; votes: Record<string, number> };
type Board = { nickname: string; points: number; correct: number; picks: number };
function Predictions() {
  const { followEmail, setFollowEmail } = usePrefs();
  const [email, setEmail] = useState(followEmail ?? "");
  const [nick, setNick] = useState("");
  const [ready, setReady] = useState(false);
  const { data } = useQuery<{ questions: Q[]; leaderboard: Board[]; players: number }>({ queryKey: ["/api/fan"] });
  const mine = useQuery<{ picks: { qid: number; choice: string }[] }>({ queryKey: [`/api/fan/mine/${email}`], enabled: ready && !!email });
  const myPick = new Map((mine.data?.picks ?? []).map(p => [p.qid, p.choice]));
  const pick = useMutation({
    mutationFn: async (b: { qid: number; choice: string }) => (await apiRequest("POST", "/api/fan/pick", { ...b, nickname: nick, email })).json(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fan"] }); mine.refetch(); },
  });
  const errMsg = pick.error ? (() => { const m = String((pick.error as Error).message); try { return JSON.parse(m.slice(m.indexOf("{"))).message as string; } catch { return "We couldn't save that pick. Try again."; } })() : null;
  const qs = data?.questions ?? [];
  const open = qs.filter(q => q.status === "open" && +new Date(q.closes_at) > Date.now());
  const closed = qs.filter(q => !open.includes(q));
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div>
        {!ready ? (
          <form className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={e => { e.preventDefault(); if (nick.trim().length >= 2 && /\S+@\S+\.\S+/.test(email)) { setReady(true); setFollowEmail(email.trim().toLowerCase()); } }}>
            <p className="sm:col-span-3"><b className="font-display text-xl">Join the game</b><span className="block text-sm text-muted-foreground">Your nickname appears on the leaderboard. Your email is only used to keep your picks; it is never shown.</span></p>
            <label className="text-sm"><span className="mb-1 block font-bold">Nickname</span><input className={field} value={nick} onChange={e => setNick(e.target.value)} maxLength={24} placeholder="Javelin_Junkie" data-testid="fan-nick" /></label>
            <label className="text-sm"><span className="mb-1 block font-bold">Email</span><input type="email" className={field} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" data-testid="fan-email" /></label>
            <button className="h-11 rounded-full bg-primary px-6 font-bold text-primary-foreground" data-testid="fan-join">Start picking</button>
          </form>
        ) : <p className="mb-6 rounded-md bg-indgreen/10 p-3 text-sm" role="status">Playing as <b>{nick}</b>. You can change a pick until the question closes.</p>}
        <Err msg={errMsg} />
        <SectionHead kicker={`${open.length} open`} title="Make your picks" />
        {open.length === 0 && <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No open questions right now. New ones go up before every big event.</p>}
        <ul className="space-y-4">{open.map(q => <QCard key={q.id} q={q} mine={myPick.get(q.id)} can={ready} busy={pick.isPending} onPick={c => pick.mutate({ qid: q.id, choice: c })} />)}</ul>
        {closed.length > 0 && <><SectionHead className="mt-12" kicker="Closed" title="Results and locked questions" />
          <ul className="space-y-4">{closed.map(q => <QCard key={q.id} q={q} mine={myPick.get(q.id)} can={false} busy={false} onPick={() => {}} />)}</ul></>}
      </div>
      <aside>
        <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-xl font-semibold"><Crown className="h-5 w-5 text-gold" />Leaderboard</p>
          <p className="text-sm text-muted-foreground">{(data?.players ?? 0).toLocaleString("en-IN")} player{data?.players === 1 ? "" : "s"}. Points are added when a question is settled.</p>
          {(data?.leaderboard ?? []).length === 0 ? <p className="mt-4 rounded-md bg-muted p-4 text-sm">Be the first on the board.</p> : (
            <ol className="mt-4 divide-y divide-border">{data!.leaderboard.map((b, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className="flex items-center gap-3"><b className={cn("grid h-7 w-7 place-items-center rounded-full text-xs tnum", i === 0 ? "bg-gold text-ink" : i === 1 ? "bg-silver text-ink" : i === 2 ? "bg-bronze text-ink" : "bg-muted")}>{i + 1}</b><span className="font-bold">{b.nickname}</span></span><span className="tnum"><b>{b.points}</b> pts <span className="text-muted-foreground">· {b.correct}/{b.picks}</span></span></li>))}</ol>
          )}
          <div className="mt-5"><ShareWA text={`I'm predicting India's results on Momentum India. Think you can beat me? ${siteUrl()}/fan-zone`} label="Challenge friends" testid="fan-share" /></div>
        </div>
      </aside>
    </div>
  );
}
function QCard({ q, mine, can, busy, onPick }: { q: Q; mine?: string; can: boolean; busy: boolean; onPick: (c: string) => void }) {
  const votes = Object.values(q.votes).reduce((a, b) => a + b, 0);
  const closesIn = +new Date(q.closes_at) - Date.now();
  const isOpen = q.status === "open" && closesIn > 0;
  return (
    <li className="rounded-xl border border-border bg-card p-5" data-testid={`q-${q.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground"><span className="text-saffron">{q.topic ?? "Prediction"} · {q.points} pts</span>
        <span className="flex items-center gap-1">{isOpen ? <>Closes {new Date(q.closes_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} IST</> : q.answer ? "Settled" : <><Lock className="h-3 w-3" />Closed, awaiting result</>}</span></div>
      <p className="mt-2 font-display text-xl font-semibold leading-snug">{q.question}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{q.options.map(o => {
        const pct = votes ? Math.round(((q.votes[o] ?? 0) / votes) * 100) : 0;
        const right = q.answer === o, chosen = mine === o;
        return (
          <button key={o} disabled={!can || !isOpen || busy} onClick={() => onPick(o)} data-testid={`q-${q.id}-opt-${o.replace(/\W+/g, "-")}`}
            className={cn("relative overflow-hidden rounded-lg border p-3 text-left text-sm font-bold transition disabled:cursor-default", chosen ? "border-primary ring-2 ring-primary" : "border-border", right && "border-indgreen ring-2 ring-indgreen", can && isOpen && "hover:border-foreground/50")}>
            {votes > 0 && <span className="absolute inset-y-0 left-0 -z-0 bg-primary/10" style={{ width: `${pct}%` }} />}
            <span className="relative flex items-center justify-between gap-2"><span className="flex items-center gap-1.5">{right && <Check className="h-4 w-4 text-indgreen" />}{q.answer && chosen && !right && <X className="h-4 w-4 text-[hsl(2_75%_55%)]" />}{o}</span>{votes > 0 && <span className="tnum text-xs text-muted-foreground">{pct}%</span>}</span>
          </button>);
      })}</div>
      <p className="mt-3 text-xs text-muted-foreground">{votes.toLocaleString("en-IN")} pick{votes === 1 ? "" : "s"}{mine ? ` · Your pick: ${mine}` : can || !isOpen ? "" : " · Join above to pick"}</p>
    </li>
  );
}

/* ===================================================== quiz */
type QuizQ = { q: string; options: string[]; answer: string; note: string };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pickN = <T,>(a: T[], n: number) => shuffle(a).slice(0, n);
const solo = OLY_MEDALS.filter(m => !/team$/i.test(m.n) && !m.n.includes(" and "));
function makeQuiz(): QuizQ[] {
  const qs: QuizQ[] = [];
  const names = [...new Set(solo.map(m => m.n))];
  const years = [...new Set(OLY_MEDALS.map(m => m.y))];
  for (const m of pickN(solo, 3)) {
    const others = pickN(names.filter(n => n !== m.n), 3);
    qs.push({ q: `Who won India's Olympic ${MEDAL_LABEL[m.m].toLowerCase()} in the ${m.ev.toLowerCase()} at the ${m.y} Games?`, options: shuffle([m.n, ...others]), answer: m.n, note: `${m.n}, ${m.sp}, ${m.d}.` });
  }
  for (const m of pickN(solo, 2)) {
    const ys = pickN(years.filter(y => y !== m.y), 3).map(String);
    qs.push({ q: `In which year did ${m.n} win Olympic ${MEDAL_LABEL[m.m].toLowerCase()} (${m.ev.toLowerCase()})?`, options: shuffle([String(m.y), ...ys]), answer: String(m.y), note: `${m.d}.` });
  }
  const eds = OLY.filter(e => isPlayed(e) && total(e) > 0);
  for (const e of pickN(eds, 1)) {
    const t = total(e); const d = shuffle([t + 1, t + 2, Math.max(0, t - 1), t + 3, Math.max(0, t - 2)].filter((x, i, a) => x !== t && a.indexOf(x) === i)).slice(0, 3);
    qs.push({ q: `How many medals did India win at the ${e.host} ${e.y} Olympics?`, options: shuffle([t, ...d].map(String)), answer: String(t), note: `${e.g} gold, ${e.s} silver, ${e.b} bronze.` });
  }
  const ag = ASIAN.find(e => e.y === 2026);
  if (ag) qs.push({ q: "How many gold medals did India win at the Aichi-Nagoya 2026 Asian Games?", options: shuffle(["21", "18", "28", "16"]), answer: String(ag.g), note: `${ag.g} gold, ${ag.s} silver and ${ag.b} bronze: ${total(ag)} medals and fourth place.` });
  const cwgBest = CWG.filter(isPlayed).sort((a, b) => total(b) - total(a))[0];
  if (cwgBest) { const others = pickN(CWG.filter(e => isPlayed(e) && e.y !== cwgBest.y && total(e) > 0), 3); qs.push({ q: "At which Commonwealth Games did India win the most medals?", options: shuffle([`${cwgBest.host} ${cwgBest.y}`, ...others.map(e => `${e.host} ${e.y}`)]), answer: `${cwgBest.host} ${cwgBest.y}`, note: `${total(cwgBest)} medals, ${cwgBest.g} of them gold.` }); }
  return shuffle(qs).slice(0, 8);
}
function Quiz() {
  const [round, setRound] = useState(0);
  const qs = useMemo(() => makeQuiz(), [round]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= qs.length;
  const q = qs[i];
  const restart = () => { setRound(r => r + 1); setI(0); setChosen(null); setScore(0); };
  if (done) return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center" role="status">
      <Brain className="mx-auto h-9 w-9 text-saffron" />
      <p className="mt-3 font-display text-5xl font-semibold tnum">{score}/{qs.length}</p>
      <p className="mt-2 text-lg text-muted-foreground">{score === qs.length ? "Perfect. You could write this site." : score >= qs.length * 0.6 ? "Strong. You know your Indian sport." : "Good start. Try a fresh round."}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2"><ShareWA text={`I scored ${score}/${qs.length} on the Momentum India sports quiz. Can you beat it? ${siteUrl()}/fan-zone`} testid="quiz-share" /><button onClick={restart} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-muted" data-testid="quiz-again"><RotateCcw className="h-4 w-4" />New round</button></div>
      <Link href="/medals/olympics" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">Brush up on India's Olympic medals<ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm font-bold text-muted-foreground"><span>Question {i + 1} of {qs.length}</span><span className="tnum">Score {score}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <p className="font-display text-2xl font-semibold leading-snug" data-testid="quiz-question">{q.q}</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">{q.options.map(o => (
          <button key={o} disabled={!!chosen} onClick={() => { setChosen(o); if (o === q.answer) setScore(s => s + 1); }} data-testid="quiz-option"
            className={cn("rounded-lg border p-3 text-left font-bold transition", !chosen && "hover:border-foreground/50", chosen && o === q.answer && "border-indgreen bg-indgreen/10", chosen === o && o !== q.answer && "border-[hsl(2_75%_55%)] bg-[hsl(2_75%_55%/.08)]", chosen && o !== q.answer && chosen !== o && "opacity-60")}>{o}</button>
        ))}</div>
        {chosen && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4" role="status"><p className="text-sm"><b>{chosen === q.answer ? "Correct." : `The answer is ${q.answer}.`}</b> <span className="text-muted-foreground">{q.note}</span></p>
          <button onClick={() => { setI(i + 1); setChosen(null); }} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground" data-testid="quiz-next">{i + 1 === qs.length ? "See score" : "Next"}<ArrowRight className="h-4 w-4" /></button></div>}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Questions are built from the medal records on this site. Every round is different.</p>
    </div>
  );
}

/* ===================================================== on this day */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseD = (d: string) => { const [day, mon] = d.split(" "); return { day: +day, mon: MONTHS.indexOf(mon) }; };
const sentence = (m: OlyMedal) => `${m.n} won Olympic ${MEDAL_LABEL[m.m].toLowerCase()} in the ${m.ev.toLowerCase()} (${m.sp.toLowerCase()}) in ${m.y}.`;
function OnThisDay() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const today = OLY_MEDALS.filter(m => { const p = parseD(m.d); return p.day === now.getDate() && p.mon === now.getMonth(); });
  const ahead = OLY_MEDALS.map(m => { const p = parseD(m.d); let at = new Date(now.getFullYear(), p.mon, p.day); if (at < new Date(now.getFullYear(), now.getMonth(), now.getDate())) at = new Date(now.getFullYear() + 1, p.mon, p.day); return { m, at, days: Math.round((+at - +new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5) }; })
    .filter(x => x.days > 0).sort((a, b) => a.days - b.days).slice(0, 6);
  const label = now.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <Kicker className="text-saffron">{label}</Kicker>
        <h2 className="mt-2 font-display text-4xl font-semibold">On this day</h2>
        {today.length ? (
          <ul className="mt-6 space-y-4">{today.map(m => (
            <li key={m.n + m.y + m.ev} className="rounded-xl border border-border bg-card p-6"><p className="font-display text-6xl font-semibold tnum text-muted-foreground/60">{m.y}</p><p className="mt-2 text-xl font-semibold">{sentence(m)}</p>
              <div className="mt-4"><ShareWA text={`On this day in ${m.y}: ${sentence(m)} Via Momentum India ${siteUrl()}/fan-zone`} label="Share this moment" testid="otd-share" /></div></li>))}</ul>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-border p-8"><CalendarHeart className="h-8 w-8 text-saffron" /><p className="mt-3 text-lg">No Indian Olympic medal was won on {label}. The next anniversary is {ahead[0] ? <b>in {ahead[0].days} day{ahead[0].days === 1 ? "" : "s"}</b> : "coming up"}.</p></div>
        )}
      </div>
      <aside>
        <p className="mb-3 flex items-center gap-2 font-bold"><Target className="h-4 w-4 text-primary" />Coming up</p>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">{ahead.map(({ m, at, days }) => (
          <li key={m.n + m.y + m.ev} className="p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{at.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · in {days} day{days === 1 ? "" : "s"}</p><p className="mt-1 text-sm">{sentence(m)}</p></li>))}</ul>
        <p className="mt-3 text-xs text-muted-foreground">Dates from the Olympic medal records on this site. <Link href="/medals/olympics" className="font-bold text-primary hover:underline">See all 41 medals</Link>.</p>
      </aside>
    </div>
  );
}
