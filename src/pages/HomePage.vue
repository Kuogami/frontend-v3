<script setup lang="ts">
import { MapPin, Route, Bot, ArrowRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    icon: MapPin,
    title: '景点浏览',
    description: '探索全国各地的精彩景点，轻松搜索与收藏',
    path: '/attractions',
    color: 'sky',
  },
  {
    icon: Route,
    title: '路线规划',
    description: '智能规划旅行路线，让每一次出行都完美',
    path: '/route',
    color: 'emerald',
  },
  {
    icon: Bot,
    title: 'AI 助手',
    description: '智能旅行助手，为您提供个性化推荐',
    path: '/ai-assistant',
    color: 'violet',
  },
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto px-4 py-8">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-200">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-3xl font-semibold text-carbon mb-4">欢迎来到旅游系统</h1>
      <p class="text-lg text-carbon-light max-w-md mx-auto leading-relaxed">
        探索世界各地的精彩景点，规划您的完美旅程
      </p>
    </div>

    <!-- Feature Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button
        v-for="feature in features"
        :key="feature.title"
        @click="navigateTo(feature.path)"
        class="group p-6 bg-white rounded-2xl shadow-[0_2px_12px_rgba(147,177,207,0.12)] hover:shadow-[0_8px_30px_rgba(147,177,207,0.2)] transition-all duration-300 text-left"
      >
        <div
          :class="[
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105',
            feature.color === 'sky' ? 'bg-sky-50' : '',
            feature.color === 'emerald' ? 'bg-emerald-50' : '',
            feature.color === 'violet' ? 'bg-violet-50' : '',
          ]"
        >
          <component
            :is="feature.icon"
            :class="[
              'w-7 h-7',
              feature.color === 'sky' ? 'text-sky-primary' : '',
              feature.color === 'emerald' ? 'text-emerald-500' : '',
              feature.color === 'violet' ? 'text-violet-500' : '',
            ]"
          />
        </div>
        <h3 class="text-lg font-medium text-carbon mb-2">{{ feature.title }}</h3>
        <p class="text-sm text-carbon-light leading-relaxed mb-4">{{ feature.description }}</p>
        <div class="flex items-center text-sky-primary text-sm font-medium">
          <span>开始探索</span>
          <ArrowRight class="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </button>
    </div>
  </div>
</template>
