<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PrismLogo from './PrismLogo.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const links = [
  { name: '模型市场', path: '/models' },
  { name: '创意工坊', path: '/studio' },
  { name: '在线体验', path: '/console/playground' },
  { name: 'API 文档', path: '/docs' },
]
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
      <PrismLogo />
      <nav class="hidden items-center gap-6 md:flex">
        <router-link
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="text-sm transition-colors hover:text-t1"
          :class="route.path === link.path ? 'text-t1 font-medium' : 'text-t2'"
        >
          {{ link.name }}
        </router-link>
      </nav>
      <div class="ml-auto flex items-center gap-3">
        <template v-if="auth.isLoggedIn">
          <n-button type="primary" size="medium" round @click="router.push('/console')">
            <span class="px-1">控制台</span>
          </n-button>
        </template>
        <template v-else>
          <n-button quaternary size="medium" @click="router.push('/login')">登录</n-button>
          <n-button type="primary" size="medium" round @click="router.push('/register')">
            <span class="px-1">免费注册</span>
          </n-button>
        </template>
      </div>
    </div>
  </header>
</template>
