import fs from "fs-extra";
import path from "path";

/**
 * Safely walks a directory tree and collects files for deployment.
 * Converts each file to Base64 while preventing crashes.
 */
export const prepareFilesForDeployment = async (dir) => {
  const fileList = [];

  const walk = async (folder) => {
    let items;

    try {
      items = await fs.readdir(folder);
    } catch (err) {
      console.error("⚠ Failed to read folder:", folder, err);
      return; // Skip this folder
    }

    for (const item of items) {
      const fullPath = path.join(folder, item);

      let stat;
      try {
        stat = await fs.stat(fullPath);
      } catch (err) {
        console.error("⚠ Failed to stat:", fullPath, err);
        continue;
      }

      // Folder → recurse
      if (stat.isDirectory()) {
        // skip dangerous folders
        if (item === "node_modules" || item.startsWith(".")) continue;
        await walk(fullPath);
        continue;
      }

      // Skip oversized files (common crash cause)
      if (stat.size > 5 * 1024 * 1024) {
        console.warn("⚠ Skipping large file (5MB+):", fullPath);
        continue;
      }

      // Read file content safely
      let base64Data;
      try {
        const buffer = await fs.readFile(fullPath);
        base64Data = buffer.toString("base64");
      } catch (err) {
        console.error("⚠ Failed to read file:", fullPath, err);
        continue;
      }

      const relativePath = path
        .relative(dir, fullPath)
        .replace(/\\/g, "/"); // Windows fix

      fileList.push({
        file: relativePath,
        data: base64Data,
      });
    }
  };

  await walk(dir);
  return fileList;
};
