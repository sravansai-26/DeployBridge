import fs from "fs-extra";
import path from "path";
import { generateReactConfig, generateViteConfig, generateNextConfig, generateStaticConfig, generateFlaskConfig } from "./configGenerator.js";

export const normalizeProject = async (dir, framework) => {
  console.log("🔧 Normalizing project...");

  if (framework === "react") {
    await generateReactConfig(dir);
  }

  if (framework === "vite") {
    await generateViteConfig(dir);
  }

  if (framework === "next") {
    await generateNextConfig(dir);
  }

  if (framework === "static") {
    await generateStaticConfig(dir);
  }

  if (framework === "flask") {
    await generateFlaskConfig(dir);
  }

  if (framework === "node") {
    // Node usually already fine
    console.log("Node project: No normalization needed");
  }

  if (framework === "unknown") {
    console.log("⚠ Unknown framework. DeployBridge will treat as static site.");
    await generateStaticConfig(dir);
  }

  console.log("✨ Normalization Completed");
};
