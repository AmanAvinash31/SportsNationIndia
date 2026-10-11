import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18N } from "@/data";

export type Lang = "en" | "hi" | "gu";
type Prefs = { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void; lang: Lang; setLang: (l: Lang) => void; t: (k: string, fallback?: string) => string; lite: boolean; setLite: (v: boolean) => void; followEmail: string; setFollowEmail: (e: string) => void };
const Ctx = createContext<Prefs | null>(null);

const EXTRA: Record<Lang, Record<string, string>> = {
  en: { games: "Games", news: "News", explore: "Explore", search: "Search", latest: "Latest", allNews: "All news", readStory: "Read the story", medalHistory: "Medal history", rise: "Next gen" },
  hi: { games: "खेल", news: "समाचार", explore: "और देखें", search: "खोजें", latest: "ताज़ा", allNews: "सभी समाचार", readStory: "पूरी ख़बर पढ़ें", medalHistory: "पदक इतिहास", rise: "नई पीढ़ी" },
  gu: { games: "રમતો", news: "સમાચાર", explore: "વધુ જુઓ", search: "શોધો", latest: "તાજા", allNews: "બધા સમાચાર", readStory: "આખી વાર્તા વાંચો", medalHistory: "મેડલ ઇતિહાસ", rise: "નવી પેઢી" },
};

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [lang, setLang] = useState<Lang>("en");
  const [lite, setLite] = useState<boolean>(() => typeof navigator !== "undefined" && !!(navigator as any).connection?.saveData);
  const [followEmail, setFollowEmail] = useState("");
  useEffect(() => { document.documentElement.classList.toggle("lite", lite); }, [lite]);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const value = useMemo<Prefs>(() => ({
    theme, setTheme, lang, setLang, lite, setLite, followEmail, setFollowEmail,
    t: (k, fb) => EXTRA[lang][k] ?? I18N[lang]?.[k] ?? EXTRA.en[k] ?? I18N.en?.[k] ?? fb ?? k,
  }), [theme, lang, lite, followEmail]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const usePrefs = () => { const c = useContext(Ctx); if (!c) throw new Error("PrefsProvider missing"); return c; };
