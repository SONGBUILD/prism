<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ html: string; height?: number; label?: string }>()
const tab = ref<'preview' | 'code'>('preview')

function openInNewTab() {
  const blob = new Blob([props.html], { type: 'text/html' })
  window.open(URL.createObjectURL(blob), '_blank')
}
</script>

<template>
  <div class="glass overflow-hidden">
    <div class="flex items-center gap-1 border-b border-line px-3 py-2">
      <span class="mr-2 flex gap-1.5 pl-1">
        <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </span>
      <button
        class="rounded-lg px-3 py-1 text-xs transition"
        :class="tab === 'preview' ? 'bg-brand/15 text-brand' : 'text-t3 hover:text-t1'"
        @click="tab = 'preview'"
      >
        预览
      </button>
      <button
        class="rounded-lg px-3 py-1 text-xs transition"
        :class="tab === 'code' ? 'bg-brand/15 text-brand' : 'text-t3 hover:text-t1'"
        @click="tab = 'code'"
      >
        源码
      </button>
      <span class="ml-2 text-xs text-t3">{{ label || 'AI 生成 · 沙箱运行' }}</span>
      <button class="ml-auto rounded-lg px-3 py-1 text-xs text-t3 transition hover:text-t1" @click="openInNewTab">
        新窗口打开 ↗
      </button>
    </div>
    <iframe
      v-if="tab === 'preview'"
      :srcdoc="html"
      sandbox="allow-scripts allow-pointer-lock"
      class="w-full border-0 bg-[#0a0a12]"
      :style="{ height: `${height || 520}px` }"
    />
    <pre
      v-else
      class="overflow-auto p-4 font-mono text-xs leading-relaxed text-t2"
      :style="{ height: `${height || 520}px` }"
    >{{ html }}</pre>
  </div>
</template>
