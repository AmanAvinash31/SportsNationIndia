/* Facts for the live hubs, leagues, broadcasts and state tables. Every block carries its source.
   Checked 8 October 2026. Update this file when dates or broadcasters are confirmed. */

export const LSRC = {
  apgPib: "https://pib.gov.in/FactsheetDetails.aspx?id=151080&NoteId=151080&ModuleId=16&reg=1&lang=1",
  apgIndiatimes: "https://www.indiatimes.com/trending/asian-para-games-2026-aichi-nagoya-countdown-begins-as-india-prepares-for-another-major-para-sporting-challenge/articleshow/134712352.html",
  apgWiki: "https://en.wikipedia.org/wiki/2026_Asian_Para_Games",
  apgIndiaWiki: "https://en.wikipedia.org/wiki/India_at_the_2026_Asian_Para_Games",
  apgFlag: "https://ddnews.gov.in/en/pramod-bhagat-bhavina-patel-named-flag-bearers-for-aichi-nagoya-asian-para-games",
  apgArchery: "https://www.worldarchery.sport/news/202477/sheetal-devi-payal-nag-and-harvinder-singh-named-indias-asian-games-squad",
  apgContenders: "https://revsportz.in/para-athletics-could-power-india-past-100-medals-again-at-asian-para-games/",
  apgOfficial: "https://www.asianparagames-2026.org/en/",
  hangzhou: "https://scroll.in/field/1058264/india-at-asian-para-games-satish-darpan-neeraj-yadav-win-gold-as-campaign-ends-with-111-medals",
  islStart: "https://www.espn.com/football/story/_/id/49832841/isl-202627-season-begin-october-10",
  islTv: "https://www.latestly.com/sports/football/isl-2026-27-broadcast-details-tv-channel-and-live-streaming-guide-for-india-7635980.html",
  islFixtures: "https://news24online.com/sports/indian-super-league-2026-27-schedule-timings-live-streaming-tickets-teams-fixtures/939850/",
  islClubs: "https://www.keralatv.in/isl-2026-2027-broadcast-partners-live-streaming/",
  pklChamp: "https://www.business-standard.com/sports/pro-kabaddi-league/pro-kabaddi-league-2025-final-live-score-updates-kabaddi-online-score-delhi-vs-puneri-125103101116_1.html",
  pklStatus: "https://sportsboardindia.com/kabaddi/pkl-2026-season-13/",
  hil27: "https://www.thehockeypaper.co.uk/articles/2026/06/11/hockey-india-league-2027-set-for-three-host-cities",
  hilReg: "https://hockeyindialeague.com/news/hockey-india-opens-player-registration-for-hero-hockey-india-league-2027",
  hilTv: "https://www.espn.com/field-hockey/story/_/id/47481609/hockey-india-league-2026-all-need-know-men-hil",
  agTv: "https://www.sportingnews.com/in/tsn/news/watch-asian-games-2026-india-live-stream-tv-channel-time-zone-aichi-nagoya/dfefdd94fedebe35704e7166",
  la28Rights: "https://www.nst.com.my/sports/cricket/2026/07/1498438/olympics-cricket-iocs-gateway-india",
  kiyg: "https://en.wikipedia.org/wiki/2025_Khelo_India_Youth_Games",
  kiygOfficial: "https://youth.kheloindia.gov.in/medal-tally",
  ng: "https://www.olympics.com/en/news/national-games-2025-medal-tally-table",
} as const;

