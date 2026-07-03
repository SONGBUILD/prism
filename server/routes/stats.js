import { Router } from "express";
import { db } from "../db.js";
import { requireUser } from "../auth.js";
import { MODELS } from "../models.js";

export const statsRouter = Router();

/** 模型目录（公开） */
statsRouter.get("/models", (_req, res) => {
  res.json({ models: MODELS });
});

/** 控制台总览 */
statsRouter.get("/overview", requireUser, (req, res) => {
  const uid = req.user.id;
  const totals = db
    .prepare(
      `SELECT COUNT(*) as requests,
              COALESCE(SUM(prompt_tokens + completion_tokens), 0) as tokens,
              COALESCE(SUM(cost), 0) as cost
       FROM usage_logs WHERE user_id = ?`
    )
    .get(uid);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const today = db
    .prepare(
      `SELECT COUNT(*) as requests, COALESCE(SUM(cost), 0) as cost
       FROM usage_logs WHERE user_id = ? AND created_at >= ?`
    )
    .get(uid, dayStart.getTime());

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(dayStart);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const row = db
      .prepare(
        `SELECT COALESCE(SUM(cost), 0) as cost,
                COALESCE(SUM(prompt_tokens + completion_tokens), 0) as tokens,
                COUNT(*) as requests
         FROM usage_logs WHERE user_id = ? AND created_at >= ? AND created_at < ?`
      )
      .get(uid, d.getTime(), next.getTime());
    days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, ...row });
  }

  const byModel = db
    .prepare(
      `SELECT model, COUNT(*) as requests, COALESCE(SUM(cost), 0) as cost
       FROM usage_logs WHERE user_id = ? GROUP BY model ORDER BY cost DESC LIMIT 8`
    )
    .all(uid);

  res.json({ balance: req.user.balance, totals, today, days, byModel });
});

/** 调用日志（分页） */
statsRouter.get("/usage", requireUser, (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = 20;
  const total = db
    .prepare("SELECT COUNT(*) as c FROM usage_logs WHERE user_id = ?")
    .get(req.user.id).c;
  const logs = db
    .prepare(
      `SELECT l.id, l.model, l.prompt_tokens, l.completion_tokens, l.cost, l.latency_ms, l.created_at, k.name as key_name
       FROM usage_logs l LEFT JOIN api_keys k ON k.id = l.key_id
       WHERE l.user_id = ? ORDER BY l.id DESC LIMIT ? OFFSET ?`
    )
    .all(req.user.id, size, (page - 1) * size);
  res.json({ logs, total, page, size });
});
