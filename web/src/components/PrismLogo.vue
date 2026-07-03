<script setup lang="ts">
defineProps<{ size?: number; showText?: boolean }>()
</script>

<template>
  <router-link to="/" class="flex items-center gap-2 select-none">
    <svg :width="size || 28" :height="size || 28" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8b6dff" />
          <stop offset=".5" stop-color="#22d3ee" />
          <stop offset="1" stop-color="#34d399" />
        </linearGradient>
      </defs>
      <path d="M16 3 29 27H3Z" stroke="url(#logo-g)" stroke-width="2.4" stroke-linejoin="round" />
      <path d="m1 12 11 5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9" />
      <path d="m20 17 11-4M20 18l11 1M20 19l10 6" stroke="url(#logo-g)" stroke-width="1.4" stroke-linecap="round" />
    </svg>
    <template v-if="showText !== false">
      <span class="text-xl font-bold tracking-tight text-t1">Prism</span>
      <span class="text-xs text-t3 mt-1">棱镜</span>
    </template>
  </router-link>
</template>
