<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, Download, Star, MapPin, Building2, TreePine, Landmark, Church, BookOpen } from 'lucide-vue-next'
import { apiDelete, apiGet, apiPost } from '../services/api'

type Mode = 'search' | 'import'
type CategoryValue = 'scenic' | 'park' | 'museum' | 'ancient-town' | 'temple' | 'memorial'

type BackendAttraction = {
  id: number
  name: string
  category?: string | null
  city?: string | null
  averageRating?: number | null
  address?: string | null
  description?: string | null
  latitude?: number | null
  longitude?: number | null
}

type FavoriteItemResponse = {
  attraction: BackendAttraction
  addTime?: string
}

type RatingItemResponse = {
  attraction: BackendAttraction
  score: number
  addTime?: string
}

type AttractionCard = {
  id: number
  name: string
  category: string
  rating: number
  userRating: number
  isFavorite: boolean
  city: string
  showFeedback: boolean
  address: string
  description: string
  latitude: number | null
  longitude: number | null
}

const activeMode = ref<Mode>('search')
const searchCity = ref('')
const searchKeyword = ref('')
const importCity = ref('')
const importCategory = ref<CategoryValue | ''>('')

const categories = [
  { value: 'scenic', label: '风景名胜', icon: TreePine },
  { value: 'park', label: '公园', icon: TreePine },
  { value: 'museum', label: '博物馆', icon: Building2 },
  { value: 'ancient-town', label: '古镇', icon: Landmark },
  { value: 'temple', label: '寺庙', icon: Church },
  { value: 'memorial', label: '纪念馆', icon: BookOpen },
] as const

const importCategoryCodeMap: Record<CategoryValue, number> = {
  scenic: 2,
  park: 3,
  museum: 4,
  'ancient-town': 5,
  temple: 6,
  memorial: 7,
}

const attractions = ref<AttractionCard[]>([])
const hoverRatings = ref<Record<number, number>>({})
const favoriteIds = ref<Set<number>>(new Set())
const ratingMap = ref<Record<number, number>>({})
const isLoading = ref(false)

const hasToken = computed(() => Boolean(localStorage.getItem('token')))

const normalizeScore = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(5, Number(value.toFixed(1))))
}

const mapAttraction = (item: BackendAttraction): AttractionCard => ({
  id: item.id,
  name: item.name,
  category: item.category || '景点',
  rating: normalizeScore(item.averageRating),
  userRating: ratingMap.value[item.id] || 0,
  isFavorite: favoriteIds.value.has(item.id),
  city: item.city || '待定',
  showFeedback: false,
  address: item.address || '待定',
  description: item.description || '暂无简介',
  latitude: item.latitude ?? null,
  longitude: item.longitude ?? null,
})

const refreshAttractionStates = () => {
  attractions.value = attractions.value.map((item) => ({
    ...item,
    userRating: ratingMap.value[item.id] || 0,
    isFavorite: favoriteIds.value.has(item.id),
  }))
}

const loadUserBehaviors = async () => {
  if (!hasToken.value) {
    favoriteIds.value = new Set()
    ratingMap.value = {}
    refreshAttractionStates()
    return
  }

  const [favoritesData, ratingsData] = await Promise.all([
    apiGet<FavoriteItemResponse[]>('/api/user/favorites'),
    apiGet<RatingItemResponse[]>('/api/user/ratings'),
  ])

  favoriteIds.value = new Set(
    favoritesData
      .map((item) => item.attraction?.id)
      .filter((id): id is number => typeof id === 'number'),
  )

  ratingMap.value = ratingsData.reduce<Record<number, number>>((acc, item) => {
    if (item.attraction?.id) {
      acc[item.attraction.id] = item.score
    }
    return acc
  }, {})

  refreshAttractionStates()
}

const loadAttractions = async (city = '', keyword = '') => {
  isLoading.value = true
  try {
    const data = await apiGet<BackendAttraction[]>('/api/attractions', {
      city: city || undefined,
      keyword: keyword || undefined,
    })
    attractions.value = data.map(mapAttraction)
  } finally {
    isLoading.value = false
  }
}

