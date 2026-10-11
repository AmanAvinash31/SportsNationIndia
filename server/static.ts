import express from "express";
import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { registerSeoRoutes, renderPage } from "./seo";
import { LEGACY } from "../client/src/lib/seo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }
  const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  registerSeoRoutes(app);

  // Unknown API routes return JSON, never the app shell.
  app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));

  // Old addresses move permanently.
  const legacy = new Map(LEGACY);
  app.use((req, res, next) => {
    const to = legacy.get(req.path.replace(/\/+$/, "") || "/");
    if (to && (req.method === "GET" || req.method === "HEAD")) return res.redirect(301, to);
    // Trailing slashes: one canonical form.
    if (req.path.length > 1 && req.path.endsWith("/") && !req.path.startsWith("/assets")) return res.redirect(301, req.path.replace(/\/+$/, "") + (req.url.slice(req.path.length) || ""));
    next();
  });

  app.use(express.static(distPath, {
    index: false,
    setHeaders: (res, file) => {
      if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      else if (/\.(webp|png|jpe?g|svg|ico|woff2?)$/.test(file)) res.setHeader("Cache-Control", "public, max-age=604800");
    },
  }));

  // Every other GET gets the app shell, with page-specific tags and readable content.
  app.get("/{*path}", (req, res) => {
    let p = req.originalUrl.split("?")[0]; try { p = decodeURIComponent(p); } catch { /* malformed escape: use raw */ }
    if (/\.[a-z0-9]{2,5}$/i.test(p)) return res.status(404).type("text/plain").send("Not found");
    const { html, status } = renderPage(template, p, req);
    res.status(status).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }).send(html);
  });
}
