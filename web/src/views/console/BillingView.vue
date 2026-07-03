<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { NButton, NInput, NSpin, NTag, useMessage } from 'naive-ui'
import { api, type OrderInfo, type UsadConfig } from '../../api'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const message = useMessage()

const presets = [10, 30, 50, 100, 200, 500]
const amount = ref(50)
const payType = ref<'alipay' | 'wxpay' | 'usad'>('alipay')
const paying = ref(false)

// USAD 加密货币充值
const usadCfg = ref<UsadConfig | null>(null)
const usadLoading = ref(false)
const usadError = ref('')
const txid = ref('')
const verifying = ref(false)
// 当前待支付订单：下单后展示二维码
const pendingOrder = ref<{ outTradeNo: string; amount: number; payType: string } | null>(null)
const notifying = ref(false)
const showAdminWx = ref(false)
const orders = ref<OrderInfo[]>([])
const loaded = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

async function loadOrders() {
  try {
    orders.value = (await api.orders()).orders
  } finally {
    loaded.value = true
  }
}

/** 下单 → 页内展示收款二维码 */
async function pay() {
  paying.value = true
  try {
    const res = await api.createOrder(amount.value, payType.value)
    pendingOrder.value = { outTradeNo: res.outTradeNo, amount: res.amount, payType: res.payType }
    startPolling()
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    paying.value = false
  }
}

/** 用户扫码付款后点击「我已支付」→ 通知管理员确认 */
async function notifyAdmin() {
  if (!pendingOrder.value) return
  notifying.value = true
  try {
    await api.notifyAdmin(pendingOrder.value.outTradeNo)
    message.success('已通知管理员，请耐心等待确认到账', { duration: 4000 })
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    notifying.value = false
  }
}

