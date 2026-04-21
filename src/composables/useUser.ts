import { computed, ref } from 'vue'
import { apiGet, apiPost } from '../services/api'

interface LoginPayload {
  token: string
  userId: number
  username: string
  avatar?: string | null
}

interface CurrentUserPayload {
  id: number
  name: string
  avatar?: string | null
  tag?: string | null
  status?: number | null
  gender?: number | null
}

interface UserInfo {
  id?: number
  name: string
  email: string
  avatar: string
  tag?: string
  status?: number | null
  gender?: number | null
}

const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiMwMEEzRkYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiPuaXhTwvdGV4dD48L3N2Zz4='

const applyUserState = (nextUser: UserInfo | null, token?: string | null) => {
  if (token) {
    localStorage.setItem('token', token)
  }

  if (nextUser) {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userInfo', JSON.stringify(nextUser))
    isLoggedIn.value = true
    userInfo.value = nextUser
    return
  }

  localStorage.removeItem('token')
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  isLoggedIn.value = false
  userInfo.value = null
}

const mapLoginUser = (payload: LoginPayload): UserInfo => ({
  id: payload.userId,
  name: payload.username || '旅行者',
  email: payload.username || 'traveler@example.com',
  avatar: payload.avatar || defaultAvatar,
})

const mapCurrentUser = (payload: CurrentUserPayload, fallbackEmail?: string): UserInfo => ({
  id: payload.id,
  name: payload.name || '旅行者',
  email: fallbackEmail || payload.name || 'traveler@example.com',
  avatar: payload.avatar || defaultAvatar,
  tag: payload.tag || '',
  status: payload.status ?? null,
  gender: payload.gender ?? null,
})

const initUserState = () => {
  try {
    const storedToken = localStorage.getItem('token')
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn')
    const storedUserInfo = localStorage.getItem('userInfo')

    if (storedToken && storedIsLoggedIn === 'true' && storedUserInfo) {
      isLoggedIn.value = true
      userInfo.value = JSON.parse(storedUserInfo) as UserInfo
      return
    }
  } catch {
    // ignore parse failure and reset below
  }

  applyUserState(null)
}

initUserState()

export function useUser() {
  const refreshCurrentUser = async () => {
    const current = await apiGet<CurrentUserPayload>('/api/me')
    const nextUser = mapCurrentUser(current, userInfo.value?.email)
    applyUserState(nextUser, localStorage.getItem('token'))
    return nextUser
  }

  const login = async (username: string, password: string) => {
    const payload = await apiPost<LoginPayload>('/api/login', { username, password })

    let nextUser = mapLoginUser(payload)
    applyUserState(nextUser, payload.token)

    try {
      nextUser = await refreshCurrentUser()
    } catch {
      applyUserState(nextUser, payload.token)
    }

    return nextUser
  }

  const register = async (username: string, password: string) => {
    const payload = await apiPost<LoginPayload>('/api/register', { username, password })

    let nextUser = mapLoginUser(payload)
    applyUserState(nextUser, payload.token)

    try {
      nextUser = await refreshCurrentUser()
    } catch {
      applyUserState(nextUser, payload.token)
    }

    return nextUser
  }

  const logout = () => {
    applyUserState(null)
  }

  const userInitial = computed(() => {
    if (userInfo.value?.name) {
      return userInfo.value.name.charAt(0)
    }
    return '旅'
  })

  return {
    isLoggedIn,
    userInfo,
    userInitial,
    login,
    register,
    refreshCurrentUser,
    logout,
  }
}
