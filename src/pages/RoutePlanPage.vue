<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  MapPin, 
  Navigation, 
  MousePointer2, 
  LocateFixed,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-vue-next'

// 起点终点
const startPoint = ref('')
const endPoint = ref('')

// 方案模式
const planMode = ref<'normal' | 'personalized' | 'compare'>('personalized')

// 移动端抽屉状态
const drawerState = ref<'collapsed' | 'half' | 'full'>('half')

// 导航状态
const isNavigating = ref(false)
const routeProgress = ref(0)

// 地图选点模式
const pickingMode = ref<'none' | 'start' | 'end'>('none')

// 桌面端面板折叠状态
const isPanelCollapsed = ref(false)

// 涟漪效果状态
const rippleEffect = ref<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false })

// 地图中心坐标（模拟）
const mapCenter = ref({ x: 50, y: 50 })

// 路线绘制是否完成
const routeDrawn = ref(false)

// 地图标记点位置
const markers = computed(() => {
  if (planMode.value === 'normal') {
    return {
      start: { x: 25, y: 20 },
      spots: [
        { x: 40, y: 35 },
        { x: 60, y: 45 },
        { x: 75, y: 38 }
      ],
      end: { x: 72, y: 65 }
    }
  } else {
    return {
      start: { x: 30, y: 22 },
      spots: [
        { x: 45, y: 37 },
        { x: 55, y: 52 },
        { x: 70, y: 42 }
      ],
      end: { x: 68, y: 68 }
    }
  }
})

// SVG 路径（根据方案动态变化）
const routePath = computed(() => {
  const m = markers.value
  if (planMode.value === 'normal') {
    return `M ${m.start.x}% ${m.start.y}% 
            Q ${(m.start.x + m.spots[0].x) / 2}% ${m.start.y + 5}%, ${m.spots[0].x}% ${m.spots[0].y}% 
            Q ${(m.spots[0].x + m.spots[1].x) / 2}% ${m.spots[0].y + 5}%, ${m.spots[1].x}% ${m.spots[1].y}% 
            Q ${(m.spots[1].x + m.spots[2].x) / 2}% ${m.spots[1].y - 3}%, ${m.spots[2].x}% ${m.spots[2].y}% 
            Q ${(m.spots[2].x + m.end.x) / 2}% ${m.spots[2].y + 10}%, ${m.end.x}% ${m.end.y}%`
  } else {
    return `M ${m.start.x}% ${m.start.y}% 
            C ${m.start.x + 10}% ${m.start.y + 15}%, ${m.spots[0].x - 5}% ${m.spots[0].y - 10}%, ${m.spots[0].x}% ${m.spots[0].y}% 
            S ${m.spots[1].x - 5}% ${m.spots[1].y - 5}%, ${m.spots[1].x}% ${m.spots[1].y}% 
            S ${m.spots[2].x - 5}% ${m.spots[2].y + 5}%, ${m.spots[2].x}% ${m.spots[2].y}% 
            S ${m.end.x - 5}% ${m.end.y - 10}%, ${m.end.x}% ${m.end.y}%`
  }
})

// 个性化路线时间轴数据
const timelineSpots = ref([
  { id: 1, name: '故宫博物院', duration: '3小时', type: 'attraction' },
  { id: 2, name: '景山公园', duration: '1.5小时', type: 'attraction' },
  { id: 3, name: '北海公园', duration: '2小时', type: 'attraction' },
  { id: 4, name: '什刹海', duration: '2小时', type: 'attraction' },
])

// 普通路线数据
const normalRoutes = ref([
  { id: 1, name: '推荐路线', time: '8小时', distance: '15公里', via: '故宫 → 景山 → 北海' },
  { id: 2, name: '快速路线', time: '6小时', distance: '12公里', via: '故宫 → 北海 → 什刹海' },
])

// 对比数据
const compareData = ref([
  { label: '总时间', route1: '8小时', route2: '6小时' },
  { label: '总距离', route1: '15公里', route2: '12公里' },
  { label: '景点数', route1: '4个', route2: '3个' },
  { label: '步行距离', route1: '5公里', route2: '3公里' },
])

