<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NButton, NInput, NModal, NSpin, NPopconfirm, useMessage } from 'naive-ui'
import { api, type ApiKeyInfo } from '../../api'

const message = useMessage()
const keys = ref<ApiKeyInfo[]>([])
const loading = ref(true)
const showCreate = ref(false)
const newName = ref('')
const creating = ref(false)
const revealed = ref(new Set<number>())

function mask(key: string) {
  return key.length > 16 ? `${key.slice(0, 13)}…${key.slice(-4)}` : key
}

function fmtTime(ms: number | null) {
  if (!ms) return '-'
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function load() {
  loading.value = true
  try {
    keys.value = (await api.keys()).keys
  } finally {
    loading.value = false
  }
}

async function create() {
  creating.value = true
  try {
    const res = await api.createKey(newName.value.trim() || '默认密钥')
    showCreate.value = false
    newName.value = ''
    await load()
    await copy(res.key)
    message.success('密钥已创建并复制到剪贴板')
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    creating.value = false
  }
}

async function remove(id: number) {
  await api.deleteKey(id)
  keys.value = keys.value.filter((k) => k.id !== id)
  message.success('已删除')
}

function toggleReveal(id: number) {
  revealed.value.has(id) ? revealed.value.delete(id) : revealed.value.add(id)
  revealed.value = new Set(revealed.value)
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* 非安全上下文降级：忽略 */
  }
}

async function copyKey(text: string) {
  await copy(text)
  message.success('已复制到剪贴板')
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <p class="text-[13px] text-t2">密钥用于调用 /v1 接口，请妥善保管，泄露可随时吊销。</p>
      <n-button type="primary" round @click="showCreate = true">＋ 创建密钥</n-button>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><n-spin /></div>
    <div v-else-if="!keys.length" class="glass mt-5 py-16 text-center text-sm text-t3">
      还没有密钥，点击右上角创建第一个
    </div>
    <div v-else class="mt-5 flex flex-col gap-3">
      <div v-for="k in keys" :key="k.id" class="glass flex items-center gap-4 p-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21 10h-8.35A5.99 5.99 0 0 0 7 6a6 6 0 1 0 5.65 8H14l2 2 2-2 1 1 2.5-2.55zM7 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
            />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-t1">{{ k.name }}</div>
          <div class="mt-0.5 select-all font-mono text-xs text-t2">
            {{ revealed.has(k.id) ? k.key : mask(k.key) }}
          </div>
          <div class="mt-0.5 text-xs text-t3">
            创建于 {{ fmtTime(k.created_at) }} ·
            {{ k.last_used_at ? `最近使用 ${fmtTime(k.last_used_at)}` : '从未使用' }}
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <n-button quaternary circle size="small" @click="toggleReveal(k.id)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-t3">
              <path
                d="M12 6a9.77 9.77 0 0 1 8.82 5.5A9.77 9.77 0 0 1 12 17a9.77 9.77 0 0 1-8.82-5.5A9.77 9.77 0 0 1 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4m0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5"
              />
            </svg>
          </n-button>
          <n-button quaternary circle size="small" @click="copyKey(k.key)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-t3">
              <path
                d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11z"
              />
            </svg>
          </n-button>
          <n-popconfirm @positive-click="remove(k.id)">
            <template #trigger>
              <n-button quaternary circle size="small">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-red-400">
                  <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
                </svg>
              </n-button>
            </template>
            删除后使用该密钥的调用会立即失败，确定删除？
          </n-popconfirm>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showCreate" preset="card" title="创建 API 密钥" class="!w-[420px]">
      <n-input v-model:value="newName" placeholder="密钥名称，如：生产环境" @keyup.enter="create" />
      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button quaternary @click="showCreate = false">取消</n-button>
          <n-button type="primary" :loading="creating" @click="create">创建</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
