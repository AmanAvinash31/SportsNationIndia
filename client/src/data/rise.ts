import fac from "./facilities.json";
import { IMG } from "./index";

/* ---------- extra images ---------- */
export const RIMG = { youth: "./img/youth-training.webp", celebration: "./img/celebration.webp", academy: "./img/academy.webp" } as const;

/* ---------- sources ---------- */
export const SRC = {
  saiList: "https://sportsauthorityofindia.nic.in/sai_new/public/assets/front/pdfs/schemes/STC_Strength.pdf",
  saiFinder: "https://sportsauthorityofindia.nic.in/sai_new/sai-sports-centers",
  kiAcademies: "https://dashboard.kheloindia.gov.in/public/front/assets/Khelo_India_Academies_State_wise.xlsx",
  kiAccredited: "https://dashboard.kheloindia.gov.in/public/khelo-india-accredited-academies",
  kic: "https://dashboard.kheloindia.gov.in/state-wise-khelo-india-centers",
  kiHow: "https://dashboard.kheloindia.gov.in/public/front/assets/become_kia/How%20to%20become%20a%20Khelo%20India%20Athlete.pdf",
  kiTalent: "https://dashboard.kheloindia.gov.in/talent-search-development",
  kiScholar: "https://sansad.in/getFile/annex/267/AU464_vkXYV2.pdf?source=pqars",
  kiPib: "https://pib.gov.in/PressReleasePage.aspx?PRID=1741491",
  tops: "https://www.sportsauthorityofindia.nic.in/sai_new/target-olympic-podium",
  topsLs: "https://sansad.in/getFile/loksabhaquestions/annex/176/AU1821.pdf?source=pqals",
  kiyg: "https://www.olympics.com/en/news/khelo-india-games-youth-university-school-history-winners",
  policy: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2224219&reg=3&lang=1",
  posh: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1941167",
  wellbeing: "https://sportsauthorityofindia.nic.in/sai_new/public/assets/uploads/news/a859afd1-1cb1-4211-8fda-13b6c44c3512.pdf",
  la28Dates: "https://la28.org/en/newsroom/LA28_Announces_Games_Dates.html",
  la28Schedule: "https://la28.org/en/newsroom/la28-releases-competition-schedule-for-2028-olympic-games.html",
  la28New: "https://www.olympics.com/en/news/la28-olympics-what-are-new-sports-and-events-at-olympic-games-in-los-angeles",
  la28Events: "https://www.britannica.com/event/Los-Angeles-2028-Summer-Olympic-Games",
  la28Qual: "https://assets.ctfassets.net/761l7gh5x5an/2RVPJbSeNp2zz29eKyohcN/3c832aac148a8975d3a94d41ac8e9bb6/LA28_Qualification_Webinar_-_24.03.2026.pdf",
  feiQual: "https://inside.fei.org/system/files/LA2028%20Qualification%20System_final.pdf",
  para28: "https://www.paralympic.org/news/la28-new-details-games-plan",
} as const;

/* ---------- facilities ---------- */
export interface SaiCentre { t: "NCOE" | "STC" | "Extension"; n: string; s: string; d: string[]; st: "open" | "inactive"; rg?: string; ll?: [number, number]; seats?: [string, number, number][] }
export interface Academy { s: string; dist: string; n: string; d: string[] }
export const SAI: SaiCentre[] = (fac as any).sai;
export const ACADEMIES: Academy[] = (fac as any).academies;
export const baseSport = (d: string) => d.replace(/\s*\(Para\)/i, "").replace(/^Para Sports$/i, "Para sports").trim();
export const STATES = [...new Set([...SAI.map(x => x.s), ...ACADEMIES.map(x => x.s)])].sort();
export const FAC_SPORTS = [...new Set([...SAI.flatMap(x => x.d), ...ACADEMIES.flatMap(x => x.d)].map(baseSport))].filter(Boolean).sort();
export const stateCounts = (s: string) => ({
  ncoe: SAI.filter(x => x.s === s && x.t === "NCOE" && x.st === "open").length,
  stc: SAI.filter(x => x.s === s && x.t === "STC" && x.st === "open").length,
  ext: SAI.filter(x => x.s === s && x.t === "Extension" && x.st === "open").length,
  acad: ACADEMIES.filter(x => x.s === s).length,
});
export const sportCount = (sport: string) =>
  SAI.filter(x => x.st === "open" && x.d.some(d => baseSport(d) === sport)).length + ACADEMIES.filter(x => x.d.some(d => baseSport(d) === sport)).length;
