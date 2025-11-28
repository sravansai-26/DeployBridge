import fetch from "node-fetch";

/**
 * Deploys files to Vercel in a safe, stable, crash-proof way
 */
export const deployToVercel = async (files, projectName) => {
  // ---------------------------
  // VALIDATE ENV VARIABLES
  // ---------------------------
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token) {
    throw new Error("Missing VERCEL_TOKEN in environment variables.");
  }

  if (!projectId) {
    throw new Error("Missing VERCEL_PROJECT_ID in environment variables.");
  }

  // ---------------------------
  // PREPARE REQUEST BODY
  // ---------------------------
  const payload = {
    name: projectName,
    project: projectId,
    files,
    target: "production",
  };

  let response;
  let result;

  try {
    response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    console.error("❌ Network error while calling Vercel:", networkErr);
    throw new Error("Network error while contacting Vercel API.");
  }

  // ---------------------------
  // SAFELY PARSE JSON
  // (Vercel may return HTML errors → JSON.parse will fail)
  // ---------------------------
  try {
    result = await response.json();
  } catch (jsonErr) {
    console.error("❌ Vercel returned non-JSON response:", jsonErr);

    throw new Error(
      "Vercel returned an invalid response. Your request may be malformed or unauthorized."
    );
  }

  // ---------------------------
  // ERROR HANDLING
  // ---------------------------
  if (!response.ok) {
    console.error("❌ Vercel Deployment Error:", result);

    const errorMsg =
      result.error?.message ||
      result.error?.code ||
      JSON.stringify(result, null, 2);

    throw new Error("Vercel deployment failed: " + errorMsg);
  }

  // ---------------------------
  // SUCCESS RESPONSE
  // ---------------------------
  if (!result.url) {
    throw new Error("Deployment succeeded but Vercel did not return a URL.");
  }

  return {
    liveUrl: `https://${result.url}`,
    deploymentId: result.id,
    vercelResponse: result,
  };
};
