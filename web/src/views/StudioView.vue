<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { NInput, NSelect, NButton, useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { api, type ModelInfo } from '../api'
import { useAuthStore } from '../stores/auth'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import MusicPlayer, { type Composition } from '../components/studio/MusicPlayer.vue'
import HtmlSandbox from '../components/studio/HtmlSandbox.vue'
import { MUSIC_DEMOS } from '../demos/music'
import { SITE_DEMOS } from '../demos/sites'
import { GAME_DEMOS } from '../demos/games'

type Mode = 'music' | 'site' | 'game'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const mode = ref<Mode>(
  ['music', 'site', 'game'].includes(route.query.mode as string) ? (route.query.mode as Mode) : 'music',
)
const prompt = ref('')
const models = ref<ModelInfo[]>([])
const selected = ref('')
const generating = ref(false)
const streamedChars = ref(0)

const musicResult = ref<Composition | null>(null)
const htmlResult = ref('')
const resultMode = ref<Mode | null>(null)

const MODES: Record<Mode, { icon: string; name: string; desc: string; placeholder: string; examples: string[]; system: string }> = {
  music: {
    icon: '♪',
    name: '音乐 Demo',
    desc: 'AI 作曲 → Web Audio 实时合成播放',
    placeholder: '描述你想要的曲子，比如：一首赛博朋克风的夜间驾驶配乐',
    examples: ['星际漫游的太空环境乐', '轻快的像素游戏 BGM', '雨夜爵士小品'],
    system:
      'PRISM_STUDIO:music 你是作曲引擎。只输出一个 JSON（可用 ```json 包裹），不要任何解释。格式：{"title":"曲名","bpm":整数,"key":"调式","tracks":[{"name":"轨名","wave":"sine|triangle|sawtooth|square|noise|kick","gain":0-1,"notes":[[起始拍,MIDI音高,时值拍]...]}]}。8-16 小节，包含旋律、贝斯、和声铺底与鼓组。',
  },
  site: {
    icon: '❒',
    name: '网站 Demo',
    desc: 'AI 生成完整网页 → 沙箱实时预览',
    placeholder: '描述你想要的网站，比如：一家手冲咖啡馆的品牌官网',
    examples: ['极简风个人作品集', '猫咖啡馆官网', 'SaaS 产品落地页'],
    system:
      'PRISM_STUDIO:site 你是网页生成引擎。只输出一个完整的 HTML 文档（可用 ```html 包裹），内联全部 CSS/JS，禁止引用外部资源，设计精美、含渐变与悬停动效、响应式。',
  },
  game: {
    icon: '▶',
    name: '游戏 Demo',
    desc: 'AI 生成小游戏 → 即刻开玩',
    placeholder: '描述你想要的小游戏，比如：躲避陨石的太空飞船',
    examples: ['接住掉落的光子', '霓虹风贪吃蛇', '太空躲避战'],
    system:
      'PRISM_STUDIO:game 你是游戏生成引擎。只输出一个完整的 HTML 文档（可用 ```html 包裹），用 canvas 实现可玩的小游戏，键盘+鼠标可操作，含计分与重开，内联全部代码，禁止外部资源。',
  },
}

const options = computed<SelectOption[]>(() =>
  models.value.map((m) => ({ label: `${m.name} · ${m.vendor}`, value: m.id })),
)

/** 精选作品：真实开发的成品，点开即用，不走生成 */
const gallery = computed(() => {
  if (mode.value === 'music')
    return MUSIC_DEMOS.map((d) => ({ id: d.id, title: d.composition.title, desc: d.desc }))
  const list = mode.value === 'site' ? SITE_DEMOS : GAME_DEMOS
  return list.map((d) => ({ id: d.id, title: d.title, desc: d.desc }))
})

function openDemo(id: string) {
  const currentMode = mode.value
  if (currentMode === 'music') {
    musicResult.value = MUSIC_DEMOS.find((d) => d.id === id)!.composition
  } else {
    const list = currentMode === 'site' ? SITE_DEMOS : GAME_DEMOS
    htmlResult.value = list.find((d) => d.id === id)!.html
  }
  resultMode.value = currentMode
}

function pickMode(m: Mode) {
  mode.value = m
  prompt.value = ''
}

async function bootstrap() {
  try {
    models.value = (await api.models()).models
    selected.value = models.value[0]?.id || ''
  } catch {
    /* 模型列表加载失败不阻塞，生成时用默认模型 */
  }
}

/** 从模型回复中提取代码块内容 */
function extractBlock(text: string): string {
  const match = text.match(/```(?:json|html)?\s*\n?([\s\S]*?)```/)
  return (match ? match[1] : text).trim()
}

async function generate() {
  const text = prompt.value.trim()
  if (!text || generating.value) return

  generating.value = true
  streamedChars.value = 0
  const currentMode = mode.value

  try {
    // 公共工坊接口：无需登录/密钥，服务端用公共上游密钥转发，所有人可生成。
    const res = await fetch('/v1/studio/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: currentMode,
        prompt: text,
        model: selected.value,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `请求失败（${res.status}）`)
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    streamedChars.value = content.length

    const block = extractBlock(content)
    if (currentMode === 'music') {
      musicResult.value = JSON.parse(block) as Composition
    } else {
      htmlResult.value = block
    }
    resultMode.value = currentMode
    message.success('生成完成')
  } catch (e) {
    message.error(`生成失败：${(e as Error).message}`)
  } finally {
    generating.value = false
  }
}

onMounted(bootstrap)
</script>

<template>
  <div class="min-h-screen">
    <SiteNav />

    <div class="mx-auto max-w-5xl px-6 py-12">
      <!-- 头部 -->
      <div class="text-center">
        <div class="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[13px] text-brand">
          ✦ 创意工坊 · 让模型的输出「活」起来
        </div>
        <h1 class="mt-5 text-4xl font-extrabold tracking-tight">
          <span class="spectrum-text">一句话，折射出一个作品</span>
        </h1>
        <p class="mt-4 text-sm text-t2">
          每次生成都是一次真实的 <code class="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs">/v1/chat/completions</code>
          调用——按 token 计费、写入调用日志，可在控制台核对每一分钱。
        </p>
      </div>

      <!-- 模式选择 -->
      <div class="mt-10 grid gap-4 sm:grid-cols-3">
        <button
          v-for="(m, key) in MODES"
          :key="key"
          class="glass glass-hover p-5 text-left transition"
          :class="mode === key ? '!border-brand/60 shadow-lg shadow-brand/20' : ''"
          @click="pickMode(key as Mode)"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
              :class="mode === key ? 'spectrum-bg text-white' : 'bg-white/5 text-t2'"
            >
              {{ m.icon }}
            </span>
            <span class="font-semibold" :class="mode === key ? 'text-t1' : 'text-t2'">{{ m.name }}</span>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-t3">{{ m.desc }}</p>
        </button>
      </div>

      <!-- 输入区 -->
      <div class="glass mt-6 p-5">
        <div class="flex flex-col gap-3 sm:flex-row">
          <n-input
            v-model:value="prompt"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="MODES[mode].placeholder"
            class="flex-1"
            @keydown.enter.exact.prevent="generate"
          />
          <div class="flex shrink-0 flex-col gap-2 sm:w-56">
            <n-select v-model:value="selected" :options="options" size="medium" placeholder="选择模型" />
            <button
              class="spectrum-bg flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
              :disabled="generating"
              @click="generate"
            >
              <span v-if="generating" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {{ generating ? `生成中 · ${streamedChars} 字符` : `✦ 生成${MODES[mode].name}` }}
            </button>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span class="text-xs text-t3">试试：</span>
          <button
            v-for="ex in MODES[mode].examples"
            :key="ex"
            class="rounded-full border border-line px-3 py-1 text-xs text-t2 transition hover:border-brand/50 hover:text-t1"
            @click="prompt = ex"
          >
            {{ ex }}
          </button>
        </div>
      </div>

      <!-- 精选作品 -->
      <div class="mt-8">
        <div class="flex items-center gap-3">
          <h2 class="font-semibold text-t1">精选作品</h2>
          <span class="rounded-full border border-emerald/40 bg-emerald/10 px-2.5 py-0.5 text-[11px] text-emerald">
            真实开发 · 即点即玩 · 不扣费
          </span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            v-for="d in gallery"
            :key="d.id"
            class="glass glass-hover flex items-center gap-4 p-4 text-left"
            @click="openDemo(d.id)"
          >
            <span class="spectrum-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
              {{ MODES[mode].icon }}
            </span>
            <span class="min-w-0">
              <span class="block font-medium text-t1">{{ d.title }}</span>
              <span class="mt-0.5 block truncate text-xs text-t3">{{ d.desc }}</span>
            </span>
            <span class="ml-auto shrink-0 text-sm text-brand">▶</span>
          </button>
        </div>
      </div>

      <!-- 结果区 -->
      <div class="mt-8">
        <div v-if="!resultMode" class="glass flex flex-col items-center gap-3 py-20 text-center">
          <span class="text-3xl opacity-40">{{ MODES[mode].icon }}</span>
          <p class="text-sm text-t3">选一个灵感，点击生成——作品会在这里响起 / 亮起 / 动起来</p>
          <n-button v-if="!auth.isLoggedIn" type="primary" round class="mt-2" @click="router.push('/register')">
            注册领 ¥1 体验金，立即开玩
          </n-button>
        </div>
        <MusicPlayer v-else-if="resultMode === 'music' && musicResult" :composition="musicResult" />
        <HtmlSandbox
          v-else-if="htmlResult"
          :html="htmlResult"
          :height="resultMode === 'game' ? 560 : 620"
          :label="resultMode === 'game' ? 'AI 生成游戏 · 点击画布开玩' : 'AI 生成网页 · 沙箱运行'"
        />
      </div>
    </div>

    <SiteFooter />
  </div>
</template>
