import { Router } from "express";
import { db } from "../db.js";
import { requireUser } from "../auth.js";
import { usadEnabled, getDepositAddress, verifyDeposit } from "../usad.js";

export const payRouter = Router();

// 1 USAD 折算成多少人民币入账（USAD 为美元稳定币，按需在 .env 配置汇率）
const USAD_RATE = Number(process.env.USAD_RATE) || 1;

/** 创建充值订单，返回订单号（前端展示收款二维码，用户扫码后线下付款） */
payRouter.post("/create", requireUser, (req, res) => {
  const money = Number(req.body?.amount);
  if (!Number.isFinite(money) || money < 1 || money > 10000) {
    return res.status(400).json({ error: "充值金额需在 ¥1 ~ ¥10000 之间" });
  }
  const payType = req.body?.type === "wxpay" ? "wxpay" : "alipay";
  const outTradeNo = `P${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
  db.prepare(
    "INSERT INTO orders (out_trade_no, user_id, amount, pay_type, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(outTradeNo, req.user.id, money, payType, Date.now());

  res.json({ outTradeNo, amount: money, payType });
});

/** 用户扫码付款后点「我已支付」：订单 pending → confirming，等待管理员确认 */
payRouter.post("/notify-admin", requireUser, (req, res) => {
  const outTradeNo = String(req.body?.out_trade_no || "");
  if (!outTradeNo) return res.status(400).json({ error: "缺少订单号" });

  const order = db
    .prepare("SELECT id, user_id, status FROM orders WHERE out_trade_no = ?")
    .get(outTradeNo);
  if (!order) return res.status(404).json({ error: "订单不存在" });
  if (order.user_id !== req.user.id) return res.status(403).json({ error: "无权操作此订单" });
  if (order.status === "paid") return res.json({ ok: true, already: true });
  if (order.status === "confirming") return res.json({ ok: true });

  db.prepare("UPDATE orders SET status = 'confirming' WHERE id = ? AND status = 'pending'").run(
    order.id
  );
  res.json({ ok: true });
});

/** 查询单个订单状态（充值页轮询到账用） */
payRouter.get("/order", requireUser, (req, res) => {
  const order = db
    .prepare(
      "SELECT out_trade_no, amount, status, pay_type, created_at, paid_at FROM orders WHERE out_trade_no = ? AND user_id = ?"
    )
    .get(String(req.query.no || ""), req.user.id);
  if (!order) return res.status(404).json({ error: "订单不存在" });
  res.json({ order });
});

/** USAD 充值配置：返回共用收款地址、二维码与折算汇率（地址服务端缓存） */
payRouter.get("/usad/config", requireUser, async (_req, res) => {
  if (!usadEnabled()) return res.status(503).json({ error: "USAD 充值暂未开启" });
  try {
    const a = await getDepositAddress();
    res.json({
      symbol: a.symbol,
      mainnet: a.mainnet,
      addressStr: a.addressStr,
      memo: a.memo || "",
      depositConfirm: a.depositConfirm,
      addressQRCode: a.addressQRCode || "",
      rate: USAD_RATE,
    });
  } catch (e) {
    res.status(502).json({ error: e.message || "获取充值地址失败" });
  }
});

/** USAD 凭 txid 核对到账：核对成功即生成 confirming 订单，等待管理员确认入账 */
payRouter.post("/usad/verify", requireUser, async (req, res) => {
  if (!usadEnabled()) return res.status(503).json({ error: "USAD 充值暂未开启" });
  const txid = String(req.body?.txid || "").trim();
  if (!txid) return res.status(400).json({ error: "请填写链上交易号 txid" });

  // 本地幂等：同一 txid 已入库直接回显，避免交易所侧「已核对」错误
  const exist = db
    .prepare("SELECT out_trade_no, amount, status FROM orders WHERE pay_type = 'usad' AND trade_no = ?")
    .get(txid);
  if (exist) {
    return res.json({
      outTradeNo: exist.out_trade_no,
      amount: exist.amount,
      status: exist.status,
      already: true,
    });
  }

  let r;
  try {
    r = await verifyDeposit(txid);
  } catch {
    return res.status(502).json({ error: "核对服务暂时不可用，请稍后再试" });
  }

  if (r?.code === "-3005") {
    return res.status(404).json({ error: "未查询到该交易号的充值记录，请确认转账已上链后再试" });
  }
  if (r?.code === "-3004") {
    return res.status(409).json({ error: "该交易号已被核对，请勿重复提交" });
  }
  if (r?.code !== "0") {
    return res.status(400).json({ error: r?.msg || "核对失败，请检查交易号" });
  }

  const usadAmount = Number(r.data?.amount);
  if (!Number.isFinite(usadAmount) || usadAmount <= 0) {
    return res.status(400).json({ error: "核对返回的充值数量无效" });
  }
  const money = Math.round(usadAmount * USAD_RATE * 1e6) / 1e6;

  const outTradeNo = `U${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
  db.prepare(
    "INSERT INTO orders (out_trade_no, user_id, amount, pay_type, status, trade_no, created_at) VALUES (?, ?, ?, 'usad', 'confirming', ?, ?)"
  ).run(outTradeNo, req.user.id, money, txid, Date.now());

  res.json({ outTradeNo, amount: money, usadAmount, status: "confirming" });
});

/** 订单列表 */
payRouter.get("/orders", requireUser, (req, res) => {
  const orders = db
    .prepare(
      "SELECT out_trade_no, amount, pay_type, status, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50"
    )
    .all(req.user.id);
  res.json({ orders });
});
