import fs from "fs";
import path from "path";

const write = (filePath, data) => {
  fs.writeFileSync(filePath, data);
  console.log("📝 Created:", filePath);
};

// ----------------- REACT ------------------
export const generateReactConfig = async (dir) => {
  const pkgPath = path.join(dir, "package.json");

  if (!fs.existsSync(pkgPath)) {
    write(pkgPath, JSON.stringify({
      name: "react-app",
      version: "1.0.0",
      scripts: {
        build: "react-scripts build",
        start: "react-scripts start"
      }
    }, null, 2));
  }

  // Add vercel.json for SPA routing
  write(path.join(dir, "vercel.json"), JSON.stringify({
    rewrites: [{ source: "/(.*)", destination: "/index.html" }]
  }, null, 2));
};


// ----------------- VITE ------------------
export const generateViteConfig = async (dir) => {
  const pkgPath = path.join(dir, "package.json");

  if (!fs.existsSync(pkgPath)) {
    write(pkgPath, JSON.stringify({
      name: "vite-app",
      version: "1.0.0",
      scripts: {
        build: "vite build",
        start: "vite preview"
      }
    }, null, 2));
  }

  write(path.join(dir, "vercel.json"), JSON.stringify({
    rewrites: [{ source: "/(.*)", destination: "/index.html" }]
  }, null, 2));
};


// ----------------- NEXTJS ------------------
export const generateNextConfig = async (dir) => {
  if (!fs.existsSync(path.join(dir, "next.config.js"))) {
    write(path.join(dir, "next.config.js"), `/** @type {import('next').NextConfig} */\nmodule.exports = { reactStrictMode: true };`);
  }
};


// ----------------- STATIC HTML ------------------
export const generateStaticConfig = async (dir) => {
  write(path.join(dir, "vercel.json"), JSON.stringify({
    rewrites: [{ source: "/(.*)", destination: "/index.html" }]
  }, null, 2));
};


// ----------------- PYTHON FLASK ------------------
export const generateFlaskConfig = async (dir) => {
  // If missing app.py
  if (!fs.existsSync(path.join(dir, "app.py"))) {
    write(path.join(dir, "app.py"), `
from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Flask App Auto Generated"

if __name__ == "__main__":
    app.run()
    `);
  }

  // requirements.txt
  write(path.join(dir, "requirements.txt"), `flask\ngunicorn`);
};
