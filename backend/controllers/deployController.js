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

    // Remove node_modules
    const nm = path.join(extractPath, "node_modules");
    if (fs.existsSync(nm)) await fs.remove(nm);

    // Find dist/build
    let deployFolder = null;
    if (fs.existsSync(path.join(extractPath, "dist")))
      deployFolder = path.join(extractPath, "dist");
    else if (fs.existsSync(path.join(extractPath, "build")))
      deployFolder = path.join(extractPath, "build");
    else
      return res.status(400).json({
        error: "Project must contain dist/ or build/ folder",
      });

    // Convert files to Vercel format
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

    // Create deployment
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

    const deployment = await vercelRes.json();
    if (!vercelRes.ok) {
      console.log("Vercel Error", deployment);
      return res
        .status(500)
        .json({ error: deployment.error?.message || "Deployment failed" });
    }

    const deploymentId = deployment.id;

    // Poll for READY state
    let finalUrl = null;

    for (let i = 0; i < 20; i++) {
      const checkRes = await fetch(
        `https://api.vercel.com/v13/deployments/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          },
        }
      );

      const json = await checkRes.json();

      if (json.readyState === "READY") {
        // 🔥 Correct way: take URL from alias[0]
        if (json.alias && json.alias.length > 0) {
          finalUrl = json.alias[0];
        }
        break;
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    // Cleanup
    await fs.remove(zipPath);
    await fs.remove(extractPath);

    if (!finalUrl) {
      return res.json({
        success: true,
        message:
          "Deployment created but still building. Check the Vercel dashboard.",
      });
    }

    return res.json({
      success: true,
      url: `https://${finalUrl}`,
    });
  } catch (err) {
    console.error("Deploy Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
