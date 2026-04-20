<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Download, Star, Heart, MapPin, Building2, TreePine, Landmark, Church, BookOpen } from 'lucide-vue-next'

// 模式切换
type Mode = 'search' | 'import'
const activeMode = ref<Mode>('search')

// 搜索模式表单
const searchCity = ref('')
const searchKeyword = ref('')

// 导入模式表单
const importCity = ref('')
const importCategory = ref('')

// 导入类别选项
const categories = [
  { value: 'scenic', label: '风景名胜', icon: TreePine },
  { value: 'park', label: '公园', icon: TreePine },
  { value: 'museum', label: '博物馆', icon: Building2 },
  { value: 'ancient-town', label: '古镇', icon: Landmark },
  { value: 'temple', label: '寺庙', icon: Church },
  { value: 'memorial', label: '纪念馆', icon: BookOpen },
]

// 模拟景点数据
const attractions = ref([
  { id: 1, name: '故宫博物院', category: '博物馆', rating: 0, userRating: 0, isFavorite: false, city: '北京', showFeedback: false },
  { id: 2, name: '西湖风景区', category: '风景名胜', rating: 0, userRating: 0, isFavorite: true, city: '杭州', showFeedback: false },
  { id: 3, name: '兵马俑', category: '博物馆', rating: 0, userRating: 0, isFavorite: false, city: '西安', showFeedback: false },
  { id: 4, name: '乌镇', category: '古镇', rating: 0, userRating: 0, isFavorite: false, city: '嘉兴', showFeedback: false },
  { id: 5, name: '灵隐寺', category: '寺庙', rating: 0, userRating: 0, isFavorite: true, city: '杭州', showFeedback: false },
  { id: 6, name: '颐和园', category: '公园', rating: 0, userRating: 0, isFavorite: false, city: '北京', showFeedback: false },
])

// 悬停星级
const hoverRatings = ref<Record<number, number>>({})

// 切换收藏
const toggleFavorite = (id: number) => {
  const attraction = attractions.value.find(a => a.id === id)
  if (attraction) {
    attraction.isFavorite = !attraction.isFavorite
  }
}

// 设置悬停星级
const setHoverRating = (attractionId: number, rating: number) => {
  hoverRatings.value[attractionId] = rating
}

// 清除悬停星级
const clearHoverRating = (attractionId: number) => {
  hoverRatings.value[attractionId] = 0
}

// 提交评分
const submitRating = (attractionId: number, rating: number) => {
  const attraction = attractions.value.find(a => a.id === attractionId)
  if (attraction) {
    attraction.userRating = rating
    attraction.showFeedback = true
    // 2秒后隐藏反馈
    setTimeout(() => {
      attraction.showFeedback = false
    }, 2000)
  }
}

// 获取显示的星级（悬停优先，否则显示用户评分）
const getDisplayRating = (attraction: typeof attractions.value[0]) => {
  if (hoverRatings.value[attraction.id] > 0) {
    return hoverRatings.value[attraction.id]
  }
  return attraction.userRating
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索:', searchCity.value, searchKeyword.value)
}

// 导入处理
const handleImport = () => {
  console.log('导入:', importCity.value, importCategory.value)
}

