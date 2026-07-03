<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { api, type ModelInfo } from '../api'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import PrismHero from '../components/PrismHero.vue'
import ModelCard from '../components/ModelCard.vue'

const router = useRouter()
const models = ref<ModelInfo[]>([])
const featured = computed(() => models.value.filter((m) => m.featured))

// 终端打字机
const CODE = `curl https://api.prism.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-prism-****" \\
  -d '{
    "model": "claude-sonnet-5",
    "stream": true,
    "messages": [
      {"role": "user", "content": "你好，棱镜"}
    ]
  }'`
const typed = ref('')
let timer: ReturnType<typeof setInterval> | undefined

const stats = [
  { value: '16+', label: '顶级大模型' },
  { value: '99.9%', label: '服务可用性' },
  { value: '<100ms', label: '网关延迟' },
  { value: '¥1', label: '注册体验金' },
]

const features = [
  { icon: '⇄', color: '#8b6dff', title: 'OpenAI 兼容', desc: '标准 /v1/chat/completions 协议，已有代码改一行 baseURL 即可迁移。' },
  { icon: '⚡', color: '#22d3ee', title: '流式输出', desc: 'SSE 流式转发全程无缓冲，首字延迟压到极致。' },
  { icon: '¥', color: '#34d399', title: '按量计费', desc: 'token 级透明计价，每一分钱都能在账单里找到出处。' },
  { icon: '⌘', color: '#f472b6', title: '扫码充值', desc: '易支付协议接入支付宝/微信，服务器回调验签，秒级到账。' },
  { icon: '🗝', color: '#fbbf24', title: '密钥管理', desc: '多密钥隔离不同项目，一键创建、吊销，用量独立追踪。' },
  { icon: '◔', color: '#5ba0f6', title: '用量分析', desc: '近 7 天调用趋势、模型分布、延迟统计，一目了然。' },
]

