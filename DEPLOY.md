# Deploying Momentum India

One Node.js process serves the website, the API and the search-engine files on `$PORT`.
Data lives in a single SQLite file (`data.db`) inside `DATA_DIR`, which must be on a **persistent disk**.

## Environment variables

| Name | Required | What it does |
|---|---|---|
| `SITE_URL` | Yes | Public address, no trailing slash, e.g. `https://momentumindia.in`. Used in canonical links, the sitemap and social previews. |
| `DATA_DIR` | Yes | Folder on a persistent disk for `data.db`, e.g. `/var/data`. |
| `ADMIN_TOKEN` | Yes | Long random string (16+ characters) to sign in at `/admin`. Leave empty to switch admin off. |
| `RESULTS_FEED_URL` | No | A JSON address the server checks for new medals and scores (format below). |
| `RESULTS_FEED_MINUTES` | No | How often to check the feed. Default 10, minimum 2. |
| `PORT` | No | Set automatically by most hosts. Defaults to 5000. |

Generate a token: `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`

## Option A: Render (simplest)

1. Push this folder to a GitHub repository.
2. In Render, choose **New > Blueprint** and select the repository. `render.yaml` creates the web service, a 1 GB disk at `/var/data` and an `ADMIN_TOKEN`.
3. Set `SITE_URL` in the service's Environment tab.
4. Add your domain under **Settings > Custom Domains** and create the DNS records Render shows (a CNAME for `www`, an A/ALIAS record for the bare domain). HTTPS is issued automatically.

## Option B: Any Docker host (Railway, Fly.io, a VPS)

```bash
docker build -t momentum-india .
docker run -d -p 80:5000 -v momentum-data:/data \
  -e SITE_URL=https://momentumindia.in -e ADMIN_TOKEN=... momentum-india
```
Mount a volume at `/data`. Put HTTPS in front (the host's proxy, Caddy or Nginx).

## Option C: Plain Node

```bash
npm ci && npm run build
SITE_URL=https://momentumindia.in DATA_DIR=/var/data ADMIN_TOKEN=... npm start
```
Requires Node 20+. `better-sqlite3` compiles on install, so build tools (python3, make, g++) must be present.

## Health and backups

- Health check: `GET /healthz` returns `{"ok":true}`.
- Backups: sign in at `/admin` and click **Database backup**, or copy `data.db` from the disk. Do this weekly at minimum.
- Vercel and Netlify do not suit this app as-is: their servers do not keep files between requests, so the SQLite data would be lost.

## After launch: search engines

1. Open `https://YOUR-DOMAIN/robots.txt` and `/sitemap.xml` to confirm they load.
2. Add the site to **Google Search Console** (verify with a DNS TXT record) and submit `/sitemap.xml`.
3. Do the same in **Bing Webmaster Tools** (you can import from Google Search Console).
4. Test a few pages with Google's Rich Results Test (articles, athlete profiles, FAQ).

## How search works in this app

- Real page addresses (`/news/...`, `/athletes/...`). Old `#/...` links are converted automatically, and retired addresses return 301 redirects.
- Every page is served with its own title, description, canonical link, Open Graph and Twitter tags, and structured data (NewsArticle, Person, FAQPage, BreadcrumbList, Organization, WebSite).
- Every page also contains readable HTML (heading, text, links) for crawlers and visitors without JavaScript. React replaces it once the app loads.
- Unknown addresses return a real 404. `/admin` and `/api/` are excluded from indexing.
- Page metadata lives in `client/src/lib/seo.ts`. When you add a page, add an entry there too.

## Updating content

| What | File |
|---|---|
| Articles, medal tables, athletes, FAQs | `client/src/data/content.json` |
| Ticker, countdowns, "Updated" date | `client/src/data/index.ts` |
| Pathway, facilities, stories, LA 2028 | `client/src/data/rise.ts`, `client/src/data/facilities.json` |
| Build a sporting nation page | `client/src/pages/nation.tsx` |
| Para Games facts, broadcasters, leagues, state tables | `client/src/data/live.ts` |
| Page titles and descriptions | `client/src/lib/seo.ts` |

Edit, run `npm run build`, and redeploy (on Render, pushing to GitHub redeploys automatically).
Pledges, nominations, competitions and sponsorship requests are stored in the database and do not need a redeploy. Review them at `/admin`: nominations, competitions and sponsor requests stay hidden until approved.

## Live results: three ways to update

1. **By hand:** in `/admin`, open **Live medals** or **League fixtures and results** and use **Add new entry**. Enter scores on any fixture and press Save; it is marked full time automatically.
2. **Push:** send results from any script or automation:
   ```bash
   curl -X POST https://YOUR-DOMAIN/api/admin-ingest \
     -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
     --data @scripts/sample-feed.json
   ```
3. **Pull:** set `RESULTS_FEED_URL` to a JSON file in the same format (for example one your scorer updates in a GitHub Gist). The server checks it every `RESULTS_FEED_MINUTES`.

The format is in `scripts/sample-feed.json`. Entries are matched by `ext_id` (or by Games, event, athlete and medal, or league, date and teams), so sending the same result twice updates it rather than duplicating it. The Asian Para Games page refreshes every minute while the Games are on. The admin page shows the last five feed runs.

## Fan zone

Prediction questions live in `/admin` under **Fan zone predictions**. Add a question with options separated by `|` and a closing time. After the event, pick the correct answer on the question and press Save: it is marked settled and points go to everyone who picked it.

## Community listings

Clubs and coaches, grounds, gear, sponsor offers and gear requests all wait in `/admin` until you approve them. For offers and requests, contact both sides yourself and then press **Mark introduced**. Add wins to the **Success wall** when a backed athlete gets a result.

## Security notes

- Security headers, gzip compression, a 64 KB request limit and per-IP spam limits (30 submissions per 10 minutes) are built in.
- Wrong admin tokens are locked out after 10 attempts for 15 minutes.
- Admin responses and form bodies are not written to logs in production.
- No emails are sent yet. The newsletter list is stored but not mailed; connect a provider such as Resend, Postmark or Amazon SES before promising emails.
