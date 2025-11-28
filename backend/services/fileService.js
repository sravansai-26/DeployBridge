import fs from "fs";
import path from "path";

export const prepareFilesForDeployment = async (dir) => {
  const fileList = [];

  const walk = async (folder) => {
    const items = fs.readdirSync(folder);

    for (let item of items) {
      const fullPath = path.join(folder, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await walk(fullPath);
      } else {
        const base64Data = fs.readFileSync(fullPath, "base64");
        const relativePath = path
          .relative(dir, fullPath)
          .replace(/\\/g, "/"); // fix windows backslashes

        fileList.push({
          file: relativePath,
          data: base64Data,
        });
      }
    }
  };

  await walk(dir);
  return fileList;
};
