import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// The production server injects window.__MI_PATH__ and serves real paths (/news/...).
// Static previews (no server) fall back to hash addresses (#/news/...).
export const PATH_MODE = typeof window !== "undefined" && !!(window as any).__MI_PATH__;

if (PATH_MODE) {
  // Old shared links like /#/news/story move to /news/story.
  if (window.location.hash.startsWith("#/")) window.history.replaceState(null, "", window.location.hash.slice(1) || "/");
} else if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);
