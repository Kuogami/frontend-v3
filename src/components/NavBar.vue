<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, MapPin, Route, Bot, Menu, X, ChevronDown, User, Heart, MapPinned, LogOut } from 'lucide-vue-next'
import { useUser } from '../composables/useUser'

const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)
const isDropdownOpen = ref(false)

const { isLoggedIn, userInfo, userInitial, logout } = useUser()

const navItems = [
  { name: '首页', icon: Home, path: '/' },
  { name: '景点浏览', icon: MapPin, path: '/attractions' },
  { name: '路线规划', icon: Route, path: '/route' },
  { name: 'AI 助手', icon: Bot, path: '/ai-assistant' },
]

const dropdownItems = [
  { name: '个人中心', icon: User, path: '/profile' },
  { name: '我的收藏', icon: Heart, path: '/favorites' },
  { name: '旅行记录', icon: MapPinned, path: '/history' },
]

const avatarSrc = computed(() => userInfo.value?.avatar || '')

// 判断当前路由是否激活
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleLogin = () => {
  router.push('/login')
}

const handleLogout = () => {
  logout()
  isDropdownOpen.value = false
  router.push('/')
}

const navigateTo = (path: string) => {
  router.push(path)
  isDropdownOpen.value = false
  isMenuOpen.value = false
}

// 监听路由变化关闭下拉菜单
router.afterEach(() => {
  isDropdownOpen.value = false
  isMenuOpen.value = false
})
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <!-- 毛玻璃效果导航栏 -->
    <nav class="bg-white/70 backdrop-blur-xl border-b border-[var(--color-border-light)] shadow-sm shadow-sky-100/50">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <RouterLink to="/" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-md shadow-sky-200">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-lg font-semibold text-[var(--color-carbon)] tracking-tight">
              旅游系统
            </span>
          </RouterLink>

          <!-- 桌面端导航项 -->
          <div class="hidden md:flex items-center gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.path"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path) 
                  ? 'bg-sky-50 text-[var(--color-sky-primary)]' 
                  : 'text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] hover:bg-sky-50/50'
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" :stroke-width="1.75" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </div>

          <!-- 右侧用户区域 -->
          <div class="flex items-center gap-4">
            <!-- 用户头像 / 登录按钮 -->
            <div class="relative">
              <button
                v-if="isLoggedIn"
                @click="toggleDropdown"
                class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sky-50 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-md shadow-sky-200 overflow-hidden">
                  <img
                    v-if="avatarSrc"
                    :src="avatarSrc"
                    alt="用户头像"
                    class="w-full h-full object-cover"
                  />
                  <span
                    v-else
                    class="text-white text-sm font-medium"
                  >
                    {{ userInitial }}
                  </span>
                </div>
                <ChevronDown 
                  class="w-4 h-4 text-[var(--color-carbon-light)] transition-transform duration-200" 
                  :class="{ 'rotate-180': isDropdownOpen }"
                />
              </button>
              <button
                v-else
                @click="handleLogin"
                class="px-5 py-2 rounded-xl bg-[var(--color-sky-primary)] text-white text-sm font-medium hover:bg-sky-500 transition-colors shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-200"
              >
                登录
              </button>

              <!-- 下拉菜单 -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-1"
              >
                <div
                  v-if="isDropdownOpen && isLoggedIn"
                  class="absolute right-0 mt-2 w-48 py-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-sky-100/50 border border-[var(--color-border-light)]"
                >
                  <div class="px-4 py-3 border-b border-[var(--color-border-light)]">
                    <p class="text-sm font-medium text-[var(--color-carbon)]">{{ userInfo?.name || '旅行者' }}</p>
                    <p class="text-xs text-[var(--color-carbon-light)]">{{ userInfo?.email || 'traveler@example.com' }}</p>
                  </div>
                  <button
                    v-for="item in dropdownItems"
                    :key="item.name"
                    @click="navigateTo(item.path)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] hover:bg-sky-50 transition-colors text-left"
                  >
                    <component :is="item.icon" class="w-4 h-4" />
                    <span>{{ item.name }}</span>
                  </button>
                  <div class="border-t border-[var(--color-border-light)] mt-2 pt-2">
                    <button
                      @click="handleLogout"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut class="w-4 h-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 移动端菜单按钮 -->
            <button
              @click="toggleMenu"
              class="md:hidden p-2 rounded-xl hover:bg-sky-50 transition-colors"
            >
              <Menu v-if="!isMenuOpen" class="w-5 h-5 text-[var(--color-carbon)]" />
              <X v-else class="w-5 h-5 text-[var(--color-carbon)]" />
            </button>
          </div>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="isMenuOpen"
          class="md:hidden border-t border-[var(--color-border-light)] bg-white/80 backdrop-blur-xl"
        >
          <div class="px-6 py-4 space-y-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.path"
              @click="isMenuOpen = false"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path) 
                  ? 'bg-sky-50 text-[var(--color-sky-primary)]' 
                  : 'text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] hover:bg-sky-50/50'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" :stroke-width="1.75" />
              <span>{{ item.name }}</span>
            </RouterLink>

            <!-- 移动端已登录时显示的菜单项 -->
            <template v-if="isLoggedIn">
              <div class="border-t border-[var(--color-border-light)] my-3"></div>
              <button
                v-for="item in dropdownItems"
                :key="item.name"
                @click="navigateTo(item.path)"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] hover:bg-sky-50/50 transition-all duration-200 text-left"
              >
                <component :is="item.icon" class="w-5 h-5" :stroke-width="1.75" />
                <span>{{ item.name }}</span>
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </nav>
  </header>

  <!-- 点击遮罩关闭下拉菜单 -->
  <div
    v-if="isDropdownOpen"
    @click="closeDropdown"
    class="fixed inset-0 z-40"
  ></div>
</template>
