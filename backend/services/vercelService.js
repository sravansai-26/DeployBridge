import fetch from "node-fetch";

export const deployToVercel = async (files, projectName) => {
  const response = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      project: process.env.VERCEL_PROJECT_ID,
      files,
      target: "production",
    }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(JSON.stringify(result));

  return {
    liveUrl: `https://${result.url}`,
    deploymentId: result.id,
  };
};
