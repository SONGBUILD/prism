import crypto from "crypto";
import { Router } from "express";
import { db } from "../db.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const SECRET = process.env.SESSION_SECRET || "prism-dev-secret-change-me";
const DAY = 24 * 3600 * 1000;

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
}

/** 管理员 token：<exp>.<sig>，有效期 1 天 */
function createAdminToken() {
  const payload = `admin.${Date.now() + DAY}`;
  return `${payload}.${sign(payload)}`;
}

function parseAdminToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts;
  if (role !== "admin") return false;
  if (sign(`${role}.${exp}`) !== sig) return false;
  if (Number(exp) < Date.now()) return false;
  return true;
}

/** Express 中间件：校验管理员 token */
function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!parseAdminToken(token)) {
    return res.status(401).json({ error: "管理员未登录或登录已过期" });
  }
  next();
}

export const adminRouter = Router();

/** 管理员登录 */
adminRouter.post("/login", (req, res) => {
  const password = String(req.body?.password || "");
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "管理员密码错误" });
  }
  res.json({ token: createAdminToken() });
});

/** 待确认订单列表（含用户邮箱，便于管理员核对） */
adminRouter.get("/orders", requireAdmin, (_req, res) => {
  const orders = db
    .prepare(
      `SELECT o.out_trade_no, o.amount, o.pay_type, o.status, o.created_at, o.trade_no,
              u.email, u.id as user_id
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE o.status = 'confirming'
       ORDER BY o.created_at DESC LIMIT 200`
    )
    .all();
  res.json({ orders });
});

/** 确认订单到账：confirming → paid，余额入账（事务 + 条件更新保证幂等） */
adminRouter.post("/confirm", requireAdmin, (req, res) => {
  const outTradeNo = String(req.body?.out_trade_no || "");
  if (!outTradeNo) return res.status(400).json({ error: "缺少订单号" });

  const order = db
    .prepare("SELECT id, user_id, amount, status FROM orders WHERE out_trade_no = ?")
    .get(outTradeNo);
  if (!order) return res.status(404).json({ error: "订单不存在" });
  if (order.status === "paid") return res.json({ ok: true, already: true });
  if (order.status !== "confirming") {
    return res.status(400).json({ error: "该订单尚未被用户标记为已支付" });
  }

  const tx = db.transaction(() => {
    const updated = db
      .prepare(
        // USAD 订单的 trade_no 存的是链上 txid，用 COALESCE 保留以便审计；扫码订单沿用 ADMIN 流水号
        "UPDATE orders SET status = 'paid', trade_no = COALESCE(trade_no, ?), paid_at = ? WHERE id = ? AND status = 'confirming'"
      )
      .run(`ADMIN${Date.now()}`, Date.now(), order.id);
    if (updated.changes === 1) {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(
        order.amount,
        order.user_id
      );
    }
  });
  tx();
  res.json({ ok: true });
});
