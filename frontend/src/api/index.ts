const BASE_URL = '/api'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const contentType = res.headers.get('content-type')
  if (!contentType?.includes('application/json')) throw new ApiError(`服务器错误: ${(await res.text()).slice(0, 100)}`, res.status)
  const body = await res.json()
  if (!res.ok) throw new ApiError(body.error || '请求失败', res.status)
  return body
}

// === Auth ===
export interface UserInfo { userId: string; username: string; createdAt?: string }

export const authApi = {
  login: (username: string, password: string) => request<{ token: string; userId: string; username: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string) => request<{ token: string; userId: string; username: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request<UserInfo>('/auth/me'),
}

// === Portfolio ===
export interface PortfolioItem { code: string; name: string; buyNav: number; shares: number }

export const portfolioApi = {
  getAll: () => request<PortfolioItem[]>('/portfolio'),
  save: (items: PortfolioItem[]) => request<{ success: boolean }>('/portfolio', { method: 'POST', body: JSON.stringify(items) }),
}

// === Market Data ===
export interface IndexData { code: string; name: string; price: number; change: number; changePercent: number; updateTime: string }
export interface FundData { code: string; name: string; currentNav: number; changePercent: number; lastTime: string }
export interface FundWithProfit extends FundData { buyNav?: number; shares?: number; profit?: number; profitPercent?: number }

export const marketApi = {
  getIndices: () => request<IndexData[]>('/indices'),
  getFundData: (code: string) => request<FundData>(`/fund/${code}`),
}

export { ApiError }
