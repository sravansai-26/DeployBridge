import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import deployRoutes from "./routes/deployRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.use("/api/deploy", deployRoutes);

app.get("/", (req, res) => {
  res.send("DeployBridge Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
