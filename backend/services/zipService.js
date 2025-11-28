import extract from "extract-zip";
import fs from "fs-extra";
import path from "path";

export const extractZip = async (zipPath, destPath) => {
  const fullDestPath = path.resolve(destPath);

  await fs.ensureDir(fullDestPath);

  try {
    await extract(zipPath, { dir: fullDestPath });
    console.log("📂 ZIP Extracted to:", fullDestPath);
  } catch (error) {
    console.error("❌ ZIP extraction error:", error);
    throw new Error("Failed to extract ZIP");
  }
};
