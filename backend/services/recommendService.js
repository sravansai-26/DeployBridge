// Recommend best deployment providers based on detected framework

export const recommendProviders = (framework) => {
  switch (framework) {

    case "react":
    case "vite":
      return {
        framework,
        recommended: ["vercel", "netlify"],
        reason: "SPA frameworks work best on Vercel or Netlify."
      };

    case "next":
      return {
        framework,
        recommended: ["vercel"],
        reason: "Next.js is officially optimized for Vercel."
      };

    case "static":
      return {
        framework,
        recommended: ["netlify", "vercel"],
        reason: "Static sites deploy extremely fast on Netlify or Vercel."
      };

    case "node":
      return {
        framework,
        recommended: ["vercel"],
        reason: "Node.js serverless apps run best on Vercel Serverless Functions."
      };

    case "flask":
      return {
        framework,
        recommended: ["firebase"],
        reason: "Python/Flask requires custom hosting; Firebase replacements coming soon."
      };

    default:
      return {
        framework: "unknown",
        recommended: ["netlify"],
        reason: "Unknown project type. Treating as static site for safest deployment."
      };
  }
};