export const KIC_TOTAL = 1066;
export const KIC_STATES = 36;
export const FAC_DATE = "8 October 2026";

/* ---------- contacts ---------- */
const RC = "https://sportsauthorityofindia.nic.in/sai_new/";
export interface Region { name: string; addr: string; states?: string; href: string }
export const REGIONS: Record<string, Region> = {
  HQ: { name: "SAI Head Office", addr: "Jawaharlal Nehru Stadium Complex (East Gate), Lodhi Road, New Delhi 110003", href: RC + "contact-us" },
  Bangalore: { name: "Netaji Subhash Southern Regional Centre", addr: "Jnanabharathi Campus, Bangalore University, Mysore Road, Bengaluru", states: "Andhra Pradesh, Telangana, Karnataka", href: RC + "rc-banglore" },
  Bhopal: { name: "Udhav Das Mehta (Bhai Ji) Central Regional Centre", addr: "Gram Gora, Bishenkheri, Bhopal", states: "Madhya Pradesh, Chhattisgarh", href: RC + "rc-bhopal" },
  Chandigarh: { name: "SAI Regional Centre, Chandigarh", addr: "Hockey Stadium, Sector 42, Chandigarh", href: RC + "rc-chandigarh" },
  Gandhinagar: { name: "Netaji Subhash Western Regional Centre", addr: "Gandhinagar, Gujarat", states: "Gujarat, Rajasthan", href: RC + "rc-ghandhinagar" },
  Guwahati: { name: "SAI Regional Centre, Guwahati", addr: "Guwahati, Assam", states: "Assam, Meghalaya, Arunachal Pradesh, Sikkim", href: RC + "rc-guwahati" },
  Imphal: { name: "Netaji Subhash North-East Regional Centre", addr: "Takyel, Imphal, Manipur", href: RC + "rc-imphal" },
  Kolkata: { name: "Netaji Subhash Eastern Regional Centre", addr: "Salt Lake City, Kolkata", href: RC + "rc-kolkata" },
  Lucknow: { name: "SAI Regional Centre, Lucknow", addr: "Lucknow, Uttar Pradesh", states: "Uttar Pradesh, Uttarakhand", href: RC + "rc-lucknow" },
  Mumbai: { name: "SAI Regional Centre, Mumbai", addr: "Mumbai, Maharashtra", states: "Maharashtra, Goa, Dadra and Nagar Haveli and Daman and Diu", href: RC + "rc-mumbai" },
  Sonepat: { name: "Ch. Devi Lal Northern Regional Centre", addr: "GT Road, near Bahalgarh, Sonepat, Haryana", href: RC + "rc-sonepat" },
  LNCPE: { name: "SAI Regional Centre at LNCPE", addr: "Lakshmibai National College of Physical Education, Kariavattom, Thiruvananthapuram", href: RC + "rc-thiruvananthapuram" },
  NSNIS: { name: "Netaji Subhas National Institute of Sports", addr: "Patiala, Punjab", href: RC + "regional-centres" },
  Zirakpur: { name: "SAI Regional Centre, Zirakpur", addr: "Zirakpur, Punjab", states: "Punjab, Himachal Pradesh, Jammu and Kashmir, Ladakh, Chandigarh", href: RC + "regional-centres" },
};
export const HELPLINES: { t: string; v: string; href: string; note: string }[] = [
  { t: "Khelo India", v: "011 2338 3336", href: "tel:+911123383336", note: "Talent search and development" },
  { t: "Khelo India email", v: "kheloindia@gov.in", href: "mailto:kheloindia@gov.in", note: "Athlete and academy queries" },
  { t: "SAI Head Office", v: "Lodhi Road, New Delhi", href: RC + "contact-us", note: "Postal address and contact page" },
];
export const TRIALS_DATE = "8 October 2026";
export const TRIALS: { sport: string; t: string; d: string; href: string }[] = [
  { sport: "Boxing", t: "Open selection trials for induction into the NCOE scheme", d: "07 Oct 2026", href: RC + "public/assets/uploads/selection_trials/5716899f-6ea1-42bf-b571-bb75e888d1c0.jpeg" },
  { sport: "Archery", t: "Open selection trials for induction into the NCOE scheme", d: "06 Oct 2026", href: RC + "public/assets/uploads/selection_trials/4dab7497-b803-448e-bea4-e2111d8d1c8c.pdf" },
  { sport: "Gymnastics", t: "Selection trials for admission to SAI NCOE Kolkata", d: "03 Oct 2026", href: RC + "public/assets/uploads/selection_trials/e0645770-964a-4efb-8e8e-5efe55e3de10.jpg" },
  { sport: "Archery", t: "Selection trials for admission to SAI NCOE Kolkata", d: "03 Oct 2026", href: RC + "public/assets/uploads/selection_trials/b199d99b-0f3d-471b-907b-bfe5ccdbf02e.jpg" },
  { sport: "Para archery", t: "Selection trials for admission to SAI NCOE Kolkata", d: "03 Oct 2026", href: RC + "public/assets/uploads/selection_trials/149e599a-8fde-4625-831f-71b09205a0de.pdf" },
];
export const TRIALS_PAGE = RC + "selection-trial";
export const SAI_DATA = RC + "public/assets/front/js/sai_centres_data.js";
export const mapsDir = (c: SaiCentre) => c.ll ? `https://www.google.com/maps/dir/?api=1&destination=${c.ll[0]},${c.ll[1]}` : mapsSearch(`SAI ${c.n} ${c.s}`);
export const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* shared hand-off between the sport quiz and the finder */
export const finderPrefill: { sport?: string; state?: string } = {};

