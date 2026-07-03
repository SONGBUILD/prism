import crypto from "crypto";

/**
 * USAD 加密货币充值：服务端对服务端调用交易所开放接口。
 * 签名算法（见对接文档 §1.2）：sign = HmacSHA256Hex(accessKey + timestamp, apiSecret)，小写十六进制。
 * 时间戳窗口 ±5 秒，故每次请求实时生成 timestamp。
 */

const GATEWAY = (process.env.USAD_GATEWAY || "https://kai.com/ex-open-api").replace(/\/$/, "");
const ACCESS_KEY = process.env.USAD_ACCESS_KEY || "";
const API_SECRET = process.env.USAD_API_SECRET || "";

export function usadEnabled() {
  return Boolean(ACCESS_KEY && API_SECRET);
}

function signedBody(extra = {}) {
  const timestamp = String(Date.now());
  const sign = crypto.createHmac("sha256", API_SECRET).update(ACCESS_KEY + timestamp).digest("hex");
  return { accessKey: ACCESS_KEY, timestamp, sign, ...extra };
}

async function call(path, extra) {
  const res = await fetch(GATEWAY + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signedBody(extra)),
  });
  return res.json();
}

/**
 * 充值地址在单一密钥下固定不变，缓存避免每次进入充值页都请求交易所。
 */
let addressCache = null;

export async function getDepositAddress() {
  if (addressCache) return addressCache;
  const r = await call("/openapi/deposit/address");
  if (r?.code !== "0") {
    const err = new Error(r?.msg || "获取充值地址失败");
    err.gatewayCode = r?.code;
    throw err;
  }
  addressCache = r.data;
  return addressCache;
}

/** 按 txid 核对到账，返回交易所原始响应 { code, msg, data }。 */
export async function verifyDeposit(txid) {
  return call("/openapi/deposit/verify", { txid });
}