/* ---------- Asian Para Games 2026 ---------- */
export const APG = {
  start: "2026-10-18T00:00:00+09:00", end: "2026-10-25T00:00:00+09:00",
  dates: "18 to 24 October 2026", where: "Aichi-Nagoya, Japan",
  sports: 18, events: 492, athletes: "about 3,000", npcs: 45,
  india: { squad: 121, men: 80, women: 41, bySport: [["Para athletics", 44], ["Para badminton", 27], ["Para swimming", 17], ["Shooting para sport", 15], ["Para archery", 11], ["Para judo", 7]] as [string, number][] },
  flagBearers: "Pramod Bhagat (para badminton) and Bhavina Patel (para table tennis)",
  hangzhou: { g: 29, s: 31, b: 51, t: 111 },
  medalDays: [["19 Oct", 63], ["20 Oct", 105], ["21 Oct", 100]] as [string, number][],
};
export const APG_WATCH: { name: string; event: string; sport: string }[] = [
  { name: "Sumit Antil", event: "Men's javelin F64", sport: "Para athletics" },
  { name: "Deepthi Jeevanji", event: "Women's 400 m T20", sport: "Para athletics" },
  { name: "Nishad Kumar", event: "Men's high jump T47", sport: "Para athletics" },
  { name: "Preethi Pal", event: "Women's 100 m T35", sport: "Para athletics" },
  { name: "Simran Sharma", event: "Women's 100 m T12", sport: "Para athletics" },
  { name: "Praveen Kumar", event: "Men's high jump T64", sport: "Para athletics" },
  { name: "Sachin Khilari", event: "Men's shot put F46", sport: "Para athletics" },
  { name: "Dharambir Nain", event: "Men's club throw F51", sport: "Para athletics" },
  { name: "Sheetal Devi", event: "Women's compound", sport: "Para archery" },
  { name: "Harvinder Singh", event: "Men's recurve", sport: "Para archery" },
  { name: "Pramod Bhagat", event: "Flag bearer", sport: "Para badminton" },
  { name: "Bhavina Patel", event: "Flag bearer", sport: "Para table tennis" },
];
export const APG_VENUES: [string, string][] = [
  ["Paloma Mizuho Stadium, Nagoya", "Ceremonies and para athletics"], ["Ichinomiya City Gymnasium", "Para badminton"], ["Nippon Gaishi Hall Rainbow Pool, Nagoya", "Para swimming"],
  ["Aichi Prefectural Shooting Range, Toyota", "Shooting para sport"], ["Okazaki Central Park", "Para archery"], ["Aichi Budokan, Nagoya", "Para judo"],
];

/* ---------- where to watch ---------- */
export type Watch = { comp: string; when: string; tv: string; stream: string; free?: string; status: "live" | "soon" | "tbc" | "done"; src: string; href?: string };
export const WATCH: Watch[] = [
  { comp: "Indian Super League 2026-27", when: "From 10 October 2026 to May 2027", tv: "Sony Sports Network", stream: "SonyLIV", free: "YouTube, free worldwide", status: "soon", src: LSRC.islTv, href: "/leagues" },
  { comp: "Asian Para Games 2026", when: "18 to 24 October 2026", tv: "India broadcaster not yet announced", stream: "Check the official Games site and the Paralympic Committee of India channels", status: "tbc", src: LSRC.apgOfficial, href: "/games/asian-para-games-2026" },
  { comp: "Pro Kabaddi League Season 13", when: "Expected late 2026, dates not yet confirmed", tv: "Star Sports for Season 12; Season 13 to be confirmed", stream: "JioHotstar for Season 12", status: "tbc", src: LSRC.pklStatus, href: "/leagues" },
  { comp: "Hockey India League 2027", when: "January 2027", tv: "Sony Sports Ten 1 and Ten 3 in 2026; 2027 to be confirmed", stream: "Waves and the HIL YouTube channel in 2026", free: "DD Sports in 2026", status: "tbc", src: LSRC.hilTv, href: "/leagues" },
  { comp: "LA 2028 Olympics", when: "14 to 30 July 2028", tv: "Indian rights not yet awarded", stream: "The IOC says talks with Indian broadcasters are under way", status: "tbc", src: LSRC.la28Rights, href: "/road-to-la-2028" },
  { comp: "Asian Games 2026 (replays)", when: "Finished 4 October 2026", tv: "Sony Sports Network", stream: "SonyLIV", free: "DD Sports on DD Free Dish", status: "done", src: LSRC.agTv, href: "/games/asian-games-2026" },
];