/* ---------- success stories ---------- */
export interface Story {
  slug: string; n: string; sport: string; from: string; state: string; img: string;
  start: string; turn: string; peak: string; lesson: string; src: [string, string][];
}
export const STORIES: Story[] = [
  { slug: "neeraj-chopra", n: "Neeraj Chopra", sport: "Athletics, javelin", from: "Khandra, Panipat", state: "Haryana", img: IMG.hero,
    start: "Grew up in a farming village in Panipat district. His family sent him to the gym to lose weight.",
    turn: "When the village gym shut, he trained in Panipat, about 15 km away. That is where he picked up the javelin.",
    peak: "India's first Olympic athletics gold in Tokyo 2020, then silver in Paris 2024.",
    lesson: "A child does not need to look like an athlete on day one. Getting started counts for more.",
    src: [["Times of India", "https://timesofindia.indiatimes.com/sports/more-sports/athletics/why-world-champion-neeraj-chopra-took-to-javelin/articleshow/103119863.cms"], ["Global Indian", "https://www.globalindian.com/profiles/subedar-major-neeraj-chopra/"]] },
  { slug: "mirabai-chanu", n: "Mirabai Chanu", sport: "Weightlifting", from: "Nongpok Kakching, Imphal East", state: "Manipur", img: IMG.weightlifting,
    start: "The youngest of six children in a family of limited means. As a girl she carried heavy bundles of firewood home.",
    turn: "Her lifting strength was spotted early and she moved into formal weightlifting training.",
    peak: "Olympic silver in Tokyo 2020. Gold at Glasgow 2026, where she became the first Indian woman to medal at four straight Commonwealth Games.",
    lesson: "Raw strength shows up in everyday life. A good coach turns it into technique.",
    src: [["Olympics.com", "https://www.olympics.com/en/athletes/chanu-saikhom-mirabai"], ["Northeast Live", "https://northeastlivetv.com/topnews/from-carrying-firewood-in-a-manipur-village-to-lifting-indias-pride-the-remarkable-childhood-of-mirabai-chanu/"]] },
  { slug: "manu-bhaker", n: "Manu Bhaker", sport: "Shooting", from: "Goria, Jhajjar", state: "Haryana", img: IMG.shooting,
    start: "A national karate champion who also tried boxing, tennis and skating.",
    turn: "Took up shooting in 2016, in Class 10, at her school, which had the only shooting range in Jhajjar district.",
    peak: "Two bronze medals at Paris 2024, the first Indian to win two medals at one Olympic Games since independence.",
    lesson: "Let children sample several sports. The right one can arrive late. Manu found hers at 14.",
    src: [["Hindustan Times", "https://www.hindustantimes.com/cities/chandigarh-news/celebrations-erupt-at-manu-bhaker-s-house-as-she-wins-paris-olympics-medal-101722191091954.html"], ["Augustman", "https://www.augustman.com/in/sports/manu-bhaker-olympic-bronze-medallist-facts-you-did-not-know/"]] },
  { slug: "lovlina-borgohain", n: "Lovlina Borgohain", sport: "Boxing", from: "Baromukhia, Golaghat", state: "Assam", img: IMG.boxing,
    start: "Born in a remote village in Golaghat. She and her elder twin sisters first trained in Muay Thai and kickboxing.",
    turn: "Moved from kickboxing into Olympic-style boxing.",
    peak: "Women's welterweight bronze at Tokyo 2020.",
    lesson: "Skills carry over between related sports. A martial arts start can lead to an Olympic podium.",
    src: [["Olympics.com", "https://www.olympics.com/en/news/lovlina-borgohain-olympics-medal-tokyo-2020-boxing"], ["The Sentinel", "https://www.sentinelassam.com/more-news/life/assams-golden-girl-world-champion-644531"]] },
  { slug: "pv-sindhu", n: "PV Sindhu", sport: "Badminton", from: "Hyderabad", state: "Telangana", img: IMG.badminton,
    start: "Started badminton at eight, inspired by Pullela Gopichand's All England title in 2001.",
    turn: "Learned the basics under coach Mahboob Ali, won age-group titles, and joined Gopichand's academy in 2008.",
    peak: "Olympic silver in Rio 2016 and bronze in Tokyo 2020, the first Indian woman with two Olympic medals.",
    lesson: "Heroes matter. One Indian win on television can start a new generation.",
    src: [["Olympics.com", "https://www.olympics.com/en/news/pv-sindhu-frequently-asked-questions"], ["Hindustan Times", "https://www.hindustantimes.com/other-sports/focus-and-dedication-define-rio-silver-medallist-pv-sindhu/story-kuuG3uCdZa2K961RltYr0M.html"]] },
  { slug: "bajrang-punia", n: "Bajrang Punia", sport: "Wrestling", from: "Khudan, Jhajjar", state: "Haryana", img: IMG.wrestling,
    start: "Began wrestling at seven in a village where kabaddi and wrestling were everyday games, encouraged by his father, himself a wrestler.",
    turn: "Moved from local coaching to Delhi's Chhatrasal Stadium.",
    peak: "Men's freestyle 65kg bronze at Tokyo 2020.",
    lesson: "Local sporting culture and a supportive parent give a child a head start.",
    src: [["Wikipedia", "https://en.wikipedia.org/wiki/Bajrang_Punia"], ["Khaskhabar", "https://www.m.khaskhabar.com/en/news/bajrang-punia--india-only-wrestler-with-four-world-championship-medals-1-24451-KKN.html"]] },
  { slug: "shafali-verma", n: "Shafali Verma", sport: "Cricket", from: "Rohtak", state: "Haryana", img: IMG.cricket,
    start: "No academy in her town would take girls, so she cut her hair short to train at a boys' academy.",
    turn: "Broke into India's senior side as a teenager.",
    peak: "Scored a semi-final century as India's women won Asian Games gold at Aichi-Nagoya 2026.",
    lesson: "Access is often the barrier, not ability. Ask for girls' batches and push for them.",
    src: [["Sydney Morning Herald", "https://www.smh.com.au/sport/cricket/shafali-s-the-man-teen-disguised-herself-as-a-boy-to-start-her-cricket-career-20211019-p591bj.html"], ["Times of India", "https://timesofindia.indiatimes.com/women/voices-of-power/why-did-this-girl-disguise-herself-as-a-boy-to-play-cricket-for-years-and-what-is-her-connection-with-the-india-womens-national-cricket-team/articleshow/132016465.cms"]] },
];

