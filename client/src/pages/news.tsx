import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, Languages, Link2, Check } from "lucide-react";
import { ARTICLES, GAMES, fmtDate, readTime } from "@/data";
import { Container, Img, Kicker, SectionHead, Tabs, NewsletterForm } from "@/components/site";
import { StoryCard, localized } from "./home";
import { usePrefs, type Lang } from "@/lib/prefs";
import NotFound from "./not-found";
import { cn } from "@/lib/utils";

export function NewsIndex() {
  const [f, setF] = useState<"all" | "asian" | "cwg" | "oly" | "analysis">("all");
  const list = useMemo(() => ARTICLES.filter(a => f === "all" || (f === "analysis" ? a.kind === "analysis" : a.g === f && a.kind === "news")), [f]);
  const [first, ...rest] = list;
  return (
    <>
      <Container className="pt-12 md:pt-16">
        <Kicker className="text-gold-ink">Newsroom</Kicker>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,1.2rem+4vw,4.5rem)] font-semibold leading-[0.95]">News and analysis</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Reports from Aichi-Nagoya, Glasgow and the road to Los Angeles and Ahmedabad. Most stories are also available in Hindi and Gujarati.</p>
        <Tabs className="mt-8" tabs={[["all", "All"], ["asian", "Asian Games"], ["cwg", "Commonwealth"], ["oly", "Olympics"], ["analysis", "Analysis"]]} value={f} onChange={setF} />
      </Container>
      <Container className="py-10">
        {!first ? <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No stories in this section yet. Try another filter.</p> : (
          <>
            <StoryCard a={first} size="lg" className="mb-12 lg:max-w-4xl" />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{rest.map(a => <StoryCard key={a.slug} a={a} />)}</div>
          </>
        )}
      </Container>
    </>
  );
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const a = ARTICLES.find(x => x.slug === slug);
  const { lang, setLang } = usePrefs();
  const [copied, setCopied] = useState(false);
  if (!a) return <NotFound />;
  const has = (l: Lang) => l === "en" || !!(a as any)[l];
  const l = localized(a, lang);
  const related = ARTICLES.filter(x => x.slug !== a.slug && x.g === a.g).slice(0, 3);
  const copy = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ } };
  return (
    <article>
      <Container className="pt-10 md:pt-14">
        <Link href="/news" data-testid="link-back-news" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />News</Link>
        <div className="mx-auto mt-8 max-w-3xl">
          <Kicker color={GAMES[a.g]?.color} className="text-muted-foreground">{GAMES[a.g]?.label}{a.kind === "analysis" ? " · Analysis" : ""}</Kicker>
          <h1 className="mt-4 text-balance font-display text-[clamp(2.2rem,1.2rem+3.4vw,4rem)] font-semibold leading-[0.98]">{l.title}</h1>
          <p className="mt-5 text-pretty text-xl leading-relaxed text-muted-foreground">{l.body}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground font-display font-semibold text-background">MI</span>
              <div><p className="font-bold">Momentum India desk</p><p className="flex items-center gap-2 text-muted-foreground">{fmtDate(a.date)}<span>·</span><Clock className="h-3 w-3" />{readTime(a)} min read</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {(["en", "hi", "gu"] as Lang[]).map(k => (
                <button key={k} disabled={!has(k)} onClick={() => setLang(k)} data-testid={`button-article-lang-${k}`}
                  className={cn("rounded-full px-3 py-1 text-xs font-bold", lang === k ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground disabled:opacity-40")}>
                  {{ en: "English", hi: "हिन्दी", gu: "ગુજરાતી" }[k]}
                </button>
              ))}
              <button onClick={copy} data-testid="button-copy-link" aria-label="Copy link" className="ml-1 grid h-8 w-8 place-items-center rounded-full border border-border hover:text-primary">{copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}</button>
            </div>
          </div>
          {lang !== "en" && !(a as any)[lang] && <p className="mt-4 rounded-md bg-muted p-3 text-sm">This story is not translated yet, so it is shown in English.</p>}
        </div>
      </Container>
      <Container className="mt-10">
        <figure className="mx-auto max-w-5xl">
          <div className="aspect-[16/9] overflow-hidden rounded-lg"><Img src={a.img} alt="" eager /></div>
          <figcaption className="mt-2 text-xs text-muted-foreground">Illustrative photography.</figcaption>
        </figure>
      </Container>
      <Container>
        <div className="mx-auto mt-10 max-w-[68ch] space-y-6 text-[1.125rem] leading-[1.75]">
          {l.paras.map((p: string, i: number) => <p key={i} className={cn("text-pretty", i === 0 && "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-primary")}>{p}</p>)}
        </div>
        <div className="mx-auto mt-14 max-w-3xl rounded-lg bg-ink p-6 text-paper md:p-8">
          <p className="font-display text-2xl font-semibold">Get stories like this after every big day</p>
          <div className="mt-4"><NewsletterForm id="article" /></div>
        </div>
      </Container>
      {related.length > 0 && <Container className="mt-20">
        <SectionHead kicker="Keep reading" title="More from this Games" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{related.map(r => <StoryCard key={r.slug} a={r} />)}</div>
      </Container>}
    </article>
  );
}
