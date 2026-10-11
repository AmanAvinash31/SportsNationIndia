/* Search and social metadata for every route.
   Pure data, no browser APIs: imported by the client (titles while navigating)
   and by the server (meta tags, JSON-LD, crawler-readable HTML, sitemap). */
import { ARTICLES, PEOPLE, FAQS, UPDATED, personMedals, fmtDate } from "../data";

export const SITE_NAME = "Momentum India";
export const TAGLINE = "Celebrating the rise of a sporting nation";
const DEFAULT_IMG = "/img/hero-javelin.webp";

export type Crumb = [string, string];
export interface Seo {
  path: string;            // canonical path
  title: string;           // full <title>
  description: string;
  image: string;           // site-relative
  type: "website" | "article" | "profile";
  status: 200 | 404;
  noindex?: boolean;
  h1: string;
  body: string[];          // crawler-readable paragraphs
  links?: Crumb[];         // related internal links [label, path]
  crumbs?: Crumb[];
  jsonld?: Record<string, unknown>[];
  published?: string;
}

type Page = { t: string; d: string; img?: string; h1?: string; body?: string[]; links?: Crumb[]; crumbs?: Crumb[] };
const P: Record<string, Page> = {
  "/": { t: `${SITE_NAME} · ${TAGLINE}`, h1: `${SITE_NAME}: ${TAGLINE}`,
    d: "Results, medal history and athlete stories for India at the Olympics, Asian Games and Commonwealth Games, plus tools to grow sport from the grassroots.",
    body: ["India finished fourth at the Aichi-Nagoya 2026 Asian Games with 85 medals and fourth at Glasgow 2026. Follow every medal, athlete and Games, and help build the next generation."] },
  "/news": { t: "Indian sport news and analysis", d: "The latest news and analysis on India at the Asian Games, Commonwealth Games and Olympics.", img: "/img/crowd.webp" },
  "/medals": { t: "India medal history: Olympics, Commonwealth and Asian Games", d: "Every Indian medal across the Olympics, Commonwealth Games and Asian Games, with edition-by-edition tables and downloadable data.", img: "/img/hockey.webp" },
  "/medals/olympics": { t: "India at the Olympics: all 41 medals since 1900", d: "Every Olympic medal India has won, by year, sport and athlete, from 1900 to Paris 2024.", img: "/img/hockey.webp", crumbs: [["Medal history", "/medals"]] },
  "/medals/commonwealth": { t: "India at the Commonwealth Games: medal history", d: "India's Commonwealth Games medals by edition and sport, including Glasgow 2026.", img: "/img/weightlifting.webp", crumbs: [["Medal history", "/medals"]] },
  "/medals/asian-games": { t: "India at the Asian Games: the last five editions", d: "India's Asian Games medal tally from 2010 to Aichi-Nagoya 2026, by edition and sport.", img: "/img/cricket.webp", crumbs: [["Medal history", "/medals"]] },
  "/games/asian-games-2026": { t: "Asian Games 2026: India medal tally and results", d: "India finished 4th at Aichi-Nagoya 2026 with 85 medals: 21 gold, 27 silver and 37 bronze. Full medal table, day-by-day results and medallists.", img: "/img/hockey.webp" },
  "/games/asian-para-games-2026": { t: "Asian Para Games 2026: India live medal tally and results", h1: "Asian Para Games 2026 live hub",
    d: "Live medal tally for India at the Aichi-Nagoya 2026 Asian Para Games, 18 to 24 October: medallists, contenders, the 121-strong squad and where to watch.", img: "/img/relay.webp",
    body: ["The 5th Asian Para Games run from 18 to 24 October 2026 in Aichi-Nagoya, Japan, with 18 sports and 492 medal events. India's flag bearers are Pramod Bhagat and Bhavina Patel. India won a record 111 medals at Hangzhou 2022: 29 gold, 31 silver and 51 bronze."],
    links: [["Para sport hub", "/para"], ["Fan zone predictions", "/fan-zone"], ["Where to watch", "/watch"]] },
  "/watch": { t: "Where to watch Indian sport: TV channels, streaming and times in IST", h1: "Where to watch",
    d: "Which channel and app shows the ISL, Asian Para Games, Pro Kabaddi, Hockey India League and LA 2028 in India, with start times in IST and calendar reminders.", img: "/img/crowd.webp",
    body: ["The Indian Super League 2026-27 is on Sony Sports Network and SonyLIV, and free on YouTube. The season starts on 10 October 2026."] },
  "/leagues": { t: "Indian sports leagues: ISL, Pro Kabaddi and Hockey India League", h1: "India's leagues",
    d: "Fixtures, results, tables and where to watch for the Indian Super League, Pro Kabaddi League and Hockey India League.", img: "/img/stadium.webp",
    body: ["The ISL 2026-27 season starts on 10 October 2026 with 13 clubs. Pro Kabaddi Season 13 dates are yet to be announced. The Hockey India League returns in January 2027."] },
  "/states": { t: "State medal leaderboards: Khelo India Youth Games and National Games", h1: "State leaderboards",
    d: "Which Indian states win the most medals: Khelo India Youth Games 2025 and National Games 2025 tables, plus districts producing local stars.", img: "/img/youth-training.webp",
    body: ["Maharashtra topped the 2025 Khelo India Youth Games with 158 medals, 58 of them gold. Services won the 2025 National Games with 68 gold medals."] },
  "/fan-zone": { t: "Fan zone: predictions, sports quiz and on this day", h1: "Fan zone",
    d: "Predict India's results and climb the leaderboard, take a quiz on India's Olympic history, and see what happened on this day.", img: "/img/celebration.webp" },
  "/clubs": { t: "Sports clubs and coaches near you in India", h1: "Clubs and coaches",
    d: "A verified directory of local sports clubs, academies and coaches in India, with fees, timings, ages and girls-only sessions.", img: "/img/academy.webp" },
  "/adopt-a-ground": { t: "Adopt a ground and donate sports gear", h1: "Adopt a ground and gear exchange",
    d: "Fund the upkeep, floodlights or kit for a local sports ground, and pass on outgrown sports gear to young athletes in India.", img: "/img/youth-training.webp" },
  "/games/glasgow-2026": { t: "Glasgow 2026 Commonwealth Games: India results", d: "India's results at the Glasgow 2026 Commonwealth Games: 39 medals and 4th on the table.", img: "/img/boxing.webp" },
  "/games/ahmedabad-2030": { t: "Ahmedabad 2030: India hosts the Centenary Commonwealth Games", d: "Guide to the 2030 Commonwealth Games in Ahmedabad: venues, tickets, volunteering and the city.", img: "/img/stadium.webp" },
  "/athletes": { t: "Indian athletes: profiles and medals", d: "Profiles of India's Olympic, Asian Games and Commonwealth Games medallists, with career medals by Games.", img: "/img/relay.webp" },
  "/road-to-la-2028": { t: "Road to LA 2028: India's Olympic medal hopes", d: "Countdown, qualification timeline and India's medal watchlist for the Los Angeles 2028 Olympics.", img: "/img/celebration.webp" },
  "/sporting-nation": { t: "Build a sporting nation: grassroots sport in India", h1: "Build a sporting nation",
    d: "What the US, China and the Netherlands do differently, and how India can catch up: a grassroots playbook, local stars, competitions and sponsors for budding talent.", img: "/img/youth-training.webp",
    body: ["At Paris 2024 the United States won 126 Olympic medals, China 91, the Netherlands 34 and India 6. Each leading nation built a system: college sport in the US, mass talent identification and play spaces in China, and volunteer community clubs in the Netherlands.",
      "Take the grassroots pledge as a parent, school, panchayat, company or fan. Nominate a local star, list a local tournament in the community calendar, or sponsor a budding athlete for kit, a season or a full year."],
    links: [["Pathway for parents", "/pathway"], ["Facilities by state", "/facilities"], ["Where champions began", "/stories"]] },
  "/pathway": { t: "Sports pathway for young athletes and parents in India", d: "From school sport to Khelo India and TOPS: the pathway, schemes, scholarships, safety and a find-my-sport quiz.", img: "/img/youth-training.webp" },
  "/facilities": { t: "Sports facilities by state: SAI centres and Khelo India academies", d: "Find SAI training centres, Khelo India academies and centres in every Indian state, with maps and contacts.", img: "/img/academy.webp" },
  "/stories": { t: "Where champions began: origin stories of Indian athletes", d: "Sourced stories of how India's champions started, from village grounds to the podium.", img: "/img/wrestling.webp" },
  "/golden-moments": { t: "Golden moments: India's greatest sporting wins", d: "A slideshow of India's greatest wins at the Olympics, Asian Games and Commonwealth Games.", img: "/img/hockey.webp" },
  "/para": { t: "Para sport hub: India at the Paralympics and Asian Para Games", d: "India's 29 Paris Paralympic medals, the Asian Para Games and how to get into para sport.", img: "/img/relay.webp" },
  "/women": { t: "Women in Indian sport", d: "Every Olympic medal won by Indian women, girls' places in sport and safe-sport resources.", img: "/img/badminton.webp" },
  "/my-momentum": { t: "My Momentum: follow athletes and sports", d: "Follow Indian athletes, sports and Games and get alerts by email or WhatsApp.", img: "/img/crowd.webp" },
  "/schedule": { t: "Schedule and countdowns: upcoming Games for India", d: "Dates and countdowns for the Asian Para Games, LA 2028 Olympics and Ahmedabad 2030.", img: "/img/stadium.webp" },
  "/hall-of-fame": { t: "Hall of fame: the legends of Indian sport", d: "The athletes who defined Indian sport across the Olympics, Asian Games and Commonwealth Games.", img: "/img/hockey.webp" },
  "/sports": { t: "Sports guide: where India wins medals", d: "Every sport India competes in at the Olympics, Asian Games and Commonwealth Games.", img: "/img/archery.webp" },
  "/nations": { t: "Nations: India against Asia and the Commonwealth", d: "How India compares with other nations at the Asian Games and Commonwealth Games.", img: "/img/crowd.webp" },
  "/faq": { t: "Frequently asked questions", d: "Answers on India's medal counts, upcoming Games and how to use Momentum India." },
  "/about": { t: "About Momentum India", d: "An independent fan publication covering India at the Olympics, Asian Games and Commonwealth Games." },
  "/about/standards": { t: "Editorial standards and corrections", d: "How Momentum India sources, checks and corrects its reporting.", crumbs: [["About", "/about"]] },
  "/about/credits": { t: "Data credits and sources", d: "The data sources behind Momentum India's medal tables and profiles.", crumbs: [["About", "/about"]] },
  "/about/legal": { t: "Privacy and terms", d: "How Momentum India handles your data, and the terms of use.", crumbs: [["About", "/about"]] },
};
const ALIASES: Record<string, string> = { "/sporting-nation/benchmark": "/sporting-nation", "/sporting-nation/playbook": "/sporting-nation", "/sporting-nation/stars": "/sporting-nation", "/sporting-nation/compete": "/sporting-nation", "/sporting-nation/sponsor": "/sporting-nation" };

