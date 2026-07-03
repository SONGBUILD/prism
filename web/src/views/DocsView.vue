<script setup lang="ts">
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'

const origin = window.location.origin

// 模型推荐:帮小白做选择,而不是让他们面对 7 个选项发呆
const models = [
  { id: 'glm-5.2', name: 'GLM-5.2', desc: '最强,复杂任务首选', in: 10, out: 40, badge: '推荐' },
  { id: 'glm-4.5-air', name: 'GLM-4.5 Air', desc: '最便宜,日常够用', in: 1, out: 2, badge: '高性价比' },
  { id: 'glm-5-turbo', name: 'GLM-5 Turbo', desc: '快速又便宜', in: 3, out: 12, badge: '' },
]
</script>

<template>
  <div class="min-h-screen">
    <SiteNav />
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-bold text-t1">接入指南</h1>
      <p class="mt-2 text-sm text-t2">5 分钟接入你的 AI 工具。不用懂代码,跟着步骤填就行。</p>

      <!-- 第 0 步:先准备好 -->
      <div class="glass mt-8 rounded-xl border border-line p-6">
        <h2 class="text-base font-semibold text-t1">📝 开始前,准备好这两样</h2>
        <ol class="mt-3 space-y-2 text-sm text-t2">
          <li>1. <b class="text-t1">一个 Prism 账号</b> —— 没有就去 <a :href="origin" class="text-primary underline">首页</a> 注册(送体验余额)</li>
          <li>2. <b class="text-t1">一个 API 密钥</b> —— 登录后进「控制台 → API 密钥 → 新建」,会得到一串 <code class="rounded bg-bg px-1.5 py-0.5 text-[12px]">sk-prism-...</code> 开头的钥匙</li>
        </ol>
        <div class="mt-3 rounded-lg bg-amber-500/10 p-3 text-[13px] text-amber-300">
          ⚠️ 密钥只显示一次,生成后立刻复制保存。泄露了别人能花你的余额,丢了只能重新生成。
        </div>
      </div>

      <!-- 模型怎么选 -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">🤔 7 个模型怎么选?</h2>
        <p class="mt-2 text-sm text-t2">不用纠结,按需求对号入座:</p>
        <div class="mt-4 grid gap-3">
          <div v-for="m in models" :key="m.id" class="glass flex items-center gap-4 rounded-lg p-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm text-t1">{{ m.id }}</span>
                <span v-if="m.badge" class="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] text-primary">{{ m.badge }}</span>
              </div>
              <p class="mt-1 text-[13px] text-t3">{{ m.desc }}</p>
            </div>
            <div class="text-right text-[12px] text-t3">
              <div>输入 ¥{{ m.in }}/百万</div>
              <div>输出 ¥{{ m.out }}/百万</div>
            </div>
          </div>
        </div>
        <p class="mt-3 text-[13px] text-t3">💡 1 百万 token ≈ 75 万字中文。日常聊几句花的钱几分钱都不到,放心用。</p>
      </section>

      <!-- 通用信息卡片 -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">🔑 你的接入信息</h2>
        <p class="mt-2 text-sm text-t2">下面所有工具都用这三样,先记下来:</p>
        <div class="glass mt-4 rounded-xl p-5 font-mono text-[13px]">
          <div class="flex gap-3"><span class="w-20 shrink-0 text-t3">服务地址</span><span class="text-t1">{{ origin }}/v1</span></div>
          <div class="mt-2 flex gap-3"><span class="w-20 shrink-0 text-t3">密钥</span><span class="text-t1">sk-prism-你的密钥</span></div>
          <div class="mt-2 flex gap-3"><span class="w-20 shrink-0 text-t3">模型名</span><span class="text-t1">glm-5.2</span></div>
        </div>
      </section>

      <!-- Cursor -->
      <section class="mt-12">
        <h2 class="text-lg font-semibold text-t1">👨‍💻 Cursor 接入</h2>
        <p class="mt-2 text-sm text-t2">Cursor 是最火的 AI 编程编辑器,接入只需 4 步:</p>
        <ol class="mt-4 space-y-3 text-sm text-t2">
          <li><b class="text-t1">①</b> 打开 Cursor,按 <code class="rounded bg-bg px-1.5 py-0.5 text-[12px]">Cmd + ,(逗号)</code> 进设置,点左侧 <b>Models</b></li>
          <li><b class="text-t1">②</b> 滚到「OpenAI API Key」区域,粘贴你的密钥,然后<b>勾选 Override OpenAI Base URL</b></li>
          <li><b class="text-t1">③</b> Base URL 填:</li>
        </ol>
        <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[13px] text-t2">{{ origin }}/v1</pre>
        <p class="mt-3 text-sm text-t2"><b class="text-t1">④</b> 点 <b>+ Add Model</b>,输入 <code class="rounded bg-bg px-1.5 py-0.5 text-[12px]">glm-5.2</code>,回车;再点 <b>Verify</b>,看到绿色 ✓ 就成了。</p>
        <div class="mt-3 rounded-lg bg-blue-500/10 p-3 text-[13px] text-blue-300">
          ✅ 验证成功后,回到对话窗口,点模型选择器,就能看到 glm-5.2 了。
        </div>
      </section>

      <!-- Continue -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">🧩 Continue.dev(VS Code 插件)</h2>
        <p class="mt-2 text-sm text-t2">Continue 是免费开源的 AI 编程助手,装在 VS Code 里。</p>
        <ol class="mt-4 space-y-2 text-sm text-t2">
          <li><b class="text-t1">①</b> VS Code 扩展商店搜「Continue」,安装</li>
          <li><b class="text-t1">②</b> 点 Continue 侧栏的齿轮 ⚙️,打开配置文件</li>
          <li><b class="text-t1">③</b> 把下面这段粘进去,替换密钥:</li>
        </ol>
        <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2">{
  "models": [{
    "title": "Prism GLM-5.2",
    "provider": "openai",
    "model": "glm-5.2",
    "apiBase": "{{ origin }}/v1",
    "apiKey": "sk-prism-你的密钥"
  }]
}</pre>
        <p class="mt-3 text-[13px] text-t3">保存后,Continue 侧栏顶部下拉就能选 Prism GLM-5.2。</p>
      </section>

      <!-- Cline -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">🤖 Cline / Roo Code(VS Code 插件)</h2>
        <p class="mt-2 text-sm text-t2">Cline 是自主编程 Agent,接入更简单:</p>
        <ol class="mt-4 space-y-2 text-sm text-t2">
          <li><b class="text-t1">①</b> 打开 Cline 设置(侧栏齿轮)</li>
          <li><b class="text-t1">②</b> API Provider 选 <b>OpenAI Compatible</b></li>
          <li><b class="text-t1">③</b> 照填:</li>
        </ol>
        <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[13px] text-t2">Base URL:  {{ origin }}/v1
