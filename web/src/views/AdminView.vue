<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NInput, NButton, NSpin, NTag, useMessage } from 'naive-ui'
import { api } from '../api'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'

const message = useMessage()

const loggedIn = ref(!!localStorage.getItem('prism_admin_token'))
const password = ref('')
const loading = ref(false)
const orders = ref<(import('../api').OrderInfo & { email: string; user_id: number })[]>([])
const loaded = ref(false)
const confirming = ref<string>('')

async function login() {
  if (!password.value) {
    message.warning('请输入管理员密码')
    return
  }
  loading.value = true
  try {
    const res = await api.adminLogin(password.value)
    localStorage.setItem('prism_admin_token', res.token)
    loggedIn.value = true
    message.success('登录成功')
    await loadOrders()
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('prism_admin_token')
  loggedIn.value = false
  orders.value = []
  password.value = ''
}

async function loadOrders() {
  loaded.value = false
  try {
    const res = await api.adminOrders()
    orders.value = res.orders
  } catch (e) {
    // token 失效则退回登录
    if ((e as Error).message.includes('未登录')) {
      logout()
    } else {
      message.error((e as Error).message)
    }
  } finally {
    loaded.value = true
  }
}

async function confirm(outTradeNo: string) {
  confirming.value = outTradeNo
  try {
    await api.adminConfirm(outTradeNo)
    message.success('已确认到账，余额已入账')
    orders.value = orders.value.filter((o) => o.out_trade_no !== outTradeNo)
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    confirming.value = ''
  }
}

function fmtTime(ms: number) {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
  if (loggedIn.value) loadOrders()
})
</script>

<template>
  <div class="min-h-screen">
    <SiteNav />

    <div class="mx-auto max-w-3xl px-6 py-12">
      <div class="text-center">
        <div class="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[13px] text-brand">
          🔧 管理员后台
        </div>
        <h1 class="mt-5 text-3xl font-extrabold tracking-tight">订单确认</h1>
        <p class="mt-3 text-sm text-t2">用户扫码付款后标记的待确认订单，核对到账后点击确认即可入账</p>
      </div>

      <!-- 登录 -->
      <div v-if="!loggedIn" class="glass mt-8 p-8">
        <div class="mx-auto max-w-sm">
          <label class="text-sm font-medium text-t2">管理员密码</label>
          <n-input
            v-model:value="password"
            type="password"
            show-password-on="click"
            placeholder="请输入管理员密码"
            class="mt-2"
            @keydown.enter="login"
          />
          <n-button
            type="primary"
            block
            class="mt-4"
            :loading="loading"
            @click="login"
          >
            登录
          </n-button>
        </div>
      </div>

      <!-- 订单列表 -->
      <template v-else>
        <div class="mt-8 flex items-center justify-between">
          <h2 class="font-semibold text-t1">待确认订单 <span class="text-t3">({{ orders.length }})</span></h2>
          <div class="flex gap-2">
            <n-button size="small" quaternary @click="loadOrders">刷新</n-button>
            <n-button size="small" quaternary @click="logout">退出</n-button>
          </div>
        </div>

        <div v-if="!loaded" class="glass mt-4 flex justify-center py-16"><n-spin /></div>
        <div v-else-if="!orders.length" class="glass mt-4 py-16 text-center text-sm text-t3">
          暂无待确认订单
        </div>
        <div v-else class="mt-4 flex flex-col gap-3">
          <div
            v-for="o in orders"
            :key="o.out_trade_no"
            class="glass flex items-center gap-4 p-4"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              :class="{
                'bg-[#07c160]/15 text-[#3dd57f]': o.pay_type === 'wxpay',
                'bg-[#f0b90b]/15': o.pay_type === 'usad',
                'bg-[#1677ff]/15 text-[#4d94ff]': o.pay_type !== 'wxpay' && o.pay_type !== 'usad',
              }"
            >
              <img v-if="o.pay_type === 'usad'" src="/USAD.png" alt="USAD" class="h-7 w-7 object-contain" />
              <template v-else>{{ o.pay_type === 'wxpay' ? '微信' : '支付宝' }}</template>
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-t1">¥{{ o.amount.toFixed(2) }}</span>
                <n-tag size="tiny" round :bordered="false" type="warning">待确认</n-tag>
              </div>
              <div class="mt-0.5 truncate text-xs text-t3">
                {{ o.email }} · {{ o.out_trade_no }}
              </div>
              <div v-if="o.pay_type === 'usad' && o.trade_no" class="truncate text-xs text-[#f0b90b]">
                txid：{{ o.trade_no }}
              </div>
              <div class="text-xs text-t3">{{ fmtTime(o.created_at) }}</div>
            </div>
            <n-button
              type="primary"
              :loading="confirming === o.out_trade_no"
              @click="confirm(o.out_trade_no)"
            >
              确认到账
            </n-button>
          </div>
        </div>
      </template>
    </div>

    <SiteFooter />
  </div>
</template>