function startPolling() {
  stopPolling()
  let ticks = 0
  pollTimer = setInterval(async () => {
    if (++ticks > 300 || !pendingOrder.value) return stopPolling()
    try {
      const res = await api.orderStatus(pendingOrder.value.outTradeNo)
      if (res.order.status === 'paid') {
        stopPolling()
        pendingOrder.value = null
        await Promise.all([auth.refresh(), loadOrders()])
        message.success(`¥${res.order.amount.toFixed(2)} 已到账 · 管理员确认完成`, { duration: 4000 })
      }
    } catch {
      /* 轮询偶发失败忽略 */
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = undefined
}

function cancelPending() {
  stopPolling()
  pendingOrder.value = null
}

async function selectPayType(t: 'alipay' | 'wxpay' | 'usad') {
  payType.value = t
  if (t === 'usad' && !usadCfg.value && !usadLoading.value) await loadUsadConfig()
}

async function loadUsadConfig() {
  usadLoading.value = true
  usadError.value = ''
  try {
    usadCfg.value = await api.usadConfig()
  } catch (e) {
    usadError.value = (e as Error).message
  } finally {
    usadLoading.value = false
  }
}

async function copyAddress() {
  if (!usadCfg.value) return
  try {
    await navigator.clipboard.writeText(usadCfg.value.addressStr)
    message.success('充值地址已复制')
  } catch {
    message.error('复制失败，请手动长按复制')
  }
}

/** 用户链上转账后输入 txid，后端核对到账并生成待确认订单 */
async function verifyUsad() {
  const id = txid.value.trim()
  if (!id) {
    message.warning('请输入链上交易号 txid')
    return
  }
  verifying.value = true
  try {
    const res = await api.usadVerify(id)
    if (res.already) {
      message.info('该交易号已提交，正在等待管理员确认入账')
    } else {
      message.success(`核对成功 · ¥${res.amount.toFixed(2)} 待管理员确认入账`, { duration: 4000 })
    }
    txid.value = ''
    await loadOrders()
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    verifying.value = false
  }
}

function fmtTime(ms: number | null) {
  if (!ms) return '-'
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(loadOrders)
onBeforeUnmount(stopPolling)
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-5 lg:grid-cols-[3fr_2fr]">
      <!-- 充值面板 -->
      <div class="glass p-6">
        <template v-if="!pendingOrder">
          <h3 class="font-semibold text-t1">支付方式</h3>
          <div class="mt-3 flex flex-wrap gap-3">
            <button
              class="flex items-center gap-2 rounded-xl border px-5 py-3 text-sm transition"
              :class="payType === 'alipay' ? 'border-[#1677ff] bg-[#1677ff]/12 text-[#4d94ff]' : 'border-line text-t2'"
              @click="selectPayType('alipay')"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1677ff">
                <path
                  d="M21.42 15.45c-3.14-1.1-5.15-1.86-6.03-2.27.66-1.13 1.17-2.43 1.5-3.86h-3.65V7.9h4.45V7h-4.45V4.6h-2.1V7H6.7v.9h4.44v1.42H7.4v.9h7.32a11 11 0 0 1-1.06 2.62c-1.86-.66-3.36-.99-4.5-.99-2.7 0-4.25 1.28-4.25 3.06 0 1.9 1.63 3.13 4.02 3.13 2.1 0 4.03-.98 5.6-2.68 1.55.78 4.05 1.9 7.47 3.34V22H24v-4.3zM8.9 16.9c-1.5 0-2.36-.63-2.36-1.62 0-.94.9-1.62 2.4-1.62.96 0 2.17.3 3.62.86-1.2 1.6-2.5 2.38-3.66 2.38"
                />
              </svg>
              支付宝
            </button>
            <button
              class="flex items-center gap-2 rounded-xl border px-5 py-3 text-sm transition"
              :class="payType === 'wxpay' ? 'border-[#07c160] bg-[#07c160]/12 text-[#3dd57f]' : 'border-line text-t2'"
              @click="selectPayType('wxpay')"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#07c160">
                <path
                  d="M8.7 4C4.9 4 1.8 6.6 1.8 9.8c0 1.8 1 3.4 2.5 4.5l-.6 1.9 2.2-1.1c.8.2 1.5.3 2.4.3h.6a5.4 5.4 0 0 1-.2-1.5c0-3.1 3-5.6 6.6-5.6h.5C15.2 5.7 12.2 4 8.7 4M6.4 7.3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8m5 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8m4 2.5c-3.2 0-5.7 2.1-5.7 4.7s2.5 4.7 5.7 4.7c.7 0 1.3-.1 2-.3l1.8 1-.5-1.6c1.3-.9 2.1-2.2 2.1-3.8 0-2.6-2.6-4.7-5.4-4.7m-2 2.3a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5m4.2 0a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5"
                />
              </svg>
              微信支付
            </button>
            <button
              class="flex items-center gap-2 rounded-xl border px-5 py-3 text-sm transition"
              :class="payType === 'usad' ? 'border-[#f0b90b] bg-[#f0b90b]/12 text-[#f0b90b]' : 'border-line text-t2'"
              @click="selectPayType('usad')"
            >
              <img src="/USAD.png" alt="USAD" width="17" height="17" class="object-contain" />
              USAD
            </button>
          </div>

          <!-- 微信/支付宝：选金额下单 -->
          <template v-if="payType !== 'usad'">
            <h3 class="mt-7 font-semibold text-t1">选择充值金额</h3>
            <div class="mt-4 flex flex-wrap gap-2.5">
              <button
                v-for="p in presets"
                :key="p"
                class="w-24 rounded-xl border py-3.5 font-semibold transition"
                :class="
                  amount === p
                    ? 'border-brand bg-brand/15 text-brand'
                    : 'border-line bg-white/[0.03] text-t2 hover:border-white/25'
                "
                @click="amount = p"
              >
                ¥{{ p }}
              </button>
            </div>

            <div class="mt-7">
              <button
                class="spectrum-bg w-full rounded-xl py-3.5 font-medium text-white shadow-lg shadow-brand/25 transition hover:brightness-110 disabled:opacity-60"
                :disabled="paying"
                @click="pay"
              >
                {{ paying ? '正在创建订单…' : `立即充值 ¥${amount}` }}
              </button>
            </div>
          </template>

          <!-- USAD：链上转账 + txid 核对 -->
          <template v-else>
            <div v-if="usadLoading" class="flex justify-center py-12"><n-spin /></div>
            <div v-else-if="usadError" class="mt-6 text-center">
              <p class="text-sm text-pink">{{ usadError }}</p>
              <n-button size="small" class="mt-3" @click="loadUsadConfig">重试</n-button>
            </div>
            <template v-else-if="usadCfg">
              <div class="mt-6 flex flex-col items-center gap-3">
                <div class="text-[13px] text-t2">
                  向以下地址转入 <span class="font-semibold text-[#f0b90b]">{{ usadCfg.symbol }}</span>
                  （主网 {{ usadCfg.mainnet }}）
                </div>
                <div
                  v-if="usadCfg.addressQRCode"
                  class="w-48 overflow-hidden rounded-2xl bg-white p-3"
                >
                  <img :src="usadCfg.addressQRCode" alt="USAD 充值地址二维码" class="h-full w-full object-contain" />
                </div>

                <div class="w-full rounded-xl border border-line bg-white/[0.03] p-3">
                  <div class="text-[11px] text-t3">充值地址</div>
                  <div class="mt-1 flex items-center gap-2">
                    <code class="flex-1 break-all text-[13px] text-t1">{{ usadCfg.addressStr }}</code>
                    <n-button size="tiny" secondary @click="copyAddress">复制</n-button>
                  </div>
                  <div v-if="usadCfg.memo" class="mt-2 text-[12px] text-[#f0b90b]">
                    Memo/标签：{{ usadCfg.memo }}（务必填写，否则无法到账）
                  </div>
                </div>
                <p class="text-[12px] leading-relaxed text-t3">
                  需 {{ usadCfg.depositConfirm }} 个网络确认到账；1 USAD ≈ ¥{{ usadCfg.rate }}。
                  链上转账完成后，粘贴交易号核对即可提交管理员确认入账。
                </p>
              </div>

              <div class="mt-5">
                <label class="text-sm font-medium text-t2">链上交易号 txid</label>
                <n-input
                  v-model:value="txid"
                  placeholder="粘贴转账成功后的交易哈希 / txid"
                  class="mt-2"
                  @keydown.enter="verifyUsad"
                />
                <button
                  class="spectrum-bg mt-4 w-full rounded-xl py-3.5 font-medium text-white shadow-lg shadow-brand/25 transition hover:brightness-110 disabled:opacity-60"
                  :disabled="verifying"
                  @click="verifyUsad"
                >
                  {{ verifying ? '正在核对到账…' : '核对到账' }}
                </button>
              </div>
            </template>
          </template>
        </template>

        <!-- 收款二维码区域 -->
        <template v-else>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 text-[13px] text-t2">
              <span
                class="h-2 w-2 rounded-full"
                :class="pendingOrder.payType === 'wxpay' ? 'bg-[#07c160]' : 'bg-[#1677ff]'"
              />
              请使用{{ pendingOrder.payType === 'wxpay' ? '微信' : '支付宝' }}扫码支付
            </div>
            <div class="spectrum-text mt-3 text-4xl font-extrabold">
              ¥{{ pendingOrder.amount.toFixed(2) }}
            </div>

            <div class="mx-auto mt-5 w-56 overflow-hidden rounded-2xl bg-white p-3">
              <img
                :src="pendingOrder.payType === 'wxpay' ? '/wechat-qr.jpg' : '/alipay-qr.webp'"
                :alt="pendingOrder.payType === 'wxpay' ? '微信收款码' : '支付宝收款码'"
                class="h-56 w-full object-contain"
              />
            </div>

            <p class="mt-4 text-xs leading-relaxed text-t3">
              扫码完成付款后，请点击下方按钮通知管理员确认到账
            </p>

            <button
              class="spectrum-bg mt-4 w-full rounded-xl py-3.5 font-medium text-white shadow-lg shadow-brand/25 transition hover:brightness-110 disabled:opacity-60"
              :disabled="notifying"
              @click="notifyAdmin"
            >
              {{ notifying ? '正在通知…' : '✓ 我已支付，通知管理员' }}
            </button>

            <div class="mt-3 flex items-center justify-center gap-2 text-[13px] text-t2">
              <n-spin :size="14" />
              <span>等待管理员确认到账…</span>
            </div>

            <!-- 联系管理员微信确认 -->
            <button
              class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#07c160]/30 bg-[#07c160]/8 py-3 text-[13px] text-[#3dd57f] transition hover:bg-[#07c160]/12"
              @click="showAdminWx = !showAdminWx"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#3dd57f">
                <path d="M8.7 4C4.9 4 1.8 6.6 1.8 9.8c0 1.8 1 3.4 2.5 4.5l-.6 1.9 2.2-1.1c.8.2 1.5.3 2.4.3h.6a5.4 5.4 0 0 1-.2-1.5c0-3.1 3-5.6 6.6-5.6h.5C15.2 5.7 12.2 4 8.7 4" />
              </svg>
              {{ showAdminWx ? '收起' : '扫码加管理员微信确认' }}
            </button>
            <div v-if="showAdminWx" class="mt-3 rounded-xl border border-line bg-white/[0.03] p-4">
              <img src="/wx.png" alt="管理员微信二维码" class="mx-auto h-44 w-44 rounded-lg object-contain bg-white p-1" />
              <p class="mt-2 text-center text-xs text-t3">扫码添加管理员微信，发送订单号加速确认</p>
              <p class="mt-1 text-center text-[11px] text-t3">订单号：{{ pendingOrder.outTradeNo }}</p>
            </div>

            <div class="mt-3">
              <n-button size="tiny" quaternary @click="cancelPending">取消</n-button>
            </div>

            <div class="mt-4 break-all border-t border-line pt-3 text-[11px] text-t3">
              订单号 {{ pendingOrder.outTradeNo }}
            </div>
          </div>
        </template>
      </div>

      <!-- 余额卡 -->
      <div class="glass p-6" style="box-shadow: 0 20px 70px -30px rgba(139, 109, 255, 0.4)">
        <div class="flex items-center gap-2 text-[13px] text-t2">
          <span class="h-2 w-2 rounded-full bg-brand" /> 当前余额
        </div>
        <div class="spectrum-text mt-4 text-4xl font-extrabold">
          ¥{{ (auth.user?.balance ?? 0).toFixed(4) }}
        </div>
        <p class="mt-4 text-xs leading-relaxed text-t3">
          余额实时扣费，按 token 精确到 6 位小数。<br />
          充值采用扫码支付，付款后联系管理员确认即时到账。
        </p>
      </div>
    </div>

    <!-- 充值记录 -->
    <div class="glass p-6">
      <h3 class="font-semibold text-t1">充值记录</h3>
      <div v-if="!loaded" class="flex justify-center py-10"><n-spin /></div>
      <div v-else-if="!orders.length" class="py-10 text-center text-sm text-t3">暂无充值记录</div>
      <div v-else class="mt-2">
        <div
          v-for="o in orders"
          :key="o.out_trade_no"
          class="flex items-center gap-4 border-b border-line py-3.5 last:border-0"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold"
            :class="{
              'bg-[#07c160]/15 text-[#3dd57f]': o.pay_type === 'wxpay',
              'bg-[#f0b90b]/15': o.pay_type === 'usad',
              'bg-[#1677ff]/15 text-[#4d94ff]': o.pay_type !== 'wxpay' && o.pay_type !== 'usad',
            }"
          >
            <img v-if="o.pay_type === 'usad'" src="/USAD.png" alt="USAD" class="h-5 w-5 object-contain" />
            <template v-else>{{ o.pay_type === 'wxpay' ? '微' : '支' }}</template>
          </span>
          <div class="flex-1">
            <div class="text-sm font-semibold text-t1">¥{{ o.amount.toFixed(2) }}</div>
            <div class="text-xs text-t3">{{ o.out_trade_no }} · {{ fmtTime(o.created_at) }}</div>
          </div>
          <n-tag
            :type="o.status === 'paid' ? 'success' : 'warning'"
            size="small"
            round
            :bordered="false"
          >
            {{ o.status === 'paid' ? '已到账' : o.status === 'confirming' ? '待确认' : '待支付' }}
          </n-tag>
        </div>
      </div>
    </div>
  </div>
</template>