API Key:   sk-prism-你的密钥
Model ID:  glm-5.2</pre>
      </section>

      <!-- Aider -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">⌨️ Aider(终端工具)</h2>
        <p class="mt-2 text-sm text-t2">Aider 是命令行 AI 编程工具,适合喜欢终端的开发者。</p>
        <pre class="glass mt-3 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2"># 先安装(只需一次)
pip install aider-chat

# 设置 Prism 为后端(每次开终端前运行,或写进 ~/.zshrc)
export OPENAI_API_BASE={{ origin }}/v1
export OPENAI_API_KEY=sk-prism-你的密钥

# 启动,指定模型
aider --model glm-5.2</pre>
      </section>

      <!-- 其他工具 -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">🛠️ 其他工具(Hermes / OpenClaw / 任意客户端)</h2>
        <p class="mt-2 text-sm text-t2">不管什么工具,只要它<b class="text-t1">允许填写自定义 OpenAI 地址</b>,就能用这三样接入:</p>
        <div class="glass mt-3 rounded-xl p-4 font-mono text-[13px]">
          <div>地址:{{ origin }}/v1</div>
          <div>密钥:sk-prism-你的密钥</div>
          <div>模型:glm-5.2</div>
        </div>
        <div class="mt-3 rounded-lg bg-amber-500/10 p-3 text-[13px] text-amber-300">
          ⚠️ 如果工具<b>不让填自定义地址</b>(比如 Claude Code 只能用官方模型),那就接不了第三方服务——这是工具本身的限制,不是你的问题。
        </div>
        <p class="mt-3 text-sm text-t2">不确定能不能接?先用下面这条命令测一下,能返回回复就说明没问题:</p>
        <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2">curl {{ origin }}/v1/chat/completions \
  -H "Authorization: Bearer sk-prism-你的密钥" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5.2","messages":[{"role":"user","content":"你好"}]}'</pre>
      </section>

      <!-- 代码示例 -->
      <section class="mt-12">
        <h2 class="text-lg font-semibold text-t1">📦 写代码接入(Python / Node.js)</h2>
        <p class="mt-2 text-sm text-t2">用 OpenAI 官方 SDK,改一行 base_url 就行:</p>
        <details class="mt-3 group">
          <summary class="cursor-pointer text-sm text-primary">▶ Python 示例(点击展开)</summary>
          <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2">pip install openai</pre>
          <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2">from openai import OpenAI