// 获取类别对应的图标
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    '风景名胜': TreePine,
    '公园': TreePine,
    '博物馆': Building2,
    '古镇': Landmark,
    '寺庙': Church,
    '纪念馆': BookOpen,
  }
  return iconMap[category] || MapPin
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto px-4 py-8">
    <!-- 标题 -->
    <h1 class="text-2xl font-semibold text-carbon text-center mb-8">景点查询与导入</h1>
    
    <!-- Segmented Control -->
    <div class="flex justify-center mb-8">
      <div class="inline-flex p-1 bg-sky-50 rounded-full">
        <button
          @click="activeMode = 'search'"
          :class="[
            'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
            activeMode === 'search'
              ? 'bg-white text-sky-primary shadow-sm'
              : 'text-carbon-light hover:text-carbon'
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
            'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
            activeMode === 'import'
              ? 'bg-white text-sky-primary shadow-sm'
              : 'text-carbon-light hover:text-carbon'
          ]"
        >
          <span class="flex items-center gap-2">
            <Download class="w-4 h-4" />
            导入景点
          </span>
        </button>
      </div>
    </div>

    <!-- 搜索/导入区域 -->
    <div class="mb-10">
      <!-- 搜索模式 -->
      <div v-if="activeMode === 'search'" class="flex items-center gap-3 p-4 bg-sky-50/60 rounded-2xl">
        <div class="flex-1">
          <input
            v-model="searchCity"
            type="text"
            placeholder="输入城市"
            class="w-full px-4 py-3 bg-white/80 rounded-xl text-carbon placeholder:text-carbon-light/60 outline-none focus:ring-2 focus:ring-sky-primary/20 transition-all"
          />
        </div>
        <div class="flex-1">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="输入关键词"
            class="w-full px-4 py-3 bg-white/80 rounded-xl text-carbon placeholder:text-carbon-light/60 outline-none focus:ring-2 focus:ring-sky-primary/20 transition-all"
          />
        </div>
        <button
          @click="handleSearch"
          class="px-8 py-3 bg-sky-primary text-white font-medium rounded-full hover:bg-sky-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-sky-primary/25"
        >
          搜索
        </button>
      </div>

      <!-- 导入模式 -->
      <div v-else class="flex items-center gap-3 p-4 bg-sky-50/60 rounded-2xl">
        <div class="flex-1">
          <input
            v-model="importCity"
            type="text"
            placeholder="输入城市"
            class="w-full px-4 py-3 bg-white/80 rounded-xl text-carbon placeholder:text-carbon-light/60 outline-none focus:ring-2 focus:ring-sky-primary/20 transition-all"
          />
        </div>
        <div class="flex-1 relative">
          <select
            v-model="importCategory"
            class="w-full px-4 py-3 bg-white/80 rounded-xl text-carbon outline-none focus:ring-2 focus:ring-sky-primary/20 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>选择导入类别</option>
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-4 h-4 text-carbon-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button
          @click="handleImport"
          class="px-8 py-3 bg-sky-primary text-white font-medium rounded-full hover:bg-sky-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-sky-primary/25"
        >
          导入
        </button>
      </div>
    </div>

    <!-- 结果展示区 -->
    <div class="space-y-4">
      <h2 class="text-lg font-medium text-carbon mb-4">景点列表</h2>
      
      <div class="flex flex-col gap-4">
        <div
          v-for="attraction in attractions"
          :key="attraction.id"
          class="flex items-center justify-between p-5 bg-white rounded-2xl shadow-[0_2px_12px_rgba(147,177,207,0.12)] hover:shadow-[0_4px_20px_rgba(147,177,207,0.18)] transition-all duration-300"
        >
          <!-- 左侧：名称和类别 -->
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
              <component :is="getCategoryIcon(attraction.category)" class="w-6 h-6 text-sky-primary" />
            </div>
            <div>
              <h3 class="text-base font-medium text-carbon">{{ attraction.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-2.5 py-0.5 text-xs font-medium text-sky-primary bg-sky-50 rounded-full">
                  {{ attraction.category }}
                </span>
                <span class="text-xs text-carbon-light flex items-center gap-1">
                  <MapPin class="w-3 h-3" />
                  {{ attraction.city }}
                </span>
              </div>
            </div>
          </div>

          <!-- 右侧：评分和操作 -->
          <div class="flex items-center gap-4">
            <!-- 交互式星级评分 -->
            <div class="flex items-center gap-2">
              <div 
                class="flex items-center"
                @mouseleave="clearHoverRating(attraction.id)"
              >
                <button
                  v-for="i in 5"
                  :key="i"
                  @mouseenter="setHoverRating(attraction.id, i)"
                  @click="submitRating(attraction.id, i)"
                  class="p-0.5 transition-transform duration-150 hover:scale-110 active:scale-95"
                >
                  <Star
                    :class="[
                      'w-5 h-5 transition-all duration-200',
                      i <= getDisplayRating(attraction)
                        ? 'text-sky-400 fill-sky-400'
                        : 'text-zinc-300 hover:text-sky-300'
                    ]"
                  />
                </button>
              </div>
              
              <!-- 评分反馈 -->
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
                  class="text-xs text-sky-primary font-medium whitespace-nowrap"
                >
                  感谢您的评分
                </span>
              </Transition>
            </div>

            <!-- 收藏按钮 -->
            <button
              @click="toggleFavorite(attraction.id)"
              :class="[
                'p-2.5 rounded-full transition-all duration-300',
                attraction.isFavorite
                  ? 'bg-red-50 text-red-500'
                  : 'bg-sky-50 text-carbon-light hover:text-red-500 hover:bg-red-50'
              ]"
            >
              <Heart
                class="w-5 h-5"
                :class="attraction.isFavorite ? 'fill-red-500' : ''"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="attractions.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
        <Search class="w-8 h-8 text-sky-primary/50" />
      </div>
      <p class="text-carbon-light">暂无景点数据，请尝试搜索或导入</p>
    </div>
  </div>
</template>
