import crypto from "crypto";
import { Router } from "express";
import { MODELS, getModel, estimateTokens } from "../models.js";
import { authenticateKey, settleUsage, messagesText, UPSTREAM, demoReply } from "../relay.js";
import { resolveUpstream, anyUpstreamEnabled, DEFAULT_UPSTREAM } from "../upstreams.js";
import { studioReply } from "../studio.js";

export const v1Router = Router();

/** OpenAI 兼容模型列表 */
v1Router.get("/models", (_req, res) => {
  res.json({
    object: "list",
    data: MODELS.map((m) => ({
      id: m.id,
      object: "model",
      created: 1735689600,
      owned_by: m.vendor,
    })),
  });
});

function apiError(res, status, message, type = "invalid_request_error") {
  return res.status(status).json({ error: { message, type } });
}

/**
 * 公共工坊生成接口：无需登录、无需密钥，任何人都能调用。
 * 用服务端配置的 UPSTREAM 公共密钥转发，费用由部署者承担，不扣用户余额。
 * 仅限工坊场景（system prompt 由服务端按 mode 注入），防止被滥用作通用中转。
 */
const STUDIO_SYSTEMS = {
  music:
    'PRISM_STUDIO:music 你是作曲引擎。只输出一个 JSON（可用 ```json 包裹），不要任何解释。格式：{"title":"曲名","bpm":整数,"key":"调式","tracks":[{"name":"轨名","wave":"sine|triangle|sawtooth|square|noise|kick","gain":0-1,"notes":[[起始拍,MIDI音高,时值拍]...]}]}。8-16 小节，包含旋律、贝斯、和声铺底与鼓组。',
  site:
    'PRISM_STUDIO:site 你是网页生成引擎。只输出一个完整的 HTML 文档（可用 ```html 包裹），内联全部 CSS/JS，禁止引用外部资源，设计精美、含渐变与悬停动效、响应式。',
  game:
    'PRISM_STUDIO:game 你是游戏生成引擎。只输出一个完整的 HTML 文档（可用 ```html 包裹），用 canvas 实现可玩的小游戏，键盘+鼠标可操作，含计分与重开，内联全部代码，禁止外部资源。',
};

