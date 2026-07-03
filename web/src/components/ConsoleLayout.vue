<script setup lang="ts">
import { onMounted } from 'vue'
import { NButton, NTooltip } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PrismLogo from './PrismLogo.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const items = [
  { icon: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z', name: '总览', path: '/console' },
  {
    icon: 'M21 10h-8.35A5.99 5.99 0 0 0 7 6a6 6 0 1 0 5.65 8H14l2 2 2-2 1 1 2.5-2.55zM7 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6',
    name: 'API 密钥',
    path: '/console/keys',
  },
  {
    icon: 'M21 7.28V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72M20 9v6h-7V9zm-5 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3',
    name: '充值中心',
    path: '/console/billing',
  },
  {
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z',
    name: '调用日志',
    path: '/console/usage',
  },
  {
    icon: 'M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2M6 9h12v2H6zm8 5H6v-2h8zm4-6H6V6h12z',
    name: '在线体验',
    path: '/console/playground',
  },
]

const title = () => items.find((i) => i.path === route.path)?.name || '控制台'

function logout() {
  auth.logout()
  router.push('/')
}

onMounted(() => auth.refresh())
</script>

<template>
  <div class="flex min-h-screen">
    <!-- 侧边栏 -->
    <aside class="hidden w-60 shrink-0 flex-col border-r border-line p-4 md:flex">
      <div class="px-2 py-2"><PrismLogo :size="24" /></div>
      <nav class="mt-6 flex flex-col gap-1">
        <router-link
          v-for="item in items"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
          :class="
            route.path === item.path
              ? 'bg-brand/15 font-medium text-brand'
              : 'text-t2 hover:bg-white/5 hover:text-t1'
          "
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path :d="item.icon" />
          </svg>
          {{ item.name }}
        </router-link>
      </nav>
      <div class="mt-auto">
        <div class="glass flex items-center gap-2.5 p-3">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/20 text-sm font-medium text-brand"
          >
            {{ (auth.user?.email || '?')[0].toUpperCase() }}
          </div>
          <span class="min-w-0 flex-1 truncate text-xs text-t2">{{ auth.user?.email }}</span>
          <n-tooltip>
            <template #trigger>
              <button class="text-t3 transition-colors hover:text-red-400" @click="logout">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4z"
                  />
                </svg>
              </button>
            </template>
            退出登录
          </n-tooltip>
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex h-14 items-center gap-3 border-b border-line px-6">
        <span class="font-semibold text-t1">{{ title() }}</span>
        <div class="ml-auto flex items-center gap-3">
          <router-link
            to="/console/billing"
            class="flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-[13px] font-medium text-brand transition hover:bg-brand/25"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M21 7.28V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72M20 9v6h-7V9z"
              />
            </svg>
            ¥{{ (auth.user?.balance ?? 0).toFixed(4) }}
          </router-link>
          <n-button size="small" quaternary @click="router.push('/')">返回官网</n-button>
        </div>
      </div>
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
