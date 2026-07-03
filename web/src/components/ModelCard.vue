<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ModelInfo } from '../api'

const props = defineProps<{ model: ModelInfo }>()
const router = useRouter()

function contextLabel(c: number) {
  return c >= 1_000_000 ? `${c / 1_000_000}M` : `${Math.round(c / 1000)}K`
}

function fmt(v: number) {
  return v === Math.round(v) ? String(Math.round(v)) : String(v)
}

function go() {
  router.push({ path: '/console/playground', query: { model: props.model.id } })
}
</script>

<template>
  <div class="glass glass-hover cursor-pointer p-5" @click="go">
    <div class="flex items-center gap-3">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        :style="{
          background: `linear-gradient(135deg, ${model.vendorColor}e6, ${model.vendorColor}88)`,
          boxShadow: `0 4px 14px -2px ${model.vendorColor}55`,
        }"
      >
        {{ model.vendor[0].toUpperCase() }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate font-semibold text-t1">{{ model.name }}</div>
        <div class="text-xs text-t3">{{ model.vendor }}</div>
      </div>
      <span class="shrink-0 rounded-md bg-brand/15 px-2 py-0.5 text-xs text-brand">
        {{ contextLabel(model.context) }}
      </span>
    </div>
    <p class="mt-3 line-clamp-2 text-[13px] leading-relaxed text-t2">{{ model.description }}</p>
    <div class="mt-4 flex items-center gap-1.5">
      <span
        v-for="tag in model.tags.slice(0, 3)"
        :key="tag"
        class="rounded-md border border-line px-2 py-0.5 text-xs text-t3"
      >
        {{ tag }}
      </span>
      <span class="ml-auto truncate text-xs font-medium text-t2">
        ¥{{ fmt(model.promptPrice) }} / ¥{{ fmt(model.completionPrice) }}
        <span class="text-t3">/1M</span>
      </span>
    </div>
  </div>
</template>
