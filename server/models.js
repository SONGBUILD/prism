/**
 * 模型目录：价格单位 ¥/1M tokens。
 * 仅收录智谱官方真实支持的模型，全部直连 open.bigmodel.cn 官方渠道（非中转）。
 * 价格按官方定价上浮，覆盖运营成本与利润；可按经营需要自行微调。
 */
export const MODELS = [
  // ===== 智谱 GLM 系列（7 个，官方直连）=====
  {
    id: "glm-5.2",
    name: "GLM-5.2",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "智谱新一代旗舰基座，中文理解与综合能力顶尖。",
    context: 128000,
    promptPrice: 10,
    completionPrice: 40,
    tags: ["中文", "旗舰"],
    featured: true,
  },
  {
    id: "glm-5.1",
    name: "GLM-5.1",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "GLM-5 系列旗舰，推理与创作能力全面。",
    context: 128000,
    promptPrice: 8,
    completionPrice: 32,
    tags: ["中文", "旗舰"],
  },
  {
    id: "glm-5",
    name: "GLM-5",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "智谱主力模型，全栈国产化方案首选。",
    context: 128000,
    promptPrice: 7,
    completionPrice: 28,
    tags: ["中文"],
  },
  {
    id: "glm-5-turbo",
    name: "GLM-5 Turbo",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "高速版 GLM-5，低延迟高性价比，适合实时对话。",
    context: 128000,
    promptPrice: 3,
    completionPrice: 12,
    tags: ["极速", "低价"],
  },
  {
    id: "glm-4.7",
    name: "GLM-4.7",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "成熟主力模型，能力均衡，适合通用任务。",
    context: 128000,
    promptPrice: 5,
    completionPrice: 20,
    tags: ["中文", "均衡"],
  },
  {
    id: "glm-4.6",
    name: "GLM-4.6",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "经济型模型，日常对话与轻量任务的高性价比之选。",
    context: 128000,
    promptPrice: 4,
    completionPrice: 16,
    tags: ["低价", "中文"],
  },
  {
    id: "glm-4.5-air",
    name: "GLM-4.5 Air",
    vendor: "智谱",
    vendorColor: "#3b82f6",
    description: "超轻量模型，极致低价，批量处理与简单任务首选。",
    context: 128000,
    promptPrice: 1,
    completionPrice: 2,
    tags: ["极速", "超低价"],
  },
];

export function getModel(id) {
  return MODELS.find((m) => m.id === id);
}

/** 粗略估算 token 数：中文约 1 字/token，英文约 4 字符/token */
export function estimateTokens(text) {
  if (!text) return 0;
  let cjk = 0;
  let other = 0;
  for (const ch of text) {
    if (/[一-鿿　-〿＀-￯]/.test(ch)) cjk++;
    else other++;
  }
  return Math.max(1, cjk + Math.ceil(other / 4));
}

export function calcCost(model, promptTokens, completionTokens) {
  const cost =
    (promptTokens / 1_000_000) * model.promptPrice +
    (completionTokens / 1_000_000) * model.completionPrice;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
