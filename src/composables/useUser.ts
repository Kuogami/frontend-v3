import { ref, computed } from 'vue'

// 用户信息接口
interface UserInfo {
  name: string
  email: string
  avatar: string
}

// 全局用户状态（单例模式）
const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)

// 默认头像 - 使用 Data URL 生成纯色头像
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiMwMEEzRkYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiPuaXhTwvdGV4dD48L3N2Zz4='

// 初始化：从 localStorage 恢复登录状态
const initUserState = () => {
  try {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn')
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedIsLoggedIn === 'true' && storedUserInfo) {
      isLoggedIn.value = true
      userInfo.value = JSON.parse(storedUserInfo)
    }
  } catch (error) {
    // 解析失败时清除存储
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
  }
}

// 立即初始化
initUserState()

export function useUser() {
  // 登录
  const login = (email?: string, name?: string) => {
    const user: UserInfo = {
      name: name || '旅行者',
      email: email || 'traveler@example.com',
      avatar: defaultAvatar
    }
    
    // 存储到 localStorage
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userInfo', JSON.stringify(user))
    
    // 更新响应式状态
    isLoggedIn.value = true
    userInfo.value = user
  }
  
  // 登出
  const logout = () => {
    // 清除 localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
    
    // 更新响应式状态
    isLoggedIn.value = false
    userInfo.value = null
  }
  
  // 计算属性：用户首字
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
    logout
  }
}