onMounted(async () => {
  let i = 0
  timer = setInterval(() => {
    i += 2
    typed.value = CODE.slice(0, i)
    if (i >= CODE.length) clearInterval(timer)
  }, 24)
  try {
    models.value = (await api.models()).models
  } catch {
    /* 橱窗加载失败不阻塞首页 */
  }
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="min-h-screen">
    <SiteNav />

    <!-- Hero -->
    <section class="relative overflow-hidden">
      <PrismHero />
      <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-[1.2fr_1fr] lg:py-32">
        <div>
          <div class="rise rise-1 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[13px] text-brand">
            <span>✦</span> 一个密钥 · 聚合 16+ 顶级大模型
          </div>
          <h1 class="rise rise-2 mt-6 text-5xl font-extrabold leading-[1.15] tracking-tight lg:text-6xl">
            <span class="spectrum-text">一束光</span><br />
            <span class="text-t1">折射整个 AI 宇宙</span>
          </h1>
          <p class="rise rise-3 mt-6 max-w-md text-base leading-relaxed text-t2">
            OpenAI 兼容协议，一行代码切换上百个模型。按量计费透明可见，充值即时到账，流式输出毫秒必争。
          </p>
          <div class="rise rise-4 mt-9 flex flex-wrap items-center gap-4">
            <button
              class="spectrum-bg group flex items-center gap-2 rounded-xl px-7 py-3.5 font-medium text-white shadow-lg shadow-brand/30 transition hover:shadow-xl hover:shadow-brand/40 hover:brightness-110"
              @click="router.push('/register')"
            >
              免费开始 · 送 ¥1 体验金
              <span class="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
            <n-button size="large" quaternary class="!rounded-xl" @click="router.push('/models')">
              浏览模型
            </n-button>
          </div>
        </div>

        <!-- 终端卡片 -->
        <div class="rise rise-3 glass overflow-hidden shadow-2xl shadow-brand/20">
          <div class="flex items-center gap-2 border-b border-line px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span class="h-3 w-3 rounded-full bg-[#28c840]" />
            <span class="ml-2 text-xs text-t3">terminal — 接入只需 10 秒</span>
          </div>
          <pre class="h-56 overflow-hidden p-5 font-mono text-[13px] leading-relaxed text-t2"><span class="text-emerald">$ </span>{{ typed }}<span class="animate-pulse text-cyan">▌</span></pre>
        </div>
      </div>
    </section>

    <!-- 数据条 -->
    <section class="border-y border-line py-10">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-24 gap-y-8 px-6">
        <div v-for="s in stats" :key="s.label" class="text-center">
          <div class="spectrum-text text-3xl font-extrabold">{{ s.value }}</div>
          <div class="mt-1 text-[13px] text-t3">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- 精选模型 -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <h2 class="text-center text-3xl font-bold text-t1">精选模型</h2>
      <p class="mt-3 text-center text-sm text-t2">旗舰模型一网打尽，价格全网透明</p>
      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ModelCard v-for="m in featured" :key="m.id" :model="m" />
      </div>
      <div class="mt-8 text-center">
        <router-link to="/models" class="text-sm font-medium text-brand hover:underline">
          查看全部 {{ models.length }} 个模型 →
        </router-link>
      </div>
    </section>

    <!-- 创意工坊 -->
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="glass relative overflow-hidden p-10 text-center" style="box-shadow: 0 30px 90px -40px rgba(139, 109, 255, 0.5)">
        <div
          class="pointer-events-none absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full opacity-30"
          style="background: radial-gradient(ellipse, #8b6dff 0%, transparent 65%)"
        />
        <div class="relative">
          <h2 class="text-3xl font-bold"><span class="spectrum-text">创意工坊</span></h2>
          <p class="mt-3 text-sm text-t2">不止于对话——让模型的输出直接「响起来、亮起来、动起来」</p>
          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <router-link
              v-for="s in [
                { icon: '♪', name: '音乐 Demo', desc: 'AI 作曲，Web Audio 实时合成', mode: 'music' },
                { icon: '❒', name: '网站 Demo', desc: 'AI 生成网页，沙箱实时预览', mode: 'site' },
                { icon: '▶', name: '游戏 Demo', desc: 'AI 生成小游戏，即刻开玩', mode: 'game' },
              ]"
              :key="s.mode"
              :to="`/studio?mode=${s.mode}`"
              class="glass glass-hover p-6"
            >
              <div class="spectrum-bg mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-lg text-white">
                {{ s.icon }}
              </div>
              <div class="mt-3 font-semibold text-t1">{{ s.name }}</div>
              <p class="mt-1.5 text-xs text-t3">{{ s.desc }}</p>
            </router-link>
          </div>
          <router-link to="/studio" class="mt-7 inline-block text-sm font-medium text-brand hover:underline">
            进入创意工坊 →
          </router-link>
        </div>
      </div>
    </section>

    <!-- 特性 -->
    <section class="bg-bg-soft py-20">
      <div class="mx-auto max-w-6xl px-6">
        <h2 class="text-center text-3xl font-bold text-t1">为什么选择棱镜</h2>
        <p class="mt-3 text-center text-sm text-t2">从接入到收款，每个环节都为生产环境打磨</p>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="f in features" :key="f.title" class="glass glass-hover p-6">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                :style="{ background: f.color + '22', color: f.color }"
              >
                {{ f.icon }}
              </div>
              <span class="font-semibold text-t1">{{ f.title }}</span>
            </div>
            <p class="mt-4 text-[13px] leading-relaxed text-t2">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 text-center">
      <h2 class="spectrum-text mx-auto max-w-2xl text-3xl font-bold">现在，让光穿过棱镜</h2>
      <p class="mt-4 text-sm text-t2">注册即送 ¥1 体验金，10 秒拿到你的第一个 API 密钥</p>
      <button
        class="spectrum-bg mt-8 rounded-xl px-10 py-3.5 font-medium text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
        @click="router.push('/register')"
      >
        免费注册
      </button>
    </section>

    <SiteFooter />
  </div>
</template>