/* ---------- golden moments ---------- */
const yt = (q: string) => `https://www.youtube.com/@Olympics/search?query=${encodeURIComponent(q)}`;
export interface Moment { y: string; where: string; games: string; t: string; d: string; img: string; href: string; watch?: string }
export const MOMENTS: Moment[] = [
  { y: "1928", where: "Amsterdam", games: "Olympics", t: "The first gold", d: "Men's hockey wins India's first Olympic gold, the first for any Asian nation, and starts a run of six straight titles.", img: IMG.hockey, href: "/medals/olympics", watch: yt("India hockey 1928") },
  { y: "1958", where: "Cardiff", games: "Commonwealth Games", t: "Milkha's 440 yards", d: "Milkha Singh wins India's first Commonwealth Games gold.", img: IMG.relay, href: "/medals/commonwealth" },
  { y: "1980", where: "Moscow", games: "Olympics", t: "Hockey's eighth crown", d: "Men's hockey wins an eighth Olympic gold, still the most by any team in the sport.", img: IMG.hockey, href: "/medals/olympics", watch: yt("India hockey 1980 Moscow") },
  { y: "2008", where: "Beijing", games: "Olympics", t: "Bindra stands alone", d: "Abhinav Bindra wins the 10m air rifle, India's first individual Olympic gold.", img: IMG.shooting, href: "/medals/olympics", watch: yt("Abhinav Bindra Beijing 2008") },
  { y: "2010", where: "Delhi", games: "Commonwealth Games", t: "A century at home", d: "101 medals and second place, India's best Commonwealth Games.", img: IMG.stadium, href: "/medals/commonwealth" },
  { y: "2016", where: "Rio de Janeiro", games: "Olympics", t: "Sindhu's silver", d: "PV Sindhu reaches the women's singles final, India's first Olympic badminton silver.", img: IMG.badminton, href: "/athletes/pv-sindhu", watch: yt("PV Sindhu Rio 2016 final") },
  { y: "2021", where: "Tokyo", games: "Olympics", t: "87.58 metres", d: "Neeraj Chopra wins India's first Olympic athletics gold. Men's hockey ends a 41-year wait for an Olympic medal.", img: RIMG.celebration, href: "/athletes/neeraj-chopra", watch: yt("Neeraj Chopra Tokyo gold") },
  { y: "2023", where: "Hangzhou", games: "Asian Games", t: "107 medals", d: "India's record Asian Games haul, the first time past 100.", img: IMG.crowd, href: "/medals/asian-games" },
  { y: "2024", where: "Paris", games: "Olympics", t: "Manu's double", d: "Manu Bhaker wins two shooting bronzes, and Aman Sehrawat becomes India's youngest Olympic medallist.", img: IMG.shooting, href: "/athletes/manu-bhaker", watch: yt("Manu Bhaker Paris 2024") },
  { y: "2026", where: "Glasgow", games: "Commonwealth Games", t: "Ten boxing medals", d: "The most boxing medals by any nation at one Games, and gold for Mirabai Chanu with a Games record.", img: IMG.boxing, href: "/games/glasgow-2026" },
  { y: "2026", where: "Aichi-Nagoya", games: "Asian Games", t: "Double hockey, double cricket", d: "Golds in both hockey and both cricket events as India finish fourth with 85 medals.", img: IMG.cricket, href: "/games/asian-games-2026" },
];

