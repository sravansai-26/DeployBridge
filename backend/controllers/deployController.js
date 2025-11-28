import extract from "extract-zip";
import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";

export const deployProject = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const zipPath = req.file.path;
    const extractPath = `temp/extracted-${Date.now()}`;
    await fs.ensureDir(extractPath);

    // Extract ZIP
    await extract(zipPath, { dir: path.resolve(extractPath) });

    // Remove node_modules if exists
    const nm = path.join(extractPath, "node_modules");
    if (fs.existsSync(nm)) await fs.remove(nm);

    // Find dist or build folder
    let deployFolder = null;
    if (fs.existsSync(path.join(extractPath, "dist"))) {
      deployFolder = path.join(extractPath, "dist");
    } else if (fs.existsSync(path.join(extractPath, "build"))) {
      deployFolder = path.join(extractPath, "build");
    } else {
      return res.status(400).json({
        error: "Project must contain dist/ or build/ folder"
      });
    }

    // Convert files to Vercel upload format
    const files = [];
    const walk = async (folder) => {
      const items = await fs.readdir(folder);
      for (let item of items) {
        const full = path.join(folder, item);
        const stat = await fs.stat(full);

        if (stat.isDirectory()) {
          await walk(full);
        } else {
          const content = await fs.readFile(full);
          files.push({
            file: path.relative(deployFolder, full).replace(/\\/g, "/"),
            data: content.toString("base64"),
          });
        }
      }
    };
    await walk(deployFolder);

    // Deploy to Vercel
    const vercelRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "deploybridge-app",
        project: process.env.VERCEL_PROJECT_ID,
        files,
        target: "production",
      }),
    });

    const result = await vercelRes.json();

    if (!vercelRes.ok) {
      console.log("Vercel Error", result);
      return res.status(500).json({ error: result.error?.message });
    }

    // Cleanup
    fs.remove(zipPath);
    fs.remove(extractPath);

    return res.json({
      success: true,
      url: `https://${result.url}`,
    });

  } catch (err) {
    console.error("Deploy Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
