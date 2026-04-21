const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:8080'
export const AMAP_KEY = (import.meta.env.VITE_AMAP_KEY as string | undefined)?.trim() || 'e69bd262c7d5bf013bafe14ad65d235d'

type Primitive = string | number | boolean | null | undefined
type QueryValue = Primitive | Primitive[]

interface ResponseDO<T> {
  success: boolean
  msg: string
  data: T
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT'
  params?: Record<string, QueryValue>
  body?: unknown
  headers?: Record<string, string>
}

const buildUrl = (path: string, params?: Record<string, QueryValue>) => {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`)
  if (!params) return url.toString()

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && item !== '') {
          url.searchParams.append(key, String(item))
        }
      })
      return
    }
    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

const showError = (msg: string) => {
  if (typeof window !== 'undefined') {
    window.alert(msg)
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(path, options.params), {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  let payload: ResponseDO<T> | null = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    const msg = payload?.msg || '未登录或登录已过期'
    showError(msg)
    throw new Error(msg)
  }

  if (!response.ok) {
    const msg = payload?.msg || `请求失败(${response.status})`
    showError(msg)
    throw new Error(msg)
  }

  if (!payload) {
    const msg = '服务器返回格式错误'
    showError(msg)
    throw new Error(msg)
  }

  if (!payload.success) {
    const msg = payload.msg || '请求失败'
    showError(msg)
    throw new Error(msg)
  }

  return payload.data
}

export function apiGet<T>(path: string, params?: Record<string, QueryValue>) {
  return request<T>(path, { method: 'GET', params })
}

export function apiPost<T>(path: string, body?: unknown) {
  return request<T>(path, { method: 'POST', body })
}

export function apiDelete<T>(path: string, params?: Record<string, QueryValue>) {
  return request<T>(path, { method: 'DELETE', params })
}
