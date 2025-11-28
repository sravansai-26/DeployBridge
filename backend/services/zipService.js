import extract from "extract-zip";
import fs from "fs-extra";
import path from "path";

export const extractZip = async (zipPath, destPath) => {
  if (!zipPath) {
    throw new Error("ZIP file path missing.");
  }

  const fullDestPath = path.resolve(destPath);

  try {
    // Ensure destination folder exists
    await fs.ensureDir(fullDestPath);

    // Validate ZIP exists
    if (!fs.existsSync(zipPath)) {
      throw new Error("Uploaded file does not exist.");
    }

    console.log("📦 Extracting ZIP:", zipPath);
    console.log("📁 Destination:", fullDestPath);

    // Try extracting
    await extract(zipPath, { dir: fullDestPath });

    console.log("✅ ZIP Extracted Successfully:", fullDestPath);
    return fullDestPath;

  } catch (error) {
    console.error("❌ ZIP extraction error:", error.message || error);

    // ON ERROR: Cleanup partially extracted files
    try {
      if (fs.existsSync(fullDestPath)) {
        await fs.remove(fullDestPath);
      }
    } catch (cleanupErr) {
      console.error("⚠ Failed to clean up extraction folder:", cleanupErr);
    }

    throw new Error("Failed to extract ZIP. Ensure file is a valid ZIP archive.");
  }
};
