import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Clock, ExternalLink, HandCoins, MapPin, Package, Phone, Search, Shirt, Sparkles, Trophy, Users, Wallet } from "lucide-react";
import { Container, Kicker, SectionHead, PageHero, Tabs } from "@/components/site";
import { F, field, StateSelect, Done, Err, SubmitBtn, useSubmit } from "@/pages/nation";
import { cn } from "@/lib/utils";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
type Club = { id: number; name: string; kind: string; sport: string; city: string; state: string; ages: string | null; fees: string | null; timings: string | null; girls_only: number; about: string | null; contact_name: string; phone: string; website: string | null };

/* ===================================================== clubs and coaches directory */
export function Clubs() {
  const { data } = useQuery<{ clubs: Club[] }>({ queryKey: ["/api/clubs"] });
  const clubs = data?.clubs ?? [];
  const [q, setQ] = useState(""); const [st, setSt] = useState(""); const [kind, setKind] = useState(""); const [girls, setGirls] = useState(false);
  const sports = [...new Set(clubs.map(c => c.sport))].sort();
  const [sport, setSport] = useState("");
  const shown = clubs.filter(c => (!st || c.state === st) && (!kind || c.kind === kind) && (!sport || c.sport === sport) && (!girls || c.girls_only) && (!q || `${c.name} ${c.city} ${c.sport}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHero kicker="Clubs and coaches · Verified listings" img="./img/academy.webp" title="Find a place to play near you" dek="Local clubs, academies and coaches, with fees, timings, ages and girls-only sessions. Every listing is checked before it appears." />
      <Container className="py-10 md:py-14">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
          <label className="text-sm"><span className="mb-1 block font-bold">Search</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={cn(field, "pl-9")} value={q} onChange={e => setQ(e.target.value)} placeholder="Club, town or sport" data-testid="clubs-search" /></span></label>
          <label className="text-sm"><span className="mb-1 block font-bold">State</span><StateSelect value={st} onChange={setSt} any /></label>
          <label className="text-sm"><span className="mb-1 block font-bold">Sport</span><select className={field} value={sport} onChange={e => setSport(e.target.value)}><option value="">Any sport</option>{sports.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1 block font-bold">Type</span><select className={field} value={kind} onChange={e => setKind(e.target.value)}><option value="">Clubs, academies and coaches</option><option>Club</option><option>Academy</option><option>Coach</option></select></label>
          <label className="flex h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" checked={girls} onChange={e => setGirls(e.target.checked)} data-testid="clubs-girls" />Girls-only sessions</label>
        </div>
        <p className="mt-4 text-sm text-muted-foreground" role="status">{shown.length} of {clubs.length} listing{clubs.length === 1 ? "" : "s"}</p>
        {clubs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center"><Users className="mx-auto h-8 w-8 text-saffron" /><p className="mt-3 font-display text-2xl font-semibold">The directory opens with your listing</p>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">Run a club, academy or coaching group? List it below. We call to confirm details before it goes live. For government centres, see <Link href="/facilities" className="font-bold text-primary hover:underline">facilities by state</Link>.</p></div>
        ) : shown.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No listings match. Try another state or sport.</p> : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{shown.map(c => (
            <li key={c.id} className="flex flex-col rounded-xl border border-border bg-card p-5" data-testid={`club-${c.id}`}>
              <div className="flex items-start justify-between gap-2"><div><p className="font-display text-xl font-semibold leading-tight">{c.name}</p><p className="text-sm text-muted-foreground">{c.kind} · {c.sport}</p></div><BadgeCheck className="h-5 w-5 shrink-0 text-indgreen" aria-label="Verified" /></div>
              <p className="mt-2 flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{c.city}, {c.state}</p>
              <dl className="mt-3 grid gap-1 text-sm">
                {c.ages && <div><dt className="inline font-bold">Ages: </dt><dd className="inline">{c.ages}</dd></div>}
                {c.fees && <div><dt className="inline font-bold">Fees: </dt><dd className="inline">{c.fees}</dd></div>}
                {c.timings && <div className="flex items-start gap-1"><Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd>{c.timings}</dd></div>}
              </dl>
              {!!c.girls_only && <span className="mt-3 w-fit rounded-full bg-saffron/15 px-2 py-0.5 text-xs font-bold text-saffron">Girls-only sessions</span>}
              {c.about && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{c.about}</p>}
              <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3 text-sm">
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 font-bold text-primary hover:underline"><Phone className="h-3.5 w-3.5" />{c.contact_name}</a>
                {c.website && <a href={/^https?:/.test(c.website) ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer nofollow" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">Website<ExternalLink className="h-3 w-3" /></a>}
              </div>
            </li>))}</ul>
        )}
        <ClubForm />
      </Container>
    </>
  );
}
function ClubForm() {
  const sub = useSubmit("/api/clubs", "/api/clubs");
  const blank = { name: "", kind: "Club", sport: "", city: "", state: "", ages: "", fees: "", timings: "", girls_only: false, about: "", contact_name: "", phone: "", email: "", website: "", consent: false };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e });
  return (
    <section id="list" className="mt-14 scroll-mt-24 rounded-xl border border-border bg-card p-5 md:p-8">
      {sub.isSuccess ? <Done title={`Listing ${sub.data?.ref} received`} onReset={() => { sub.reset(); setF(blank); }}>We will call {f.contact_name || "you"} to confirm the details, usually within a week. The listing appears once confirmed.</Done> : (
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" noValidate onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, ages: f.ages || null, fees: f.fees || null, timings: f.timings || null, about: f.about || null, website: f.website || null }); }}>
          <div className="sm:col-span-2 lg:col-span-3"><Kicker className="text-saffron">Free listing</Kicker><p className="mt-1 font-display text-2xl font-semibold">List your club, academy or coaching</p></div>
          <F label="Name"><input className={field} value={f.name} onChange={set("name")} data-testid="club-name" /></F>
          <F label="Type"><select className={field} value={f.kind} onChange={set("kind")}><option>Club</option><option>Academy</option><option>Coach</option></select></F>
          <F label="Sport"><input className={field} value={f.sport} onChange={set("sport")} placeholder="Athletics, kabaddi…" data-testid="club-sport" /></F>
          <F label="Town or city"><input className={field} value={f.city} onChange={set("city")} data-testid="club-city" /></F>
          <F label="State or UT"><StateSelect value={f.state} onChange={v => setF({ ...f, state: v })} testid="club-state" /></F>
          <F label="Ages (optional)"><input className={field} value={f.ages} onChange={set("ages")} placeholder="8 to 16" /></F>
          <F label="Fees (optional)"><input className={field} value={f.fees} onChange={set("fees")} placeholder="₹800 a month, first week free" /></F>
          <F label="Timings (optional)"><input className={field} value={f.timings} onChange={set("timings")} placeholder="Mon to Sat, 6 to 8 am" /></F>
          <F label="Website or social (optional)"><input className={field} value={f.website} onChange={set("website")} /></F>
          <F label="About (optional)" className="sm:col-span-2 lg:col-span-3"><textarea className={cn(field, "h-20 py-2")} value={f.about} onChange={set("about")} placeholder="Coaches' qualifications, facilities, results" /></F>
          <F label="Contact name for families"><input className={field} value={f.contact_name} onChange={set("contact_name")} data-testid="club-contact" /></F>
          <F label="Phone"><input className={field} value={f.phone} onChange={set("phone")} inputMode="tel" data-testid="club-phone" /></F>
          <F label="Email (not shown)"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="club-email" /></F>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" checked={f.girls_only} onChange={set("girls_only")} />We run girls-only sessions</label>
          <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" checked={f.consent} onChange={set("consent")} data-testid="club-consent" /><span>Show the contact name, phone and website publicly. We follow safe-sport practice and will not coach children without a parent's consent.</span></label>
          <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="club-submit">Send listing</SubmitBtn></div>
        </form>
      )}
    </section>
  );
}

/* ===================================================== adopt a ground and gear exchange */
type Ground = { id: number; name: string; place: string; district: string; state: string; sport: string; need: string; budget: number; story: string; users: string | null; adopters: number };
type Gear = { id: number; item: string; sport: string; size: string | null; condition: string; city: string; state: string; requests: number };
export function AdoptGround() {
  const [tab, setTab] = useState<"grounds" | "gear">("grounds");
  return (
    <>
      <PageHero kicker="Adopt a ground · Gear exchange" img="./img/youth-training.webp" accent="#138808" title="Give the next champion a place to train" dek="Fund the upkeep, lights or kit for one local ground. Pass on the shoes, rackets and bows your family has outgrown." />
      <Container className="py-10 md:py-14">
        <Tabs tabs={[["grounds", "Adopt a ground"], ["gear", "Gear exchange"]]} value={tab} onChange={setTab} />
        <div className="mt-8">{tab === "grounds" ? <Grounds /> : <GearExchange />}</div>
      </Container>
    </>
  );
}
const NEEDS = ["Levelling and maintenance", "Floodlights", "Equipment", "Toilets and changing rooms", "Drinking water", "Fencing and security"];
function Grounds() {
  const { data } = useQuery<{ grounds: Ground[] }>({ queryKey: ["/api/grounds"] });
  const grounds = data?.grounds ?? [];
  const [adopt, setAdopt] = useState<Ground | null>(null);
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">{([[HandCoins, "Pick a ground", "Each listing is checked with the school, panchayat or RWA that runs it."], [Wallet, "Fund what it needs", "Pay the ground's committee directly. We introduce you; we never handle money."], [Trophy, "See it used", "Get photos and a short report after the work, and see it on the success wall."]] as const).map(([I, t, d]) => (
          <div key={t} className="rounded-lg border border-border bg-card p-4"><I className="h-5 w-5 text-indgreen" /><p className="mt-2 font-bold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>))}</div>
        {grounds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center"><MapPin className="mx-auto h-8 w-8 text-indgreen" /><p className="mt-3 font-display text-2xl font-semibold">No grounds listed yet</p><p className="mx-auto mt-2 max-w-md text-muted-foreground">Schools, panchayats, RWAs and clubs can list a ground that needs help, using the form.</p></div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">{grounds.map(g => (
            <li key={g.id} className="flex flex-col rounded-xl border border-border bg-card p-5" data-testid={`ground-${g.id}`}>
              <span className="w-fit rounded-full bg-indgreen/15 px-2 py-0.5 text-xs font-bold text-indgreen">{g.need}</span>
              <p className="mt-2 font-display text-xl font-semibold leading-tight">{g.name}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{g.place}, {g.district}, {g.state}</p>
              <p className="mt-1 text-sm">{g.sport}{g.users && ` · ${g.users}`}</p>
              <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{g.story}</p>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3"><span><b className="font-display text-xl tnum">{inr(g.budget)}</b><span className="block text-xs text-muted-foreground">{g.adopters ? `${g.adopters} backer${g.adopters > 1 ? "s" : ""} so far` : "Needs a first backer"}</span></span>
                <button onClick={() => { setAdopt(g); setTimeout(() => document.getElementById("adopt-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }} className="rounded-full bg-indgreen px-4 py-2 text-sm font-bold text-white" data-testid={`adopt-${g.id}`}>Adopt</button></div>
            </li>))}</ul>
        )}
      </div>
      <div className="space-y-6">
        {adopt && <AdoptForm g={adopt} clear={() => setAdopt(null)} />}
        <GroundForm />
      </div>
    </div>
  );
}
function AdoptForm({ g, clear }: { g: Ground; clear: () => void }) {
  const sub = useSubmit(`/api/grounds/${g.id}/adopt`, "/api/grounds");
  const blank = { org: "", kind: "Individual", amount: "Part of the cost", contact: "", email: "" };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <div id="adopt-form" className="scroll-mt-24 rounded-xl border-2 border-indgreen bg-card p-5">
      {sub.isSuccess ? <Done title={`Offer ${sub.data?.ref} received`} onReset={() => { sub.reset(); clear(); }}>Thank you. We will confirm the work and costs with the ground's committee, then introduce you by email.</Done> : (
        <form className="grid gap-3" noValidate onSubmit={e => { e.preventDefault(); sub.mutate(f); }}>
          <p className="font-display text-xl font-semibold">Adopt: {g.name}</p>
          <F label="Your name or organisation"><input className={field} value={f.org} onChange={set("org")} data-testid="adopt-org" /></F>
          <F label="You are"><select className={field} value={f.kind} onChange={set("kind")}>{["Individual", "Company (CSR)", "Alumni or club", "Panchayat or RWA"].map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="You'd like to fund"><select className={field} value={f.amount} onChange={set("amount")}>{["Part of the cost", "The full cost", "Upkeep for a year", "Equipment or labour in kind"].map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Contact person"><input className={field} value={f.contact} onChange={set("contact")} data-testid="adopt-contact" /></F>
          <F label="Email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="adopt-email" /></F>
          <p className="text-xs text-muted-foreground">Companies: ground development and sports training can count as CSR under Schedule VII. Check with your CSR committee.</p>
          <Err msg={sub.errorMsg} /><div className="flex gap-2"><SubmitBtn busy={sub.isPending} testid="adopt-submit">Send offer</SubmitBtn><button type="button" onClick={clear} className="text-sm font-bold text-muted-foreground">Cancel</button></div>
        </form>
      )}
    </div>
  );
}
function GroundForm() {
  const sub = useSubmit("/api/grounds", "/api/grounds");
  const blank = { name: "", place: "", district: "", state: "", sport: "", need: NEEDS[0], budget: "", story: "", users: "", contact_name: "", email: "", phone: "" };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {sub.isSuccess ? <Done title={`Ground ${sub.data?.ref} received`} onReset={() => { sub.reset(); setF(blank); }}>We will check the ground and the estimate with you, then list it for backers.</Done> : (
        <form className="grid gap-3" noValidate onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, users: f.users || null }); }}>
          <p className="font-display text-xl font-semibold">List a ground that needs help</p>
          <F label="Ground name"><input className={field} value={f.name} onChange={set("name")} placeholder="Government school ground, Rampur" data-testid="ground-name" /></F>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Village, ward or town"><input className={field} value={f.place} onChange={set("place")} data-testid="ground-place" /></F><F label="District"><input className={field} value={f.district} onChange={set("district")} data-testid="ground-district" /></F></div>
          <F label="State or UT"><StateSelect value={f.state} onChange={v => setF({ ...f, state: v })} testid="ground-state" /></F>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Sports played"><input className={field} value={f.sport} onChange={set("sport")} data-testid="ground-sport" /></F><F label="Who uses it (optional)"><input className={field} value={f.users} onChange={set("users")} placeholder="About 120 children daily" /></F></div>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Main need"><select className={field} value={f.need} onChange={set("need")}>{NEEDS.map(o => <option key={o}>{o}</option>)}</select></F><F label="Estimated cost (₹)"><input className={field} value={f.budget} onChange={set("budget")} inputMode="numeric" data-testid="ground-budget" /></F></div>
          <F label="What would change?"><textarea className={cn(field, "h-24 py-2")} value={f.story} onChange={set("story")} placeholder="The ground floods every monsoon, so training stops for three months…" data-testid="ground-story" /></F>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Your name"><input className={field} value={f.contact_name} onChange={set("contact_name")} data-testid="ground-contact" /></F><F label="Phone"><input className={field} value={f.phone} onChange={set("phone")} inputMode="tel" data-testid="ground-phone" /></F></div>
          <F label="Email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="ground-email" /></F>
          <Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="ground-submit">List the ground</SubmitBtn>
        </form>
      )}
    </div>
  );
}
function GearExchange() {
  const { data } = useQuery<{ gear: Gear[] }>({ queryKey: ["/api/gear"] });
  const gear = data?.gear ?? [];
  const [want, setWant] = useState<Gear | null>(null);
  const [st, setSt] = useState("");
  const shown = gear.filter(g => !st || g.state === st);
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><p className="max-w-lg text-muted-foreground">Donors list kit they no longer need. Athletes or parents ask for it, and we connect them. Pick up locally or post it.</p>
          <label className="text-sm"><span className="mb-1 block font-bold">State</span><StateSelect value={st} onChange={setSt} any /></label></div>
        {shown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center"><Shirt className="mx-auto h-8 w-8 text-saffron" /><p className="mt-3 font-display text-2xl font-semibold">{gear.length ? "Nothing in this state yet" : "No gear listed yet"}</p><p className="mx-auto mt-2 max-w-md text-muted-foreground">Running spikes, shin pads, a badminton racket, a used bow: list it with the form and it finds a young athlete.</p></div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">{shown.map(g => (
            <li key={g.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4" data-testid={`gear-${g.id}`}>
              <div className="min-w-0"><p className="font-bold">{g.item}</p><p className="text-sm text-muted-foreground">{g.sport}{g.size && ` · Size ${g.size}`} · {g.condition}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{g.city}, {g.state}</p>{g.requests > 0 && <p className="mt-1 text-xs font-bold text-saffron">{g.requests} request{g.requests > 1 ? "s" : ""}</p>}</div>
              <button onClick={() => { setWant(g); setTimeout(() => document.getElementById("gear-req")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-bold hover:bg-muted" data-testid={`gear-want-${g.id}`}>Request</button>
            </li>))}</ul>
        )}
      </div>
      <div className="space-y-6">
        {want && <GearRequest g={want} clear={() => setWant(null)} />}
        <GearForm />
      </div>
    </div>
  );
}
function GearRequest({ g, clear }: { g: Gear; clear: () => void }) {
  const sub = useSubmit(`/api/gear/${g.id}/request`, "/api/gear");
  const blank = { name: "", email: "", phone: "", note: "", guardian: false };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <div id="gear-req" className="scroll-mt-24 rounded-xl border-2 border-saffron bg-card p-5">
      {sub.isSuccess ? <Done title={`Request ${sub.data?.ref} sent`} onReset={() => { sub.reset(); clear(); }}>We will pass your note to the donor and introduce you both by email if they agree.</Done> : (
        <form className="grid gap-3" noValidate onSubmit={e => { e.preventDefault(); sub.mutate(f); }}>
          <p className="font-display text-xl font-semibold">Request: {g.item}</p>
          <F label="Athlete's or parent's name"><input className={field} value={f.name} onChange={set("name")} data-testid="greq-name" /></F>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="greq-email" /></F><F label="Phone"><input className={field} value={f.phone} onChange={set("phone")} inputMode="tel" data-testid="greq-phone" /></F></div>
          <F label="Who will use it?"><textarea className={cn(field, "h-20 py-2")} value={f.note} onChange={set("note")} placeholder="My daughter, 13, runs the 800 m for her district and trains barefoot" data-testid="greq-note" /></F>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" checked={f.guardian} onChange={set("guardian")} data-testid="greq-guardian" /><span>I am the athlete, or their parent, guardian or coach. Under-18s must ask through an adult.</span></label>
          <Err msg={sub.errorMsg} /><div className="flex gap-2"><SubmitBtn busy={sub.isPending} testid="greq-submit">Send request</SubmitBtn><button type="button" onClick={clear} className="text-sm font-bold text-muted-foreground">Cancel</button></div>
        </form>
      )}
    </div>
  );
}
function GearForm() {
  const sub = useSubmit("/api/gear", "/api/gear");
  const blank = { item: "", sport: "", size: "", condition: "Good", city: "", state: "", donor: "", email: "", phone: "" };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {sub.isSuccess ? <Done title={`Item ${sub.data?.ref} received`} onReset={() => { sub.reset(); setF(blank); }}>Thank you. It appears in the exchange once checked. Your contact details stay private.</Done> : (
        <form className="grid gap-3" noValidate onSubmit={e => { e.preventDefault(); sub.mutate({ ...f, size: f.size || null }); }}>
          <p className="flex items-center gap-2 font-display text-xl font-semibold"><Package className="h-5 w-5 text-saffron" />Donate gear</p>
          <F label="Item"><input className={field} value={f.item} onChange={set("item")} placeholder="Running spikes" data-testid="gear-item" /></F>
          <div className="grid gap-3 sm:grid-cols-3"><F label="Sport"><input className={field} value={f.sport} onChange={set("sport")} data-testid="gear-sport" /></F><F label="Size (optional)"><input className={field} value={f.size} onChange={set("size")} placeholder="UK 6" /></F>
            <F label="Condition"><select className={field} value={f.condition} onChange={set("condition")}>{["Like new", "Good", "Used but working"].map(o => <option key={o}>{o}</option>)}</select></F></div>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Town or city"><input className={field} value={f.city} onChange={set("city")} data-testid="gear-city" /></F><F label="State or UT"><StateSelect value={f.state} onChange={v => setF({ ...f, state: v })} testid="gear-state" /></F></div>
          <F label="Your name"><input className={field} value={f.donor} onChange={set("donor")} data-testid="gear-donor" /></F>
          <div className="grid gap-3 sm:grid-cols-2"><F label="Email"><input type="email" className={field} value={f.email} onChange={set("email")} data-testid="gear-email" /></F><F label="Phone"><input className={field} value={f.phone} onChange={set("phone")} inputMode="tel" data-testid="gear-phone" /></F></div>
          <Err msg={sub.errorMsg} /><SubmitBtn busy={sub.isPending} testid="gear-submit">List the item</SubmitBtn>
        </form>
      )}
    </div>
  );
}

/* ===================================================== success wall */
type Success = { id: number; athlete: string; sport: string; state: string; backed_year: number; via: string; result: string; link: string | null };
export function SuccessWall({ dark }: { dark?: boolean }) {
  const { data } = useQuery<{ successes: Success[]; clubs: number; grounds: number; gear: number }>({ queryKey: ["/api/community"] });
  const list = data?.successes ?? [];
  return (
    <section id="success" className={cn("scroll-mt-24 py-14 md:py-20", dark ? "bg-ink text-paper" : "")}>
      <Container>
        <SectionHead kicker="Success wall" title="Backed here, now winning" dek="When an athlete we spotlighted, sponsored or kitted out wins, it goes on this wall. That proof is what brings in the next sponsor." />
        {list.length === 0 ? (
          <div className={cn("grid gap-6 rounded-xl border border-dashed p-8 md:grid-cols-[1fr_auto] md:items-center", dark ? "border-white/20" : "border-border")}>
            <div><Sparkles className="h-7 w-7 text-saffron" /><p className="mt-3 font-display text-2xl font-semibold">The first stories are being written</p><p className={cn("mt-1 max-w-xl", dark ? "text-paper/70" : "text-muted-foreground")}>Every nomination, sponsorship, adopted ground and donated pair of spikes can end up here.</p></div>
            <div className="flex flex-wrap gap-2"><Link href="/sporting-nation/sponsor" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">Sponsor an athlete<ArrowRight className="h-4 w-4" /></Link><Link href="/adopt-a-ground" className={cn("inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 font-bold", dark ? "border-white/30" : "border-border")}>Adopt a ground</Link></div>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => (
            <li key={s.id} className={cn("rounded-xl border p-5", dark ? "border-white/10 bg-white/5" : "border-border bg-card")} data-testid={`success-${s.id}`}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-saffron">{s.via} · {s.backed_year}</p>
              <p className="mt-2 font-display text-2xl font-semibold">{s.athlete}</p>
              <p className={cn("text-sm", dark ? "text-paper/70" : "text-muted-foreground")}>{s.sport} · {s.state}</p>
              <p className="mt-3 flex items-start gap-2 font-bold"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{s.result}</p>
              {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline">Source<ExternalLink className="h-3 w-3" /></a>}
            </li>))}</ul>
        )}
      </Container>
    </section>
  );
}