const clip = (s: string, n = 158) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + "…");
const imgPath = (p: string) => p.replace(/^\.\//, "/");
const withSite = (t: string) => (t.includes(SITE_NAME) ? t : `${t} · ${SITE_NAME}`);

export function seoFor(rawPath: string): Seo {
  let path = (rawPath.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  path = ALIASES[path] ?? path;

  const a = path.match(/^\/news\/([^/]+)$/);
  if (a) {
    const art = ARTICLES.find(x => x.slug === a[1]);
    if (art) {
      const lead = art.body || ""; const d = clip(lead.length < 110 ? [lead, ...art.paras.filter(x => x !== lead)].join(" ") : lead);
      return { path, title: withSite(art.title), description: d, image: imgPath(art.img), type: "article", status: 200, h1: art.title, body: art.paras.length ? art.paras : [art.body],
        published: art.date, crumbs: [["News", "/news"]],
        jsonld: [{ "@context": "https://schema.org", "@type": "NewsArticle", headline: art.title, description: d, datePublished: art.date, dateModified: art.date,
          image: [imgPath(art.img)], author: { "@type": "Organization", name: SITE_NAME }, publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: "/favicon.svg" } }, mainEntityOfPage: path }] };
    }
  }
  const p = path.match(/^\/athletes\/([^/]+)$/);
  if (p) {
    const per = PEOPLE.find(x => x.slug === p[1]);
    if (per) {
      const m = personMedals(per); const tot = m.G + m.S + m.B;
      const d = clip(`${per.name}, ${per.sport}. ${per.tagline ? per.tagline + " " : ""}${tot ? `${tot} major Games medal${tot > 1 ? "s" : ""}: ${m.G} gold, ${m.S} silver, ${m.B} bronze.` : ""}`);
      return { path, title: withSite(`${per.name}: ${per.sport} profile and medals`), description: d, image: imgPath(per.img), type: "profile", status: 200, h1: per.name,
        body: [d, ...per.career.slice(0, 12).map(c => `${c.games} ${c.year}: ${c.medal ? ({ G: "Gold", S: "Silver", B: "Bronze" } as const)[c.medal] + ", " : ""}${c.event}`), ...per.honours.slice(0, 8)],
        crumbs: [["Athletes", "/athletes"]],
        jsonld: [{ "@context": "https://schema.org", "@type": per.isTeam ? "SportsTeam" : "Person", name: per.name, ...(per.isTeam ? { sport: per.sport } : { nationality: "Indian", jobTitle: `${per.sport} athlete` }), description: d, url: path }] };
    }
  }
  if (path === "/admin") return { path, title: withSite("Admin"), description: "Moderation dashboard.", image: DEFAULT_IMG, type: "website", status: 200, noindex: true, h1: "Admin", body: [] };
  const page = P[path];
  if (!page) return { path, title: withSite("Page not found"), description: "This page doesn't exist.", image: DEFAULT_IMG, type: "website", status: 404, noindex: true, h1: "Page not found", body: [] };

  const s: Seo = { path, title: withSite(page.t), description: page.d, image: page.img ?? DEFAULT_IMG, type: "website", status: 200, h1: page.h1 ?? page.t, body: page.body ?? [page.d], links: page.links, crumbs: page.crumbs, jsonld: [] };
  if (path === "/news") s.links = ARTICLES.slice(0, 30).map(x => [`${x.title} (${fmtDate(x.date)})`, `/news/${x.slug}`]);
  if (path === "/athletes") s.links = PEOPLE.slice(0, 80).map(x => [`${x.name}, ${x.sport}`, `/athletes/${x.slug}`]);
  if (path === "/faq") {
    s.body = FAQS.flatMap(([q, ans]) => [q, ans]);
    s.jsonld!.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) });
  }
  if (path === "/games/asian-para-games-2026") s.jsonld!.push({ "@context": "https://schema.org", "@type": "SportsEvent", name: "Asian Para Games 2026", alternateName: "Aichi-Nagoya 2026",
    startDate: "2026-10-18", endDate: "2026-10-24", eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: "Aichi-Nagoya", address: { "@type": "PostalAddress", addressLocality: "Nagoya", addressRegion: "Aichi", addressCountry: "JP" } }, url: path });
  if (path === "/") s.jsonld!.push(
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, alternateName: TAGLINE, url: "/" },
    { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, slogan: TAGLINE, url: "/", logo: "/favicon.svg" },
  );
  return s;
}

