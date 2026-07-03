<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { NSpin } from 'naive-ui'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useRouter } from 'vue-router'
import { api, type Overview } from '../../api'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const router = useRouter()
const data = ref<Overview | null>(null)

const cards = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: '账户余额', value: `¥${d.balance.toFixed(4)}`, sub: '', color: '#8b6dff', action: true },
    { label: '今日消费', value: `¥${d.today.cost.toFixed(4)}`, sub: `${d.today.requests} 次调用`, color: '#22d3ee' },
    { label: '累计 Tokens', value: fmtTokens(d.totals.tokens), sub: `${d.totals.requests} 次调用`, color: '#34d399' },
    { label: '累计消费', value: `¥${d.totals.cost.toFixed(4)}`, sub: '', color: '#f472b6' },
  ]
})

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

const chartOption = computed(() => {
  const days = data.value?.days ?? []
  return {
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1a2a',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#f2f3f8', fontSize: 12 },
      formatter: (params: any) => {
        const p = params[0]
        const d = days[p.dataIndex]
        return `${d.date}<br/>消费 ¥${d.cost.toFixed(4)}<br/>${d.requests} 次调用 · ${fmtTokens(d.tokens)} tokens`
      },
    },
    xAxis: {
      type: 'category',
      data: days.map((d) => d.date),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#5f5f74', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: '#5f5f74', fontSize: 11, formatter: (v: number) => `¥${v.toFixed(3)}` },
    },
    series: [
      {
        type: 'line',
        data: days.map((d) => Number(d.cost.toFixed(6))),
        smooth: 0.4,
        symbol: 'none',
        lineStyle: {
          width: 2.5,
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#8b6dff' },
              { offset: 0.5, color: '#22d3ee' },
              { offset: 1, color: '#34d399' },
            ],
          },
        },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139,109,255,0.28)' },
              { offset: 1, color: 'rgba(34,211,238,0.02)' },
            ],
          },
        },
      },
    ],
  }
})

const maxModelCost = computed(() =>
  Math.max(0.000001, ...(data.value?.byModel ?? []).map((m) => m.cost)),
)

const barColors = ['#8b6dff', '#22d3ee', '#34d399', '#f472b6', '#fbbf24', '#5ba0f6']

onMounted(async () => {
  data.value = await api.overview()
})
</script>

<template>
  <div v-if="!data" class="flex justify-center py-24"><n-spin /></div>
  <div v-else class="flex flex-col gap-5">
    <!-- 统计卡 -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="c in cards" :key="c.label" class="glass p-5">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 text-xs text-t3">
            <span class="h-2 w-2 rounded-full" :style="{ background: c.color }" />
            {{ c.label }}
          </span>
          <button
            v-if="c.action"
            class="spectrum-bg rounded-lg px-3 py-1 text-xs font-medium text-white transition hover:brightness-110"
            @click="router.push('/console/billing')"
          >
            充值
          </button>
        </div>
        <div class="mt-3 text-2xl font-bold text-t1">{{ c.value }}</div>
        <div v-if="c.sub" class="mt-1 text-xs text-t3">{{ c.sub }}</div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="glass p-6">
      <h3 class="font-semibold text-t1">近 7 天消费趋势</h3>
      <v-chart class="mt-4 !h-64 w-full" :option="chartOption" autoresize />
    </div>

    <!-- 模型分布 -->
    <div v-if="data.byModel.length" class="glass p-6">
      <h3 class="font-semibold text-t1">模型消费分布</h3>
      <div class="mt-5 flex flex-col gap-3.5">
        <div v-for="(m, i) in data.byModel" :key="m.model" class="flex items-center gap-4">
          <span class="w-40 truncate text-[13px] text-t2">{{ m.model }}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: `${(m.cost / maxModelCost) * 100}%`, background: barColors[i % barColors.length] }"
            />
          </div>
          <span class="w-32 shrink-0 text-right text-xs text-t3">
            ¥{{ m.cost.toFixed(4) }} · {{ m.requests }}次
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
