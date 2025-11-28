import fs from "fs";
import path from "path";

export const detectFramework = async (dir) => {
  const has = (file) => fs.existsSync(path.join(dir, file));

  // React / Vite
  if (has("package.json")) {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json")));

    if (pkg.dependencies?.react) return "react";
    if (pkg.devDependencies?.vite) return "vite";
  }

  // Next.js
  if (has("next.config.js") || has("next.config.mjs")) return "next";

  if (fs.existsSync(path.join(dir, "app"))) return "next";
  if (fs.existsSync(path.join(dir, "pages"))) return "next";

  // Node.js Backend
  if (has("server.js") || has("app.js")) return "node";

  // Python Flask
  if (has("app.py")) return "flask";

  // Static HTML
  if (has("index.html")) return "static";

  return "unknown";
};
