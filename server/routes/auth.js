import { Router } from "express";
import { db } from "../db.js";
import { hashPassword, verifyPassword, createSessionToken, requireUser } from "../auth.js";

export const authRouter = Router();

authRouter.post("/register", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "邮箱格式不正确" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "密码至少 6 位" });
  }
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "该邮箱已注册" });
  }
  // 新用户赠送 ¥1 体验金，注册即可试用
  const r = db
    .prepare("INSERT INTO users (email, password_hash, balance, created_at) VALUES (?, ?, 1.0, ?)")
    .run(email, hashPassword(password), Date.now());
  res.json({ token: createSessionToken(Number(r.lastInsertRowid)) });
});

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "请填写邮箱和密码" });
  const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "邮箱或密码错误" });
  }
  res.json({ token: createSessionToken(user.id) });
});

authRouter.get("/me", requireUser, (req, res) => {
  res.json({ user: req.user });
});
