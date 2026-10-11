import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, LogOut, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { Container } from "@/components/site";
import { API_BASE } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type Field = { name: string; label: string; type: "text" | "textarea" | "date" | "number" | "select" | "datetime"; options?: string[]; required?: boolean; hint?: string };
type Table = { key: string; label: string; statuses: string[]; total: number; pending: number; content?: boolean; create?: Field[] | null; edit?: Field[] | null };
type Row = Record<string, string | number | null>;

// The token is held in memory only: closing or reloading the tab signs you out.
let memToken = "";
const load = () => memToken;
const save = (t: string) => { memToken = t; };

const PRIVATE = new Set(["email", "phone", "whatsapp"]);
const ACTION: Record<string, string> = { approved: "Approve and publish", rejected: "Reject", introduced: "Mark introduced", resolved: "Mark resolved", published: "Publish", hidden: "Hide", settled: "Mark settled", given: "Mark given", final: "Mark final", live: "Mark live", postponed: "Mark postponed", scheduled: "Mark scheduled", open: "Reopen" };
const STATUS_CLS: Record<string, string> = { published: "bg-indgreen/15 text-indgreen", settled: "bg-indgreen/15 text-indgreen", given: "bg-indgreen/15 text-indgreen", final: "bg-indgreen/15 text-indgreen", live: "bg-saffron/15 text-saffron", scheduled: "bg-muted", hidden: "bg-muted", postponed: "bg-muted", pending: "bg-saffron/15 text-saffron", open: "bg-saffron/15 text-saffron", approved: "bg-indgreen/15 text-indgreen", introduced: "bg-indgreen/15 text-indgreen", resolved: "bg-indgreen/15 text-indgreen", rejected: "bg-[hsl(2_75%_55%/.15)] text-[hsl(2_75%_55%)]" };

