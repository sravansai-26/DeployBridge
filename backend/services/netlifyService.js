import fetch from "node-fetch";

export const deployToNetlify = async (files, projectName) => {
  const body = {
    files: {},
  };

  files.forEach(f => {
    body.files[`/${f.file}`] = f.data;
  });

  const response = await fetch(
    `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NETLIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Netlify Error:", result);
    throw new Error(JSON.stringify(result));
  }

  return {
    liveUrl: result.deploy_ssl_url || result.deploy_url,
    deploymentId: result.id,
  };
};
