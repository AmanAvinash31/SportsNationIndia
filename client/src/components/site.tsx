import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles, Accessibility, HeartHandshake, Sprout, Gamepad2, Tv, CalendarDays, BarChart3, Medal, Globe2, HelpCircle, Info, Dumbbell, Compass, MapPin, Building2, Flame, BookOpen, Star, Trophy, Users, School, Crown, Footprints, type LucideIcon, Menu, Moon, Search, Sun, ArrowRight, ArrowUpRight, Check, Loader2, Bell, Feather } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { usePrefs, type Lang } from "@/lib/prefs";
import { ARTICLES, PEOPLE, TICKER, UPDATED, IMG, fmtDate, type MedalCode, OLY, CWG, ASIAN, sumEditions, total } from "@/data";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

/* ---------------- primitives ---------------- */
export const Container = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>
);

export function Logo({ className, animated = true }: { className?: string; animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 40 40" className={cn("mi-logo overflow-visible", animated && "mi-logo--anim", className)} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={`tri-${id}`} x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF9933" /><stop offset=".36" stopColor="#FF9933" />
          <stop offset=".36" stopColor="#F7F7F2" /><stop offset=".64" stopColor="#F7F7F2" />
          <stop offset=".64" stopColor="#1DB954" /><stop offset="1" stopColor="#138808" />
        </linearGradient>
        <linearGradient id={`glint-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`clip-${id}`}><rect x="1" y="1" width="38" height="38" rx="9" /></clipPath>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="9" fill="hsl(var(--ink))" />
      <rect x="1.5" y="1.5" width="37" height="37" rx="8.5" stroke="hsl(var(--paper) / .14)" />
      <g clipPath={`url(#clip-${id})`}>
        <rect className="mi-logo-glint" x="-20" y="-4" width="14" height="48" fill={`url(#glint-${id})`} opacity=".22" transform="skewX(-18)" />
      </g>
      <path className="mi-logo-pulse" pathLength={100} d="M5 23h7l3.5-11 6 17 3.5-10 2.5 4H30" stroke={`url(#tri-${id})`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <g className="mi-logo-chakra">
        <circle cx="33.5" cy="23" r="4.2" fill="#F7F7F2" />
        <circle cx="33.5" cy="23" r="3.5" stroke="#0A2A8C" strokeWidth=".7" />
        {spokes.map(a => <line key={a} x1="33.5" y1="23" x2={33.5 + 3.3 * Math.cos((a * Math.PI) / 180)} y2={23 + 3.3 * Math.sin((a * Math.PI) / 180)} stroke="#0A2A8C" strokeWidth=".32" />)}
        <circle cx="33.5" cy="23" r=".9" fill="#0A2A8C" />
      </g>
    </svg>
  );
}

export const TAGLINE = "Celebrating the rise of a sporting nation";

export function Wordmark({ tagline = true, dark, className }: { tagline?: boolean; dark?: boolean; className?: string }) {
  return (
    <span className={cn("flex flex-col justify-center leading-none", className)}>
      <span className="font-display text-[1.15rem] font-semibold leading-none tracking-tight">Momentum <span className={dark ? "text-saffron" : "text-primary"}>India</span></span>
      {tagline && <span className={cn("mi-tagline mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em]", dark ? "text-paper/65" : "text-muted-foreground")}>{TAGLINE}</span>}
    </span>
  );
}

export function Kicker({ children, className, color }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <span className={cn("mi-eyebrow inline-flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em]", className)} style={color ? { color } : undefined}>
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

const slug = (n: ReactNode) => typeof n === "string" ? n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) : undefined;

export function SectionHead({ kicker, title, action, className, dek }: { kicker?: string; title: ReactNode; action?: ReactNode; className?: string; dek?: ReactNode }) {
  const id = slug(title);
  return (
    <div id={id ? `s-${id}` : undefined} className={cn("mi-section-head mb-7 scroll-mt-36 md:mb-10", className)}>
      <div className="mi-sh-grid grid gap-4">
      <div className="min-w-0">
        {kicker && <Kicker className="mb-3 text-gold-ink">{kicker}</Kicker>}
        <h2 className="text-balance font-display text-[clamp(1.7rem,1.1rem+2vw,2.9rem)] font-bold leading-[1.02]">{title}</h2>
      </div>
      {(dek || action) && <div className="mi-sh-side flex flex-col items-start gap-3">
        {dek && <p className="max-w-xl text-pretty text-muted-foreground">{dek}</p>}
        {action}
      </div>}
      </div>
    </div>
  );
}

export function ScrollButtons() {
  const [y, setY] = useState(0);
  useEffect(() => { const on = () => setY(window.scrollY); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  const atEnd = typeof document !== "undefined" && y + window.innerHeight >= document.documentElement.scrollHeight - 200;
  if (y < 600) return null;
  return (
    <div className="fixed bottom-4 right-3 z-40 flex flex-col gap-2 opacity-90 hover:opacity-100 md:bottom-6 md:right-4">
      <button data-testid="button-scroll-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mi-fab grid h-10 w-10 place-items-center rounded-full"><ChevronUp className="h-5 w-5" /></button>
      {!atEnd && <button data-testid="button-scroll-down" aria-label="Scroll down" onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" })} className="mi-fab mi-fab--alt hidden h-10 w-10 md:grid place-items-center rounded-full"><ChevronDown className="h-5 w-5" /></button>}
    </div>
  );
}

export const MoreLink = ({ href, children, testid }: { href: string; children: ReactNode; testid?: string }) => (
  <Link href={href} data-testid={testid} className="group inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary">
    {children}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </Link>
);

export const MEDAL_CLS: Record<MedalCode, string> = { G: "bg-gold", S: "bg-silver", B: "bg-bronze" };
export const MedalDot = ({ m, className }: { m: MedalCode; className?: string }) => (
  <span className={cn("inline-block h-3 w-3 shrink-0 rounded-full ring-2 ring-background", MEDAL_CLS[m], className)} aria-label={{ G: "Gold", S: "Silver", B: "Bronze" }[m]} />
);

export function MedalTriplet({ g, s, b, size = "md", className }: { g: number; s: number; b: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const num = size === "lg" ? "text-3xl md:text-4xl" : size === "md" ? "text-xl" : "text-base";
  return (
    <div className={cn("flex items-center gap-4 tnum", className)}>
      {([["G", g], ["S", s], ["B", b]] as [MedalCode, number][]).map(([m, v]) => (
        <span key={m} className="flex items-center gap-1.5"><MedalDot m={m} /><span className={cn("font-display font-semibold", num)}>{v}</span></span>
      ))}
    </div>
  );
}

export function StackBar({ g, s, b, max, className }: { g: number; s: number; b: number; max?: number; className?: string }) {
  const t = g + s + b; const m = max ?? t;
  return (
    <div className={cn("flex h-2.5 w-full overflow-hidden rounded-full bg-muted", className)} role="img" aria-label={`${g} gold, ${s} silver, ${b} bronze`}>
      {t > 0 && <><span className="bg-gold" style={{ width: `${(g / m) * 100}%` }} /><span className="bg-silver" style={{ width: `${(s / m) * 100}%` }} /><span className="bg-bronze" style={{ width: `${(b / m) * 100}%` }} /></>}
    </div>
  );
}

export function CountUp({ to, className, duration = 1.4 }: { to: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const c = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: x => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, duration, mv]);
  return <span ref={ref} className={cn("tnum", className)}>{v.toLocaleString("en-IN")}</span>;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

export function Img({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const { lite } = usePrefs();
  if (lite) return <div role={alt ? "img" : undefined} aria-label={alt || undefined} className={cn("lite-ph h-full w-full", className)} />;
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onLoad={() => setLoaded(true)} className={cn("h-full w-full object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", className)} />;
}

export function useCountdown(at: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!at) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, [at]);
  if (!at) return null;
  const ms = Math.max(0, new Date(at).getTime() - now);
  return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60, done: ms === 0 };
}

/* ---------------- navigation ---------------- */
type NavLink = { label: string; href: string; desc?: string; img?: string; icon?: LucideIcon; group?: string };
type NavFeature = { kicker: string; title: string; desc: string; href: string; img: string; cta: string };
const NAV: { key: string; href?: string; items?: NavLink[]; feature?: NavFeature }[] = [
  { key: "games", items: [
    { label: "Asian Para Games 2026", href: "/games/asian-para-games-2026", desc: "Live hub · 18 to 24 October", img: IMG.relay },
    { label: "Asian Games 2026", href: "/games/asian-games-2026", desc: "Aichi-Nagoya · India 4th, 85 medals", img: IMG.hockey },
    { label: "Glasgow 2026", href: "/games/glasgow-2026", desc: "Commonwealth Games · 39 medals", img: IMG.boxing },
    { label: "Ahmedabad 2030", href: "/games/ahmedabad-2030", desc: "India hosts the Centenary Games", img: IMG.stadium },
    { label: "Road to LA 2028", href: "/road-to-la-2028", desc: "Olympic Games · 14 to 30 July 2028", img: IMG.hero },
    { label: "Leagues", href: "/leagues", desc: "ISL, Pro Kabaddi, Hockey India League", img: IMG.stadium },
    { label: "Where to watch", href: "/watch", desc: "Channels, apps and start times in IST", img: IMG.crowd },
  ] },
  { key: "medalHistory", items: [
    { label: "All-time overview", href: "/medals", desc: "Every Indian medal across three Games", icon: BarChart3 },
    { label: "Olympic Games", href: "/medals/olympics", desc: "41 medals since 1900", icon: Medal },
    { label: "Commonwealth Games", href: "/medals/commonwealth", desc: "602 medals, 4th all-time", icon: Crown },
    { label: "Asian Games", href: "/medals/asian-games", desc: "The last five editions in depth", icon: Trophy },
  ] },
  { key: "athletes", href: "/athletes" },
  { key: "rise", feature: { kicker: "Grassroots to podium", title: "Build a sporting nation", desc: "What the US, China and the Netherlands do differently, and how you can help from your own street.", href: "/sporting-nation", img: "./img/youth-training.webp", cta: "Read the playbook" }, items: [
    { group: "Start playing", label: "Pathway and parents", href: "/pathway", desc: "Find my sport quiz, schemes, safety", icon: Footprints },
    { group: "Start playing", label: "Clubs and coaches", href: "/clubs", desc: "Local clubs, fees, girls-only sessions", icon: Users },
    { group: "Start playing", label: "Facilities by state", href: "/facilities", desc: "SAI centres and Khelo India academies", icon: MapPin },
    { group: "Start playing", label: "Para sport hub", href: "/para", desc: "Classes explained, how to begin", icon: Accessibility },
    { group: "Start playing", label: "Women in sport", href: "/women", desc: "Medals, girls' places, safe sport", icon: Star },
    { group: "Back the next generation", label: "Build a sporting nation", href: "/sporting-nation", desc: "Local stars, competitions, sponsors", icon: HeartHandshake },
    { group: "Back the next generation", label: "Adopt a ground", href: "/adopt-a-ground", desc: "Fund a ground, pass on outgrown gear", icon: Sprout },
    { group: "Back the next generation", label: "Road to LA 2028", href: "/road-to-la-2028", desc: "Watchlist and qualification", icon: Flame },
    { group: "Back the next generation", label: "Where champions began", href: "/stories", desc: "Seven sourced origin stories", icon: BookOpen },
    { group: "Back the next generation", label: "Golden moments", href: "/golden-moments", desc: "India's greatest wins", icon: Trophy },
    { group: "Back the next generation", label: "My Momentum", href: "/my-momentum", desc: "Follow athletes, set alerts", icon: Bell },
  ] },
  { key: "news", href: "/news" },
  { key: "explore", feature: { kicker: "Fan zone", title: "Predict India's Para Games haul", desc: "Make your picks before 18 October, then test yourself in the medal quiz.", href: "/fan-zone", img: IMG.crowd, cta: "Play now" }, items: [
    { group: "Follow", label: "Schedule and countdowns", href: "/schedule", desc: "Every Games and league date", icon: CalendarDays },
    { group: "Follow", label: "Where to watch", href: "/watch", desc: "Channels and IST start times", icon: Tv },
    { group: "Follow", label: "State leaderboards", href: "/states", desc: "Khelo India and National Games", icon: BarChart3 },
    { group: "Follow", label: "Fan zone", href: "/fan-zone", desc: "Predictions, quiz, on this day", icon: Gamepad2 },
    { group: "Discover", label: "Hall of fame", href: "/hall-of-fame", desc: "India's greatest medallists", icon: Crown },
    { group: "Discover", label: "Sports", href: "/sports", desc: "Every sport India medals in", icon: Dumbbell },
    { group: "Discover", label: "Nations", href: "/nations", desc: "How India compares", icon: Globe2 },
    { group: "Discover", label: "FAQ", href: "/faq", desc: "Quick answers", icon: HelpCircle },
    { group: "Discover", label: "About and data credits", href: "/about", desc: "Sources and methods", icon: Info },
  ] },
];

function useActive() {
  const [loc] = useLocation();
  return (href: string) => (href === "/" ? loc === "/" : loc === href || loc.startsWith(href + "/"));
}

function LangSwitch({ compact }: { compact?: boolean }) {
  const { lang, setLang } = usePrefs();
  const opts: [Lang, string, string][] = [["en", "EN", "English"], ["hi", "हिं", "हिन्दी"], ["gu", "ગુ", "ગુજરાતી"]];
  return (
    <div role="radiogroup" aria-label="Language" className={cn("flex items-center rounded-full border border-border p-0.5", compact && "w-full")}>
      {opts.map(([k, l, full]) => (
        <button key={k} role="radio" aria-checked={lang === k} aria-label={full} data-testid={`button-lang-${k}`} onClick={() => setLang(k)}
          className={cn("min-h-8 min-w-8 rounded-full px-2.5 text-[0.8rem] font-bold transition-colors", compact && "flex-1", lang === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{l}</button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = usePrefs();
  return (
    <button data-testid="button-theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground hover:bg-muted">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="border-b border-white/10 bg-ink text-paper" aria-label="Latest results">
      <Container className="flex h-9 items-center gap-4 text-[0.8rem]">
        <span className="flex shrink-0 items-center gap-2 font-bold uppercase tracking-[0.14em] text-saffron">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-60 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" /></span>
          Results
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
          <div className="ticker-track flex w-max animate-marquee gap-10 whitespace-nowrap">
            {items.map(([a, b], i) => (
              <span key={i} className="flex items-center gap-2" aria-hidden={i >= TICKER.length}>
                <span className="font-bold text-paper">{a}</span><span className="text-paper/70">{b}</span>
              </span>
            ))}
          </div>
        </div>
        <span className="hidden shrink-0 text-paper/60 md:inline">Updated {UPDATED}</span>
      </Container>
    </div>
  );
}

/* Dropdown panel that always stays inside the viewport (iPad landscape, split view, small laptops). */
function NavDropdown({ n, open, setOpen, label, isActive }: { n: { key: string; items?: NavLink[]; feature?: NavFeature }; open: boolean; setOpen: (v: boolean) => void; label: string; isActive: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const hoverAt = useRef(0);
  const active = useActive();
  const rich = !!n.items![0].img;
  const grouped = n.items!.some(i => i.group);
  const want = rich ? 680 : grouped ? (n.feature ? 820 : 600) : 380;
  const [box, setBox] = useState<{ left: number; width: number; maxH: number }>({ left: 0, width: want, maxH: 600 });
  const measure = useCallback(() => {
    const el = wrap.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, gutter = 16;
    const width = Math.min(want, vw - gutter * 2);
    let left = 0;
    if (r.left + width > vw - gutter) left = vw - gutter - width - r.left;
    if (r.left + left < gutter) left = gutter - r.left;
    setBox({ left, width, maxH: Math.max(240, vh - r.bottom - 24) });
  }, [want]);
  useLayoutEffect(() => { if (!open) return; measure(); window.addEventListener("resize", measure); return () => window.removeEventListener("resize", measure); }, [open, measure]);
  const showFeature = !!n.feature && box.width >= 760;
  const cols = rich ? (box.width >= 560 ? 2 : 1) : grouped && box.width >= 540 ? 2 : 1;
  const groups = grouped ? [...new Set(n.items!.map(i => i.group!))].map(g => [g, n.items!.filter(i => i.group === g)] as const) : [["", n.items!] as const];
  const Item = ({ i }: { i: NavLink }) => {
    const on = active(i.href); const Ic = i.icon ?? Compass;
    return (
      <Link href={i.href} data-testid={`navitem-${i.href.replace(/\W+/g, "-")}`} aria-current={on ? "page" : undefined}
        className={cn("mi-nav-item group flex min-w-0 items-center gap-3 rounded-xl p-2.5", on && "mi-nav-item--on")}>
        {i.img
          ? <span className="h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg"><img src={i.img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" /></span>
          : <span className="mi-nav-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl"><Ic className="h-[18px] w-[18px]" /></span>}
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold leading-snug transition-colors group-hover:text-gold-ink">{i.label}</span>{i.desc && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{i.desc}</span>}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-gold-ink opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
      </Link>
    );
  };
  return (
    <div ref={wrap} className="relative flex" onPointerEnter={e => { if (e.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches && !open) { hoverAt.current = Date.now(); setOpen(true); } }}>
      <button data-testid={`nav-${n.key}`} aria-expanded={open} aria-haspopup="true" onClick={() => { if (open && Date.now() - hoverAt.current < 500) return; setOpen(!open); }}
        className={cn("relative flex items-center gap-1 whitespace-nowrap px-2 text-sm font-bold transition-colors hover:text-primary xl:px-3", (isActive || open) && "text-primary", isActive && "after:absolute after:inset-x-2 xl:after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-primary")}>
        {label}<ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full z-50 pt-2.5" style={{ left: box.left, width: box.width }} data-testid={`menu-${n.key}`}>
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxHeight: box.maxH }}
            className={cn("mi-menu overscroll-contain overflow-y-auto rounded-2xl p-2.5", showFeature && "grid grid-cols-[minmax(0,1fr)_240px] gap-2.5")}>
            <div className={cn("grid gap-x-2 gap-y-4 p-1", cols === 2 && "grid-cols-2")}>
              {groups.map(([g, items]) => (
                <div key={g || "all"} className={cn("min-w-0", !grouped && cols === 2 && "contents")}>
                  {g && <p className="mb-1.5 px-2.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-gold-ink">{g}</p>}
                  <div className={cn("grid gap-0.5", !grouped && cols === 2 && "col-span-2 grid-cols-2 gap-1")}>{items.map(i => <Item key={i.href} i={i} />)}</div>
                </div>
              ))}
            </div>
            {showFeature && n.feature && (
              <Link href={n.feature.href} data-testid={`navfeature-${n.key}`} className="group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-xl p-4 text-paper">
                <img src={n.feature.img} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[hsl(232_45%_5%)] via-[hsl(232_45%_5%/0.7)] to-[hsl(232_45%_5%/0.1)]" />
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold-bright">{n.feature.kicker}</span>
                <span className="mt-1.5 font-display text-xl font-bold leading-tight">{n.feature.title}</span>
                <span className="mt-1.5 text-xs leading-relaxed text-paper/75">{n.feature.desc}</span>
                <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground">{n.feature.cta}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function Header({ onSearch, onSubscribe }: { onSearch: () => void; onSubscribe: () => void }) {
  const { t } = usePrefs();
  const active = useActive();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [loc] = useLocation();
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); setMenu(null); }, [loc]);
  useEffect(() => {
    if (!menu) return;
    const out = (e: PointerEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    document.addEventListener("pointerdown", out); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", esc); };
  }, [menu]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);

  return (
    <header className={cn("sticky top-0 z-50 border-b transition-colors", scrolled ? "border-border bg-background/85 backdrop-blur-xl" : "border-transparent bg-background")}>
      <div className="tricolour h-[3px]" aria-hidden="true" />
      <Container className="flex h-16 items-center gap-6">
        <Link href="/" data-testid="link-home" className="flex shrink-0 items-center gap-2.5" aria-label="Momentum India home">
          <Logo className="h-9 w-9" />
          <Wordmark className="[&_.mi-tagline]:hidden sm:[&_.mi-tagline]:block lg:[&_.mi-tagline]:hidden 2xl:[&_.mi-tagline]:block" />
        </Link>

        <nav ref={navRef} aria-label="Primary" className="hidden h-full items-stretch lg:flex" onMouseLeave={() => setMenu(null)}>
          {NAV.map(n => n.href ? (
            <Link key={n.key} href={n.href} data-testid={`nav-${n.key}`} onMouseEnter={() => setMenu(null)}
              className={cn("relative flex items-center whitespace-nowrap px-2 text-sm font-bold transition-colors hover:text-primary xl:px-3", active(n.href) && "text-primary after:absolute after:inset-x-2 xl:after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-primary")}>{t(n.key)}</Link>
          ) : (
            <NavDropdown key={n.key} n={n} open={menu === n.key} setOpen={v => setMenu(v ? n.key : null)} label={t(n.key)} isActive={n.items!.some(i => active(i.href))} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={onSearch} data-testid="button-search" className="flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-border px-3 text-sm text-muted-foreground hover:text-foreground md:w-40 lg:w-9 lg:justify-center lg:px-0 2xl:w-56 2xl:justify-start 2xl:px-3" aria-label="Search">
            <Search className="h-4 w-4 shrink-0" /><span className="hidden md:inline lg:hidden 2xl:inline">{t("search")}</span>
            <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[0.7rem] md:inline lg:hidden 2xl:inline">⌘K</kbd>
          </button>
          <div className="hidden xl:block"><LangSwitch /></div>
          <Link href="/my-momentum" data-testid="link-my-momentum" aria-label="My Momentum: what you follow" className="hidden h-9 w-9 sm:grid lg:hidden xl:grid place-items-center rounded-full border border-border text-foreground hover:bg-muted"><Bell className="h-4 w-4" /></Link>
          <ThemeToggle />
          <button onClick={onSubscribe} data-testid="button-subscribe-header" className="hidden h-9 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:brightness-110 sm:block">Subscribe</button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button data-testid="button-menu" aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-full border border-border lg:hidden"><Menu className="h-4 w-4" /></button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto">
              <SheetHeader><SheetTitle className="flex items-center gap-2.5 text-left font-display font-semibold"><Logo className="h-9 w-9" /><Wordmark /></SheetTitle></SheetHeader>
              <div className="mt-4"><LangSwitch compact /></div>
              <div className="mt-3"><LiteToggle /></div>
              <nav aria-label="Mobile" className="mt-6 space-y-6">
                <Link href="/" className="block font-display text-2xl font-semibold">Home</Link>
                {NAV.map(n => n.href ? <Link key={n.key} href={n.href} className="block font-display text-2xl font-semibold">{t(n.key)}</Link> : (
                  <div key={n.key}>
                    <p className="mb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-ink">{t(n.key)}</p>
                    <ul className="space-y-0.5">{n.items!.map(i => { const Ic = i.icon; return <li key={i.href}><Link href={i.href} className="mi-nav-item group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-base font-bold">
                      {Ic ? <span className="mi-nav-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl"><Ic className="h-4 w-4" /></span> : i.img ? <span className="h-9 w-9 shrink-0 overflow-hidden rounded-xl"><img src={i.img} alt="" loading="lazy" className="h-full w-full object-cover" /></span> : null}
                      <span className="min-w-0 flex-1">{i.label}</span></Link></li>; })}</ul>
                  </div>
                ))}
              </nav>
              <button onClick={() => { setOpen(false); onSubscribe(); }} className="mt-8 h-11 w-full rounded-full bg-primary font-bold text-primary-foreground">Subscribe to the newsletter</button>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}

/* ---------------- search palette ---------------- */
export function SearchPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [, nav] = useLocation();
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!open); } };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [open, setOpen]);
  const go = (h: string) => { setOpen(false); nav(h); };
  const o = sumEditions(OLY), c = sumEditions(CWG), a = sumEditions(ASIAN);
  const answers: [string, string, string][] = [
    ["How many Olympic medals has India won?", `${total(o)} medals: ${o.g} gold, ${o.s} silver, ${o.b} bronze`, "/medals/olympics"],
    ["How many Commonwealth Games medals has India won?", `${total(c)} medals: ${c.g} gold, ${c.s} silver, ${c.b} bronze`, "/medals/commonwealth"],
    ["Asian Games 2026 India medal tally", "85 medals, 4th: 21 gold, 27 silver, 37 bronze", "/games/asian-games-2026"],
    ["Asian Games, last five editions", `${total(a)} medals across 2010 to 2026`, "/medals/asian-games"],
    ["Where can I watch the ISL?", "Sony Sports Network, SonyLIV, and free on YouTube", "/watch"],
    ["When are the Asian Para Games?", "18 to 24 October 2026 in Aichi-Nagoya", "/games/asian-para-games-2026"],
    ["When is the next Olympics?", "Los Angeles, 14 to 30 July 2028", "/schedule"],
  ];
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search athletes, stories, Games or ask a question" data-testid="input-search" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Nothing matches yet. Try an athlete like "Neeraj" or a Games like "Glasgow".</CommandEmpty>
        <CommandGroup heading="Quick answers">
          {answers.map(([q, ans, h]) => <CommandItem key={q} value={q} onSelect={() => go(h)}><div><div className="font-bold">{q}</div><div className="text-xs text-muted-foreground">{ans}</div></div></CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Pages">
          {[["Asian Para Games 2026 live hub", "/games/asian-para-games-2026"], ["Where to watch: TV and streaming", "/watch"], ["Leagues: ISL, Pro Kabaddi, Hockey India League", "/leagues"], ["Fan zone: predictions, quiz, on this day", "/fan-zone"], ["State leaderboards", "/states"], ["Clubs and coaches near me", "/clubs"], ["Adopt a ground and donate gear", "/adopt-a-ground"], ["Build a sporting nation: grassroots, local stars, sponsors", "/sporting-nation"], ["Sponsor a budding athlete", "/sporting-nation/sponsor"], ["Road to LA 2028", "/road-to-la-2028"], ["Para sport hub and Asian Para Games", "/para"], ["Women in sport", "/women"], ["My Momentum: follow athletes and sports", "/my-momentum"], ["Editorial standards and corrections", "/about/standards"], ["Pathway for young athletes and parents", "/pathway"], ["Find sports facilities by state", "/facilities"], ["Success stories", "/stories"], ["Golden moments slideshow", "/golden-moments"], ["Asian Games 2026 hub", "/games/asian-games-2026"], ["Glasgow 2026 hub", "/games/glasgow-2026"], ["Ahmedabad 2030 guide", "/games/ahmedabad-2030"], ["Olympic medal history", "/medals/olympics"], ["Commonwealth medal history", "/medals/commonwealth"], ["Asian Games medal history", "/medals/asian-games"], ["Schedule", "/schedule"], ["Hall of fame", "/hall-of-fame"], ["Nations", "/nations"], ["FAQ", "/faq"]].map(([l, h]) => <CommandItem key={h} value={l} onSelect={() => go(h)}>{l}</CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Athletes">
          {PEOPLE.map(p => <CommandItem key={p.slug} value={`${p.name} ${p.sport}`} onSelect={() => go(`/athletes/${p.slug}`)}><span className="font-bold">{p.name}</span><span className="ml-2 text-xs text-muted-foreground">{p.sport}</span></CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Stories">
          {ARTICLES.map(a => <CommandItem key={a.slug} value={a.title} onSelect={() => go(`/news/${a.slug}`)}><div><div className="font-bold">{a.title}</div><div className="text-xs text-muted-foreground">{fmtDate(a.date)}</div></div></CommandItem>)}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/* ---------------- newsletter ---------------- */
const INTERESTS = [["asian", "Asian Games"], ["cwg", "Commonwealth Games"], ["oly", "Olympics"]] as const;
export function NewsletterForm({ tone = "dark", id = "nl" }: { tone?: "dark" | "light"; id?: string }) {
  const { lang } = usePrefs();
  const [email, setEmail] = useState("");
  const [picks, setPicks] = useState<string[]>(["asian", "cwg", "oly"]);
  const [state, setState] = useState<{ s: "idle" | "busy" | "ok" | "err"; msg?: string }>({ s: "idle" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setState({ s: "err", msg: "Enter a valid email address, like name@example.com." }); return; }
    setState({ s: "busy" });
    try {
      const r = await apiRequest("POST", "/api/subscribe", { email, interests: JSON.stringify(picks), lang });
      const j = await r.json();
      setState({ s: "ok", msg: j.existed ? `${j.email} was already subscribed. We've updated your preferences.` : `You're in. The next briefing goes to ${j.email}.` });
    } catch (err) {
      const m = String((err as Error).message);
      setState({ s: "err", msg: m.startsWith("400") ? "That email doesn't look right. Check it and try again." : "We couldn't reach the newsletter service. Try again in a moment." });
    }
  };
  const dark = tone === "dark";
  if (state.s === "ok") return (
    <div role="status" className={cn("flex items-start gap-3 rounded-lg border p-4", dark ? "border-white/15 bg-white/5 text-paper" : "border-border bg-card")}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indgreen text-white"><Check className="h-4 w-4" /></span>
      <p className="text-sm">{state.msg}</p>
    </div>
  );
  return (
    <form onSubmit={submit} noValidate className="space-y-3" aria-describedby={`${id}-msg`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
        <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" data-testid={`input-${id}-email`}
          aria-invalid={state.s === "err"}
          className={cn("h-12 flex-1 rounded-full border px-5 text-base outline-none transition focus:ring-2 focus:ring-primary", dark ? "border-white/20 bg-white/5 text-paper placeholder:text-paper/50" : "border-input bg-background")} />
        <button type="submit" disabled={state.s === "busy"} data-testid={`button-${id}-submit`} className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-70">
          {state.s === "busy" ? <><Loader2 className="h-4 w-4 animate-spin" />Subscribing</> : <>Get the briefing<ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Topics</legend>
        {INTERESTS.map(([k, l]) => {
          const on = picks.includes(k);
          return <button type="button" key={k} aria-pressed={on} data-testid={`toggle-${id}-${k}`} onClick={() => setPicks(on ? picks.filter(x => x !== k) : [...picks, k])}
            className={cn("rounded-full border px-3 py-1.5 text-xs font-bold transition", on ? "border-primary bg-primary/15 text-primary" : dark ? "border-white/20 text-paper/70" : "border-border text-muted-foreground")}>{on && "✓ "}{l}</button>;
        })}
      </fieldset>
      <p id={`${id}-msg`} role={state.s === "err" ? "alert" : undefined} className={cn("min-h-5 text-sm", state.s === "err" ? "text-[hsl(2_80%_62%)]" : dark ? "text-paper/60" : "text-muted-foreground")}>
        {state.s === "err" ? state.msg : "One email after each big day. No spam, unsubscribe anytime."}
      </p>
    </form>
  );
}

export function SubscribeDialog({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">The Momentum briefing</DialogTitle>
          <DialogDescription>Results, medal counts and the stories behind them, after every big day of competition.</DialogDescription>
        </DialogHeader>
        <NewsletterForm tone="light" id="dlg" />
      </DialogContent>
    </Dialog>
  );
}

export function LiteToggle({ dark }: { dark?: boolean }) {
  const { lite, setLite } = usePrefs();
  return (
    <button role="switch" aria-checked={lite} data-testid="button-lite" onClick={() => setLite(!lite)}
      className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm", dark ? "border-white/15 text-paper hover:border-white/40" : "border-border hover:border-foreground")}>
      <Feather className="h-4 w-4 shrink-0" />
      <span className="flex-1"><b className="block">Lite mode</b><span className={cn("text-xs", dark ? "text-paper/60" : "text-muted-foreground")}>No photos or animation. Saves data on slow connections.</span></span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", lite ? "bg-primary" : dark ? "bg-white/20" : "bg-muted")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", lite ? "left-[18px]" : "left-0.5")} /></span>
    </button>
  );
}

/* ---------------- footer ---------------- */
export function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Games", [["Asian Games 2026", "/games/asian-games-2026"], ["Glasgow 2026", "/games/glasgow-2026"], ["Ahmedabad 2030", "/games/ahmedabad-2030"], ["Schedule", "/schedule"]]],
    ["Medal history", [["Overview", "/medals"], ["Olympics", "/medals/olympics"], ["Commonwealth Games", "/medals/commonwealth"], ["Asian Games", "/medals/asian-games"]]],
    ["Next generation", [["Road to LA 2028", "/road-to-la-2028"], ["Build a sporting nation", "/sporting-nation"], ["Pathway and parents", "/pathway"], ["Facilities by state", "/facilities"], ["Success stories", "/stories"], ["Golden moments", "/golden-moments"], ["Para sport hub", "/para"], ["Women in sport", "/women"]]],
    ["Explore", [["Athletes", "/athletes"], ["News", "/news"], ["Hall of fame", "/hall-of-fame"], ["Sports", "/sports"], ["Nations", "/nations"]]],
    ["About", [["About us", "/about"], ["My Momentum", "/my-momentum"], ["Standards and corrections", "/about/standards"], ["Data credits", "/about/credits"], ["Privacy and terms", "/about/legal"], ["FAQ", "/faq"]]],
  ];
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-paper">
      <div className="tricolour h-1" aria-hidden="true" />
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-3"><Logo className="h-12 w-12" />
              <span className="flex flex-col"><span className="font-display text-2xl font-semibold leading-none">Momentum India</span><span className="mt-1.5 text-xs font-bold uppercase tracking-[0.12em] text-saffron">{TAGLINE}</span></span></div>
            <p className="mt-4 max-w-sm text-paper/70">The pulse of Indian sport. An independent fan publication covering India at the Olympics, Asian Games and Commonwealth Games.</p>
            <div className="mt-8 max-w-md"><p className="mb-3 font-bold">Get the briefing</p><NewsletterForm id="footer" /></div>
            <div className="mt-6 max-w-md"><LiteToggle dark /></div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-5">
            {cols.map(([h, ls]) => (
              <div key={h}><p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-paper/50">{h}</p>
                <ul className="space-y-2.5">{ls.map(([l, href]) => <li key={href}><Link href={href} className="text-sm text-paper/85 hover:text-saffron">{l}</Link></li>)}</ul></div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-paper/50 md:flex-row md:justify-between">
          <p>Not affiliated with the IOA, OCA, Commonwealth Sport or the IOC. Photography is illustrative and AI-generated. Data updated {UPDATED}.</p>
          <a href="https://en.wikipedia.org/wiki/India_at_the_Olympics" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-paper">Primary data sources<ArrowUpRight className="h-3 w-3" /></a>
        </div>
      </Container>
    </footer>
  );
}

/* ---------------- page hero ---------------- */
export function PageHero({ kicker, title, dek, img, children, accent }: { kicker: string; title: ReactNode; dek?: ReactNode; img: string; children?: ReactNode; accent?: string }) {
  return (
    <section className="grain mi-hero relative isolate overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 -z-10"><Img src={img} alt="" eager className="scale-105" /></div>
      <div className="scrim-l absolute inset-0 -z-10" /><div className="scrim-b absolute inset-0 -z-10 opacity-80" />
      <div className="mi-hero-glow absolute inset-0 -z-10" aria-hidden="true" />
      <Container className="flex min-h-[380px] flex-col justify-end pb-12 pt-24 md:min-h-[480px] md:pb-16">
        <span className="mi-glass inline-flex w-fit max-w-full items-center rounded-2xl px-3.5 py-1.5 sm:rounded-full"><Kicker color={accent ?? "hsl(var(--gold-bright))"} className="text-[0.66rem] leading-snug sm:text-[0.72rem]">{kicker}</Kicker></span>
        <h1 className="mt-5 max-w-4xl text-balance font-display text-[clamp(2.5rem,1.2rem+4.4vw,5.4rem)] font-bold leading-[0.94]">{title}</h1>
        <span className="mi-swoosh mt-5 block h-[3px] w-28 rounded-full" aria-hidden="true" />
        {dek && <p className="mt-5 max-w-2xl text-pretty text-lg text-paper/80">{dek}</p>}
        {children}
      </Container>
    </section>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: [T, string][]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0", className)}>
      {tabs.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={value === k} data-testid={`tab-${k}`} onClick={() => onChange(k)}
          className={cn("relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors", value === k ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-[3px] after:rounded-t after:bg-primary" : "text-muted-foreground hover:text-foreground")}>{l}</button>
      ))}
    </div>
  );
}
