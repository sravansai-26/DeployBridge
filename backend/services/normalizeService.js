import fs from "fs-extra";
import path from "path";
import {
  generateReactConfig,
  generateViteConfig,
  generateNextConfig,
  generateStaticConfig,
  generateFlaskConfig
} from "./configGenerator.js";

export const normalizeProject = async (dir, framework) => {
  console.log("🔧 Normalizing project...");

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    console.warn("⚠ Normalization skipped. Directory does not exist:", dir);
    return;
  }

  try {
    switch (framework) {
      case "react":
        console.log("⚙ Applying React normalization");
        await safeNormalize(() => generateReactConfig(dir));
        break;

      case "vite":
        console.log("⚙ Applying Vite normalization");
        await safeNormalize(() => generateViteConfig(dir));
        break;

      case "next":
        console.log("⚙ Applying Next.js normalization");
        await safeNormalize(() => generateNextConfig(dir));
        break;

      case "static":
        console.log("⚙ Applying Static Site normalization");
        await safeNormalize(() => generateStaticConfig(dir));
        break;

      case "flask":
        console.log("⚙ Applying Flask normalization");
        await safeNormalize(() => generateFlaskConfig(dir));
        break;

      case "node":
        console.log("Node project: No normalization required.");
        break;

      default:
        console.log("⚠ Unknown framework → treating as static");
        await safeNormalize(() => generateStaticConfig(dir));
        break;
    }

    console.log("✨ Normalization Completed");
  } catch (err) {
    console.error("❌ Normalization error:", err);
    console.log("⚠ Continuing deployment despite normalization errors…");
  }
};

/**
 * Wrap config generators safely so they NEVER crash the backend.
 */
const safeNormalize = async (fn) => {
  try {
    await fn();
  } catch (err) {
    console.error("⚠ Normalization step failed but was handled:", err.message);
  }
};