const toggleFavorite = async (id: number) => {
  if (!hasToken.value) {
    window.alert('请先登录后再收藏景点。')
    return
  }

  if (favoriteIds.value.has(id)) {
    await apiDelete(`/api/favorites/${id}`)
    favoriteIds.value.delete(id)
  } else {
    await apiPost('/api/favorites', { attractionId: id })
    favoriteIds.value.add(id)
  }

  refreshAttractionStates()
}

const setHoverRating = (attractionId: number, rating: number) => {
  hoverRatings.value[attractionId] = rating
}

const clearHoverRating = (attractionId: number) => {
  hoverRatings.value[attractionId] = 0
}

const submitRating = async (attractionId: number, rating: number) => {
  if (!hasToken.value) {
    window.alert('请先登录后再评分。')
    return
  }

  await apiPost('/api/ratings', { attractionId, score: rating })
  ratingMap.value = { ...ratingMap.value, [attractionId]: rating }

  const attraction = attractions.value.find((item) => item.id === attractionId)
  if (attraction) {
    attraction.userRating = rating
    attraction.showFeedback = true
    setTimeout(() => {
      attraction.showFeedback = false
    }, 2000)
  }
}

const getDisplayRating = (attraction: AttractionCard) => {
  if (hoverRatings.value[attraction.id] > 0) {
    return hoverRatings.value[attraction.id]
  }
  return attraction.userRating
}

const handleSearch = async () => {
  await loadAttractions(searchCity.value, searchKeyword.value)
}

const handleImport = async () => {
  if (!importCity.value || !importCategory.value) {
    window.alert('请先选择城市和导入类别。')
    return
  }

  await apiGet('/api/map/poi-import', {
    city: importCity.value,
    categoryCode: importCategoryCodeMap[importCategory.value],
    page: 1,
    pageSize: 20,
  })

  activeMode.value = 'search'
  searchCity.value = importCity.value
  searchKeyword.value = ''
  await loadAttractions(importCity.value, '')
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    风景名胜: TreePine,
    公园: TreePine,
    博物馆: Building2,
    古镇: Landmark,
    寺庙: Church,
    纪念馆: BookOpen,
  }
  return iconMap[category] || MapPin
}

