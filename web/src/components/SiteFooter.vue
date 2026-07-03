<script setup lang="ts">
import PrismLogo from './PrismLogo.vue'
</script>

<template>
  <footer class="border-t border-line py-12">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6">
      <PrismLogo :size="22" />
      <p class="text-sm text-t3">一个接口，折射整个 AI 宇宙</p>
      <p class="text-xs text-t3">© 2026 Prism 棱镜 · OpenAI 兼容协议 · 易支付安全收款</p>
    </div>
  </footer>
</template>