/* ---------- LA 2028 ---------- */
export const LA_OPEN = "2028-07-15T00:00:00Z"; // 14 July 2028, 17:00 PT
export const LA_TIMELINE: [string, string, string][] = [
  ["18–24 Oct 2026", "Asian Para Games, Aichi-Nagoya", "Para athletes start the Paralympic cycle."],
  ["2027", "World championships season", "Most sports hand out quota places through world championships, continental qualifiers and world rankings."],
  ["17 Nov 2027", "Cycling quota places allocated", "An example of how early some sports lock in their places."],
  ["11 Jun 2028", "Equestrian qualification closes", "Most qualification windows close in the first half of 2028."],
  ["14 Jul 2028", "Opening ceremony", "Held at the LA Memorial Coliseum and 2028 Stadium in Inglewood. The Games run until 30 July."],
  ["15–27 Aug 2028", "Paralympic Games", "About 4,480 athletes in 560 medal events across 23 sports."],
];
export const LA_NEW = [
  ["Cricket", "Returns after more than a century. India hold both Asian Games T20 golds from Aichi-Nagoya 2026."],
  ["Squash", "Olympic debut. India won 5 squash medals at Aichi-Nagoya 2026."],
  ["Flag football", "Olympic debut."],
  ["Lacrosse", "Returns after more than a century."],
  ["Baseball and softball", "Back on the programme."],
] as const;
export interface Watch { sport: string; why: string; names: string; img: string; slug?: string }
export const LA_WATCH: Watch[] = [
  { sport: "Athletics, javelin", why: "Gold in Tokyo, silver in Paris. India's most consistent Olympic event of the decade.", names: "Neeraj Chopra", img: IMG.hero, slug: "neeraj-chopra" },
  { sport: "Shooting", why: "Three of India's six medals in Paris. Three golds and 15 medals at Aichi-Nagoya 2026.", names: "Manu Bhaker, Sarabjot Singh, Swapnil Kusale", img: IMG.shooting, slug: "manu-bhaker" },
  { sport: "Hockey", why: "Bronze in Tokyo and Paris, then gold for both the men's and women's teams at Aichi-Nagoya 2026.", names: "Men's and women's teams", img: IMG.hockey },
  { sport: "Wrestling", why: "A medal at every Games since 2008. Aman Sehrawat won bronze at 21 in Paris.", names: "Aman Sehrawat", img: IMG.wrestling },
  { sport: "Cricket", why: "New at LA28. India won both T20 golds at Aichi-Nagoya 2026.", names: "Men's and women's T20 squads", img: IMG.cricket, slug: "shafali-verma" },
  { sport: "Archery", why: "Five golds at Aichi-Nagoya 2026, India's best Asian Games sport by golds.", names: "Compound and recurve squads", img: IMG.archery },
  { sport: "Boxing", why: "Ten medals at Glasgow 2026, a record for any nation at one Games.", names: "Lovlina Borgohain and the Glasgow squad", img: IMG.boxing, slug: "lovlina-borgohain" },
  { sport: "Weightlifting", why: "Silver in Tokyo. Commonwealth gold in Glasgow 2026 with a Games record.", names: "Mirabai Chanu", img: IMG.weightlifting, slug: "mirabai-chanu" },
];

