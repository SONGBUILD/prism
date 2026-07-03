<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { NInput, NSpin } from 'naive-ui'
import { api, type ModelInfo } from '../api'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import ModelCard from '../components/ModelCard.vue'

const models = ref<ModelInfo[]>([])
const loading = ref(true)
const keyword = ref('')
const tag = ref('')

const allTags = computed(() => [...new Set(models.value.flatMap((m) => m.tags))])

const filtered = computed(() =>
  models.value.filter((m) => {
    const kw = keyword.value.toLowerCase()
    const hitKw =
      !kw ||
      m.name.toLowerCase().includes(kw) ||
      m.id.toLowerCase().includes(kw) ||
      m.vendor.toLowerCase().includes(kw)
    const hitTag = !tag.value || m.tags.includes(tag.value)
    return hitKw && hitTag
  }),
)

onMounted(async () => {
  try {
    models.value = (await api.models()).models
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen">
    <SiteNav />
    <div class="mx-auto max-w-6xl px-6 py-12">
      <h1 class="text-3xl font-bold text-t1">模型市场</h1>
      <p class="mt-2 text-sm text-t2">{{ models.length }} 个模型 · 价格单位 ¥/1M tokens（输入/输出）</p>

      <div class="mt-8">
        <n-input v-model:value="keyword" size="large" clearable placeholder="搜索模型名称 / 厂商…" class="!rounded-xl">
          <template #prefix>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-t3">
              <path
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"
              />
            </svg>
          </template>
        </n-input>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="rounded-full border px-3.5 py-1.5 text-[13px] transition"
            :class="!tag ? 'border-brand bg-brand/15 text-brand' : 'border-line text-t2 hover:text-t1'"
            @click="tag = ''"
          >
            全部
          </button>
          <button
            v-for="t in allTags"
            :key="t"
            class="rounded-full border px-3.5 py-1.5 text-[13px] transition"
            :class="tag === t ? 'border-brand bg-brand/15 text-brand' : 'border-line text-t2 hover:text-t1'"
            @click="tag = tag === t ? '' : t"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-24"><n-spin /></div>
      <div v-else-if="!filtered.length" class="py-24 text-center text-sm text-t3">没有匹配的模型</div>
      <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ModelCard v-for="m in filtered" :key="m.id" :model="m" />
      </div>
    </div>
    <SiteFooter />
  </div>
</template>
