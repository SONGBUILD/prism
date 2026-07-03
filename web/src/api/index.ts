/** 统一 API 客户端：相对路径，dev 走 Vite 代理，生产与 Express 同源 */

export interface UserInfo {
  id: number
  email: string
  balance: number
  created_at: number
}

export interface ModelInfo {
  id: string
  name: string
  vendor: string
  vendorColor: string
  description: string
  context: number
  promptPrice: number
  completionPrice: number
  tags: string[]
  featured?: boolean
}

export interface ApiKeyInfo {
  id: number
  key: string
  name: string
  status: number
  created_at: number
  last_used_at: number | null
}

export interface OrderInfo {
  out_trade_no: string
  amount: number
  pay_type: string
  status: string
  created_at: number
  paid_at: number | null
  trade_no?: string | null
}

export interface UsadConfig {
  symbol: string
  mainnet: string
  addressStr: string
  memo: string
  depositConfirm: number
  addressQRCode: string
  rate: number
}

export interface UsageLog {
  id: number
  model: string
  prompt_tokens: number
  completion_tokens: number
  cost: number
  latency_ms: number
  created_at: number
  key_name: string | null
}

export interface Overview {
  balance: number
  totals: { requests: number; tokens: number; cost: number }
  today: { requests: number; cost: number }
  days: { date: string; cost: number; tokens: number; requests: number }[]
  byModel: { model: string; requests: number; cost: number }[]
}

export function getToken(): string {
  return localStorage.getItem('prism_token') || ''
}

export function setToken(token: string) {
  localStorage.setItem('prism_token', token)
}

export function clearToken() {
  localStorage.removeItem('prism_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  // 仅在未显式指定 Authorization 时附加用户 token，避免覆盖管理员 token
  if (!headers.Authorization) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data.error === 'string' ? data.error : data.error?.message || `请求失败（${res.status}）`
    throw new Error(message)
  }
  return data as T
}

export const api = {
  register: (email: string, password: string) =>
    request<{ token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: UserInfo }>('/api/auth/me'),

  models: () => request<{ models: ModelInfo[] }>('/api/models'),

  keys: () => request<{ keys: ApiKeyInfo[] }>('/api/keys'),
  createKey: (name: string) =>
    request<{ key: string }>('/api/keys', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteKey: (id: number) => request<{ ok: boolean }>(`/api/keys/${id}`, { method: 'DELETE' }),

  createOrder: (amount: number, type: string) =>
    request<{ outTradeNo: string; amount: number; payType: string }>('/api/pay/create', {
      method: 'POST',
      body: JSON.stringify({ amount, type }),
    }),
  notifyAdmin: (outTradeNo: string) =>
    request<{ ok: boolean }>('/api/pay/notify-admin', {
      method: 'POST',
      body: JSON.stringify({ out_trade_no: outTradeNo }),
    }),
  orderStatus: (no: string) => request<{ order: OrderInfo }>(`/api/pay/order?no=${no}`),
  orders: () => request<{ orders: OrderInfo[] }>('/api/pay/orders'),

  usadConfig: () => request<UsadConfig>('/api/pay/usad/config'),
  usadVerify: (txid: string) =>
    request<{ outTradeNo: string; amount: number; usadAmount?: number; status: string; already?: boolean }>(
      '/api/pay/usad/verify',
      { method: 'POST', body: JSON.stringify({ txid }) }
    ),

  // 管理员
  adminLogin: (password: string) =>
    request<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  adminOrders: () =>
    request<{ orders: (OrderInfo & { email: string; user_id: number })[] }>('/api/admin/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('prism_admin_token') || ''}` },
    }),
  adminConfirm: (outTradeNo: string) =>
    request<{ ok: boolean }>('/api/admin/confirm', {
      method: 'POST',
      body: JSON.stringify({ out_trade_no: outTradeNo }),
      headers: { Authorization: `Bearer ${localStorage.getItem('prism_admin_token') || ''}` },
    }),

  overview: () => request<Overview>('/api/overview'),
  usage: (page: number) =>
    request<{ logs: UsageLog[]; total: number; page: number; size: number }>(`/api/usage?page=${page}`),
}