v1Router.post("/studio/generate", async (req, res) => {
  if (!anyUpstreamEnabled() || !DEFAULT_UPSTREAM.apiKey) {
    return apiError(res, 503, "工坊生成需要配置上游模型，请联系管理员", "service_unavailable");
  }
  const mode = STUDIO_SYSTEMS[req.body?.mode] ? req.body.mode : "music";
  const userText = String(req.body?.prompt || "").trim();
  if (!userText) return apiError(res, 400, "prompt 不能为空");
  if (userText.length > 2000) return apiError(res, 400, "prompt 过长（上限 2000 字）");

  const model = getModel(req.body?.model) || MODELS[0];
  // 工坊统一走默认上游（中转），避免不同厂商思维链参数差异影响结构化输出
  const upstream = DEFAULT_UPSTREAM;
  const payload = {
    model: model.id,
    stream: false,
    messages: [
      { role: "system", content: STUDIO_SYSTEMS[mode] },
      { role: "user", content: userText },
    ],
  };
  if (upstream.disableThinking) payload.thinking = { type: "disabled" };

  const started = Date.now();
  let resp;
  try {
    resp = await fetch(`${upstream.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${upstream.apiKey}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });
  } catch (e) {
    return res.status(502).json({ error: { message: `上游连接失败: ${e.message}`, type: "upstream_error" } });
  }
  if (!resp.ok) {
    const text = await resp.text();
    return res.status(resp.status).type("application/json").send(text);
  }

  const data = await resp.json();
  const usage = data.usage || {};
  const pt = usage.prompt_tokens ?? estimateTokens(userText);
  const ct = usage.completion_tokens ?? estimateTokens(data.choices?.[0]?.message?.content || "");
  // 工坊为公共体验，不扣用户余额；仅记录日志便于运营统计
  console.log(
    `[studio] mode=${mode} model=${model.id} pt=${pt} ct=${ct} latency=${Date.now() - started}ms`
  );
  data.model = model.id;
  res.json(data);
});

v1Router.post("/chat/completions", async (req, res) => {
  const auth = authenticateKey(req.headers.authorization);
  if (!auth) return apiError(res, 401, "无效的 API 密钥", "authentication_error");
  if (auth.balance <= 0) return apiError(res, 402, "余额不足，请前往控制台充值", "insufficient_quota");

  const body = req.body || {};
  const model = getModel(body.model);
  if (!model) return apiError(res, 404, `模型 ${body.model || "(空)"} 不存在，请查看 /v1/models`);
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return apiError(res, 400, "messages 不能为空");
  }

  const stream = !!body.stream;
  const promptTokens = estimateTokens(messagesText(body.messages));
  const started = Date.now();
  const id = `chatcmpl-${crypto.randomBytes(12).toString("hex")}`;

  const upstream = resolveUpstream(body.model);
  if (upstream) {
    return relayUpstream({ req, res, body, model, auth, promptTokens, started, stream, upstream });
  }
  return demoEngine({ res, body, model, auth, promptTokens, started, stream, id });
});

/** 转发到真实上游（OpenAI 兼容），流式透传并从末尾 usage 块取真实 token 数 */
async function relayUpstream({ req, res, body, model, auth, promptTokens, started, stream, upstream }) {
  // 透传用户选择的模型 id（真实多模型中转）
  const payload = { ...body, model: body.model };
  if (stream) payload.stream_options = { include_usage: true, ...(body.stream_options || {}) };
  // 部分上游的思维链模型会先吐超长 reasoning_content，按该上游配置决定是否关闭
  if (upstream.disableThinking) payload.thinking = { type: "disabled" };

  let resp;
  try {
    resp = await fetch(`${upstream.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${upstream.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });
  } catch (e) {
    return res.status(502).json({ error: { message: `上游连接失败: ${e.message}`, type: "upstream_error" } });
  }

  if (!resp.ok) {
    const text = await resp.text();
    return res.status(resp.status).type("application/json").send(text);
  }

  if (!stream) {
    const data = await resp.json();
    const usage = data.usage || {};
    const pt = usage.prompt_tokens ?? promptTokens;
    const ct =
      usage.completion_tokens ?? estimateTokens(data.choices?.[0]?.message?.content || "");
    settleUsage(auth, model, pt, ct, Date.now() - started);
    data.model = model.id;
    return res.json(data);
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let buffer = "";
  let usage = null;
  let contentAcc = "";
  const decoder = new TextDecoder();
  try {
    for await (const chunk of resp.body) {
      const text = decoder.decode(chunk, { stream: true });
      res.write(text);
      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const obj = JSON.parse(data);
          if (obj.usage) usage = obj.usage;
          contentAcc += obj.choices?.[0]?.delta?.content || "";
        } catch {
          /* 跨块的半截 JSON，忽略 */
        }
      }
    }
  } finally {
    const pt = usage?.prompt_tokens ?? promptTokens;
    const ct = usage?.completion_tokens ?? estimateTokens(contentAcc);
    settleUsage(auth, model, pt, ct, Date.now() - started);
    res.end();
  }
}

/** 内置演示引擎：模拟流式打字输出，计费链路与真实上游一致 */
async function demoEngine({ res, body, model, auth, promptTokens, started, stream, id }) {
  const userText = messagesText(body.messages.filter((m) => m.role === "user"));
  const systemText = messagesText(body.messages.filter((m) => m.role === "system"));
  // 创意工坊请求返回结构化作品（音乐 JSON / 网站 HTML / 游戏 HTML）
  const reply = studioReply(systemText, userText) || demoReply(model, userText);
  const completionTokens = estimateTokens(reply);
  const base = {
    id,
    object: stream ? "chat.completion.chunk" : "chat.completion",
    created: Math.floor(started / 1000),
    model: model.id,
  };
  const usage = {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  };

  if (!stream) {
    settleUsage(auth, model, promptTokens, completionTokens, Date.now() - started);
    return res.json({
      ...base,
      choices: [{ index: 0, message: { role: "assistant", content: reply }, finish_reason: "stop" }],
      usage,
    });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  send({ ...base, choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }] });
  // 长内容（工坊作品）加大块、提速，短对话保持打字机节奏
  const chunkSize = reply.length > 1200 ? 64 : 6;
  const delay = reply.length > 1200 ? 6 : 18;
  const pieces = reply.match(new RegExp(`[\\s\\S]{1,${chunkSize}}`, "g")) || [];
  for (const piece of pieces) {
    send({ ...base, choices: [{ index: 0, delta: { content: piece }, finish_reason: null }] });
    await new Promise((r) => setTimeout(r, delay));
  }
  send({ ...base, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
  send({ ...base, choices: [], usage });
  res.write("data: [DONE]\n\n");
  settleUsage(auth, model, promptTokens, completionTokens, Date.now() - started);
  res.end();
}
