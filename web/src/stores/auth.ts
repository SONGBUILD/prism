import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, getToken, setToken, clearToken, type UserInfo } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  // token 需是响应式：computed 依赖 localStorage（非响应式）会被永久缓存，
  // 导致登录后 isLoggedIn 不更新，回到官网时导航栏误判为已退出。
  const token = ref(getToken())
  const isLoggedIn = computed(() => !!token.value)

  async function refresh() {
    if (!token.value) return
    try {
      const res = await api.me()
      user.value = res.user
    } catch {
      // token 失效
      clearToken()
      token.value = ''
      user.value = null
    }
  }

  function loginWith(t: string) {
    setToken(t)
    token.value = t
    return refresh()
  }

  function logout() {
    clearToken()
    token.value = ''
    user.value = null
  }

  return { user, isLoggedIn, refresh, loginWith, logout }
})
