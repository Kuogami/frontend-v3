<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Heart, MapPin, Star } from 'lucide-vue-next'
import { apiDelete, apiGet } from '../services/api'

type BackendAttraction = {
  id: number
  name: string
  category?: string | null
  averageRating?: number | null
  city?: string | null
  address?: string | null
}

type FavoriteItemResponse = {
  attraction: BackendAttraction
  addTime?: string
}

type FavoriteCard = {
  id: number
  name: string
  image: string
  location: string
  rating: number
  category: string
}

const router = useRouter()

const imagePool = [
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop',
]

const favorites = ref<FavoriteCard[]>([])

const goBack = () => {
  router.back()
}

const mapFavorite = (item: FavoriteItemResponse, index: number): FavoriteCard => ({
  id: item.attraction.id,
  name: item.attraction.name,
  image: imagePool[index % imagePool.length],
  location: item.attraction.address || item.attraction.city || '地点待定',
  rating: typeof item.attraction.averageRating === 'number'
    ? Number(item.attraction.averageRating.toFixed(1))
    : 0,
  category: item.attraction.category || '景点',
})

const loadFavorites = async () => {
  const data = await apiGet<FavoriteItemResponse[]>('/api/user/favorites')
  favorites.value = data.map(mapFavorite)
}

const removeFavorite = async (id: number) => {
  await apiDelete(`/api/favorites/${id}`)
  favorites.value = favorites.value.filter((item) => item.id !== id)
}

onMounted(loadFavorites)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50/80 to-white/90">
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
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="group overflow-hidden rounded-2xl border border-sky-100/30 bg-white/60 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-sky-100/50"
        >
          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              :src="item.image"
              :alt="item.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div class="absolute top-3 right-3">
              <button
                @click="removeFavorite(item.id)"
                class="rounded-xl bg-white/90 p-2 text-red-500 shadow-lg backdrop-blur transition-colors hover:bg-red-50"
              >
                <Heart class="w-5 h-5 fill-current" />
              </button>
            </div>
            <div class="absolute bottom-3 left-3">
              <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#00A3FF] backdrop-blur">
                {{ item.category }}
              </span>
            </div>
          </div>

          <div class="p-4">
            <h3 class="text-lg font-semibold text-[var(--color-carbon)]">{{ item.name }}</h3>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center gap-1 text-sm text-[var(--color-carbon-light)]">
                <MapPin class="w-4 h-4" />
                <span>{{ item.location }}</span>
              </div>
              <div class="flex items-center gap-1 text-sm">
                <Star class="w-4 h-4 fill-current text-amber-400" />
                <span class="font-medium text-[var(--color-carbon)]">{{ item.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="favorites.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-50">
          <Heart class="w-12 h-12 text-[#00A3FF]/30" />
        </div>
        <p class="text-lg font-medium text-[var(--color-carbon)]">暂无收藏</p>
        <p class="mt-2 text-[var(--color-carbon-light)]">浏览景点时点击“收藏”按钮即可加入收藏</p>
      </div>
    </main>
  </div>
</template>