client = OpenAI(
    api_key="sk-prism-你的密钥",
    base_url="{{ origin }}/v1",
)
resp = client.chat.completions.create(
    model="glm-5.2",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)</pre>
        </details>
        <details class="mt-3 group">
          <summary class="cursor-pointer text-sm text-primary">▶ Node.js 示例(点击展开)</summary>
          <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2">npm install openai</pre>
          <pre class="glass mt-2 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-t2">import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-prism-你的密钥",
  baseURL: "{{ origin }}/v1",
});
const resp = await client.chat.completions.create({
  model: "glm-5.2",
  messages: [{ role: "user", content: "你好" }],
});
console.log(resp.choices[0].message.content);</pre>
        </details>
      </section>

      <!-- 计费 -->
      <section class="mt-12">
        <h2 class="text-lg font-semibold text-t1">💰 计费与充值</h2>
        <ul class="mt-3 space-y-2 text-sm text-t2">
          <li>• <b class="text-t1">按用量计费</b>:用了多少 token 扣多少钱,不用不扣钱</li>
          <li>• <b class="text-t1">价格举例</b>:用 glm-5.2 聊一句(约 100 字),花费不到 ¥0.001</li>
          <li>• <b class="text-t1">余额不足</b>:会返回 402 错误,去控制台充值即可恢复</li>
          <li>• <b class="text-t1">充值方式</b>:控制台 → 充值,支持 USAD 加密货币</li>
        </ul>
      </section>

      <!-- 常见问题 -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-t1">❓ 常见问题</h2>
        <div class="mt-4 space-y-4">
          <div class="glass rounded-lg p-4">
            <p class="text-sm font-medium text-t1">Verify 一直报错怎么办?</p>
            <p class="mt-1 text-[13px] text-t3">① 检查地址末尾有没有 <code>/v1</code>(必须带)② 密钥是不是 sk-prism- 开头 ③ 余额是否为 0。还不行就用上面的 curl 命令测,看具体报什么错。</p>
          </div>
          <div class="glass rounded-lg p-4">
            <p class="text-sm font-medium text-t1">流式输出卡住不出字?</p>
            <p class="mt-1 text-[13px] text-t3">检查工具设置里有没有开「Stream / 流式」开关。如果走 Nginx 反代,需确保关闭了 buffer。</p>
          </div>
          <div class="glass rounded-lg p-4">
            <p class="text-sm font-medium text-t1">想换模型怎么办?</p>
            <p class="mt-1 text-[13px] text-t3">在工具的模型列表里把想用的模型名都加一遍(如 glm-4.5-air),切换时选不同模型即可。模型名必须和文档里的一致。</p>
          </div>
        </div>
      </section>
    </div>
    <SiteFooter />
  </div>
</template>
