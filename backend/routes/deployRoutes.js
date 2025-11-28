import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { deployProject } from "../controllers/deployController.js";

const router = express.Router();

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Configure multer safely
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + "-" + file.originalname);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Async error wrapper to avoid crashing server
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/", upload.single("file"), asyncHandler(deployProject));

export default router;
