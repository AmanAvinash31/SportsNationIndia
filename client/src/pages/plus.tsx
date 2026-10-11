import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Accessibility, Bell, BellRing, CalendarPlus, Check, ExternalLink, HeartHandshake, Loader2, ShieldCheck, Trash2, Trophy, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePrefs } from "@/lib/prefs";
import { apiRequest } from "@/lib/queryClient";
import { Container, Kicker, SectionHead, PageHero, Tabs, useCountdown } from "@/components/site";
import { ARTICLES, PEOPLE, IMG } from "@/data";
import content from "@/data/content.json";
import { SAI, TRIALS, TRIALS_PAGE, RIMG, type SaiCentre } from "@/data/rise";
import { cn } from "@/lib/utils";

const Src = ({ href, children }: { href: string; children: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline decoration-border underline-offset-2 hover:text-primary">{children}<ExternalLink className="h-3 w-3" /></a>
);
const Stat = ({ v, l, className }: { v: string | number; l: string; className?: string }) => (
  <div className={cn("rounded-lg border border-border bg-card p-4", className)}><p className="font-display text-3xl font-semibold tnum md:text-4xl">{v}</p><p className="mt-1 text-sm text-muted-foreground">{l}</p></div>
);
const field = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
const btn = "inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60";
const errMsg = (e: unknown) => { const m = String((e as Error)?.message ?? e); try { return JSON.parse(m.slice(m.indexOf("{"))).message; } catch { return "Something went wrong. Check your connection and try again."; } };

/* ================================================= calendar (.ics) */
export type CalEvent = { id: string; title: string; start: string; end: string; where: string; note?: string };
export const KEY_EVENTS: CalEvent[] = [
  { id: "apg2026", title: "Asian Para Games 2026", start: "2026-10-18", end: "2026-10-25", where: "Aichi-Nagoya, Japan", note: "India's flag bearers: Pramod Bhagat and Bhavina Patel" },
  { id: "la28", title: "Olympic Games, Los Angeles 2028", start: "2028-07-14", end: "2028-07-31", where: "Los Angeles, USA" },
  { id: "la28p", title: "Paralympic Games, Los Angeles 2028", start: "2028-08-15", end: "2028-08-28", where: "Los Angeles, USA" },
];
const icsDate = (d: string) => d.replace(/-/g, "");
const icsTime = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export function downloadIcs(evs: CalEvent[], name = "momentum-india") {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Momentum India//EN", "CALSCALE:GREGORIAN",
    ...evs.flatMap(e => ["BEGIN:VEVENT", `UID:${e.id}@momentum-india`, `DTSTAMP:${stamp}`, ...(e.start.includes("T") ? [`DTSTART:${icsTime(e.start)}`, `DTEND:${icsTime(e.end)}`] : [`DTSTART;VALUE=DATE:${icsDate(e.start)}`, `DTEND;VALUE=DATE:${icsDate(e.end)}`]),
      `SUMMARY:${e.title}`, `LOCATION:${e.where}`, `DESCRIPTION:${(e.note ?? "Follow India on Momentum India").replace(/[,;]/g, "\\$&")}`, "END:VEVENT"]),
    "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = `${name}.ics`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CalButton({ evs, name, label = "Add to calendar", className }: { evs: CalEvent[]; name?: string; label?: string; className?: string }) {
  return <button onClick={() => downloadIcs(evs, name)} data-testid={`button-cal-${name ?? "all"}`} className={cn("inline-flex items-center gap-1.5 rounded-full border border-current/30 px-4 py-2 text-sm font-bold hover:border-current", className)}><CalendarPlus className="h-4 w-4" />{label}</button>;
}

/* ================================================= follow */
export type FollowKind = "athlete" | "sport" | "games" | "trials";
type FollowItem = { kind: FollowKind; key: string; label: string };
const followedCache = new Map<string, Set<string>>();

export function FollowButton({ kind, k, label, className, tone = "light" }: { kind: FollowKind; k: string; label: string; className?: string; tone?: "light" | "dark" }) {
  const { followEmail, setFollowEmail } = usePrefs();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [on, setOn] = useState(() => !!followEmail && !!followedCache.get(followEmail)?.has(`${kind}:${k}`));
  const save = async (email: string) => {
    setBusy(true);
    try {
      const r = await (await apiRequest("POST", "/api/follow", { email, items: [{ kind, key: k, label }] })).json();
      followedCache.set(email, new Set(r.follows.map((f: FollowItem) => `${f.kind}:${f.key}`)));
      setFollowEmail(email); setOn(true); setOpen(false);
      toast({ title: `Following ${label}`, description: "See everything you follow on My Momentum." });
    } catch (e) { toast({ title: "Could not follow", description: errMsg(e), variant: "destructive" }); }
    setBusy(false);
  };
  return (
    <>
      <button data-testid={`button-follow-${kind}-${k}`} aria-pressed={on} disabled={busy} onClick={() => on ? undefined : followEmail ? save(followEmail) : setOpen(true)}
        className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors",
          on ? "bg-indgreen text-white" : tone === "dark" ? "border border-paper/40 text-paper hover:border-paper" : "border border-border hover:border-foreground", className)}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : on ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}{on ? "Following" : "Follow"}
      </button>
      <EmailDialog open={open} setOpen={setOpen} title={`Follow ${label}`} busy={busy} onSubmit={save}
        desc="Enter your email to save what you follow. We'll use it for alerts and your For you page, nothing else." />
    </>
  );
}

