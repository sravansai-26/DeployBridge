import express from "express";
import multer from "multer";
import { deployProject } from "../controllers/deployController.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/", upload.single("file"), deployProject);

export default router;
