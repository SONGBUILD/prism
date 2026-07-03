<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const isRegister = computed(() => route.name === 'register')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  if (!email.value || !password.value) {
    message.warning('请填写邮箱和密码')
    return
  }
  loading.value = true
  try {
    const res = isRegister.value
      ? await api.register(email.value.trim(), password.value)
      : await api.login(email.value.trim(), password.value)
    await auth.loginWith(res.token)
    if (isRegister.value) message.success('注册成功，已赠送 ¥1 体验金')
    router.push((route.query.redirect as string) || '/console')
  } catch (e) {
    message.error((e as Error).message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- 左侧品牌展示 -->
    <div class="brand-side">
      <div class="brand-bg" />
      <div class="brand-prism">
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="auth-prism" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#8b6dff" />
              <stop offset=".5" stop-color="#22d3ee" />
              <stop offset="1" stop-color="#34d399" />
            </linearGradient>
          </defs>
          <path d="M16 3 29 27H3Z" stroke="url(#auth-prism)" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M16 3 16 27" stroke="url(#auth-prism)" stroke-width="1" opacity=".5" />
          <path d="m8 20 8 7 8-7" stroke="url(#auth-prism)" stroke-width="1" opacity=".4" />
          <path d="m1 12 11 5" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8" />
          <path d="m20 17 11-4M20 18l11 1M20 19l10 6" stroke="url(#auth-prism)" stroke-width="1" stroke-linecap="round" />
        </svg>
      </div>
      <div class="brand-content">
        <h1 class="brand-title">
          <span class="spectrum-text">Prism 棱镜</span>
        </h1>
        <p class="brand-slogan">一束光，折射整个 AI 宇宙</p>
        <div class="brand-features">
          <div class="feat"><span class="feat-dot" style="background:#8b6dff" />16+ 顶级大模型统一接口</div>
          <div class="feat"><span class="feat-dot" style="background:#22d3ee" />OpenAI 兼容 · 流式转发</div>
          <div class="feat"><span class="feat-dot" style="background:#34d399" />token 级计费 · 透明到分</div>
        </div>
      </div>
      <div class="brand-footer">OpenAI 兼容协议的大模型 API 中转站</div>
    </div>

    <!-- 右侧表单 -->
    <div class="form-side">
      <div class="form-wrap">
        <router-link to="/" class="back-home">← 返回首页</router-link>

        <h2 class="form-title">{{ isRegister ? '创建账号' : '欢迎回来' }}</h2>
        <p class="form-subtitle">
          {{ isRegister ? '注册即送 ¥1 体验金，立刻调用旗舰模型' : '登录你的棱镜控制台' }}
        </p>

        <div class="form-fields">
          <div class="field">
            <label class="field-label">邮箱</label>
            <n-input
              v-model:value="email"
              size="large"
              placeholder="you@example.com"
              class="field-input"
              @keyup.enter="submit"
            />
          </div>
          <div class="field">
            <label class="field-label">密码</label>
            <n-input
              v-model:value="password"
              type="password"
              show-password-on="click"
              size="large"
              :placeholder="isRegister ? '至少 6 位' : '请输入密码'"
              class="field-input"
              @keyup.enter="submit"
            />
          </div>
          <button class="submit-btn" :disabled="loading" @click="submit">
            <span v-if="loading" class="spinner" />
            {{ isRegister ? '注册并领取体验金' : '登 录' }}
          </button>
        </div>

        <p class="switch-mode">
          {{ isRegister ? '已有账号？' : '还没有账号？' }}
          <router-link :to="isRegister ? '/login' : '/register'" class="switch-link">
            {{ isRegister ? '去登录' : '免费注册' }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  background: #0a0a12;
}

/* ===== 左侧品牌区 ===== */
.brand-side {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 46%;
  overflow: hidden;
  background: #0c0c16;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}
.brand-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 400px at 30% 20%, rgba(139, 109, 255, 0.22) 0%, transparent 60%),
    radial-gradient(500px 400px at 70% 80%, rgba(34, 211, 238, 0.15) 0%, transparent 60%),
    radial-gradient(400px 300px at 50% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 60%);
}
.brand-prism {
  position: relative;
  z-index: 1;
  animation: float 6s ease-in-out infinite;
  filter: drop-shadow(0 0 40px rgba(139, 109, 255, 0.4));
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.brand-content {
  position: relative;
  z-index: 1;
  margin-top: 48px;
  text-align: center;
}
.brand-title {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -1px;
}
.brand-slogan {
  margin-top: 12px;
  font-size: 15px;
  color: #8b8b9e;
  letter-spacing: 2px;
}
.brand-features {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.feat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #b0b0c4;
}
.feat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}
.brand-footer {
  position: absolute;
  bottom: 32px;
  font-size: 11px;
  color: #5c5c70;
  letter-spacing: 1px;
}

/* ===== 右侧表单区 ===== */
.form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54%;
  padding: 40px;
}
.form-wrap {
  width: 100%;
  max-width: 380px;
}
.back-home {
  font-size: 13px;
  color: #8b8b9e;
  text-decoration: none;
  transition: color 0.2s;
}
.back-home:hover { color: #8b6dff; }

.form-title {
  margin-top: 32px;
  font-size: 28px;
  font-weight: 700;
  color: #f0f0f5;
  letter-spacing: -0.5px;
}
.form-subtitle {
  margin-top: 8px;
  font-size: 13px;
  color: #8b8b9e;
}

.form-fields {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #b0b0c4;
  letter-spacing: 0.5px;
}
.field-input :deep(.n-input__input-el) {
  font-size: 15px;
}

.submit-btn {
  margin-top: 6px;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #8b6dff 0%, #7357e6 100%);
  box-shadow: 0 8px 24px rgba(139, 109, 255, 0.3);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(139, 109, 255, 0.4);
  filter: brightness(1.08);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.65; cursor: wait; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-mode {
  margin-top: 28px;
  text-align: center;
  font-size: 13px;
  color: #8b8b9e;
}
.switch-link {
  font-weight: 500;
  color: #8b6dff;
  text-decoration: none;
  margin-left: 4px;
}
.switch-link:hover { text-decoration: underline; }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .brand-side {
    width: 100%;
    min-height: 240px;
    padding: 40px 24px;
  }
  .brand-features { display: none; }
  .brand-slogan { font-size: 13px; }
  .brand-title { font-size: 30px; }
  .form-side { width: 100%; padding: 32px 24px; }
}
</style>