/** Every indexable path, for sitemap.xml. */
export function sitemapEntries(): { path: string; lastmod?: string; priority: number }[] {
  const updated = new Date(UPDATED + " UTC");
  const iso = isNaN(+updated) ? undefined : updated.toISOString().slice(0, 10);
  return [
    ...Object.keys(P).map(path => ({ path, lastmod: iso, priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8 })),
    ...ARTICLES.map(a => ({ path: `/news/${a.slug}`, lastmod: a.date, priority: 0.7 })),
    ...PEOPLE.map(x => ({ path: `/athletes/${x.slug}`, lastmod: iso, priority: x.featured ? 0.6 : 0.4 })),
  ];
}

/** Old addresses that permanently move. Used for client redirects and server 301s. */
export const LEGACY: [string, string][] = [
  ["/india-medal-history", "/medals"], ["/medal-history", "/medals"], ["/olympic-history", "/medals/olympics"], ["/cwg-history", "/medals/commonwealth"],
  ["/history", "/medals"], ["/asian-games-2026", "/games/asian-games-2026"], ["/glasgow-2026", "/games/glasgow-2026"], ["/cwg-2030", "/games/ahmedabad-2030"],
  ["/tickets", "/games/ahmedabad-2030"], ["/volunteers", "/games/ahmedabad-2030"], ["/venues", "/games/ahmedabad-2030"], ["/city", "/games/ahmedabad-2030"],
  ["/blog", "/news"], ["/updates", "/news"], ["/hall", "/hall-of-fame"], ["/credits", "/about/credits"], ["/legal", "/about/legal"], ["/medals-table", "/games/asian-games-2026"], ["/la-2028", "/road-to-la-2028"], ["/parents", "/pathway"], ["/grassroots", "/sporting-nation"], ["/sponsor", "/sporting-nation/sponsor"], ["/local-stars", "/sporting-nation/stars"], ["/academies", "/facilities"], ["/success-stories", "/stories"], ["/gallery", "/golden-moments"], ["/paralympics", "/para"], ["/para-sport", "/para"], ["/women-in-sport", "/women"], ["/following", "/my-momentum"], ["/standards", "/about/standards"], ["/corrections", "/about/standards"], ["/live", "/games/asian-para-games-2026"], ["/asian-para-games", "/games/asian-para-games-2026"], ["/fan", "/fan-zone"], ["/quiz", "/fan-zone"], ["/predictions", "/fan-zone"], ["/coaches", "/clubs"], ["/gear", "/adopt-a-ground"], ["/tv", "/watch"], ["/isl", "/leagues"], ["/pkl", "/leagues"],
];

/** Primary navigation for crawler-readable HTML. */
export const CRAWL_NAV: Crumb[] = [["Home", "/"], ["News", "/news"], ["Medal history", "/medals"], ["Athletes", "/athletes"], ["Asian Para Games 2026", "/games/asian-para-games-2026"], ["Asian Games 2026", "/games/asian-games-2026"], ["Where to watch", "/watch"], ["Leagues", "/leagues"], ["State leaderboards", "/states"], ["Fan zone", "/fan-zone"], ["Clubs and coaches", "/clubs"], ["Adopt a ground", "/adopt-a-ground"], ["Glasgow 2026", "/games/glasgow-2026"], ["Ahmedabad 2030", "/games/ahmedabad-2030"], ["Road to LA 2028", "/road-to-la-2028"], ["Build a sporting nation", "/sporting-nation"], ["Pathway", "/pathway"], ["Facilities", "/facilities"], ["Para sport", "/para"], ["Women in sport", "/women"], ["FAQ", "/faq"], ["About", "/about"]];