/* ---------- pathway ---------- */
export const LADDER: { age: string; t: string; d: string }[] = [
  { age: "6–12", t: "Play many sports", d: "School PE, local clubs and a Khelo India Centre near you. Build general movement skills before specialising." },
  { age: "10–16", t: "District and state events", d: "Age-group championships organised by state associations and school sports bodies. Results here get noticed." },
  { age: "Under 18 / 21", t: "Khelo India Games", d: "National youth, university and para Games. Selectors scout here and at national championships." },
  { age: "Selected", t: "Khelo India athlete", d: "Talent committees pick athletes. Training at an accredited academy with ₹6.28 lakh of support a year, including ₹1.20 lakh as a cash allowance." },
  { age: "National", t: "Camps and NCOEs", d: "National camps and SAI National Centres of Excellence, with sports science and full-time coaching." },
  { age: "Elite", t: "TOPS and the podium", d: "The Target Olympic Podium Scheme funds top medal prospects. Core group athletes get ₹50,000 a month on top of training and competition costs." },
];
export const SCHEMES: { t: string; who: string; what: string; href: string; src: string }[] = [
  { t: "Khelo India Centres", who: "Children and teenagers near home", what: "1,066 centres notified across 36 states and union territories, run with local coaches.", href: SRC.kic, src: "Khelo India dashboard" },
  { t: "Khelo India athlete support", who: "Talents picked by the selection committee", what: "₹6.28 lakh a year per athlete at accredited academies, including ₹1.20 lakh as a cash allowance.", href: SRC.kiScholar, src: "Lok Sabha reply" },
  { t: "Khelo India Games", who: "School, university and para athletes", what: "Annual national Games. The 2025 youth edition was held in the under-18 category.", href: SRC.kiyg, src: "Olympics.com" },
  { t: "Target Olympic Podium Scheme", who: "Olympic and Paralympic prospects", what: "Running since September 2014. Pays for coaching and competition, plus a monthly allowance for the core group.", href: SRC.tops, src: "Sports Authority of India" },
  { t: "Khelo Bharat Niti 2025", who: "The whole sports system", what: "National sports policy launched on 10 July 2025 to build a performance-driven, inclusive sports system.", href: SRC.policy, src: "PIB" },
];
export const PARENT_FAQ: [string, string, [string, string]?][] = [
  ["Can my child apply to become a Khelo India athlete?", "No. Athletes cannot apply directly. A Talent Identification and Development Committee picks them at competitions, so the way in is to compete regularly at district, state and national age-group events.", ["Khelo India guide", SRC.kiHow]],
  ["How do I pick an academy?", "Start with the official lists: SAI centres and Khelo India accredited academies, both in our facilities finder. Visit before you join. Ask about coach qualifications, athlete-to-coach ratio, residential care, schooling arrangements and recent results.", ["Accredited academies", SRC.kiAccredited]],
  ["How do we balance school and sport?", "Most top athletes kept studying. Ask the academy how it arranges schooling and exams around training and travel. Many residential centres tie up with local schools."],
  ["What about nutrition and supplements?", "Food first, with advice from a qualified sports dietitian or doctor. Under anti-doping rules athletes are responsible for everything they take, so never use a supplement without professional advice."],
  ["How do I keep my child safe?", "The POSH Act applies to every National Sports Federation, and SAI's athlete wellbeing policy requires access to counselling. Ask the academy who its safeguarding officer is. Red flags include coaches isolating a child, unexplained secrecy, and pressure to train through pain.", ["PIB on POSH", SRC.posh]],
  ["What does it cost?", "Costs vary widely. Government centres are subsidised. Once selected, Khelo India athletes get yearly support, and TOPS covers elite athletes' coaching and competition. Ask your state sports department about state scholarships too.", ["TOPS", SRC.tops]],
];

