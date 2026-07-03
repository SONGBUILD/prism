<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from 'vue'
import { NSelect, NInput, NButton, useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { useRoute } from 'vue-router'
import { api, getToken, type ModelInfo } from '../../api'
import { useAuthStore } from '../../stores/auth'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const route = useRoute()
const auth = useAuthStore()
const message = useMessage()

const models = ref<ModelInfo[]>([])
const selected = ref('')
const apiKey = ref('')
const messages = ref<ChatMsg[]>([])
const input = ref('')
const streaming = ref(false)
const listRef = ref<HTMLElement | null>(null)

const options = computed<SelectOption[]>(() =>
  models.value.map((m) => ({
    label: `${m.name} · ${m.vendor} · ¥${m.promptPrice}/¥${m.completionPrice}`,
    value: m.id,
  })),
)

function scrollBottom() {
  nextTick(() => listRef.value?.scrollTo({ top: listRef.value.scrollHeight }))
}

async function bootstrap() {
  try {
    models.value = (await api.models()).models
    const q = route.query.model as string
    selected.value = models.value.some((m) => m.id === q) ? q : models.value[0]?.id || ''
    // 自动取第一个密钥，没有则静默创建
    if (getToken()) {
      const res = await api.keys()
      apiKey.value = res.keys[0]?.key || (await api.createKey('体验密钥')).key
    }
  } catch {
    /* 发送时再提示 */
  }
}

async function send() {
  const text = input.value.trim()
  if (!text || streaming.value) return
  if (!apiKey.value) {
    message.error('请先登录并创建 API 密钥')
    return
  }
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  const assistant: ChatMsg = { role: 'assistant', content: '' }
  messages.value.push(assistant)
  streaming.value = true
  scrollBottom()

  try {
    const res = await fetch('/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({
        model: selected.value,
        stream: true,
        messages: messages.value.filter((m) => m.content).map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      assistant.content = `⚠️ ${err.error?.message || `请求失败（${res.status}）`}`
      return
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          const obj = JSON.parse(data)
          const delta = obj.choices?.[0]?.delta?.content
          if (delta) {
            assistant.content += delta
            scrollBottom()
          }
        } catch {
          /* 半截 JSON */
        }
      }
    }
    auth.refresh()
  } catch (e) {
    assistant.content = `⚠️ 网络错误：${(e as Error).message}`
  } finally {
    streaming.value = false
  }
}

onMounted(bootstrap)
</script>

<template>
  <div class="flex h-[calc(100vh-8.5rem)] flex-col gap-4">
    <!-- 工具栏 -->
    <div class="flex items-center gap-3">
      <n-select v-model:value="selected" :options="options" class="max-w-lg" placeholder="选择模型" />
      <n-button quaternary circle title="清空对话" @click="messages = []">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" class="text-t3">
          <path d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8H3zM14 5h-3l-1-1H6L5 5H2v2h12z" />
        </svg>
      </n-button>
    </div>

    <!-- 消息区 -->
    <div ref="listRef" class="glass flex-1 overflow-y-auto p-5">
      <div v-if="!messages.length" class="flex h-full flex-col items-center justify-center gap-3">
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
          <path d="M16 3 29 27H3Z" stroke="url(#logo-g)" stroke-width="2" stroke-linejoin="round" />
        </svg>
        <p class="text-sm text-t3">向任意模型发起你的第一条消息</p>
        <p class="text-xs text-t3">调用走真实 /v1 中转接口，按 token 计费</p>
      </div>
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="max-w-[72%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed"
          :class="
            m.role === 'user'
              ? 'self-end rounded-br-md bg-brand text-white'
              : 'self-start rounded-bl-md border border-line bg-card text-t1'
          "
        >{{ m.content || '…' }}<span v-if="m.role === 'assistant' && i === messages.length - 1 && streaming" class="animate-pulse text-cyan"> ▌</span></div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="glass flex items-end gap-2 p-2">
      <n-input
        v-model:value="input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        placeholder="输入消息，Enter 发送…"
        :bordered="false"
        @keydown.enter.exact.prevent="send"
      />
      <button
        class="spectrum-bg m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition hover:brightness-110 disabled:opacity-50"
        :disabled="streaming"
        @click="send"
      >
        <svg v-if="!streaming" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z" />
        </svg>
        <span v-else class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      </button>
    </div>
  </div>
</template>