function EmailDialog({ open, setOpen, title, desc, busy, onSubmit }: { open: boolean; setOpen: (v: boolean) => void; title: string; desc: string; busy: boolean; onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-2xl">{title}</DialogTitle><DialogDescription>{desc}</DialogDescription></DialogHeader>
        <form noValidate onSubmit={e => { e.preventDefault(); const v = email.trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(v)) return setErr("Enter a valid email address, like name@example.com."); setErr(""); onSubmit(v); }} className="space-y-3">
          <label className="block text-sm font-bold" htmlFor="follow-email">Email</label>
          <input id="follow-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={field} placeholder="name@example.com" data-testid="input-follow-email" aria-invalid={!!err} aria-describedby={err ? "follow-err" : undefined} />
          {err && <p id="follow-err" className="text-sm text-destructive">{err}</p>}
          <button type="submit" disabled={busy} className={cn(btn, "w-full")} data-testid="button-follow-submit">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Follow</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================= My Momentum */
const SUGGEST: FollowItem[] = [
  ...PEOPLE.filter(p => p.featured).slice(0, 6).map(p => ({ kind: "athlete" as const, key: p.slug, label: p.name })),
  ...["Athletics", "Boxing", "Wrestling", "Shooting", "Archery", "Badminton", "Hockey", "Weightlifting"].map(s => ({ kind: "sport" as const, key: s.toLowerCase(), label: s })),
  ...KEY_EVENTS.map(e => ({ kind: "games" as const, key: e.id, label: e.title })),
  { kind: "trials", key: "all", label: "SAI selection trials" },
];
const KIND_LABEL: Record<FollowKind, string> = { athlete: "Athletes", sport: "Sports", games: "Games", trials: "Trials" };

export function MyMomentum() {
  const { followEmail, setFollowEmail } = usePrefs();
  const { toast } = useToast();
  const [email, setEmail] = useState(followEmail);
  const [data, setData] = useState<{ follows: (FollowItem & { created: string })[]; whatsapp: string | null; channels: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [wa, setWa] = useState(""); const [ch, setCh] = useState<string[]>(["email"]); const [prefMsg, setPrefMsg] = useState("");

  const load = async (e: string) => {
    setBusy(true); setErr("");
    try {
      const r = await (await apiRequest("GET", `/api/follow/${encodeURIComponent(e)}`)).json();
      setData(r); setWa(r.whatsapp ?? ""); setCh(r.channels); setFollowEmail(e);
      followedCache.set(e, new Set(r.follows.map((f: FollowItem) => `${f.kind}:${f.key}`)));
    } catch (x) { setErr(errMsg(x)); }
    setBusy(false);
  };
  useEffect(() => { if (followEmail) load(followEmail); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (items: FollowItem[]) => {
    try { const r = await (await apiRequest("POST", "/api/follow", { email: followEmail, items })).json(); setData(d => d && { ...d, follows: r.follows }); followedCache.set(followEmail, new Set(r.follows.map((f: FollowItem) => `${f.kind}:${f.key}`))); }
    catch (x) { toast({ title: "Could not follow", description: errMsg(x), variant: "destructive" }); }
  };
  const remove = async (f: FollowItem) => {
    setData(d => d && { ...d, follows: d.follows.filter(x => !(x.kind === f.kind && x.key === f.key)) });
    followedCache.get(followEmail)?.delete(`${f.kind}:${f.key}`);
    try { await apiRequest("DELETE", `/api/follow/${encodeURIComponent(followEmail)}/${f.kind}/${encodeURIComponent(f.key)}`); } catch { load(followEmail); }
  };
  const savePrefs = async () => {
    setPrefMsg("");
    try { await apiRequest("PUT", `/api/follow/${encodeURIComponent(followEmail)}/prefs`, { whatsapp: wa, channels: ch }); setPrefMsg("ok"); }
    catch (x) { setPrefMsg(errMsg(x)); }
  };

  const fs = data?.follows ?? [];
  const has = (f: FollowItem) => fs.some(x => x.kind === f.kind && x.key === f.key);
  const feed = useMemo(() => {
    const out: { tag: string; title: string; sub: string; href: string; ext?: boolean }[] = [];
    for (const f of fs) {
      if (f.kind === "athlete") {
        const n = f.label.toLowerCase();
        ARTICLES.filter(a => (a.title + " " + a.body + " " + a.paras.join(" ")).toLowerCase().includes(n)).slice(0, 2)
          .forEach(a => out.push({ tag: f.label, title: a.title, sub: "Story", href: `/news/${a.slug}` }));
        out.push({ tag: f.label, title: `${f.label}: profile and medal timeline`, sub: "Athlete", href: `/athletes/${f.key}` });
      }
      if (f.kind === "sport") {
        TRIALS.filter(t => t.sport.toLowerCase().includes(f.key)).forEach(t => out.push({ tag: f.label, title: `${t.sport}: ${t.t}`, sub: `SAI notice, ${t.d}`, href: t.href, ext: true }));
        const n = SAI.filter(c => c.st === "open" && c.d.some(d => d.toLowerCase().startsWith(f.key))).length;
        if (n) out.push({ tag: f.label, title: `${n} SAI centres train ${f.label.toLowerCase()}`, sub: "Facilities", href: "/facilities" });
      }
      if (f.kind === "trials") TRIALS.forEach(t => out.push({ tag: "Trials", title: `${t.sport}: ${t.t}`, sub: `SAI notice, ${t.d}`, href: t.href, ext: true }));
      if (f.kind === "games") { const e = KEY_EVENTS.find(x => x.id === f.key); if (e) out.push({ tag: "Games", title: e.title, sub: `${e.where} · starts ${new Date(e.start).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, href: e.id === "apg2026" ? "/para" : "/road-to-la-2028" }); }
    }
    const seen = new Set<string>();
    return out.filter(x => !seen.has(x.title) && !!seen.add(x.title));
  }, [fs]);

  return (
    <Container className="py-12 md:py-16">
      <Kicker className="text-gold-ink">My Momentum</Kicker>
      <h1 className="mt-3 font-display text-[clamp(2.4rem,1.2rem+4vw,4.5rem)] font-semibold leading-[0.95]">Your athletes. Your sports. Your alerts.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Follow the people and sports you care about. We bring their stories, trials notices and Games dates together on one page.</p>

      {!data ? (
        <form noValidate className="mt-10 max-w-md space-y-3 rounded-lg border border-border bg-card p-6" onSubmit={e => { e.preventDefault(); const v = email.trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(v)) return setErr("Enter a valid email address, like name@example.com."); load(v); }}>
          <label htmlFor="mm-email" className="block font-bold">Enter your email to see or start your list</label>
          <input id="mm-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={field} placeholder="name@example.com" data-testid="input-mm-email" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className={btn} disabled={busy} data-testid="button-mm-load">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Continue</button>
          <p className="text-xs text-muted-foreground">No password needed. Anyone with your email can see your follows, so don't follow anything private.</p>
        </form>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionHead kicker="For you" title={fs.length ? "What's new for you" : "Start following"} dek={fs.length ? `Built from ${fs.length} things you follow.` : "Pick a few below and your page fills up."} />
            {feed.length > 0 && <ul className="space-y-2" data-testid="mm-feed">{feed.map((x, i) => (
              <li key={i}>{x.ext ? <a href={x.href} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary"><FeedRow x={x} /></a>
                : <Link href={x.href} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary"><FeedRow x={x} /></Link>}</li>))}</ul>}
            <h3 className="mt-10 font-bold">Suggested</h3>
            <div className="mt-3 flex flex-wrap gap-2">{SUGGEST.filter(s => !has(s)).map(s => (
              <button key={s.kind + s.key} onClick={() => add([s])} data-testid={`suggest-${s.kind}-${s.key}`} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary"><span className="text-muted-foreground">{KIND_LABEL[s.kind].slice(0, -1)}</span><b>{s.label}</b><span className="text-primary">+</span></button>))}</div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="flex items-center justify-between font-bold"><span>Following</span><span className="text-sm text-muted-foreground">{followEmail}</span></p>
              {fs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nothing yet.</p> :
                <ul className="mt-3 divide-y divide-border">{fs.map(f => (
                  <li key={f.kind + f.key} className="flex items-center justify-between gap-2 py-2"><span className="text-sm"><span className="text-muted-foreground">{KIND_LABEL[f.kind as FollowKind]} · </span><b>{f.label}</b></span>
                    <button onClick={() => remove(f)} aria-label={`Unfollow ${f.label}`} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button></li>))}</ul>}
              <button onClick={() => { setData(null); setFollowEmail(""); setEmail(""); }} className="mt-4 text-sm font-bold text-muted-foreground hover:text-foreground">Use a different email</button>
            </div>
            <div className="rounded-lg border border-border bg-card p-6" data-testid="alert-prefs">
              <p className="flex items-center gap-2 font-bold"><BellRing className="h-4 w-4 text-primary" />How to get alerts</p>
              <div className="mt-3 space-y-2 text-sm">
                {[["email", "Email"], ["whatsapp", "WhatsApp"]].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={ch.includes(k)} onChange={e => setCh(c => e.target.checked ? [...c, k] : c.filter(x => x !== k))} className="h-4 w-4 accent-[hsl(var(--primary))]" />{l}</label>))}
              </div>
              {ch.includes("whatsapp") && <div className="mt-3"><label htmlFor="wa" className="text-sm font-bold">Mobile number</label><input id="wa" inputMode="tel" value={wa} onChange={e => setWa(e.target.value)} placeholder="98765 43210" className={cn(field, "mt-1")} data-testid="input-whatsapp" /></div>}
              <button onClick={savePrefs} className={cn(btn, "mt-4")} data-testid="button-save-prefs">Save</button>
              {prefMsg && <p className={cn("mt-2 text-sm", prefMsg === "ok" ? "text-indgreen" : "text-destructive")}>{prefMsg === "ok" ? "Saved." : prefMsg}</p>}
              <p className="mt-3 text-xs text-muted-foreground">Alerts start when our email and WhatsApp service goes live. Your choices are saved now.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6"><p className="font-bold">Put the Games in your calendar</p><p className="mt-1 text-sm text-muted-foreground">Asian Para Games 2026 and the Los Angeles 2028 Olympics and Paralympics.</p><CalButton evs={KEY_EVENTS} name="momentum-india-key-dates" className="mt-4" /></div>
          </aside>
        </div>
      )}
    </Container>
  );
}
const FeedRow = ({ x }: { x: { tag: string; title: string; sub: string; ext?: boolean } }) => (
  <><span className="mt-0.5 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{x.tag}</span>
    <span className="min-w-0 flex-1"><span className="block font-bold">{x.title}</span><span className="text-sm text-muted-foreground">{x.sub}</span></span>{x.ext && <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />}</>
);

/* ================================================= claim a listing */
export function ClaimDialog({ listing, kind, open, setOpen }: { listing: string; kind: "sai" | "academy"; open: boolean; setOpen: (v: boolean) => void }) {
  const [f, setF] = useState({ name: "", role: "", email: "", phone: "", fees: "", coaches: "", website: "", notes: "" });
  const [st, setSt] = useState<{ s: "idle" | "busy" | "ok" | "err"; msg?: string }>({ s: "idle" });
  useEffect(() => { if (open) setSt({ s: "idle" }); }, [open]);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSt({ s: "busy" });
    try { const r = await (await apiRequest("POST", "/api/claims", { listing, kind, ...f })).json(); setSt({ s: "ok", msg: r.ref }); }
    catch (x) { setSt({ s: "err", msg: errMsg(x) }); }
  };
  const In = (k: keyof typeof f, l: string, p = "", req = false, type = "text") => (
    <div><label htmlFor={`cl-${k}`} className="text-sm font-bold">{l}{req && <span className="text-primary"> *</span>}</label><input id={`cl-${k}`} type={type} required={req} value={f[k]} onChange={up(k)} placeholder={p} className={cn(field, "mt-1")} data-testid={`input-claim-${k}`} /></div>
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-2xl">Update this listing</DialogTitle><DialogDescription>{listing}</DialogDescription></DialogHeader>
        {st.s === "ok" ? (
          <div className="space-y-3" data-testid="claim-ok">
            <p className="flex items-center gap-2 font-bold text-indgreen"><ShieldCheck className="h-5 w-5" />Received. Your reference is {st.msg}.</p>
            <p className="text-sm text-muted-foreground">We check every update before it goes live: we call the number you gave and confirm it against the centre's official listing. Verified listings get a green badge. This usually takes about a week.</p>
            <button onClick={() => setOpen(false)} className={btn}>Done</button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="space-y-3">
            <p className="text-sm text-muted-foreground">For coaches, administrators and owners. Add the contact details parents need. Nothing is published until we verify it.</p>
            <div className="grid gap-3 sm:grid-cols-2">{In("name", "Your name", "", true)}{In("role", "Your role", "Head coach", true)}</div>
            <div className="grid gap-3 sm:grid-cols-2">{In("phone", "Centre phone", "0124 123 4567", true, "tel")}{In("email", "Centre email", "admissions@…", true, "email")}</div>
            {In("fees", "Fees and boarding", "Free residential, or ₹ per month")}
            {In("website", "Website or social page", "https://")}
            <div><label htmlFor="cl-coaches" className="text-sm font-bold">Coaches and qualifications</label><textarea id="cl-coaches" rows={2} value={f.coaches} onChange={up("coaches")} className={cn(field, "mt-1")} placeholder="Names, NIS diploma, certifications" /></div>
            <div><label htmlFor="cl-notes" className="text-sm font-bold">Anything else</label><textarea id="cl-notes" rows={2} value={f.notes} onChange={up("notes")} className={cn(field, "mt-1")} placeholder="Trial dates, age groups, girls' hostel" /></div>
            {st.s === "err" && <p className="text-sm text-destructive" role="alert">{st.msg}</p>}
            <button className={cn(btn, "w-full")} disabled={st.s === "busy"} data-testid="button-claim-submit">{st.s === "busy" && <Loader2 className="h-4 w-4 animate-spin" />}Send for verification</button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================================================= Para hub */
const PARIS: [string, "G" | "S" | "B", string, string][] = [
  ["Avani Lekhara", "G", "Shooting", "Women's 10m air rifle standing SH1"], ["Nitesh Kumar", "G", "Badminton", "Men's singles SL3"], ["Sumit Antil", "G", "Athletics", "Men's javelin F64"],
  ["Harvinder Singh", "G", "Archery", "Men's individual recurve open"], ["Dharambir", "G", "Athletics", "Men's club throw F51"], ["Praveen Kumar", "G", "Athletics", "Men's high jump T64"], ["Navdeep Singh", "G", "Athletics", "Men's javelin F41"],
  ["Manish Narwal", "S", "Shooting", "Men's 10m air pistol SH1"], ["Nishad Kumar", "S", "Athletics", "Men's high jump T47"], ["Yogesh Kathuniya", "S", "Athletics", "Men's discus F56"], ["Thulasimathi Murugesan", "S", "Badminton", "Women's singles SU5"],
  ["Suhas Yathiraj", "S", "Badminton", "Men's singles SL4"], ["Sharad Kumar", "S", "Athletics", "Men's high jump T63"], ["Ajeet Singh", "S", "Athletics", "Men's javelin F46"], ["Sachin Khilari", "S", "Athletics", "Men's shot put F46"], ["Parnav Soorma", "S", "Athletics", "Men's club throw F51"],
  ["Mona Agarwal", "B", "Shooting", "Women's 10m air rifle standing SH1"], ["Preethi Pal", "B", "Athletics", "Women's 100m T35"], ["Rubina Francis", "B", "Shooting", "Women's 10m air pistol SH1"], ["Preethi Pal", "B", "Athletics", "Women's 200m T35"],
  ["Manisha Ramadass", "B", "Badminton", "Women's singles SU5"], ["Rakesh Kumar and Sheetal Devi", "B", "Archery", "Mixed team compound open"], ["Nithya Sre Sivan", "B", "Badminton", "Women's singles SH6"], ["Deepthi Jeevanji", "B", "Athletics", "Women's 400m T20"],
  ["Mariyappan Thangavelu", "B", "Athletics", "Men's high jump T63"], ["Sundar Singh Gurjar", "B", "Athletics", "Men's javelin F46"], ["Kapil Parmar", "B", "Judo", "Men's -60kg J1"], ["Hokato Hotozhe Sema", "B", "Athletics", "Men's shot put F57"], ["Simran", "B", "Athletics", "Women's 200m T12"],
];
const MEDAL_BG = { G: "bg-gold", S: "bg-silver", B: "bg-bronze" } as const;
const MEDAL_NAME = { G: "Gold", S: "Silver", B: "Bronze" } as const;
const PARA_SRC = {
  paris: "https://www.olympics.com/en/news/paris-2024-paralympics-medal-india-tally-winners-table",
  tokyo: "https://www.olympics.com/en/news/india-tokyo-2020-paralympics-medal",
  hangzhou: "https://www.espn.com/espn/story/_/id/38762397/asian-para-games-india-medals-111-record-breaking-campaign",
  apg: "https://www.pib.gov.in/FactsheetDetails.aspx?id=151080&NoteId=151080&ModuleId=16",
  flag: "https://www.tribuneindia.com/news/sports/pramod-bhagat-bhavina-patel-to-be-indias-flag-bearers-at-aichi-nagoya-2026-asian-para-games/",
  ipc: "https://www.paralympic.org/athletics/classification",
  pci: "https://www.paralympicindia.com/about",
};
const CLASS_CODES: [string, string][] = [
  ["T and F", "Athletics. T is track and jumps, F is field throws. The number shows the impairment type and its impact: T11 to T13 are visual impairment, F51 to F57 are seated throws."],
  ["SH1 and SH2", "Shooting. SH1 athletes can hold the gun themselves, SH2 athletes use a stand."],
  ["SL, SU, WH, SH6", "Badminton. SL and SU are standing classes for lower and upper limb impairment, WH is wheelchair and SH6 is short stature."],
  ["J1 to J3", "Judo for athletes with visual impairment. J1 is the most severe."],
];
export function ParaHub() {
  const cd = useCountdown("2026-10-18T00:00:00+09:00");
  const [m, setM] = useState<"all" | "G" | "S" | "B">("all");
  const paraCentres = SAI.filter(c => c.st === "open" && c.d.some(d => /para/i.test(d)));
  const list = PARIS.filter(x => m === "all" || x[1] === m);
  return (
    <>
      <PageHero kicker="Para sport · Asian Para Games · Aichi-Nagoya, 18 to 24 October 2026" img={IMG.relay} accent="hsl(var(--indgreen))"
        title={<>India's <span className="text-saffron">para champions</span>, all in one place.</>}
        dek="India's Paralympic record, the classes explained, where to train and how to start.">
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {cd && !cd.done && <div className="flex gap-2 tnum" data-testid="apg-countdown">{([["days", cd.d], ["hrs", cd.h], ["min", cd.m]] as const).map(([l, v]) => <div key={l} className="min-w-[4rem] rounded-lg bg-paper/10 px-3 py-2 text-center backdrop-blur"><p className="font-display text-2xl font-semibold">{String(v).padStart(2, "0")}</p><p className="text-[10px] uppercase tracking-[0.14em] text-paper/70">{l}</p></div>)}</div>}
          <CalButton evs={[KEY_EVENTS[0]]} name="asian-para-games-2026" className="text-paper" />
          <FollowButton kind="games" k="apg2026" label="Asian Para Games 2026" tone="dark" />
        </div>
      </PageHero>
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat v="29" l="Medals at Paris 2024, India's best Paralympics" /><Stat v="7" l="Golds at Paris 2024" /><Stat v="19" l="Medals at Tokyo 2020" /><Stat v="111" l="Medals at the 2022 Asian Para Games, 29 gold" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Sources: <Src href={PARA_SRC.paris}>Olympics.com, Paris 2024</Src> · <Src href={PARA_SRC.tokyo}>Olympics.com, Tokyo 2020</Src> · <Src href={PARA_SRC.hangzhou}>ESPN, Hangzhou 2022</Src></p>

        <div className="mt-12 grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-indgreen/15 text-indgreen"><Trophy className="h-7 w-7" /></span>
          <div><Kicker className="text-gold-ink">Next up</Kicker><p className="mt-1 font-display text-2xl font-semibold">Pramod Bhagat and Bhavina Patel carry the flag on 18 October</p>
            <p className="mt-1 text-muted-foreground">The badminton and table tennis Paralympic champions have won eight Asian Para Games medals between them. The 5th Asian Para Games run from 18 to 24 October, the first hosted by Japan. Sources: <Src href={PARA_SRC.flag}>The Tribune</Src> · <Src href={PARA_SRC.apg}>PIB</Src></p></div>
        </div>

        <SectionHead className="mt-16" kicker="Paris 2024" title="All 29 medals" action={<Tabs tabs={[["all", "All"], ["G", "Gold"], ["S", "Silver"], ["B", "Bronze"]]} value={m} onChange={setM} className="border-none" />} />
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="paris-list">{list.map(([n, md, sp, ev], i) => (
          <li key={i} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-3"><span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-ink", MEDAL_BG[md])} aria-label={MEDAL_NAME[md]}>{md}</span>
            <span className="min-w-0"><span className="block font-bold">{n}</span><span className="block truncate text-sm text-muted-foreground">{sp} · {ev}</span></span></li>))}</ul>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead kicker="Classification" title="What the letters mean" dek="Classification groups athletes with similar impairments so that results come down to skill and training." />
            <dl className="space-y-3">{CLASS_CODES.map(([k, v]) => <div key={k} className="rounded-lg border border-border p-4"><dt className="font-display text-xl font-semibold">{k}</dt><dd className="mt-1 text-sm text-muted-foreground">{v}</dd></div>)}</dl>
            <p className="mt-3 text-xs text-muted-foreground">Para sport is open to athletes with physical, visual or intellectual impairments. Each sport sets its own classes. Source: <Src href={PARA_SRC.ipc}>International Paralympic Committee</Src></p>
          </div>
          <div>
            <SectionHead kicker="Start here" title="How a para athlete gets going" />
            <ol className="space-y-3">{[
              ["Find a sport and a club", "Try several. Athletics, shooting, badminton, archery and table tennis have strong Indian pathways."],
              ["Get a medical diagnosis on file", "Classification needs medical records of the impairment. Keep certificates up to date."],
              ["Compete at state and national level", "Para nationals are run with the Paralympic Committee of India and state associations."],
              ["Get classified", "National classification comes first, then international classification before major Games."],
              ["Apply for support", "Top athletes can be picked for TOPS and Khelo India support, the same as Olympic athletes."],
            ].map(([t, d], i) => <li key={t} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span><div><p className="font-bold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></li>)}</ol>
            <a href={PARA_SRC.pci} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 font-bold hover:text-primary"><Accessibility className="h-4 w-4" />Paralympic Committee of India<ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        </div>

        <SectionHead className="mt-16" kicker="Train" title={`${paraCentres.length} SAI centres with para disciplines`} action={<Link href="/facilities" className="text-sm font-bold hover:text-primary">All facilities</Link>} />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{paraCentres.map(c => (
          <li key={c.n + c.s} className="rounded-lg border border-border bg-card p-4"><p className="font-bold">{c.n}</p><p className="text-sm text-muted-foreground">{c.s}</p>
            <div className="mt-2 flex flex-wrap gap-1">{c.d.filter(d => /para/i.test(d)).map(d => <span key={d} className="rounded bg-indgreen/15 px-2 py-0.5 text-xs font-bold text-indgreen">{d}</span>)}</div></li>))}</ul>
        {TRIALS.some(t => /para/i.test(t.sport)) && <p className="mt-4 text-sm">Open now: <a href={TRIALS.find(t => /para/i.test(t.sport))!.href} target="_blank" rel="noreferrer" className="font-bold text-primary">Para archery trials at NCOE Kolkata</a>. More on <a href={TRIALS_PAGE} target="_blank" rel="noreferrer" className="underline">SAI's trials page</a>.</p>}
      </Container>
    </>
  );
}

/* ================================================= Women in sport */
const OLY_RAW: string = (content as any).OLY_MEDALLISTS_RAW;
const WOMEN_OLY = OLY_RAW.split("\n").map(l => l.split("|")).filter(r => /women/i.test(r[4] ?? ""));
function seatTotals(list: SaiCentre[]) { let b = 0, g = 0; for (const c of list) for (const [, x, y] of c.seats ?? []) { b += x; g += y; } return { b, g }; }

export function WomenInSport() {
  const open = SAI.filter(c => c.st === "open");
  const nat = seatTotals(open);
  const byState = useMemo(() => {
    const m = new Map<string, SaiCentre[]>(); open.forEach(c => m.set(c.s, [...(m.get(c.s) ?? []), c]));
    return [...m.entries()].map(([s, cs]) => ({ s, ...seatTotals(cs) })).filter(x => x.b + x.g >= 100).map(x => ({ ...x, share: x.g / (x.b + x.g) })).sort((a, b) => b.share - a.share);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const topCentres = open.map(c => ({ c, ...seatTotals([c]) })).sort((a, b) => b.g - a.g).slice(0, 8);
  const women = PEOPLE.filter(p => !p.isTeam && (p.gender === "F" || p.career.some(c => /women/i.test(c.event)))).slice(0, 12);
  return (
    <>
      <PageHero kicker="Women in sport" img={RIMG.celebration} title={<>From Malleswari to Manu, <span className="text-saffron">she</span> changed Indian sport.</>}
        dek="Every Olympic medal Indian women have won, where girls can train, and how to keep young athletes safe." />
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat v={WOMEN_OLY.length} l="Olympic medals in women's events, since 2000" /><Stat v={`${Math.round(100 * nat.g / (nat.b + nat.g))}%`} l="Share of SAI centre places for girls" />
          <Stat v={nat.g.toLocaleString("en-IN")} l="Places for girls at open SAI centres" /><Stat v="2" l="Paralympic golds for Avani Lekhara, a first for an Indian woman" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Sources: Momentum India Olympic medal data · <Src href="https://sportsauthorityofindia.nic.in/sai_new/public/assets/front/js/sai_centres_data.js">SAI centre data, 2025</Src> · <Src href={PARA_SRC.paris}>Olympics.com</Src></p>

        <SectionHead className="mt-16" kicker="Olympic history" title="Every Olympic medal in a women's event" />
        <ol className="grid gap-3 md:grid-cols-2">{WOMEN_OLY.map(([y, md, n, sp, ev], i) => (
          <li key={i} className="relative flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-ink", MEDAL_BG[md as "G"])}>{md}</span>
            <div><p className="font-display text-xl font-semibold">{n}</p><p className="text-sm text-muted-foreground"><b className="tnum text-foreground">{y === "2020" ? "Tokyo 2020" : y}</b> · {sp} · {ev}</p></div></li>))}</ol>
        <p className="mt-3 text-sm text-muted-foreground">Manu Bhaker also won bronze in the mixed 10m air pistol with Sarabjot Singh at Paris 2024.</p>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHead kicker="Opportunity" title="Girls' share of SAI places, by state" dek="States with at least 100 sanctioned places. The national figure is the dashed line." />
            <ul className="space-y-2" data-testid="girls-share">{byState.map(x => (
              <li key={x.s} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm"><span className="truncate font-bold">{x.s}</span>
                <span className="relative h-3 rounded-full bg-muted"><span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${x.share * 100}%` }} />
                  <span className="absolute inset-y-[-3px] border-l-2 border-dashed border-foreground/60" style={{ left: `${100 * nat.g / (nat.b + nat.g)}%` }} /></span>
                <span className="text-right tnum">{Math.round(x.share * 100)}%</span></li>))}</ul>
          </div>
          <div>
            <SectionHead kicker="Most places for girls" title="Top SAI centres" />
            <ul className="divide-y divide-border rounded-lg border border-border">{topCentres.map(({ c, g }) => (
              <li key={c.n + c.s} className="flex items-center justify-between p-3"><span><b>{c.n}</b><span className="block text-xs text-muted-foreground">{c.s} · {c.t === "NCOE" ? "National Centre of Excellence" : "Training centre"}</span></span><span className="font-display text-xl font-semibold tnum">{g}</span></li>))}</ul>
            <Link href="/facilities" className="mt-3 inline-block text-sm font-bold hover:text-primary">Find a centre near you</Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
          <div>
            <p className="flex items-center gap-2 font-display text-2xl font-semibold"><HeartHandshake className="h-6 w-6 text-primary" />Safe sport checklist for parents</p>
            <ul className="mt-4 space-y-2 text-sm">{[
              "Is there a woman coach or chaperone at training, in the hostel and on trips?",
              "Are changing rooms and hostel floors separate for girls?",
              "Does the academy have an internal complaints committee, and do athletes know who sits on it?",
              "Is one-to-one coaching held in open, visible spaces?",
              "Does the academy share travel plans and rooming lists with parents before tournaments?",
            ].map(q => <li key={q} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-indgreen" />{q}</li>)}</ul>
          </div>
          <div className="rounded-lg bg-muted p-5">
            <p className="font-bold">If something goes wrong</p>
            <p className="mt-2 text-sm text-muted-foreground">Any woman can file a sexual harassment complaint online through SHe-Box, the government's single-window portal, and track it.</p>
            <a href="https://shebox.wcd.gov.in" target="_blank" rel="noreferrer" className={cn(btn, "mt-4")}>Open SHe-Box<ExternalLink className="h-4 w-4" /></a>
            <p className="mt-3 text-xs text-muted-foreground">Source: <Src href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2227013&reg=3&lang=1">PIB</Src>. In an emergency call 112.</p>
          </div>
        </div>

        {women.length > 0 && <>
          <SectionHead className="mt-16" kicker="Follow" title="Women to follow" />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{women.map(p => (
            <li key={p.slug} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"><Link href={`/athletes/${p.slug}`} className="min-w-0"><b className="block truncate hover:text-primary">{p.name}</b><span className="text-sm text-muted-foreground">{p.sport}</span></Link><FollowButton kind="athlete" k={p.slug} label={p.name} className="shrink-0 px-3 py-1.5" /></li>))}</ul>
        </>}
      </Container>
    </>
  );
}

/* ================================================= editorial standards */
export function StandardsBody() {
  return (
    <div className="space-y-8 text-base leading-relaxed">
      <section><h2 className="font-display text-2xl font-semibold">How we work</h2>
        <ul className="mt-3 space-y-2">{[
          "Every number links to its source. We prefer official records: SAI, the Ministry of Youth Affairs and Sports, PIB, Parliament answers, and the IOC, OCA and Commonwealth Sport.",
          "Where official data is missing, we use two independent reports and say so.",
          "We say what we don't know. For example, SAI does not publish a phone number for each centre, so we show the regional office instead.",
          "Photographs are illustrative and AI-generated. They never stand in for a named athlete.",
          "Watchlists show current form. They are not predictions or betting advice.",
        ].map(x => <li key={x} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-indgreen" />{x}</li>)}</ul></section>
      <section><h2 className="font-display text-2xl font-semibold">Verified listings</h2>
        <p className="mt-2">Coaches and administrators can update a centre or academy listing. We call the number provided, confirm it against official records, and only then publish it with a green Verified badge. Unverified details are never shown.</p></section>
      <section><h2 className="font-display text-2xl font-semibold">Corrections</h2>
        <p className="mt-2">Found an error? Tell us the page and your source. We fix errors fast and log every change below.</p>
        <CorrectionForm />
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border text-sm" data-testid="corrections">{[
          ["8 Oct 2026", "Facilities", "Clarified that SAI does not publish per-centre contacts. Added regional offices, helplines and sanctioned places."],
        ].map(([d, p, t]) => <li key={t} className="grid gap-1 p-3 sm:grid-cols-[7rem_8rem_1fr]"><span className="font-bold tnum">{d}</span><span className="text-muted-foreground">{p}</span><span>{t}</span></li>)}</ul></section>
      <section><h2 className="font-display text-2xl font-semibold">Data and methods</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><b className="text-foreground">Facilities.</b> SAI's 2025–26 centre list, matched to its centre-finder data for regions, coordinates and sanctioned places. Khelo India academies come from the ministry's state-wise list.</li>
          <li><b className="text-foreground">Girls' share.</b> Girls' sanctioned places divided by all places at open SAI centres. Places are approved capacity, not current enrolment.</li>
          <li><b className="text-foreground">Medal tables.</b> Medals are counted per event, so a team gold counts once.</li>
          <li><b className="text-foreground">Open data.</b> Download our medal datasets as CSV from the medal history pages.</li>
        </ul></section>
    </div>
  );
}

function CorrectionForm() {
  const [f, setF] = useState({ page: "", detail: "", source: "", email: "" });
  const [st, setSt] = useState<{ s: "idle" | "busy" | "ok" | "err"; msg?: string }>({ s: "idle" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSt({ s: "busy" });
    try { const r = await (await apiRequest("POST", "/api/corrections", f)).json(); setSt({ s: "ok", msg: r.ref }); setF({ page: "", detail: "", source: "", email: "" }); }
    catch (x) { setSt({ s: "err", msg: errMsg(x) }); }
  };
  if (st.s === "ok") return <p className="mt-4 flex items-center gap-2 rounded-lg border border-border p-4 font-bold text-indgreen" data-testid="correction-ok"><Check className="h-5 w-5" />Thanks. Your reference is {st.msg}. We reply within three working days.</p>;
  return (
    <form noValidate onSubmit={submit} className="mt-4 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2" data-testid="correction-form">
      <div><label htmlFor="co-page" className="text-sm font-bold">Page<span className="text-primary"> *</span></label><input id="co-page" value={f.page} onChange={e => setF({ ...f, page: e.target.value })} className={cn(field, "mt-1")} placeholder="Facilities, Haryana" /></div>
      <div><label htmlFor="co-email" className="text-sm font-bold">Your email<span className="text-primary"> *</span></label><input id="co-email" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={cn(field, "mt-1")} placeholder="name@example.com" /></div>
      <div className="sm:col-span-2"><label htmlFor="co-detail" className="text-sm font-bold">What's wrong<span className="text-primary"> *</span></label><textarea id="co-detail" rows={3} value={f.detail} onChange={e => setF({ ...f, detail: e.target.value })} className={cn(field, "mt-1")} /></div>
      <div className="sm:col-span-2"><label htmlFor="co-source" className="text-sm font-bold">Source link</label><input id="co-source" value={f.source} onChange={e => setF({ ...f, source: e.target.value })} className={cn(field, "mt-1")} placeholder="https://" /></div>
      {st.s === "err" && <p className="text-sm text-destructive sm:col-span-2" role="alert">{st.msg}</p>}
      <button className={cn(btn, "w-fit")} disabled={st.s === "busy"} data-testid="button-correction">{st.s === "busy" && <Loader2 className="h-4 w-4 animate-spin" />}Send correction</button>
    </form>
  );
}

/* ================================================= home band */
export function PlusBand() {
  const cards: [string, string, string, typeof Users][] = [
    ["/para", "Para sport hub", "29 medals at Paris. Asian Para Games from 18 October.", Accessibility],
    ["/women", "Women in sport", "Every Olympic medal, girls' places by state, safe sport.", Users],
    ["/my-momentum", "My Momentum", "Follow athletes and sports. Get trials and Games alerts.", Bell],
    ["/about/standards", "Our standards", "Sources on every number. Corrections in the open.", ShieldCheck],
  ];
  return (
    <Container className="mt-20">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([h, t, d, I]) => (
        <Link key={h} href={h} className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary" data-testid={`plus-${h.slice(1).replace(/\//g, "-")}`}>
          <I className="h-6 w-6 text-primary" /><p className="mt-4 font-display text-xl font-semibold">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p>
        </Link>))}</div>
    </Container>
  );
}