export default function AdminPage() {
  const [token, setToken] = useState(load);
  const [input, setInput] = useState("");
  const [tables, setTables] = useState<Table[] | null>(null);
  const [active, setActive] = useState("nominations");
  const [filter, setFilter] = useState("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const api = useCallback(async (url: string, init: RequestInit = {}, t = token) => {
    const r = await fetch(`${API_BASE}${url}`, { ...init, headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${t}` } });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.message ?? `Error ${r.status}`), { status: r.status }); }
    return r;
  }, [token]);

  const refresh = useCallback(async (t = token) => {
    if (!t) return;
    setBusy(true); setErr(null);
    try {
      const o = await (await api("/api/admin/overview", {}, t)).json();
      setTables(o.tables);
      const tb = (o.tables as Table[]).find(x => x.key === active)!;
      const st = tb.statuses.length ? filter : "";
      const l = await (await api(`/api/admin/${active}${st && st !== "all" ? `?status=${st}` : ""}`, {}, t)).json();
      setRows(l.rows);
    } catch (e: any) {
      setErr(e.message); if (e.status === 401) { setToken(""); save(""); setTables(null); }
    } finally { setBusy(false); }
  }, [api, active, filter, token]);

  useEffect(() => { refresh(); }, [refresh]);

  const tb = tables?.find(t => t.key === active);
  const setStatus = async (id: number, status: string) => { await api(`/api/admin/${active}/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }); refresh(); };
  const remove = async (id: number) => { if (!window.confirm("Delete this entry permanently?")) return; await api(`/api/admin/${active}/${id}`, { method: "DELETE" }); refresh(); };
  const download = async (url: string, name: string) => {
    try { const b = await (await api(url)).blob(); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); URL.revokeObjectURL(a.href); } catch (e: any) { setErr(e.message); }
  };

  if (!token) return (
    <Container className="grid min-h-[60vh] place-items-center py-16">
      <form className="w-full max-w-sm rounded-xl border border-border bg-card p-6" onSubmit={e => { e.preventDefault(); const t = input.trim(); setToken(t); save(t); refresh(t); }}>
        <p className="flex items-center gap-2 font-display text-2xl font-semibold"><ShieldCheck className="h-5 w-5 text-primary" />Admin</p>
        <p className="mt-1 text-sm text-muted-foreground">Review submissions before they go public. Enter the ADMIN_TOKEN set on the server.</p>
        <input type="password" autoComplete="current-password" value={input} onChange={e => setInput(e.target.value)} placeholder="Admin token" data-testid="admin-token"
          className="mt-4 h-11 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-primary" />
        {err && <p role="alert" className="mt-2 text-sm font-bold text-[hsl(2_75%_55%)]">{err}</p>}
        <button className="mt-4 h-11 w-full rounded-full bg-primary font-bold text-primary-foreground" data-testid="admin-login">Sign in</button>
      </form>
    </Container>
  );

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold"><ShieldCheck className="h-6 w-6 text-primary" />Moderation</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => refresh()} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-muted">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh</button>
          <button onClick={() => download("/api/admin-backup", `momentum-india-${new Date().toISOString().slice(0, 10)}.db`)} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-muted"><Download className="h-4 w-4" />Database backup</button>
          <button onClick={() => { setToken(""); save(""); setTables(null); }} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-muted"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </div>
      {err && <p role="alert" className="mb-4 rounded-md bg-[hsl(2_75%_55%/.1)] p-3 text-sm font-bold text-[hsl(2_75%_55%)]">{err}</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {(tables ?? []).map(t => (
          <button key={t.key} onClick={() => { setActive(t.key); setFilter(t.statuses[0] ?? "all"); }} data-testid={`admin-tab-${t.key}`}
            className={cn("rounded-lg border p-3 text-left transition", active === t.key ? "border-primary bg-primary/10" : "border-border bg-card hover:border-foreground/40")}>
            <p className="text-sm font-bold leading-tight">{t.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.total} total{t.statuses.length && !t.content ? <> · <b className={t.pending ? "text-saffron" : ""}>{t.pending} to review</b></> : t.content ? <> · you add these</> : null}</p>
          </button>
        ))}
      </div>

      {tb && (
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {[...tb.statuses, "all"].filter((v, i, a) => a.indexOf(v) === i && (tb.statuses.length || v === "all")).map(s => (
                <button key={s} onClick={() => setFilter(s)} className={cn("rounded-full px-3 py-1.5 text-sm font-bold capitalize", filter === s || (!tb.statuses.length && s === "all") ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{s}</button>
              ))}
            </div>
            <button onClick={() => download(`/api/admin/export/${tb.key}`, `${tb.key}.csv`)} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-muted"><Download className="h-4 w-4" />Export CSV</button>
          </div>
          {tb.create && <CreateForm key={tb.key} fields={tb.create} onSave={async body => { await api(`/api/admin/${tb.key}`, { method: "POST", body: JSON.stringify(body) }); refresh(); }} />}
          {tb.key === "live_medals" && <FeedPanel api={api} />}
          {rows.length === 0 ? <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">Nothing here.</p> : (
            <ul className="space-y-3">
              {rows.map(r => (
                <li key={String(r.id)} className="rounded-lg border border-border bg-card p-4" data-testid={`admin-row-${r.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs text-muted-foreground">#{r.id} · {String(r.created ?? "")}</p>
                    {r.status != null && <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold capitalize", STATUS_CLS[String(r.status)] ?? "bg-muted")}>{r.status}</span>}
                  </div>
                  <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {Object.entries(r).filter(([k]) => !["id", "created", "status"].includes(k)).map(([k, v]) => (
                      <div key={k} className={cn("min-w-0", String(v ?? "").length > 60 && "sm:col-span-2")}><dt className="inline font-bold capitalize">{k.replace(/_/g, " ")}: </dt><dd className={cn("inline break-words", PRIVATE.has(k) && "font-mono")}>{v == null || v === "" ? "—" : String(v)}</dd></div>
                    ))}
                  </dl>
                  {tb.edit && <EditRow fields={tb.edit} row={r} onSave={async body => { await api(`/api/admin/${tb.key}/${r.id}`, { method: "PATCH", body: JSON.stringify(body) }); refresh(); }} />}
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    {tb.statuses.filter(s => s !== r.status).map(s => (
                      <button key={s} onClick={() => setStatus(Number(r.id), s)} data-testid={`admin-${s}-${r.id}`} className={cn("rounded-full px-3 py-1.5 text-sm font-bold", ["approved", "introduced", "resolved", "published", "settled", "given", "final"].includes(s) ? "bg-indgreen text-white" : "border border-border hover:bg-muted")}>{ACTION[s] ?? `Move back to ${s}`}</button>
                    ))}
                    <button onClick={() => remove(Number(r.id))} className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold text-[hsl(2_75%_55%)] hover:bg-muted"><Trash2 className="h-4 w-4" />Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Container>
  );
}

const inp = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary";
function Input({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  if (f.type === "select") return <select className={inp} value={value} onChange={e => onChange(e.target.value)}><option value="">Choose</option>{f.options!.map(o => <option key={o}>{o}</option>)}</select>;
  if (f.type === "textarea") return <textarea className={cn(inp, "h-24 py-2")} value={value} onChange={e => onChange(e.target.value)} />;
  return <input className={inp} type={f.type === "datetime" ? "datetime-local" : f.type} value={value} onChange={e => onChange(e.target.value)} />;
}
function CreateForm({ fields, onSave }: { fields: Field[]; onSave: (b: Record<string, string>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="mb-4 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground" data-testid="admin-add">Add new entry</button>;
  return (
    <form className="mb-6 rounded-lg border border-primary/40 bg-card p-4" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setErr(null);
      const body: Record<string, string> = { ...v };
      for (const f of fields) if (f.type === "datetime" && body[f.name]) body[f.name] = new Date(body[f.name]).toISOString();
      try { await onSave(body); setV({}); setOpen(false); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">{fields.map(f => (
        <label key={f.name} className="block text-sm"><span className="mb-1 block font-bold">{f.label}{f.required && " *"}</span><Input f={f} value={v[f.name] ?? ""} onChange={x => setV({ ...v, [f.name]: x })} />{f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}</label>
      ))}</div>
      {err && <p role="alert" className="mt-3 text-sm font-bold text-[hsl(2_75%_55%)]">{err}</p>}
      <div className="mt-4 flex gap-2"><button disabled={busy} className="h-10 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground" data-testid="admin-create-save">{busy ? "Saving" : "Save"}</button><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-full border border-border px-5 text-sm font-bold">Cancel</button></div>
    </form>
  );
}
function EditRow({ fields, row, onSave }: { fields: Field[]; row: Row; onSave: (b: Record<string, string>) => Promise<void> }) {
  const init = () => Object.fromEntries(fields.map(f => { const x = row[f.name]; return [f.name, x == null ? "" : f.type === "datetime" ? toLocal(String(x)) : String(x)]; }));
  const [v, setV] = useState<Record<string, string>>(init);
  const [err, setErr] = useState<string | null>(null);
  const opts = typeof row.options === "string" ? String(row.options).split("|").map(x => x.trim()) : null;
  return (
    <form className="mt-3 flex flex-wrap items-end gap-2 rounded-md bg-muted/50 p-3" onSubmit={async e => {
      e.preventDefault(); setErr(null);
      const body: Record<string, string> = {}; for (const f of fields) body[f.name] = f.type === "datetime" && v[f.name] ? new Date(v[f.name]).toISOString() : v[f.name];
      try { await onSave(body); } catch (x: any) { setErr(x.message); }
    }}>
      {fields.map(f => (
        <label key={f.name} className="block min-w-[9rem] flex-1 text-xs"><span className="mb-1 block font-bold">{f.label}</span>
          {f.name === "answer" && opts ? <select className={inp} value={v.answer} onChange={e => setV({ ...v, answer: e.target.value })} data-testid={`admin-answer-${row.id}`}><option value="">Not settled</option>{opts.map(o => <option key={o}>{o}</option>)}</select>
            : <Input f={f} value={v[f.name]} onChange={x => setV({ ...v, [f.name]: x })} />}</label>
      ))}
      <button className="h-10 rounded-full bg-foreground px-4 text-sm font-bold text-background" data-testid={`admin-edit-save-${row.id}`}>Save</button>
      {err && <p role="alert" className="w-full text-sm font-bold text-[hsl(2_75%_55%)]">{err}</p>}
    </form>
  );
}
const toLocal = (iso: string) => { const d = new Date(iso); if (isNaN(+d)) return ""; const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 16); };
function FeedPanel({ api }: { api: (u: string, i?: RequestInit) => Promise<Response> }) {
  const [info, setInfo] = useState<{ url: string | null; log: { source: string; medals: number; fixtures: number; error: string | null; created: string }[] } | null>(null);
  useEffect(() => { api("/api/admin-feed").then(r => r.json()).then(setInfo).catch(() => {}); }, [api]);
  if (!info) return null;
  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-4 text-sm">
      <p className="font-bold">Automatic results feed: {info.url ? "on" : "off"}</p>
      <p className="mt-1 text-muted-foreground">{info.url ? "The server checks RESULTS_FEED_URL on a timer and adds new medals and scores." : "Set RESULTS_FEED_URL on the server to pull results automatically, or POST them to /api/admin-ingest. See DEPLOY.md."}</p>
      {info.log.length > 0 && <ul className="mt-2 space-y-1 font-mono text-xs">{info.log.map((l, i) => <li key={i}>{l.created} · {l.source} · {l.error ? `error: ${l.error}` : `${l.medals} medals, ${l.fixtures} fixtures`}</li>)}</ul>}
    </div>
  );
}
