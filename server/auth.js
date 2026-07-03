import crypto from "crypto";
import { db } from "./db.js";

const SECRET = process.env.SESSION_SECRET || "prism-dev-secret-change-me";
const WEEK = 7 * 24 * 3600 * 1000;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test));
}

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
}

export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now() + WEEK}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [uid, exp, sig] = parts;
  if (sign(`${uid}.${exp}`) !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return Number(uid);
}

/** Express 中间件：Authorization: Bearer <session token> */
export function requireUser(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const userId = parseSessionToken(token);
  if (!userId) return res.status(401).json({ error: "未登录或登录已过期" });
  const user = db
    .prepare("SELECT id, email, balance, created_at FROM users WHERE id = ?")
    .get(userId);
  if (!user) return res.status(401).json({ error: "用户不存在" });
  req.user = user;
  next();
}
