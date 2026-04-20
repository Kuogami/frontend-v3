<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Heart, MapPin, Star, Trash2 } from 'lucide-vue-next'

const router = useRouter()

// 收藏列表（模拟数据）
const favorites = ref([
  {
    id: 1,
    name: '中山陵',
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=300&fit=crop',
    location: '南京市玄武区',
    rating: 4.9,
    category: '历史古迹',
  },
  {
    id: 2,
    name: '夫子庙',
    image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=300&fit=crop',
    location: '南京市秦淮区',
    rating: 4.7,
    category: '文化景区',
  },
  {
    id: 3,
    name: '玄武湖',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    location: '南京市玄武区',
    rating: 4.8,
    category: '自然风光',
  },
  {
    id: 4,
    name: '明孝陵',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop',
    location: '南京市玄武区',
    rating: 4.8,
    category: '世界遗产',
  },
])

const goBack = () => {
  router.back()
}

const removeFavorite = (id: number) => {
  favorites.value = favorites.value.filter(f => f.id !== id)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50/80 to-white/90">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 px-4 py-4 md:px-6 backdrop-blur-xl bg-white/70 border-b border-sky-100/50">
      <div class="max-w-4xl mx-auto flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 rounded-xl hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-carbon)]">我的收藏</h1>
        <span class="ml-auto text-sm text-[var(--color-carbon-light)]">{{ favorites.length }} 个景点</span>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <!-- 收藏列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="group bg-white/60 backdrop-blur-sm rounded-2xl border border-sky-100/30 overflow-hidden hover:shadow-xl hover:shadow-sky-100/50 transition-all"
        >
          <!-- 图片 -->
          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute top-3 right-3">
              <button
                @click="removeFavorite(item.id)"
                class="p-2 bg-white/90 backdrop-blur rounded-xl text-red-500 hover:bg-red-50 transition-colors shadow-lg"
              >
                <Heart class="w-5 h-5 fill-current" />
              </button>
            </div>
            <div class="absolute bottom-3 left-3">
              <span class="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-[#00A3FF]">
                {{ item.category }}
              </span>
            </div>
          </div>

          <!-- 信息 -->
          <div class="p-4">
            <h3 class="font-semibold text-[var(--color-carbon)] text-lg">{{ item.name }}</h3>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center gap-1 text-sm text-[var(--color-carbon-light)]">
                <MapPin class="w-4 h-4" />
                <span>{{ item.location }}</span>
              </div>
              <div class="flex items-center gap-1 text-sm">
                <Star class="w-4 h-4 text-amber-400 fill-current" />
                <span class="font-medium text-[var(--color-carbon)]">{{ item.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="favorites.length === 0" class="py-20 text-center">
        <div class="w-24 h-24 mx-auto rounded-3xl bg-sky-50 flex items-center justify-center mb-6">
          <Heart class="w-12 h-12 text-[#00A3FF]/30" />
        </div>
        <p class="text-[var(--color-carbon)] font-medium text-lg">暂无收藏</p>
        <p class="text-[var(--color-carbon-light)] mt-2">浏览景点时点击心形图标即可收藏</p>
      </div>
    </main>
  </div>
</template>