// 抽屉高度类
const drawerHeightClass = computed(() => {
  if (isNavigating.value) {
    return 'h-[70vh]'
  }
  switch (drawerState.value) {
    case 'collapsed': return 'h-[120px]'
    case 'half': return 'h-[50vh]'
    case 'full': return 'h-[85vh]'
    default: return 'h-[50vh]'
  }
})

// 输入完成后自动移动地图
watch(startPoint, (val) => {
  if (val.length > 2) {
    animateMapTo(markers.value.start.x, markers.value.start.y)
  }
})

watch(endPoint, (val) => {
  if (val.length > 2) {
    animateMapTo(markers.value.end.x, markers.value.end.y)
  }
})

// 平滑移动地图
const animateMapTo = (targetX: number, targetY: number) => {
  const startX = mapCenter.value.x
  const startY = mapCenter.value.y
  const duration = 600
  const startTime = performance.now()
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    
    mapCenter.value.x = startX + (targetX - startX) * eased
    mapCenter.value.y = startY + (targetY - startY) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

// 开始选点模式
const startPicking = (type: 'start' | 'end') => {
  pickingMode.value = type
  // 自动折叠面板
  isPanelCollapsed.value = true
}

// 切换面板折叠状态
const togglePanelCollapse = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

// 展开面板（用于把手点击）
const expandPanel = () => {
  isPanelCollapsed.value = false
}

// 地图点击直接选点（点击即确认，无弹窗）
const handleMapClick = (event: MouseEvent) => {
  if (pickingMode.value === 'none') return
  
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // 显示涟漪效果
  rippleEffect.value = { x, y, show: true }
  setTimeout(() => {
    rippleEffect.value.show = false
  }, 600)
  
  // 立即回填坐标到输入框
  if (pickingMode.value === 'start') {
    startPoint.value = `选定位置 (${x.toFixed(1)}, ${y.toFixed(1)})`
  } else if (pickingMode.value === 'end') {
    endPoint.value = `选定位置 (${x.toFixed(1)}, ${y.toFixed(1)})`
  }
  
  // 移动地图中心
  animateMapTo(x, y)
  
  // 退出选点模式并自动展开面板（带动画延迟）
  pickingMode.value = 'none'
  setTimeout(() => {
    isPanelCollapsed.value = false
  }, 200)
}

// 使用当前位置
const useCurrentLocation = (type: 'start' | 'end') => {
  if (type === 'start') {
    startPoint.value = '当前位置'
  } else {
    endPoint.value = '当前位置'
  }
  animateMapTo(50, 50)
}

// 开始导航
const startNavigation = () => {
  isNavigating.value = true
  routeProgress.value = 0
  routeDrawn.value = false
  
  // 移动端自动展开抽屉
  if (window.innerWidth < 768) {
    drawerState.value = 'full'
  }
  
  // 动画绘制路线
  const animateRoute = () => {
    if (routeProgress.value < 100) {
      routeProgress.value += 1
      setTimeout(animateRoute, 30)
    } else {
      routeDrawn.value = true
    }
  }
  animateRoute()
}

// 停止导航
const stopNavigation = () => {
  isNavigating.value = false
  routeProgress.value = 0
  routeDrawn.value = false
}

const toggleDrawer = () => {
  if (drawerState.value === 'collapsed') {
    drawerState.value = 'half'
  } else if (drawerState.value === 'half') {
    drawerState.value = 'full'
  } else {
    drawerState.value = 'half'
  }
}

const collapseDrawer = () => {
  drawerState.value = 'collapsed'
}

const expandDrawer = () => {
  drawerState.value = 'full'
}
</script>

<template>
  <div class="relative w-full h-[calc(100vh-80px)] overflow-hidden">
    <!-- 全屏地图背景层（可点击选点） -->
    <div 
      class="absolute inset-0 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 transition-transform duration-500"
      :class="{ 'cursor-crosshair': pickingMode !== 'none' }"
      :style="{ transform: `translate(${50 - mapCenter.x}%, ${50 - mapCenter.y}%) scale(1.2)` }"
      @click="handleMapClick"
    >
      <!-- 模拟地图网格 -->
      <div class="absolute inset-0 opacity-30">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#93B1CF" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <!-- 涟漪效果 -->
      <div 
        v-if="rippleEffect.show"
        class="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        :style="{ left: rippleEffect.x + '%', top: rippleEffect.y + '%' }"
      >
        <div class="w-full h-full rounded-full bg-sky-400/40 animate-ripple"></div>
        <div class="absolute inset-0 rounded-full bg-sky-400/30 animate-ripple-delay"></div>
      </div>
      
      <!-- 地图标记点 - 起点 -->
      <div 
        class="absolute flex flex-col items-center transition-all duration-500"
        :style="{ left: markers.start.x + '%', top: markers.start.y + '%' }"
      >
        <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-200">
          <MapPin class="w-5 h-5" />
        </div>
        <span class="mt-1 px-2 py-0.5 bg-white/90 rounded-full text-xs text-carbon shadow-sm">起点</span>
      </div>
      
      <!-- 途经景点 -->
      <div 
        v-for="(spot, index) in markers.spots"
        :key="index"
        class="absolute flex flex-col items-center transition-all duration-500"
        :style="{ left: spot.x + '%', top: spot.y + '%' }"
      >
        <div class="w-8 h-8 rounded-full bg-sky-400 flex items-center justify-center text-white text-sm font-medium shadow-lg">
          {{ index + 1 }}
        </div>
      </div>
      
      <!-- 终点 -->
      <div 
        class="absolute flex flex-col items-center transition-all duration-500"
        :style="{ left: markers.end.x + '%', top: markers.end.y + '%' }"
      >
        <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Navigation class="w-5 h-5" />
        </div>
        <span class="mt-1 px-2 py-0.5 bg-white/90 rounded-full text-xs text-carbon shadow-sm">终点</span>
      </div>

      <!-- 导航路线 SVG -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- 流光渐变 - 增强版 -->
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="transparent">
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="20%" stop-color="rgba(255,255,255,0.9)">
              <animate attributeName="offset" values="0.2;1.2" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="30%" stop-color="rgba(255,255,255,0.9)">
              <animate attributeName="offset" values="0.3;1.3" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stop-color="transparent">
              <animate attributeName="offset" values="0.5;1.5" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          <!-- 发光滤镜 -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- 路线裁剪蒙版 -->
          <mask id="routeMask">
            <path 
              :d="routePath"
              fill="none" 
              stroke="white" 
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
              :stroke-dasharray="isNavigating ? `${routeProgress * 10} 10000` : 'none'"
            />
          </mask>
        </defs>
        
        <!-- 底层路线阴影 -->
        <path 
          v-if="isNavigating"
          :d="routePath"
          fill="none" 
          stroke="rgba(14, 165, 233, 0.3)" 
          stroke-width="16"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-dasharray="`${routeProgress * 10} 10000`"
          class="transition-all duration-100"
          filter="url(#glow)"
        />
        
        <!-- 主路线（天蓝色） -->
        <path 
          v-if="isNavigating"
          :d="routePath"
          fill="none" 
          stroke="#00A3FF" 
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-dasharray="`${routeProgress * 10} 10000`"
          class="transition-all duration-100"
        />
        
        <!-- 流光效果层 -->
        <g v-if="isNavigating && routeDrawn" mask="url(#routeMask)">
          <!-- 流光线条 -->
          <path 
            :d="routePath"
            fill="none" 
            stroke="url(#flowGradient)" 
            stroke-width="4"
            stroke-linecap="round"
            class="animate-flow-light"
          />
          <!-- 粒子光点效果 -->
          <circle class="animate-particle-1" r="4" fill="white" filter="url(#glow)">
            <animateMotion :path="routePath" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle class="animate-particle-2" r="3" fill="rgba(255,255,255,0.7)" filter="url(#glow)">
            <animateMotion :path="routePath" dur="3s" begin="1s" repeatCount="indefinite" />
          </circle>
          <circle class="animate-particle-3" r="2" fill="rgba(255,255,255,0.5)" filter="url(#glow)">
            <animateMotion :path="routePath" dur="3s" begin="2s" repeatCount="indefinite" />
          </circle>
        </g>
        
        <!-- 未导航时的虚线预览 -->
        <path 
          v-if="!isNavigating"
          :d="routePath"
          fill="none" 
          stroke="#0ea5e9" 
          stroke-width="3" 
          stroke-dasharray="8 4"
          stroke-linecap="round"
          class="opacity-40 transition-all duration-500"
        />
      </svg>
    </div>

    <!-- 选点模式提示（精简版，无弹窗） -->
    <Transition name="fade">
      <div 
        v-if="pickingMode !== 'none'"
        class="absolute top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div class="px-6 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center animate-pulse">
            <MapPin class="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-carbon">
              {{ pickingMode === 'start' ? '选择起点' : '选择终点' }}
            </h3>
            <p class="text-xs text-carbon-light">点击地图任意位置即可选定</p>
          </div>
          <button 
            @click="pickingMode = 'none'; isPanelCollapsed = false"
            class="ml-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X class="w-4 h-4 text-carbon-light" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 桌面端：左侧浮动面板 -->
    <div 
      :class="[
        'hidden md:block absolute top-6 bottom-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(147,177,207,0.25)] overflow-hidden z-30 transition-all duration-300 ease-out',
        isPanelCollapsed ? '-left-[420px]' : 'left-6'
      ]"
      style="width: 420px;"
    >
      <!-- 折叠按钮（面板内侧） -->
      <button
        v-if="!isPanelCollapsed"
        @click="togglePanelCollapse"
        class="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-14 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-r-full shadow-lg transition-all duration-300 hover:bg-white hover:w-7 z-50"
        style="border: 1px solid rgba(147, 177, 207, 0.2); border-left: none;"
      >
        <ChevronLeft class="w-4 h-4 text-sky-500" />
      </button>

      <div class="h-full flex flex-col">
        <!-- 面板头部 -->
        <div class="p-6 border-b border-sky-100/50">
          <h2 class="text-lg font-semibold text-carbon mb-5">路线规划</h2>
          
          <!-- 起点终点输入 -->
          <div class="relative">
            <!-- 垂直连接线 -->
            <div class="absolute left-5 top-[24px] bottom-[24px] w-px border-l-2 border-dashed border-sky-300"></div>
            
            <div class="space-y-3">
              <!-- 起点 -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0 z-10">
                  <MapPin class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <input 
                    v-model="startPoint"
                    type="text" 
                    placeholder="输入起点"
                    class="flex-1 h-11 px-4 bg-sky-50/80 rounded-xl text-sm text-carbon placeholder:text-carbon-light/50 border-none outline-none focus:ring-2 focus:ring-sky-300 transition-all"
                  />
                  <button 
                    @click="startPicking('start')"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
                    title="地图选点"
                  >
                    <MousePointer2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="useCurrentLocation('start')"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
                    title="当前位置"
                  >
                    <LocateFixed class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- 终点 -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 z-10">
                  <Navigation class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <input 
                    v-model="endPoint"
                    type="text" 
                    placeholder="输入终点"
                    class="flex-1 h-11 px-4 bg-sky-50/80 rounded-xl text-sm text-carbon placeholder:text-carbon-light/50 border-none outline-none focus:ring-2 focus:ring-sky-300 transition-all"
                  />
                  <button 
                    @click="startPicking('end')"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
                    title="地图选点"
                  >
                    <MousePointer2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="useCurrentLocation('end')"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
                    title="当前位置"
                  >
                    <LocateFixed class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 开始导航按钮 -->
          <div class="mt-5">
            <button 
              v-if="!isNavigating"
              @click="startNavigation"
              class="w-full py-3 bg-sky-500 text-white font-medium rounded-full hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200 active:scale-[0.98]"
            >
              <Navigation class="w-5 h-5" />
              开始导航
            </button>
            <button 
              v-else
              @click="stopNavigation"
              class="w-full py-3 bg-rose-500 text-white font-medium rounded-full hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-[0.98]"
            >
              <X class="w-5 h-5" />
              结束导航
            </button>
          </div>
        </div>

        <!-- 方案切换 -->
        <div class="px-6 py-4">
          <div class="flex p-1 bg-sky-50 rounded-xl">
            <button 
              @click="planMode = 'normal'"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                planMode === 'normal' 
                  ? 'bg-white text-sky-600 shadow-sm' 
                  : 'text-carbon-light hover:text-carbon'
              ]"
            >
              普通
            </button>
            <button 
              @click="planMode = 'personalized'"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                planMode === 'personalized' 
                  ? 'bg-white text-sky-600 shadow-sm' 
                  : 'text-carbon-light hover:text-carbon'
              ]"
            >
              个性化
            </button>
            <button 
              @click="planMode = 'compare'"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                planMode === 'compare' 
                  ? 'bg-white text-sky-600 shadow-sm' 
                  : 'text-carbon-light hover:text-carbon'
              ]"
            >
              对比
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto px-6 pb-6">
          <!-- 普通模式：路线列表 -->
          <div v-if="planMode === 'normal'" class="space-y-3">
            <div 
              v-for="route in normalRoutes" 
              :key="route.id"
              class="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-carbon">{{ route.name }}</span>
                <span class="text-xs text-sky-600 font-medium">{{ route.time }}</span>
              </div>
              <p class="text-xs text-carbon-light mb-2">{{ route.via }}</p>
              <div class="flex items-center gap-2 text-xs text-carbon-light">
                <Clock class="w-3.5 h-3.5" />
                <span>{{ route.distance }}</span>
              </div>
            </div>
          </div>

          <!-- 个性化模式：垂直时间轴 -->
          <div v-else-if="planMode === 'personalized'" class="relative">
            <h3 class="text-sm font-medium text-carbon mb-4">行程时间轴</h3>
            
            <!-- 时间轴 -->
            <div class="relative pl-8">
              <!-- 垂直虚线 -->
              <div class="absolute left-3 top-0 bottom-0 w-px border-l-2 border-dashed border-sky-300"></div>
              
              <!-- 起点 -->
              <div class="relative mb-6">
                <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                  <MapPin class="w-3.5 h-3.5 text-white" />
                </div>
                <div class="pl-4 py-2">
                  <span class="text-sm font-medium text-carbon">出发点</span>
                  <p class="text-xs text-carbon-light mt-0.5">08:00 开始行程</p>
                </div>
              </div>
              
              <!-- 景点卡片 -->
              <div 
                v-for="(spot, index) in timelineSpots" 
                :key="spot.id"
                class="relative mb-6"
              >
                <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-white border-2 border-sky-400 flex items-center justify-center text-xs font-medium text-sky-600">
                  {{ index + 1 }}
                </div>
                <div class="ml-4 p-4 bg-white rounded-xl shadow-sm border border-sky-100/50">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-carbon text-sm">{{ spot.name }}</span>
                    <span class="flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded-full">
                      <Clock class="w-3 h-3" />
                      {{ spot.duration }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 终点 -->
              <div class="relative">
                <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Navigation class="w-3.5 h-3.5 text-white" />
                </div>
                <div class="pl-4 py-2">
                  <span class="text-sm font-medium text-carbon">目的地</span>
                  <p class="text-xs text-carbon-light mt-0.5">预计 18:00 到达</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 对比模式 -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-3 gap-2 text-center text-sm">
              <div></div>
              <div class="py-2 bg-sky-100 rounded-lg text-sky-700 font-medium">路线 A</div>
              <div class="py-2 bg-emerald-100 rounded-lg text-emerald-700 font-medium">路线 B</div>
            </div>
            
            <div 
              v-for="item in compareData" 
              :key="item.label"
              class="grid grid-cols-3 gap-2 text-sm"
            >
              <div class="py-3 text-carbon-light">{{ item.label }}</div>
              <div class="py-3 text-center bg-white rounded-lg text-carbon font-medium">{{ item.route1 }}</div>
              <div class="py-3 text-center bg-white rounded-lg text-carbon font-medium">{{ item.route2 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端：常驻把手（面板折叠时显示） -->
    <Transition name="slide-handle">
      <button
        v-if="isPanelCollapsed"
        @click="expandPanel"
        class="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 w-8 h-20 bg-white/70 backdrop-blur-xl items-center justify-center rounded-r-2xl shadow-[4px_0_16px_rgba(147,177,207,0.25)] hover:bg-white/90 hover:w-10 transition-all duration-300 group"
        style="border: 1px solid rgba(147, 177, 207, 0.2); border-left: none;"
      >
        <ChevronRight class="w-5 h-5 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </Transition>

    <!-- 移动端：底部抽屉 -->
    <div 
      :class="[
        'md:hidden fixed left-0 right-0 bottom-0 bg-white/90 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_32px_rgba(147,177,207,0.25)] transition-all duration-300 ease-out z-50',
        drawerHeightClass
      ]"
    >
      <!-- 抽屉拖动手柄 -->
      <div 
        class="flex justify-center py-3 cursor-pointer"
        @click="toggleDrawer"
      >
        <div class="w-10 h-1 bg-carbon-light/30 rounded-full"></div>
      </div>
      
      <!-- 抽屉控制按钮 -->
      <div class="absolute top-2 right-4 flex gap-1">
        <button 
          @click="expandDrawer"
          class="p-1.5 rounded-lg text-carbon-light hover:bg-sky-50 transition-colors"
        >
          <ChevronUp class="w-4 h-4" />
        </button>
        <button 
          @click="collapseDrawer"
          class="p-1.5 rounded-lg text-carbon-light hover:bg-sky-50 transition-colors"
        >
          <ChevronDown class="w-4 h-4" />
        </button>
      </div>

      <div class="h-full overflow-y-auto px-5 pb-8">
        <!-- 起点终点输入 -->
        <div class="mb-4">
          <div class="relative">
            <div class="absolute left-5 top-[24px] bottom-[24px] w-px border-l-2 border-dashed border-sky-300"></div>
            
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0 z-10">
                  <MapPin class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <input 
                    v-model="startPoint"
                    type="text" 
                    placeholder="输入起点"
                    class="flex-1 h-11 px-4 bg-sky-50/80 rounded-xl text-sm text-carbon placeholder:text-carbon-light/50 border-none outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <button 
                    @click="startPicking('start')"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-500"
                  >
                    <MousePointer2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 z-10">
                  <Navigation class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <input 
                    v-model="endPoint"
                    type="text" 
                    placeholder="输入终点"
                    class="flex-1 h-11 px-4 bg-sky-50/80 rounded-xl text-sm text-carbon placeholder:text-carbon-light/50 border-none outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <button 
                    @click="startPicking('end')"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-500"
                  >
                    <MousePointer2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 开始导航按钮 -->
        <div class="mb-5">
          <button 
            v-if="!isNavigating"
            @click="startNavigation"
            class="w-full py-3 bg-sky-500 text-white font-medium rounded-full flex items-center justify-center gap-2 shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform"
          >
            <Navigation class="w-5 h-5" />
            开始导航
          </button>
          <button 
            v-else
            @click="stopNavigation"
            class="w-full py-3 bg-rose-500 text-white font-medium rounded-full flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-[0.98] transition-transform"
          >
            <X class="w-5 h-5" />
            结束导航
          </button>
        </div>

        <!-- 方案切换 -->
        <div class="mb-5">
          <div class="flex p-1 bg-sky-50 rounded-xl">
            <button 
              @click="planMode = 'normal'"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                planMode === 'normal' ? 'bg-white text-sky-600 shadow-sm' : 'text-carbon-light'
              ]"
            >
              普通
            </button>
            <button 
              @click="planMode = 'personalized'"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                planMode === 'personalized' ? 'bg-white text-sky-600 shadow-sm' : 'text-carbon-light'
              ]"
            >
              个性化
            </button>
            <button 
              @click="planMode = 'compare'"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                planMode === 'compare' ? 'bg-white text-sky-600 shadow-sm' : 'text-carbon-light'
              ]"
            >
              对比
            </button>
          </div>
        </div>

        <!-- 内容区 -->
        <div v-if="drawerState !== 'collapsed'">
          <!-- 普通模式 -->
          <div v-if="planMode === 'normal'" class="space-y-3 mb-8">
            <div 
              v-for="route in normalRoutes" 
              :key="route.id"
              class="p-4 bg-white rounded-xl shadow-sm"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-carbon">{{ route.name }}</span>
                <span class="text-xs text-sky-600 font-medium">{{ route.time }}</span>
              </div>
              <p class="text-xs text-carbon-light">{{ route.via }}</p>
            </div>
          </div>

          <!-- 个性化模式：时间轴 -->
          <div v-else-if="planMode === 'personalized'" class="relative mb-8">
            <h3 class="text-sm font-medium text-carbon mb-4">行程时间轴</h3>
            
            <div class="relative pl-8">
              <div class="absolute left-3 top-0 bottom-0 w-px border-l-2 border-dashed border-sky-300"></div>
              
              <div class="relative mb-5">
                <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                  <MapPin class="w-3.5 h-3.5 text-white" />
                </div>
                <div class="pl-4 py-2">
                  <span class="text-sm font-medium text-carbon">出发点</span>
                </div>
              </div>
              
              <div 
                v-for="(spot, index) in timelineSpots" 
                :key="spot.id"
                class="relative mb-5"
              >
                <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-white border-2 border-sky-400 flex items-center justify-center text-xs font-medium text-sky-600">
                  {{ index + 1 }}
                </div>
                <div class="ml-4 p-3 bg-white rounded-xl shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-carbon text-sm">{{ spot.name }}</span>
                    <span class="flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded-full">
                      <Clock class="w-3 h-3" />
                      {{ spot.duration }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="relative">
                <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Navigation class="w-3.5 h-3.5 text-white" />
                </div>
                <div class="pl-4 py-2">
                  <span class="text-sm font-medium text-carbon">目的地</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 对比模式 -->
          <div v-else class="space-y-3 mb-8">
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div></div>
              <div class="py-2 bg-sky-100 rounded-lg text-sky-700 font-medium">路线 A</div>
              <div class="py-2 bg-emerald-100 rounded-lg text-emerald-700 font-medium">路线 B</div>
            </div>
            
            <div 
              v-for="item in compareData" 
              :key="item.label"
              class="grid grid-cols-3 gap-2 text-xs"
            >
              <div class="py-2 text-carbon-light">{{ item.label }}</div>
              <div class="py-2 text-center bg-white rounded-lg text-carbon font-medium">{{ item.route1 }}</div>
              <div class="py-2 text-center bg-white rounded-lg text-carbon font-medium">{{ item.route2 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 流光动画 - 增强版 */
@keyframes flow-light {
  0% {
    stroke-dashoffset: 200;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.8;
  }
}

.animate-flow-light {
  stroke-dasharray: 30 170;
  animation: flow-light 2s ease-in-out infinite;
}

/* 涟漪效果 */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out forwards;
}

.animate-ripple-delay {
  animation: ripple 0.6s ease-out 0.15s forwards;
}

/* 大头针慢速弹跳 */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 1.5s ease-in-out infinite;
}

/* 慢速脉冲光圈 */
@keyframes ping-slow {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* 粒子动画 */
.animate-particle-1 {
  opacity: 0.9;
}

.animate-particle-2 {
  opacity: 0.7;
}

.animate-particle-3 {
  opacity: 0.5;
}

/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* 把手滑入滑出过渡 */
.slide-handle-enter-active,
.slide-handle-leave-active {
  transition: all 0.3s ease;
}

.slide-handle-enter-from,
.slide-handle-leave-to {
  opacity: 0;
  transform: translateX(-100%) translateY(-50%);
}
</style>