/* ---------- leagues ---------- */
export type LeagueKey = "isl" | "pkl" | "hil";
export const LEAGUES: Record<LeagueKey, { name: string; sport: string; season: string; status: string; teams: string[]; facts: [string, string][]; src: [string, string][]; points: [number, number, number]; img: string }> = {
  isl: { name: "Indian Super League", sport: "Football", season: "2026-27", status: "Kicks off Saturday 10 October with Bengaluru FC vs Sporting Club Delhi at 5 pm IST.",
    teams: ["Bengaluru FC", "Chennaiyin FC", "Churchill Brothers", "East Bengal FC", "FC Goa", "Inter Kashi", "Kerala Blasters FC", "Mohun Bagan Super Giant", "Mumbai City FC", "NorthEast United FC", "Odisha FC", "Punjab FC", "Sporting Club Delhi"],
    facts: [["13", "clubs"], ["163", "matches planned, including play-offs"], ["78", "first-phase matches announced, to 17 January"]],
    src: [["ESPN: season dates", LSRC.islStart], ["News24: first-phase fixtures", LSRC.islFixtures], ["LatestLY: broadcast", LSRC.islTv]], points: [3, 1, 0], img: "./img/stadium.webp" },
  pkl: { name: "Pro Kabaddi League", sport: "Kabaddi", season: "Season 13", status: "Dates not yet announced by the organisers, Mashal Sports. Reports expect a late-2026 start.",
    teams: ["Bengal Warriorz", "Bengaluru Bulls", "Dabang Delhi K.C.", "Gujarat Giants", "Haryana Steelers", "Jaipur Pink Panthers", "Patna Pirates", "Puneri Paltan", "Tamil Thalaivas", "Telugu Titans", "U Mumba", "UP Yoddhas"],
    facts: [["12", "franchises"], ["31-28", "Dabang Delhi beat Puneri Paltan in the Season 12 final, 31 October 2025"]],
    src: [["Business Standard: Season 12 final", LSRC.pklChamp], ["Sports Board India: Season 13 status", LSRC.pklStatus]], points: [5, 3, 0], img: "./img/wrestling.webp" },
  hil: { name: "Hockey India League", sport: "Hockey", season: "2027", status: "Season 3 starts in January 2027. Men's matches in Bhubaneswar, Hyderabad and Delhi; the women's league in Bhubaneswar.",
    teams: [], facts: [["Jan 2027", "season start"], ["3", "men's host cities"], ["Sep 2026", "player auction"]],
    src: [["The Hockey Paper: host cities", LSRC.hil27], ["Hockey India: registration", LSRC.hilReg]], points: [3, 1, 0], img: "./img/hockey.webp" },
};

/* ---------- state leaderboards ---------- */
export type StateRow = [string, number, number, number, number];
export const KIYG25: StateRow[] = [
  ["Maharashtra", 58, 47, 53, 158], ["Haryana", 39, 27, 51, 117], ["Rajasthan", 24, 12, 24, 60], ["Karnataka", 17, 26, 15, 58], ["Delhi", 16, 20, 32, 68], ["Tamil Nadu", 15, 21, 29, 65],
  ["Uttar Pradesh", 14, 20, 18, 52], ["Kerala", 12, 5, 8, 25], ["Manipur", 11, 8, 11, 30], ["Madhya Pradesh", 10, 9, 13, 32], ["Assam", 10, 5, 10, 25], ["Telangana", 9, 3, 11, 23],
];
export const NG25: StateRow[] = [
  ["Services", 68, 26, 27, 121], ["Maharashtra", 54, 71, 76, 201], ["Haryana", 48, 47, 58, 153], ["Madhya Pradesh", 34, 26, 22, 82], ["Karnataka", 34, 18, 28, 80], ["Tamil Nadu", 27, 30, 35, 92],
  ["Uttarakhand", 24, 35, 44, 103], ["West Bengal", 16, 13, 18, 47], ["Punjab", 15, 20, 31, 66], ["Delhi", 15, 18, 29, 62], ["Manipur", 14, 16, 25, 55], ["Odisha", 14, 15, 17, 46],
];

/* Which upcoming event an athlete should count down to. */
export const NEXT_EVENTS = {
  apg: { label: "Asian Para Games", at: APG.start, where: APG.where, href: "/games/asian-para-games-2026" },
  la28: { label: "LA 2028 Olympics", at: "2028-07-14T00:00:00-07:00", where: "Los Angeles", href: "/road-to-la-2028" },
  la28p: { label: "LA 2028 Paralympics", at: "2028-08-15T00:00:00-07:00", where: "Los Angeles", href: "/para" },
};
export const PARA_NAMES = new Set(APG_WATCH.map(a => a.name.toLowerCase()));
