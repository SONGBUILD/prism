import crypto from "crypto";
import { Router } from "express";
import { db } from "../db.js";
import { requireUser } from "../auth.js";

export const keysRouter = Router();
keysRouter.use(requireUser);

keysRouter.get("/", (req, res) => {
  const keys = db
    .prepare(
      "SELECT id, key, name, status, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY id DESC"
    )
    .all(req.user.id);
  res.json({ keys });
});

keysRouter.post("/", (req, res) => {
  const count = db
    .prepare("SELECT COUNT(*) as c FROM api_keys WHERE user_id = ?")
    .get(req.user.id).c;
  if (count >= 20) return res.status(400).json({ error: "密钥数量已达上限（20 个）" });
  const key = `sk-prism-${crypto.randomBytes(24).toString("hex")}`;
  db.prepare("INSERT INTO api_keys (user_id, key, name, created_at) VALUES (?, ?, ?, ?)").run(
    req.user.id,
    key,
    String(req.body?.name || "默认密钥").slice(0, 50),
    Date.now()
  );
  res.json({ key });
});

keysRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?").run(
    Number(req.params.id),
    req.user.id
  );
  res.json({ ok: true });
});
