import { extractZip } from "../services/zipService.js";
import { detectFramework } from "../services/frameworkDetector.js";
import { normalizeProject } from "../services/normalizeService.js";
import { prepareFilesForDeployment } from "../services/fileService.js";
import { recommendProviders } from "../services/recommendService.js";

import { deployToVercel } from "../services/vercelService.js";
import { deployToNetlify } from "../services/netlifyService.js";
import { deployToFirebase } from "../services/firebaseService.js";

import fs from "fs-extra";

export const deployProject = async (req, res) => {
  try {
    const provider = req.body.provider; // can be undefined / auto / vercel / netlify / firebase
    const projectName = req.body.projectName || "deploybridge-app";
    const filePath = req.file.path;

    console.log("📦 Uploaded:", filePath);

    // -----------------------------
    // 1. Extract uploaded ZIP file
    // -----------------------------
    const extractPath = `temp/extracted-${Date.now()}`;
    await extractZip(filePath, extractPath);

    // -----------------------------
    // 2. Detect Framework
    // -----------------------------
    const framework = await detectFramework(extractPath);
    console.log("🧠 Detected Framework:", framework);

    // -----------------------------
    // 3. Normalize / Auto-Fix Project
    // -----------------------------
    await normalizeProject(extractPath, framework);
    console.log("🛠 Normalization Complete");

    // -----------------------------
    // 4. Recommend Best Providers
    // -----------------------------
    const recommendation = recommendProviders(framework);
    console.log("🤖 Recommended Providers:", recommendation);

    // If no provider selected → return recommendation only
    if (!provider || provider === "auto") {
      fs.removeSync(filePath); // remove uploaded zip only
      return res.json({
        success: true,
        stage: "recommendation",
        framework,
        recommendedProviders: recommendation.recommended,
        reason: recommendation.reason
      });
    }

    // -----------------------------
    // 5. Convert Files → Vercel Format
    // -----------------------------
    const files = await prepareFilesForDeployment(extractPath);

    // -----------------------------
    // 6. Deploy to selected provider
    // -----------------------------
    let result;

    if (provider === "vercel") {
      result = await deployToVercel(files, projectName);
    } 
    else if (provider === "netlify") {
      result = await deployToNetlify(files, projectName);
    } 
    else if (provider === "firebase") {
      result = await deployToFirebase(files, projectName);
    } 
    else {
      fs.removeSync(extractPath);
      fs.removeSync(filePath);
      return res.status(400).json({ error: "Invalid provider" });
    }

    // -----------------------------
    // 7. Cleanup temporary folders
    // -----------------------------
    fs.removeSync(extractPath);
    fs.removeSync(filePath);

    // -----------------------------
    // 8. Return Deployment Response
    // -----------------------------
    return res.json({
      success: true,
      provider,
      framework,
      ...result,
    });

  } catch (err) {
    console.error("❌ Deployment error:", err);

    return res.status(500).json({
      error: err.message || "Unexpected deployment error"
    });
  }
};
