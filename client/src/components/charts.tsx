import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link } from "wouter";
import { type Edition, type SportRow, OLY_MEDALS, OLY_SQUADS, MEDAL_LABEL, total, isPlayed, DAILY, DAY_NOTES, PEOPLE } from "@/data";
import { MedalDot, MedalTriplet, StackBar } from "./site";
import { cn } from "@/lib/utils";

export const ord = (r: string) => /^\d+$/.test(r) ? r + (["th", "st", "nd", "rd"][(+r % 100 - 20) % 10] || ["th", "st", "nd", "rd"][+r % 100] || "th") : r;
const GOLD = "hsl(var(--gold))", SILVER = "hsl(var(--silver))", BRONZE = "hsl(var(--bronze))";

function TipBox({ title, g, s, b, foot }: { title: string; g: number; s: number; b: number; foot?: string }) {
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-xl">
      <p className="font-bold">{title}</p>
      <MedalTriplet g={g} s={s} b={b} size="sm" className="mt-1" />
      <p className="mt-1 text-xs text-muted-foreground">{foot ?? `${g + s + b} medals`}</p>
    </div>
  );
}

/* ------- Edition column chart: click a column to open details ------- */
export function EditionChart({ data, games, onPick, height = 300 }: { data: Edition[]; games: string; onPick: (e: Edition) => void; height?: number }) {
  const rows = data.map(e => ({ ...e, label: String(e.y), gap: e.dnp || e.upcoming ? 0.4 : 0 }));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="w-full" data-testid={`chart-editions-${games}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} margin={{ top: 8, right: 4, left: -22, bottom: 0 }} barCategoryGap="18%" style={{ cursor: "pointer" }}
          onClick={(st: any) => { const e = st?.activePayload?.[0]?.payload ?? (st?.activeTooltipIndex != null ? rows[st.activeTooltipIndex] : null); if (e && !e.dnp && !e.upcoming) onPick(e); }}
          onMouseMove={(s: any) => setHover(s?.activeTooltipIndex ?? null)} onMouseLeave={() => setHover(null)}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={6} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={44} />
          <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.6 }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null; const e = payload[0].payload as Edition;
            if (e.dnp) return <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-xl"><b>{e.host} {e.y}</b><p className="text-xs text-muted-foreground">India did not take part</p></div>;
            if (e.upcoming) return <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-xl"><b>{e.host} {e.y}</b><p className="text-xs text-muted-foreground">Upcoming</p></div>;
            return <TipBox title={`${e.host} ${e.y}`} g={e.g} s={e.s} b={e.b} foot={`${total(e)} medals${e.rank ? ` · ${ord(e.rank)}` : ""} · click for details`} />;
          }} />
          {(["b", "s", "g"] as const).map((k, i) => (
            <Bar key={k} dataKey={k} stackId="m" fill={[BRONZE, SILVER, GOLD][i]} radius={k === "g" ? [3, 3, 0, 0] : 0} isAnimationActive>
              {rows.map((r, j) => <Cell key={j} fillOpacity={hover === null || hover === j ? 1 : 0.45} />)}
            </Bar>
          ))}
          <Bar dataKey="gap" stackId="m" fill="hsl(var(--muted-foreground))" fillOpacity={0.25} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><MedalDot m="G" />Gold</span><span className="flex items-center gap-1.5"><MedalDot m="S" />Silver</span><span className="flex items-center gap-1.5"><MedalDot m="B" />Bronze</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-muted-foreground/25" />Did not take part or upcoming</span>
      </div>
    </div>
  );
}

/* ------- Edition strip: horizontally scrollable cards ------- */
export function EditionStrip({ data, onPick, active }: { data: Edition[]; onPick: (e: Edition) => void; active?: number }) {
  const list = [...data].filter(e => !e.dnp).reverse();
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {list.map(e => (
        <button key={e.y} onClick={() => !e.upcoming && onPick(e)} disabled={e.upcoming} data-testid={`edition-${e.y}`}
          className={cn("group w-44 shrink-0 snap-start rounded-lg border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-border", active === e.y ? "border-primary" : "border-border")}>
          <span className="font-display text-3xl font-semibold tnum">{e.y}</span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">{e.host}</span>
          {e.upcoming ? <span className="mt-4 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">Upcoming</span> : (
            <>
              <StackBar g={e.g} s={e.s} b={e.b} className="mt-4" />
              <span className="mt-2 flex items-baseline justify-between text-sm"><b className="tnum">{total(e)} medals</b>{e.rank && <span className="text-xs text-muted-foreground">#{e.rank.replace(/\D/g, "") || e.rank}</span>}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------- Side panel with a Games' details ------- */
export function EditionSheet({ edition, games, onClose }: { edition: Edition | null; games: "oly" | "cwg" | "asian"; onClose: () => void }) {
  const medals = useMemo(() => (edition && games === "oly" ? OLY_MEDALS.filter(m => m.y === edition.y) : []), [edition, games]);
  const name = games === "oly" ? "Olympic Games" : games === "cwg" ? "Commonwealth Games" : "Asian Games";
  const personSlug = (n: string) => PEOPLE.find(p => p.name.toLowerCase() === n.toLowerCase())?.slug;
  return (
    <Sheet open={!!edition} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg" data-testid="sheet-edition">
        {edition && <>
          <SheetHeader className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{name}</p>
            <SheetTitle className="font-display text-4xl font-semibold leading-none">{edition.host} {edition.y}</SheetTitle>
            <SheetDescription>{edition.rank ? `India ranked ${ord(edition.rank)}` : "India's results"}{edition.ath ? ` with ${edition.ath} athletes` : ""}.</SheetDescription>
          </SheetHeader>
          {isPlayed(edition) && <div className="mt-6 grid grid-cols-4 gap-2 rounded-lg border border-border p-4 text-center">
            {[["Gold", edition.g, "bg-gold"], ["Silver", edition.s, "bg-silver"], ["Bronze", edition.b, "bg-bronze"], ["Total", total(edition), "bg-foreground"]].map(([l, v, c]) => (
              <div key={l as string}><span className={cn("mx-auto mb-2 block h-1 w-6 rounded-full", c as string)} /><p className="font-display text-3xl font-semibold tnum">{v as number}</p><p className="text-xs text-muted-foreground">{l as string}</p></div>
            ))}
          </div>}
          {edition.note && <p className="mt-6 text-pretty leading-relaxed">{edition.note}</p>}
          {medals.length > 0 && <div className="mt-8">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">Medallists</h3>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {medals.map((m, i) => { const s = personSlug(m.n); return (
                <li key={i} className="flex items-start gap-3 p-3">
                  <MedalDot m={m.m} className="mt-1.5" />
                  <div className="min-w-0">
                    {s ? <Link href={`/athletes/${s}`} className="font-bold hover:text-primary">{m.n}</Link> : <p className="font-bold">{m.n}</p>}
                    <p className="text-sm text-muted-foreground">{m.sp} · {m.ev} · {MEDAL_LABEL[m.m]}</p>
                    {m.sp === "Hockey" && OLY_SQUADS[String(m.y)] && <p className="mt-1 text-xs text-muted-foreground">Squad included {OLY_SQUADS[String(m.y)]}</p>}
                  </div>
                </li>); })}
            </ul>
          </div>}
          {games !== "oly" && <p className="mt-8 text-sm text-muted-foreground">Full medallist lists for this Games are on the official results archive. Use the sport breakdown on this page for India's strongest disciplines.</p>}
        </>}
      </SheetContent>
    </Sheet>
  );
}

/* ------- Sport bars ------- */
export function SportBars({ rows, limit, testid }: { rows: SportRow[]; limit?: number; testid?: string }) {
  const [all, setAll] = useState(false);
  const sorted = [...rows].sort((a, b) => (b[1] + b[2] + b[3]) - (a[1] + a[2] + a[3]) || b[1] - a[1]);
  const shown = limit && !all ? sorted.slice(0, limit) : sorted;
  const max = sorted[0][1] + sorted[0][2] + sorted[0][3];
  return (
    <div data-testid={testid}>
      <ul className="space-y-3.5">
        {shown.map(([sp, g, s, b]) => (
          <li key={sp} className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3 sm:grid-cols-[11rem_1fr_7rem]">
            <span className="truncate text-sm font-bold" title={sp}>{sp}</span>
            <StackBar g={g} s={s} b={b} max={max} className="h-3" />
            <span className="text-right text-sm tnum"><b>{g + s + b}</b><span className="hidden text-muted-foreground sm:inline"> · {g}/{s}/{b}</span></span>
          </li>
        ))}
      </ul>
      {limit && sorted.length > limit && <button onClick={() => setAll(!all)} data-testid={`${testid}-toggle`} className="mt-5 text-sm font-bold text-primary hover:underline">{all ? "Show fewer sports" : `Show all ${sorted.length} sports`}</button>}
    </div>
  );
}

/* ------- Daily medals (Asian Games 2026) ------- */
export function DailyChart() {
  let c = 0;
  const rows = DAILY.map(d => ({ day: d[0], date: d[1], g: d[2], s: d[3], b: d[4], t: d[2] + d[3] + d[4], cum: (c += d[2] + d[3] + d[4]) }));
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="mb-3 text-sm font-bold">Medals per day</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} interval={2} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={44} />
            <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={({ active, payload }) => { if (!active || !payload?.length) return null; const r: any = payload[0].payload; return <TipBox title={`${r.date} (${r.day})`} g={r.g} s={r.s} b={r.b} foot={DAY_NOTES[r.day] ?? `${r.t} medals`} />; }} />
            <Bar dataKey="b" stackId="d" fill={BRONZE} /><Bar dataKey="s" stackId="d" fill={SILVER} /><Bar dataKey="g" stackId="d" fill={GOLD} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold">Running total</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={rows} margin={{ top: 4, right: 8, left: -26, bottom: 0 }}>
            <defs><linearGradient id="cumfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} interval={2} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={44} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-xl"><b>{(payload[0].payload as any).date}</b><p>{(payload[0].payload as any).cum} medals so far</p></div> : null} />
            <Area type="monotone" dataKey="cum" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#cumfill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
