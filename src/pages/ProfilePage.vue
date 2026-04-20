<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Camera, Mail, Phone, MapPin, Calendar, Edit3, Settings, Shield, Bell } from 'lucide-vue-next'

const router = useRouter()

// 用户信息（模拟数据）
const userInfo = ref({
  avatar: '',
  name: '旅行者',
  email: 'traveler@example.com',
  phone: '138****8888',
  location: '江苏省南京市',
  joinDate: '2024-01-15',
  bio: '热爱旅行，喜欢探索未知的风景和文化。',
})

const stats = ref([
  { label: '旅行天数', value: 28 },
  { label: '到访景点', value: 42 },
  { label: '收藏数', value: 15 },
  { label: '足迹城市', value: 8 },
])

const menuItems = [
  { icon: Edit3, label: '编辑资料', description: '修改个人信息' },
  { icon: Bell, label: '消息通知', description: '管理推送设置' },
  { icon: Shield, label: '隐私设置', description: '账号安全管理' },
  { icon: Settings, label: '系统设置', description: '偏好与语言' },
]

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50/80 to-white/90">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 px-4 py-4 md:px-6 backdrop-blur-xl bg-white/70 border-b border-sky-100/50">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 rounded-xl hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-carbon)]">个人中心</h1>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <!-- 用户信息卡片 -->
      <div class="bg-white/60 backdrop-blur-sm rounded-3xl border border-sky-100/30 p-6 md:p-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- 头像 -->
          <div class="relative">
            <div class="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl shadow-sky-200/50">
              {{ userInfo.name.charAt(0) }}
            </div>
            <button class="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors border border-sky-100/50">
              <Camera class="w-4 h-4" />
            </button>
          </div>

          <!-- 基本信息 -->
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-xl md:text-2xl font-bold text-[var(--color-carbon)]">{{ userInfo.name }}</h2>
            <p class="text-[var(--color-carbon-light)] mt-1 text-sm md:text-base">{{ userInfo.bio }}</p>
            
            <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-[var(--color-carbon-light)]">
              <div class="flex items-center gap-1.5">
                <Mail class="w-4 h-4" />
                <span>{{ userInfo.email }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <MapPin class="w-4 h-4" />
                <span>{{ userInfo.location }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Calendar class="w-4 h-4" />
                <span>{{ userInfo.joinDate }} 加入</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-sky-100/50">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <p class="text-xl md:text-2xl font-bold text-[#00A3FF]">{{ stat.value }}</p>
            <p class="text-xs md:text-sm text-[var(--color-carbon-light)] mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="bg-white/60 backdrop-blur-sm rounded-3xl border border-sky-100/30 overflow-hidden">
        <div
          v-for="(item, index) in menuItems"
          :key="item.label"
          :class="[
            'flex items-center gap-4 px-6 py-4 hover:bg-sky-50/50 transition-colors cursor-pointer',
            index !== menuItems.length - 1 ? 'border-b border-sky-100/30' : ''
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
            <component :is="item.icon" class="w-5 h-5 text-[#00A3FF]" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-[var(--color-carbon)]">{{ item.label }}</p>
            <p class="text-sm text-[var(--color-carbon-light)]">{{ item.description }}</p>
          </div>
          <ArrowLeft class="w-5 h-5 text-[var(--color-carbon-light)] rotate-180" />
        </div>
      </div>
    </main>
  </div>
</template>