/* ---------- sport quiz ---------- */
export type Trait = "speed" | "racket" | "team" | "combat" | "precision" | "strength" | "water" | "tall" | "compact" | "endurance" | "solo" | "group" | "young" | "mid" | "late";
export const QUIZ: { q: string; opts: [string, Trait][] }[] = [
  { q: "What does your child enjoy most?", opts: [["Running, jumping, throwing", "speed"], ["Rackets and quick reactions", "racket"], ["Team games with friends", "team"], ["Wrestling, sparring, contact", "combat"], ["Calm focus and aim", "precision"], ["Lifting and pushing heavy things", "strength"], ["Being in the water", "water"]] },
  { q: "Which build fits best?", opts: [["Tall, long arms and legs", "tall"], ["Compact and powerful", "compact"], ["Lean, can keep going for ages", "endurance"]] },
  { q: "Solo or team?", opts: [["Prefers to compete alone", "solo"], ["Loves being part of a team", "group"]] },
  { q: "How old is your child?", opts: [["Under 10", "young"], ["10 to 14", "mid"], ["15 or older", "late"]] },
];
export const QUIZ_SPORTS: { n: string; fac: string; w: Partial<Record<Trait, number>>; note: string }[] = [
  { n: "Athletics", fac: "Athletics", w: { speed: 3, tall: 1, endurance: 2, solo: 1, young: 1, mid: 1 }, note: "Olympic gold in Tokyo and 24 medals at Aichi-Nagoya 2026." },
  { n: "Badminton", fac: "Badminton", w: { racket: 3, endurance: 1, solo: 1, young: 1, mid: 1 }, note: "Two Olympic medals for PV Sindhu. The sport with the most academies on our list." },
  { n: "Table tennis", fac: "Table Tennis", w: { racket: 3, precision: 1, solo: 1, young: 1 }, note: "Commonwealth regulars and a medal at Aichi-Nagoya 2026." },
  { n: "Hockey", fac: "Hockey", w: { team: 3, speed: 1, endurance: 1, group: 2, mid: 1 }, note: "Eight Olympic golds, bronze in Tokyo and Paris." },
  { n: "Football", fac: "Football", w: { team: 3, endurance: 1, group: 2, young: 1 }, note: "The most widely available team sport at SAI centres." },
  { n: "Kabaddi", fac: "Kabaddi", w: { team: 2, combat: 1, compact: 1, group: 2, late: 1 }, note: "Double Asian Games gold in 2026." },
  { n: "Boxing", fac: "Boxing", w: { combat: 3, endurance: 1, solo: 1, mid: 1, late: 1 }, note: "Ten medals at Glasgow 2026. Strong programmes in the north-east and Haryana." },
  { n: "Wrestling", fac: "Wrestling", w: { combat: 3, compact: 2, solo: 1, young: 1, mid: 1 }, note: "A medal at every Olympics since 2008." },
  { n: "Judo", fac: "Judo", w: { combat: 2, compact: 1, solo: 1, young: 1 }, note: "A good first combat sport, with centres in many states." },
  { n: "Shooting", fac: "Shooting", w: { precision: 3, solo: 1, mid: 1, late: 2 }, note: "Three medals in Paris. Manu Bhaker started at 14." },
  { n: "Archery", fac: "Archery", w: { precision: 3, tall: 1, solo: 1, mid: 1, late: 1 }, note: "Five golds at Aichi-Nagoya 2026." },
  { n: "Weightlifting", fac: "Weightlifting", w: { strength: 3, compact: 2, solo: 1, mid: 1 }, note: "Olympic medals in 2000 and 2020." },
  { n: "Swimming", fac: "Swimming", w: { water: 3, tall: 1, endurance: 1, solo: 1, young: 2 }, note: "Best started young. A growing programme led by Srihari Nataraj." },
  { n: "Rowing and canoeing", fac: "Rowing", w: { water: 2, tall: 2, endurance: 2, strength: 1, late: 2 }, note: "Friendly to late starters, with NCOEs in Odisha and Kerala." },
  { n: "Gymnastics", fac: "Gymnastics", w: { compact: 2, strength: 1, young: 3 }, note: "Needs an early start and builds movement skills for every other sport." },
  { n: "Cricket", fac: "Cricket", w: { team: 2, group: 2, precision: 1, mid: 1 }, note: "Returns to the Olympics at LA28. Asian Games double gold in 2026." },
  { n: "Volleyball and basketball", fac: "Volleyball", w: { team: 2, tall: 3, group: 2, mid: 1 }, note: "Built for tall teenagers, with SAI centres in many states." },
];
export const scoreQuiz = (answers: Trait[]) =>
  QUIZ_SPORTS.map(s => ({ ...s, score: answers.reduce((t, a) => t + (s.w[a] ?? 0), 0) })).sort((a, b) => b.score - a.score).slice(0, 3);
