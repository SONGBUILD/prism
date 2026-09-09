# Prism 棱镜 · AI 模型中转站

English: OpenAI-compatible LLM API gateway (Vue 3 + Express). Model catalog, API keys, usage billing, and a playground. Demo-friendly if no upstream key is set.

Site / hire: [heysony.com](https://heysony.com)

---

> 一束光，折射整个 AI 宇宙 —— OpenAI 兼容协议的大模型 API 中转站，参考 openrouter.ai。

![tech](https://img.shields.io/badge/Vue3-Naive%20UI-8b6dff) ![tech](https://img.shields.io/badge/Node-Express%20%2B%20SQLite-34d399) ![tech](https://img.shields.io/badge/Pay-%E6%98%93%E6%94%AF%E4%BB%98%E5%8D%8F%E8%AE%AE-22d3ee)

## 功能

- **模型市场**：16+ 模型目录，搜索 / 标签筛选，价格透明（¥/1M tokens）
- **真实中转**：`POST /v1/chat/completions` OpenAI 兼容，SSE 流式转发，按 token 计费扣余额
- **密钥管理**：`sk-prism-` 密钥创建 / 吊销 / 用量追踪
- **充值支付**：易支付协议（支付宝/微信），**服务器异步回调 + MD5 验签 + 幂等入账**；未配置网关时自带精美模拟收银台，回调链路与真实网关完全一致
- **控制台**：余额 / 今日消费 / 近 7 天趋势图（ECharts）/ 模型消费分布 / 调用日志
- **在线体验**：Playground 流式对话，直连中转接口
- **创意工坊** `/studio`：一句话生成**音乐 Demo**（JSON 乐谱 → Web Audio 实时合成 + 频谱可视化）、**网站 Demo**（完整 HTML → 沙箱 iframe 实时预览）、**游戏 Demo**（canvas 小游戏即刻开玩）——每次生成都是真实 `/v1` 调用，计费与日志全留痕
- **精选作品**（`web/src/demos/`）：手工开发的真实成品，点开即用不扣费——两首完整编曲《星港夜航》《光之涟漪》（ABA 三段式 / 卡农进行 + 琶音，6-7 轨）、两个完整游戏「霓虹贪吃蛇」「星际穿梭」（粒子特效 / 本地最佳纪录 / 难度递增）、两个成品网页「拾光咖啡官网」「NOVA 作品集」
- 注册即送 ¥1 体验金；未配置上游时内置演示引擎兜底，**断网也能完整演示**

## 快速开始

```bash
# 1. 启动后端（API + 支付回调 + 静态托管）
cd server && npm install && node index.js
# → http://localhost:8787

# 2. 前端开发模式（可选，生产直接访问 8787 即可）
cd web && npm install && npx vite
# → http://localhost:5173（API 已代理到 8787）

# 3. 前端构建（8787 会自动托管 web/dist）
cd web && npx vite build
```

## 演示脚本（比赛用）

1. 首页 → 棱镜折射动画 / 终端打字机 → 「免费注册」领 ¥1 体验金
2. 控制台 → API 密钥 → 创建密钥（自动复制）
3. 在线体验 → 选模型发消息 → 流式输出，余额实时扣费
4. 充值中心 → 选金额/支付方式 → 跳转收银台 → 「模拟支付成功」
   → 网关按易支付协议**签名回调** `/api/pay/notify` → 验签 → 入账 → 页面轮询自动刷新余额
5. 调用日志 / 总览趋势图查看计费明细
6. **创意工坊** → 「星际漫游的太空环境乐」生成音乐点播放 → 切游戏模式生成「接光子」当场开玩
7. 用 curl / OpenAI SDK 直接打 `/v1/chat/completions` 展示协议兼容（见 /docs 页）

## 配置

复制 `server/.env.example` 为 `.env`（或直接设置环境变量）：

| 变量 | 说明 |
|---|---|
| `EPAY_URL / EPAY_PID / EPAY_KEY` | 易支付商户信息；不配置 = 内置模拟收银台 |
| `UPSTREAM_BASE_URL / UPSTREAM_API_KEY` | OpenAI 兼容上游；不配置 = 内置演示引擎 |
| `PUBLIC_ORIGIN` | 部署后的公网地址（生成回调 URL 用） |
| `SESSION_SECRET` | 会话签名密钥，生产必改 |

## 架构

```
web/     Vue 3 + TypeScript + Naive UI + Tailwind 4 + ECharts
server/  Express + better-sqlite3（用户/密钥/订单/用量四张表）
         ├── /api/*            控制台接口（Bearer token 鉴权）
         ├── /api/pay/notify   易支付异步回调（MD5 验签 + 幂等）
         ├── /v1/*             OpenAI 兼容中转（sk- 密钥鉴权 + 计费）
         └── /pay/mock         内置模拟收银台
```

支付安全：回调验签（参数 ASCII 排序 + 商户密钥 MD5）、金额比对、`status='pending'` 条件更新保证幂等，重复通知与篡改签名均被拒绝。
