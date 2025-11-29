import extract from "extract-zip";
import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";

// 🔎 Helper: find first dist/ or build/ folder anywhere inside root
const findBuildFolder = async (root) => {
  const entries = await fs.readdir(root);

  for (const entry of entries) {
    const fullPath = path.join(root, entry);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      // If folder itself is dist or build -> use it
      if (entry === "dist" || entry === "build") {
        return fullPath;
      }

      // Otherwise, search inside it
      const found = await findBuildFolder(fullPath);
      if (found) return found;
    }
  }

  return null;
};

export const deployProject = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const zipPath = req.file.path;
    const extractPath = `temp/extracted-${Date.now()}`;
    await fs.ensureDir(extractPath);

    // 1️⃣ Extract ZIP
    await extract(zipPath, { dir: path.resolve(extractPath) });

    // 2️⃣ Remove top-level node_modules (if any)
    await fs.remove(path.join(extractPath, "node_modules"));

    // 3️⃣ Find dist/build folder (recursively)
    let deployFolder = await findBuildFolder(extractPath);

    // If not found, assume the extracted root itself is the built folder
    if (!deployFolder) {
      deployFolder = extractPath;
    }

    console.log("Deploying folder:", deployFolder);

    // 4️⃣ Convert files in deployFolder to Vercel "files" format
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
        encoding: "base64",
      });
    }
  }
};

    await walk(deployFolder);

    const teamId = process.env.VERCEL_ORG_ID; // empty for personal account

    // 5️⃣ Create deployment on Vercel
    const vercelUrl = `https://api.vercel.com/v13/deployments${
      teamId ? `?teamId=${teamId}` : ""
    }`;

    console.log("Creating Vercel deployment at:", vercelUrl);

    const vercelRes = await fetch(vercelUrl, {
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
      console.error("Vercel Error:", deployment);
      return res.status(500).json({
        error: deployment.error?.message || "Deployment failed on Vercel",
        details: deployment,
      });
    }

    const deploymentId = deployment.id;

    // 🔹 Start with URL from creation response (often already set)
    let finalUrl = deployment.url || null;

    // 6️⃣ Poll Vercel until deployment is READY
    for (let i = 0; i < 20; i++) {
      const checkUrl = `https://api.vercel.com/v13/deployments/${deploymentId}${
        teamId ? `?teamId=${teamId}` : ""
      }`;

      const checkRes = await fetch(checkUrl, {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      });

      const json = await checkRes.json();
      console.log("Deployment status:", json.readyState);

      if (json.readyState === "READY") {
        if (json.alias && json.alias.length > 0) {
          finalUrl = json.alias[0]; // preferred
        } else if (json.url) {
          finalUrl = json.url; // fallback if no alias array
        }
        break;
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    // 7️⃣ Cleanup temp files
    await fs.remove(zipPath);
    await fs.remove(extractPath);

    if (!finalUrl) {
      return res.json({
        success: true,
        message:
          "Deployment created but still building. Check the Vercel dashboard.",
      });
    }

// Ensure we always send full https:// URL
const fullUrl = finalUrl.startsWith("http")
  ? finalUrl
  : `https://${finalUrl}`;

console.log("Deployment final URL:", fullUrl);   // <-- ADD THIS

return res.json({
  success: true,
  url: fullUrl,
});

  } catch (err) {
    console.error("Deploy Error:", err);
    return res.status(500).json({ error: err.message });
  }
}; 