import { useEffect, useState } from "react";
import { Switch, Route, Router, Redirect, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrefsProvider, usePrefs } from "@/lib/prefs";
import { MotionConfig } from "framer-motion";
import { ScrollButtons, Header, Ticker, Footer, SearchPalette, SubscribeDialog } from "@/components/site";
import Home from "@/pages/home";
import { NewsIndex, ArticlePage } from "@/pages/news";
import { MedalsOverview, MedalsGames } from "@/pages/medals";
import { AsianGames2026, Glasgow2026, Ahmedabad2030 } from "@/pages/games";
import { AthletesIndex, AthleteProfile } from "@/pages/athletes";
import { Schedule, HallOfFame, Sports, Nations, Faq, About } from "@/pages/explore";
import { RoadToLA, Pathway, Facilities, Stories, GoldenMoments } from "@/pages/rise";
import { ParaHub, WomenInSport, MyMomentum } from "@/pages/plus";
import SportingNation from "@/pages/nation";
import NotFound from "@/pages/not-found";
import { LEGACY, seoFor } from "@/lib/seo";
import AdminPage from "@/pages/admin";
import { ParaGames2026, WhereToWatch, Leagues, StateLeaderboards } from "@/pages/live";
import FanZone from "@/pages/fan";
import { Clubs, AdoptGround } from "@/pages/community";


const PATH_MODE = typeof window !== "undefined" && !!(window as any).__MI_PATH__;

function setMeta(sel: string, attr: string, val: string, create: () => HTMLElement) {
  let el = document.head.querySelector(sel) as HTMLElement | null;
  if (!el) { el = create(); document.head.appendChild(el); }
  el.setAttribute(attr, val);
}

function ScrollTop() {
  const [loc] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc]);
  // Keep title, description and canonical in step with the page for share sheets and crawlers that run JavaScript.
  useEffect(() => {
    const s = seoFor(loc);
    document.title = s.title;
    setMeta('meta[name="description"]', "content", s.description, () => Object.assign(document.createElement("meta"), { name: "description" }));
    setMeta('meta[name="robots"]', "content", s.noindex ? "noindex, follow" : "index, follow", () => Object.assign(document.createElement("meta"), { name: "robots" }));
    if (PATH_MODE) setMeta('link[rel="canonical"]', "href", window.location.origin + s.path, () => Object.assign(document.createElement("link"), { rel: "canonical" }));
  }, [loc]);
  return null;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/news" component={NewsIndex} />
      <Route path="/news/:slug" component={ArticlePage} />
      <Route path="/medals" component={MedalsOverview} />
      <Route path="/medals/:games" component={MedalsGames} />
      <Route path="/games/asian-games-2026" component={AsianGames2026} />
      <Route path="/games/asian-para-games-2026" component={ParaGames2026} />
      <Route path="/watch" component={WhereToWatch} />
      <Route path="/leagues" component={Leagues} />
      <Route path="/states" component={StateLeaderboards} />
      <Route path="/fan-zone" component={FanZone} />
      <Route path="/clubs" component={Clubs} />
      <Route path="/adopt-a-ground" component={AdoptGround} />
      <Route path="/games/glasgow-2026" component={Glasgow2026} />
      <Route path="/games/ahmedabad-2030" component={Ahmedabad2030} />
      <Route path="/athletes" component={AthletesIndex} />
      <Route path="/athletes/:slug" component={AthleteProfile} />
      <Route path="/road-to-la-2028" component={RoadToLA} />
      <Route path="/sporting-nation" component={SportingNation} />
      <Route path="/sporting-nation/:section" component={SportingNation} />
      <Route path="/pathway" component={Pathway} />
      <Route path="/facilities" component={Facilities} />
      <Route path="/stories" component={Stories} />
      <Route path="/golden-moments" component={GoldenMoments} />
      <Route path="/para" component={ParaHub} />
      <Route path="/women" component={WomenInSport} />
      <Route path="/my-momentum" component={MyMomentum} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/hall-of-fame" component={HallOfFame} />
      <Route path="/sports" component={Sports} />
      <Route path="/nations" component={Nations} />
      <Route path="/faq" component={Faq} />
      <Route path="/about" component={About} />
      <Route path="/about/:tab" component={About} />
      <Route path="/admin" component={AdminPage} />
      {LEGACY.map(([from, to]) => <Route key={from} path={from}><Redirect to={to} replace /></Route>)}
      <Route component={NotFound} />
    </Switch>
  );
}

function Shell() {
  const { lite } = usePrefs();
  const [search, setSearch] = useState(false);
  const [sub, setSub] = useState(false);
  return (
    <MotionConfig reducedMotion={lite ? "always" : "user"}>
      <a href="#main" onClick={e => { e.preventDefault(); document.getElementById("main")?.focus(); }} className="sr-only z-[100] rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Ticker />
      <Header onSearch={() => setSearch(true)} onSubscribe={() => setSub(true)} />
      <main id="main" tabIndex={-1} className="outline-none"><ScrollTop /><AppRouter /></main>
      <Footer />
      <ScrollButtons />
      <SearchPalette open={search} setOpen={setSearch} />
      <SubscribeDialog open={sub} setOpen={setSub} />
    </MotionConfig>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrefsProvider>
        <TooltipProvider>
          <Toaster />
          {PATH_MODE ? <Router><Shell /></Router> : <Router hook={useHashLocation}><Shell /></Router>}
        </TooltipProvider>
      </PrefsProvider>
    </QueryClientProvider>
  );
}
