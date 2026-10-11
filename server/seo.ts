import type { Express, Request } from "express";
import { seoFor, sitemapEntries, CRAWL_NAV, SITE_NAME, TAGLINE, type Seo } from "../client/src/lib/seo";

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Public origin, e.g. https://momentumindia.in. Set SITE_URL in production. */
export function siteUrl(req?: Request) {
  const env = process.env.SITE_URL?.replace(/\/+$/, "");
  if (env) return env;
  if (!req) return "http://localhost:5000";
  return `${req.protocol}://${req.get("host")}`;
}

const ABS_KEYS = new Set(["url", "image", "logo", "mainEntityOfPage", "item"]);
function absolutise(v: unknown, origin: string, key = ""): unknown {
  if (typeof v === "string") return ABS_KEYS.has(key) && v.startsWith("/") ? origin + v : v;
  if (Array.isArray(v)) return v.map(x => absolutise(x, origin, key));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolutise(x, origin, k)]));
  return v;
}

function headTags(s: Seo, origin: string) {
  const url = origin + (s.path === "/" ? "/" : s.path);
  const img = origin + s.image;
  const ld = [...(s.jsonld ?? [])];
  if (s.crumbs?.length) ld.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "/"] as [string, string], ...s.crumbs, [s.h1, s.path] as [string, string]].map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })) });
  return [
    `<title>${esc(s.title)}</title>`,
    `<meta name="description" content="${esc(s.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta name="robots" content="${s.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${s.type === "article" ? "article" : s.type === "profile" ? "profile" : "website"}" />`,
    `<meta property="og:title" content="${esc(s.title)}" />`,
    `<meta property="og:description" content="${esc(s.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(img)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    s.published ? `<meta property="article:published_time" content="${esc(s.published)}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(s.title)}" />`,
    `<meta name="twitter:description" content="${esc(s.description)}" />`,
    `<meta name="twitter:image" content="${esc(img)}" />`,
    ...ld.map(j => `<script type="application/ld+json">${JSON.stringify(absolutise(j, origin)).replace(/</g, "\\u003c")}</script>`),
  ].filter(Boolean).join("\n    ");
}

/** Plain HTML that crawlers and no-JS visitors can read. React replaces it on load. */
function shell(s: Seo) {
  const a = (l: string, h: string) => `<a href="${esc(h)}">${esc(l)}</a>`;
  return `<div class="seo-shell" style="max-width:860px;margin:0 auto;padding:24px 20px;font-family:system-ui,sans-serif;line-height:1.55;color:#e8e6e1;background:#070a14">
  <header><p><a href="/" style="color:#ff9933;font-weight:700;text-decoration:none">${SITE_NAME}</a> · ${esc(TAGLINE)}</p>
  <nav aria-label="Primary"><ul style="display:flex;flex-wrap:wrap;gap:6px 14px;list-style:none;padding:0">${CRAWL_NAV.map(([l, h]) => `<li>${a(l, h)}</li>`).join("")}</ul></nav></header>
  <main>${s.crumbs?.length ? `<nav aria-label="Breadcrumb"><p>${[["Home", "/"], ...s.crumbs].map(([l, h]) => a(l, h)).join(" › ")}</p></nav>` : ""}
  <h1>${esc(s.h1)}</h1>
  ${s.body.map(p => `<p>${esc(p)}</p>`).join("\n  ")}
  ${s.links?.length ? `<ul>${s.links.map(([l, h]) => `<li>${a(l, h)}</li>`).join("")}</ul>` : ""}
  <noscript><p>Turn on JavaScript for interactive medal tables, forms and charts.</p></noscript></main></div>`;
}

export function renderPage(template: string, pathname: string, req: Request) {
  const s = seoFor(pathname);
  const origin = siteUrl(req);
  let html = template
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(name="description"|property="og:[^"]+"|name="twitter:[^"]+")[^>]*>\s*/gi, "");
  html = html.replace(/<head>/i, `<head>\n    <base href="/" />\n    ${headTags(s, origin)}\n    <script>window.__MI_PATH__=1</script>`);
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${shell(s)}</div>`);
  return { html, status: s.status };
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").set("Cache-Control", "public, max-age=3600").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", (req, res) => {
    const o = siteUrl(req);
    const rows = sitemapEntries().map(e => `  <url><loc>${esc(o + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<priority>${e.priority.toFixed(1)}</priority></url>`).join("\n");
    res.type("application/xml").set("Cache-Control", "public, max-age=3600").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`);
  });
}
