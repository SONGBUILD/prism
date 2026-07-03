<script setup lang="ts">
import { onMounted, ref, computed, h } from 'vue'
import { NDataTable, NPagination, NSpin } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { api, type UsageLog } from '../../api'

const logs = ref<UsageLog[]>([])
const total = ref(0)
const page = ref(1)
const size = 20
const loading = ref(true)

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / size)))

function fmtTime(ms: number) {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const columns: DataTableColumns<UsageLog> = [
  {
    title: '模型',
    key: 'model',
    render: (row) =>
      h('div', [
        h('div', { class: 'text-t1 font-medium text-[13px]' }, row.model),
        row.key_name ? h('div', { class: 'text-t3 text-xs' }, row.key_name) : null,
      ]),
  },
  {
    title: '输入 / 输出 Tokens',
    key: 'tokens',
    render: (row) => `${row.prompt_tokens} / ${row.completion_tokens}`,
  },
  { title: '费用', key: 'cost', render: (row) => `¥${row.cost.toFixed(6)}` },
  { title: '延迟', key: 'latency_ms', render: (row) => `${row.latency_ms} ms` },
  { title: '时间', key: 'created_at', align: 'right', render: (row) => fmtTime(row.created_at) },
]

async function load() {
  loading.value = true
  try {
    const res = await api.usage(page.value)
    logs.value = res.logs
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function goPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <p class="text-[13px] text-t2">共 {{ total }} 条记录</p>
    <div v-if="loading && !logs.length" class="flex justify-center py-24"><n-spin /></div>
    <div v-else class="glass mt-4 overflow-hidden !rounded-2xl">
      <n-data-table :columns="columns" :data="logs" :bordered="false" :loading="loading" />
      <div v-if="!logs.length && !loading" class="py-12 text-center text-sm text-t3">
        还没有调用记录，去在线体验发起第一次请求吧
      </div>
    </div>
    <div class="mt-5 flex justify-center">
      <n-pagination :page="page" :page-count="pageCount" @update:page="goPage" />
    </div>
  </div>
</template>
