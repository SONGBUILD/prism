import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authRouter } from "./routes/auth.js";
import { keysRouter } from "./routes/keys.js";
import { payRouter } from "./routes/pay.js";
import { statsRouter } from "./routes/stats.js";
import { v1Router } from "./routes/v1.js";
import { adminRouter } from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRouter);
app.use("/api/keys", keysRouter);
app.use("/api/pay", payRouter);
app.use("/api/admin", adminRouter);
app.use("/api", statsRouter);
app.use("/v1", v1Router);

// 生产模式：静态托管前端构建产物
const webDir = path.join(__dirname, "..", "web", "dist");
if (fs.existsSync(webDir)) {
  app.use(express.static(webDir));
  app.get(/^\/(?!api|v1|pay).*/, (_req, res) => res.sendFile(path.join(webDir, "index.html")));
}

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`Prism server listening on http://localhost:${PORT}`);
});