onMounted(async () => {
  await loadUserBehaviors()
  await loadAttractions()
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-8">
    <h1 class="mb-8 text-center text-2xl font-semibold text-carbon">景点查询与导入</h1>

    <div class="mb-8 flex justify-center">
      <div class="inline-flex rounded-full bg-sky-50 p-1">
        <button
          @click="activeMode = 'search'"
          :class="[
            'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300',
            activeMode === 'search' ? 'bg-white text-sky-primary shadow-sm' : 'text-carbon-light hover:text-carbon',
          ]"
        >
          <span class="flex items-center gap-2">
            <Search class="w-4 h-4" />
            搜索景点
          </span>
        </button>
        <button
          @click="activeMode = 'import'"
          :class="[
            'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300',
            activeMode === 'import' ? 'bg-white text-sky-primary shadow-sm' : 'text-carbon-light hover:text-carbon',
          ]"
        >
          <span class="flex items-center gap-2">
            <Download class="w-4 h-4" />
            导入景点
          </span>
        </button>
      </div>
    </div>

    <div class="mb-10">
      <div v-if="activeMode === 'search'" class="flex items-center gap-3 rounded-2xl bg-sky-50/60 p-4">
        <div class="flex-1">
          <input
            v-model="searchCity"
            type="text"
            placeholder="输入城市"
            class="w-full rounded-xl bg-white/80 px-4 py-3 text-carbon outline-none transition-all placeholder:text-carbon-light/60 focus:ring-2 focus:ring-sky-primary/20"
          />
        </div>
        <div class="flex-1">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="输入景点关键词"
            class="w-full rounded-xl bg-white/80 px-4 py-3 text-carbon outline-none transition-all placeholder:text-carbon-light/60 focus:ring-2 focus:ring-sky-primary/20"
          />
        </div>
        <button
          @click="handleSearch"
          class="rounded-full bg-sky-primary px-8 py-3 font-medium text-white shadow-sm shadow-sky-primary/25 transition-all hover:bg-sky-primary/90 active:scale-[0.98]"
        >
          搜索
        </button>
      </div>

      <div v-else class="flex items-center gap-3 rounded-2xl bg-sky-50/60 p-4">
        <div class="flex-1">
          <input
            v-model="importCity"
            type="text"
            placeholder="输入城市"
            class="w-full rounded-xl bg-white/80 px-4 py-3 text-carbon outline-none transition-all placeholder:text-carbon-light/60 focus:ring-2 focus:ring-sky-primary/20"
          />
        </div>
        <div class="relative flex-1">
          <select
            v-model="importCategory"
            class="w-full cursor-pointer appearance-none rounded-xl bg-white/80 px-4 py-3 text-carbon outline-none transition-all focus:ring-2 focus:ring-sky-primary/20"
          >
            <option value="" disabled>选择导入类别</option>
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg class="w-4 h-4 text-carbon-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button
          @click="handleImport"
          class="rounded-full bg-sky-primary px-8 py-3 font-medium text-white shadow-sm shadow-sky-primary/25 transition-all hover:bg-sky-primary/90 active:scale-[0.98]"
        >
          导入
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="mb-4 text-lg font-medium text-carbon">景点列表</h2>

      <div v-if="isLoading" class="rounded-2xl bg-white/70 p-8 text-center text-carbon-light shadow-[0_2px_12px_rgba(147,177,207,0.12)]">
        正在加载景点数据...
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="attraction in attractions"
          :key="attraction.id"
          class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(147,177,207,0.12)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(147,177,207,0.18)]"
        >
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50">
              <component :is="getCategoryIcon(attraction.category)" class="w-6 h-6 text-sky-primary" />
            </div>
            <div>
              <h3 class="text-base font-medium text-carbon">{{ attraction.name }}</h3>
              <div class="mt-1 flex items-center gap-2">
                <span class="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-primary">
                  {{ attraction.category }}
                </span>
                <span class="flex items-center gap-1 text-xs text-carbon-light">
                  <MapPin class="w-3 h-3" />
                  {{ attraction.city }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="flex items-center" @mouseleave="clearHoverRating(attraction.id)">
                <button
                  v-for="i in 5"
                  :key="i"
                  class="p-0.5 transition-transform duration-150 hover:scale-110 active:scale-95"
                  @mouseenter="setHoverRating(attraction.id, i)"
                  @click="submitRating(attraction.id, i)"
                >
                  <Star
                    :class="[
                      'w-5 h-5 transition-all duration-200',
                      i <= getDisplayRating(attraction)
                        ? 'fill-sky-400 text-sky-400'
                        : 'text-zinc-300 hover:text-sky-300',
                    ]"
                  />
                </button>
              </div>

              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-all duration-300"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-2"
              >
                <span
                  v-if="attraction.showFeedback"
                  class="whitespace-nowrap text-xs font-medium text-sky-primary"
                >
                  评分已提交
                </span>
              </Transition>
            </div>

            <button
              @click="toggleFavorite(attraction.id)"
              :class="[
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                attraction.isFavorite
                  ? 'bg-[#00A3FF] text-white shadow-sm shadow-sky-200'
                  : 'bg-sky-50 text-carbon-light hover:bg-sky-100 hover:text-[var(--color-carbon)]',
              ]"
            >
              {{ attraction.isFavorite ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="attractions.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-16">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
        <Search class="w-8 h-8 text-sky-primary/50" />
      </div>
      <p class="text-carbon-light">暂无景点数据，请尝试搜索或导入</p>
    </div>
  </div>
</template>
