import { extractZip } from "../services/zipService.js";
import { detectFramework } from "../services/frameworkDetector.js";
import { normalizeProject } from "../services/normalizeService.js";
import { prepareFilesForDeployment } from "../services/fileService.js";
import { recommendProviders } from "../services/recommendService.js";

import { deployToVercel } from "../services/vercelService.js";
import { deployToNetlify } from "../services/netlifyService.js";
import { deployToFirebase } from "../services/firebaseService.js";

import fs from "fs-extra";
import path from "path";

export const deployProject = async (req, res) => {
  try {
    // -----------------------------
    // VALIDATE FILE UPLOAD
    // -----------------------------
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded. Please upload a ZIP file."
      });
    }

    const filePath = req.file.path;
    const provider = req.body?.provider || null;
    const projectName = req.body?.projectName || "deploybridge-app";

    console.log("📦 Uploaded file:", filePath);
    console.log("➡ Provider selected:", provider);
    console.log("➡ Project Name:", projectName);

    // -----------------------------
    // 1. Prepare extraction directory
    // -----------------------------
    const extractPath = path.join("temp", `extracted-${Date.now()}`);

    await fs.ensureDir(extractPath);

    // -----------------------------
    // 2. Extract ZIP
    // -----------------------------
    try {
      await extractZip(filePath, extractPath);
    } catch (zipErr) {
      console.error("❌ ZIP Extraction failed:", zipErr);

      fs.removeSync(filePath);
      fs.removeSync(extractPath);

      return res.status(500).json({
        error: "ZIP extraction failed. Ensure the file is a valid ZIP."
      });
    }

    // -----------------------------
    // 3. Detect Framework
    // -----------------------------
    let framework = "unknown";
    try {
      framework = await detectFramework(extractPath);
    } catch (fwErr) {
      console.error("❌ Framework detection failed:", fwErr);
    }

    console.log("🧠 Framework detected:", framework);

    // -----------------------------
    // 4. Normalize Files
    // -----------------------------
    try {
      await normalizeProject(extractPath, framework);
      console.log("🛠 Project normalization complete.");
    } catch (normErr) {
      console.error("❌ Normalization error:", normErr);
    }

    // -----------------------------
    // 5. Recommend Deployment Provider(s)
    // -----------------------------
    const recommendation = recommendProviders(framework);

    // If provider not selected → return recommendations only
    if (!provider || provider === "auto") {
      fs.removeSync(filePath);

      return res.json({
        success: true,
        stage: "recommendation",
        framework,
        recommendedProviders: recommendation.recommended,
        reason: recommendation.reason,
      });
    }

    // -----------------------------
    // 6. Prepare Files for Deployment
    // -----------------------------
    let files;
    try {
      files = await prepareFilesForDeployment(extractPath);
    } catch (prepErr) {
      console.error("❌ File preparation failed:", prepErr);

      fs.removeSync(filePath);
      fs.removeSync(extractPath);

      return res.status(500).json({ error: "Failed to prepare files for deployment." });
    }

    // -----------------------------
    // 7. Deploy to SELECTED Provider
    // -----------------------------
    let deployResult = null;

    try {
      if (provider === "vercel") {
        deployResult = await deployToVercel(files, projectName);
      } else if (provider === "netlify") {
        deployResult = await deployToNetlify(files, projectName);
      } else if (provider === "firebase") {
        deployResult = await deployToFirebase(files, projectName);
      } else {
        throw new Error("Invalid provider");
      }
    } catch (deployErr) {
      console.error("❌ Provider Deployment Failed:", deployErr);

      fs.removeSync(filePath);
      fs.removeSync(extractPath);

      return res.status(500).json({
        error: deployErr.message || "Deployment failed at provider.",
      });
    }

    // -----------------------------
    // 8. Cleanup
    // -----------------------------
    fs.removeSync(filePath);
    fs.removeSync(extractPath);

    // -----------------------------
    // 9. SUCCESS RESPONSE
    // -----------------------------
    return res.json({
      success: true,
      provider,
      framework,
      ...deployResult,
    });

  } catch (err) {
    console.error("❌ Unhandled Deployment Error:", err);

    return res.status(500).json({
      error: err.message || "Unexpected deployment error",
    });
  }
};
