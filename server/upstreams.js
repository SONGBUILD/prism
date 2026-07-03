/**
 * 上游路由：所有模型直连智谱官方（open.bigmodel.cn），不经任何第三方中转。
 *
 * 商用背景：面向海外用户卖中国模型，全部走官方授权渠道，合规且稳定。
 * 后续如需新增其他厂商官方渠道，在此追加一条规则 + env.conf 一行 key 即可。
 *
 * 智谱官方为 OpenAI 兼容协议（/chat/completions + Bearer 鉴权），转发逻辑无需区分。
 */

/** 智谱官方（GLM 系列直连，商业授权渠道） */
const ZHIPU = {
  name: "智谱官方",
  match: /^glm-/,
  baseUrl: (process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4").replace(/\/$/, ""),
  apiKey: process.env.ZHIPU_API_KEY || "",
  // GLM-5 系列会先吐超长 reasoning_content（思维链），流式下前端迟迟收不到正文，
  // 且 reasoning_tokens 会计入用户扣费。统一关闭，让上游直接输出 content。
  disableThinking: true,
};

/** 命名上游列表，按顺序匹配 model id 前缀 */
export const UPSTREAMS = [ZHIPU];

/** 默认上游：无前缀匹配时兜底，复用智谱官方配置 */
export const DEFAULT_UPSTREAM = {
  name: "智谱官方",
  baseUrl: ZHIPU.baseUrl,
  apiKey: ZHIPU.apiKey,
  disableThinking: ZHIPU.disableThinking,
};

/**
 * 按 model id 解析该用哪个上游。
 * @returns 命中的上游对象；若无 key 则返回 null（回落到演示引擎）
 */
export function resolveUpstream(modelId) {
  for (const u of UPSTREAMS) {
    if (u.match.test(modelId) && u.apiKey) return u;
  }
  return DEFAULT_UPSTREAM.apiKey ? DEFAULT_UPSTREAM : null;
}

/** 是否有任一上游可用（决定走真实转发还是演示引擎） */
export function anyUpstreamEnabled() {
  return UPSTREAMS.some((u) => u.apiKey) || Boolean(DEFAULT_UPSTREAM.apiKey);
}
