import fs from "fs";
import path from "path";

export const detectFramework = async (dir) => {
  try {
    const has = (file) => fs.existsSync(path.join(dir, file));

    // -----------------------------
    // 1. package.json detection
    // -----------------------------
    if (has("package.json")) {
      try {
        const pkgPath = path.join(dir, "package.json");
        const pkgRaw = fs.readFileSync(pkgPath, "utf-8");
        const pkg = JSON.parse(pkgRaw);

        const deps = pkg.dependencies || {};
        const devDeps = pkg.devDependencies || {};

        // Next.js
        if (deps.next || devDeps.next) return "next";

        // React apps (Create React App / React projects)
        if (deps.react || devDeps.react) return "react";

        // Vite (JS / React / Vue / Svelte)
        if (deps.vite || devDeps.vite) return "vite";

        // Node.js backend
        if (deps.express || devDeps.express) return "node";
      } catch (err) {
        console.error("⚠ Failed to read package.json:", err.message);
      }
    }

    // -----------------------------
    // 2. Next.js special folder detection
    // -----------------------------
    if (has("next.config.js") || has("next.config.mjs")) return "next";

    // Must check only top-level "app" and "pages" folder:
    if (has("app") || has("pages")) return "next";

    // -----------------------------
    // 3. Node backend detection
    // -----------------------------
    if (has("server.js") || has("app.js")) return "node";

    // -----------------------------
    // 4. Python Flask
    // -----------------------------
    if (has("app.py")) return "flask";

    // -----------------------------
    // 5. Static HTML
    // -----------------------------
    if (has("index.html")) return "static";

    return "unknown";
  } catch (error) {
    console.error("❌ Framework detection failed:", error);
    return "unknown"; // Never throw — prevents server crash
  }
};
