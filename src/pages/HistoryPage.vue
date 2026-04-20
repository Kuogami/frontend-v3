<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, MapPin, Clock, ChevronRight } from 'lucide-vue-next'

const router = useRouter()

// 旅行记录（模拟数据）
const travelHistory = ref([
  {
    id: 1,
    title: '南京三日游',
    date: '2024-03-15',
    duration: '3天2晚',
    spots: ['中山陵', '夫子庙', '玄武湖', '明孝陵'],
    cover: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: '苏州园林之旅',
    date: '2024-02-20',
    duration: '2天1晚',
    spots: ['拙政园', '留园', '虎丘'],
    cover: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    title: '杭州西湖漫步',
    date: '2024-01-10',
    duration: '2天1晚',
    spots: ['西湖', '灵隐寺', '雷峰塔'],
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
  },
])

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50/80 to-white/90">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 px-4 py-4 md:px-6 backdrop-blur-xl bg-white/70 border-b border-sky-100/50">
      <div class="max-w-3xl mx-auto flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 rounded-xl hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-carbon)]">旅行记录</h1>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <!-- 旅行记录列表 -->
      <div class="space-y-4 md:space-y-6">
        <div
          v-for="trip in travelHistory"
          :key="trip.id"
          class="group bg-white/60 backdrop-blur-sm rounded-2xl border border-sky-100/30 overflow-hidden hover:shadow-xl hover:shadow-sky-100/50 transition-all cursor-pointer"
        >
          <!-- 封面图 -->
          <div class="relative h-32 md:h-40 overflow-hidden">
            <img
              :src="trip.cover"
              :alt="trip.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div class="absolute bottom-3 left-4 right-4">
              <h3 class="font-semibold text-white text-lg md:text-xl">{{ trip.title }}</h3>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="p-4 md:p-5">
            <div class="flex flex-wrap gap-4 text-sm text-[var(--color-carbon-light)]">
              <div class="flex items-center gap-1.5">
                <Calendar class="w-4 h-4" />
                <span>{{ trip.date }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Clock class="w-4 h-4" />
                <span>{{ trip.duration }}</span>
              </div>
            </div>

            <!-- 景点标签 -->
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="spot in trip.spots"
                :key="spot"
                class="px-3 py-1 bg-sky-50 text-[#00A3FF] text-xs font-medium rounded-full"
              >
                <MapPin class="w-3 h-3 inline mr-1" />
                {{ spot }}
              </span>
            </div>

            <!-- 查看详情 -->
            <div class="flex items-center justify-end mt-4 text-sm text-[#00A3FF] font-medium">
              <span>查看详情</span>
              <ChevronRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="travelHistory.length === 0" class="py-20 text-center">
        <div class="w-24 h-24 mx-auto rounded-3xl bg-sky-50 flex items-center justify-center mb-6">
          <MapPin class="w-12 h-12 text-[#00A3FF]/30" />
        </div>
        <p class="text-[var(--color-carbon)] font-medium text-lg">暂无旅行记录</p>
        <p class="text-[var(--color-carbon-light)] mt-2">开始您的第一次旅行吧</p>
      </div>
    </main>
  </div>
</template>
