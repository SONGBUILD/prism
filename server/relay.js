import { db } from "./db.js";
import { calcCost } from "./models.js";
import { resolveUpstream, anyUpstreamEnabled } from "./upstreams.js";

export { resolveUpstream, anyUpstreamEnabled };

/** 校验 Bearer sk- 密钥，返回归属用户 */
export function authenticateKey(authHeader) {
  const token = (authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || !token.startsWith("sk-")) return null;
  return (
    db
      .prepare(
        `SELECT k.id as keyId, k.user_id as userId, u.balance
         FROM api_keys k JOIN users u ON u.id = k.user_id
         WHERE k.key = ? AND k.status = 1`
      )
      .get(token) || null
  );
}

/** 扣费 + 记录用量，返回本次费用 */
export function settleUsage(auth, model, promptTokens, completionTokens, latencyMs) {
  const cost = calcCost(model, promptTokens, completionTokens);
  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET balance = MAX(0, balance - ?) WHERE id = ?").run(cost, auth.userId);
    db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(Date.now(), auth.keyId);
    db.prepare(
      `INSERT INTO usage_logs (user_id, key_id, model, prompt_tokens, completion_tokens, cost, latency_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(auth.userId, auth.keyId, model.id, promptTokens, completionTokens, cost, latencyMs, Date.now());
  });
  tx();
  return cost;
}

export function messagesText(messages) {
  return (messages || [])
    .map((m) =>
      typeof m.content === "string" ? m.content : (m.content || []).map((p) => p.text || "").join("")
    )
    .join("\n");
}

export const UPSTREAM = {
  get enabled() {
    return anyUpstreamEnabled();
  },
};

/** 内置演示引擎：无上游配置时生成与提问相关的回复，保证比赛现场断网也能演示 */
export function demoReply(model, userText) {
  const q = (userText || "").trim().slice(-200) || "你好";
  return [
    `你好！我是经由 **Prism 棱镜中转** 调用的 ${model.name}（${model.vendor}）。`,
    ``,
    `已收到你的消息：「${q.length > 60 ? q.slice(0, 60) + "…" : q}」`,
    ``,
    `本次请求通过 OpenAI 兼容协议 \`/v1/chat/completions\` 转发，全程支持流式输出（SSE），`,
    `并按 token 实时计费：输入 ¥${model.promptPrice}/1M tokens，输出 ¥${model.completionPrice}/1M tokens。`,
    ``,
    `> 当前为内置演示引擎。配置 UPSTREAM_BASE_URL 与 UPSTREAM_API_KEY 后，同一接口无缝切换为真实上游模型。`,
  ].join("\n");
}
