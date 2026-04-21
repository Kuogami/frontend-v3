<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
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
  X,
} from 'lucide-vue-next'
import { AMAP_KEY, apiGet } from '../services/api'

type LngLatTuple = [number, number]

type PickedLocation = {
  address: string
  lnglat: LngLatTuple
}

type RouteSpot = {
  id: number
  name: string
  duration: string
  type: string
  lnglat?: LngLatTuple
  openTime?: string
}

type BackendRoutePlan = {
  distance?: number
  duration?: number
  points?: Array<LngLatTuple | string | { lng?: number | string; lat?: number | string } | { longitude?: number | string; latitude?: number | string }>
  steps?: string[]
  summary?: string
}

type BackendAttraction = {
  id?: number
  name?: string
  category?: string
  description?: string
  address?: string
  latitude?: number | string | null
  longitude?: number | string | null
  city?: string
  averageRating?: number | null
  openTime?: string
  suggestedDuration?: string
  suggestedVisitDuration?: string
}

type BackendRecommendationReason = {
  attractionName?: string
  reason?: string
  highlights?: string[]
}

type BackendRouteResponse = {
  normalRoute?: BackendRoutePlan | null
  personalRoute?: BackendRoutePlan | null
  viaAttractions?: BackendAttraction[]
  reasons?: BackendRecommendationReason[]
  historyId?: number
}

const route = useRoute()

const startPoint = ref('')
const endPoint = ref('')
const planMode = ref<'normal' | 'personalized' | 'compare'>('personalized')
const drawerState = ref<'collapsed' | 'half' | 'full'>('half')
const isNavigating = ref(false)
const pickingMode = ref<'none' | 'start' | 'end'>('none')
const isPanelCollapsed = ref(false)

const startLocation = ref<PickedLocation | null>(null)
const endLocation = ref<PickedLocation | null>(null)

const map = shallowRef<any>(null)
let AMap: any | null = null
let geocoder: any | null = null
const startMarker = shallowRef<any>(null)
const endMarker = shallowRef<any>(null)
const attractionMarkers = shallowRef<any[]>([])
const normalPolyline = shallowRef<any>(null)
const personalPolyline = shallowRef<any>(null)

const timelineSpots = ref<RouteSpot[]>([])
const normalRoutes = ref<Array<{ id: number; name: string; time: string; distance: string; via: string }>>([])
const compareData = ref<Array<{ label: string; route1: string; route2: string }>>([])

const drawerHeightClass = computed(() => {
  if (isNavigating.value) {
    return 'h-[70vh]'
  }
  switch (drawerState.value) {
    case 'collapsed':
      return 'h-[120px]'
    case 'half':
      return 'h-[50vh]'
    case 'full':
      return 'h-[85vh]'
    default:
      return 'h-[50vh]'
  }
})

const formatDurationLabel = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '待定'
  const minutes = Math.max(1, Math.round(seconds / 60))
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  if (hours <= 0) return `${minutes}分钟`
  if (remainMinutes === 0) return `${hours}小时`
  return `${hours}小时${remainMinutes}分钟`
}

const formatDistanceLabel = (meters?: number) => {
  if (!meters || meters <= 0) return '待定'
  return `${(meters / 1000).toFixed(1)}公里`
}

const parseLngLat = (value: unknown): LngLatTuple | null => {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0])
    const lat = Number(value[1])
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat]
    }
  }

  if (typeof value === 'string') {
    const [lngText, latText] = value.split(',')
    const lng = Number(lngText)
    const lat = Number(latText)
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat]
    }
  }

  if (value && typeof value === 'object') {
    const point = value as { lng?: number | string; lat?: number | string; longitude?: number | string; latitude?: number | string }
    const lng = Number(point.lng ?? point.longitude)
    const lat = Number(point.lat ?? point.latitude)
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat]
    }
  }

  return null
}

const normalizePoints = (points?: BackendRoutePlan['points']) => {
  return (points || [])
    .map(parseLngLat)
    .filter((point): point is LngLatTuple => Array.isArray(point))
}

const createEndpointMarkerContent = (label: string, color: string, icon: string) => `
  <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:9999px;background:${color};box-shadow:0 10px 24px rgba(15,23,42,0.18);border:2px solid rgba(255,255,255,0.95);color:#fff;font-size:13px;font-weight:700;white-space:nowrap;">
    <span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:rgba(255,255,255,0.2);font-size:14px;line-height:1;">${icon}</span>
    <span>${label}</span>
  </div>
`

const createIndexedMarkerContent = (index: number, name: string) => `
  <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);">
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:linear-gradient(135deg,#ffffff 0%,#eff6ff 100%);border:2px solid #0ea5e9;color:#0369a1;font-size:14px;font-weight:800;box-shadow:0 10px 20px rgba(14,165,233,0.24);">${index}</div>
    <div style="margin-top:6px;padding:4px 8px;border-radius:9999px;background:rgba(255,255,255,0.95);border:1px solid rgba(14,165,233,0.16);box-shadow:0 8px 18px rgba(148,163,184,0.18);color:#0f172a;font-size:12px;font-weight:600;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;">${name}</div>
  </div>
`

const getVisibleOverlays = () => {
  const overlays = [startMarker.value, endMarker.value]

  if (planMode.value === 'normal' || planMode.value === 'compare') {
    overlays.push(normalPolyline.value)
  }
  if (planMode.value === 'personalized' || planMode.value === 'compare') {
    overlays.push(personalPolyline.value, ...attractionMarkers.value)
  }

  return overlays.filter(Boolean)
}

const fitMapToVisibleMarkers = () => {
  if (!map.value) return
  const overlays = getVisibleOverlays()
  if (overlays.length > 0) {
    map.value.setFitView(overlays, false, [80, 120, 80, 120])
  }
}

const updateMapVisibility = () => {
  if (!map.value) return

  if (normalPolyline.value) {
    if (planMode.value === 'normal' || planMode.value === 'compare') {
      normalPolyline.value.show?.()
    } else {
      normalPolyline.value.hide?.()
    }
  }

  if (personalPolyline.value) {
    if (planMode.value === 'personalized' || planMode.value === 'compare') {
      personalPolyline.value.show?.()
    } else {
      personalPolyline.value.hide?.()
    }
  }

  attractionMarkers.value.forEach((marker) => {
    if (planMode.value === 'personalized' || planMode.value === 'compare') {
      marker.show?.()
    } else {
      marker.hide?.()
    }
  })

  fitMapToVisibleMarkers()
}

const setEndpointMarker = (type: 'start' | 'end', location: PickedLocation) => {
  if (!map.value || !AMap) return

  const markerRef = type === 'start' ? startMarker : endMarker
  const content = type === 'start'
    ? createEndpointMarkerContent('起点', '#0ea5e9', 'S')
    : createEndpointMarkerContent('终点', '#10b981', 'E')

  if (!markerRef.value) {
    markerRef.value = new AMap.Marker({
      position: location.lnglat,
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, 6),
      content,
    })
    map.value.add(markerRef.value)
  } else {
    markerRef.value.setPosition(location.lnglat)
    markerRef.value.setContent(content)
  }
}

const clearAttractionMarkers = () => {
  if (!map.value || attractionMarkers.value.length === 0) return
  map.value.remove(attractionMarkers.value)
  attractionMarkers.value = []
}

const clearRoutePolylines = () => {
  if (!map.value) return
  normalPolyline.value?.setMap?.(null)
  personalPolyline.value?.setMap?.(null)
  normalPolyline.value = null
  personalPolyline.value = null
}

const renderAttractionMarkers = (spots: RouteSpot[]) => {
  if (!map.value || !AMap) return

  clearAttractionMarkers()

  const nextMarkers = spots
    .filter((spot): spot is RouteSpot & { lnglat: LngLatTuple } => Array.isArray(spot.lnglat) && spot.lnglat.length === 2)
    .map((spot, index) => new AMap.Marker({
      position: spot.lnglat,
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, 6),
      content: createIndexedMarkerContent(index + 1, spot.name),
    }))

  if (nextMarkers.length > 0) {
    attractionMarkers.value = nextMarkers
    map.value.add(nextMarkers)
  }
}

const renderRoutePolylines = (normalPoints: LngLatTuple[], personalPoints: LngLatTuple[]) => {
  if (!map.value || !AMap) return

  clearRoutePolylines()

  if (normalPoints.length > 1) {
    normalPolyline.value = new AMap.Polyline({
      strokeColor: '#38bdf8',
      strokeWeight: 6,
      strokeOpacity: 0.88,
      zIndex: 40,
    })
    normalPolyline.value.setPath(normalPoints)
    normalPolyline.value.setMap(map.value)
  }

  if (personalPoints.length > 1) {
    personalPolyline.value = new AMap.Polyline({
      strokeColor: '#10b981',
      strokeWeight: 7,
      strokeOpacity: 0.92,
      zIndex: 50,
    })
    personalPolyline.value.setPath(personalPoints)
    personalPolyline.value.setMap(map.value)
  }
}

const resolveAddress = (lnglat: LngLatTuple) => new Promise<string>((resolve) => {
  if (!geocoder) {
    resolve(`已选位置 (${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)})`)
    return
  }

  geocoder.getAddress(lnglat, (status: string, result: any) => {
    if (status === 'complete' && result?.regeocode?.formattedAddress) {
      resolve(result.regeocode.formattedAddress)
      return
    }
    resolve(`已选位置 (${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)})`)
  })
})

const applyPickedLocation = async (type: 'start' | 'end', lnglat: LngLatTuple) => {
  const address = await resolveAddress(lnglat)
  const text = `${address} (${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)})`
  const location = { address, lnglat }

  if (type === 'start') {
    startPoint.value = text
    startLocation.value = location
  } else {
    endPoint.value = text
    endLocation.value = location
  }

  setEndpointMarker(type, location)
  fitMapToVisibleMarkers()
}

const buildTimelineSpots = (attractions: BackendAttraction[], reasons: BackendRecommendationReason[]) => {
  const highlightMap = new Map(
    reasons
      .filter((item) => item.attractionName)
      .map((item) => [item.attractionName as string, item])
  )

  return attractions.map((item, index) => {
    const lnglat = parseLngLat([item.longitude, item.latitude]) || undefined
    const reason = highlightMap.get(item.name || '')
    return {
      id: item.id || index + 1,
      name: item.name || `推荐景点${index + 1}`,
      duration: item.suggestedDuration || item.suggestedVisitDuration || reason?.reason || '待定',
      type: item.category || 'attraction',
      lnglat,
      openTime: item.openTime || '待定',
    }
  })
}

const applyRouteResponse = async (payload: BackendRouteResponse) => {
  const normalPlan = payload.normalRoute || {}
  const personalPlan = payload.personalRoute || {}
  const attractions = (payload.viaAttractions || []).map((item) => ({
    ...item,
    openTime: item.openTime || '待定',
    suggestedDuration: item.suggestedDuration || item.suggestedVisitDuration || '待定',
  }))
  const reasons = payload.reasons || []

  timelineSpots.value = buildTimelineSpots(attractions, reasons)

  const normalDistance = formatDistanceLabel(normalPlan.distance)
  const normalDuration = formatDurationLabel(normalPlan.duration)
  const viaSummary = timelineSpots.value.length > 0
    ? timelineSpots.value.map((item) => item.name).join(' → ')
    : (normalPlan.summary || '直接前往终点')

  normalRoutes.value = [{
    id: 1,
    name: '推荐路线',
    time: normalDuration,
    distance: normalDistance,
    via: viaSummary,
  }]

  compareData.value = [
    {
      label: '总时间',
      route1: formatDurationLabel(normalPlan.duration),
      route2: formatDurationLabel(personalPlan.duration),
    },
    {
      label: '总距离',
      route1: formatDistanceLabel(normalPlan.distance),
      route2: formatDistanceLabel(personalPlan.distance),
    },
    {
      label: '景点数',
      route1: '0个',
      route2: `${timelineSpots.value.length}个`,
    },
    {
      label: '推荐亮点',
      route1: '直达终点',
      route2: reasons[0]?.reason || '个性化推荐',
    },
  ]

  const normalPoints = normalizePoints(normalPlan.points)
  const personalPoints = normalizePoints(personalPlan.points)

  console.log('解析后的路径:', {
    normalPath: normalPoints,
    personalPath: personalPoints,
  })

  renderRoutePolylines(normalPoints, personalPoints)
  await nextTick()
  updateMapVisibility()
  fitMapToVisibleMarkers()
}

const initAMap = async () => {
  if (map.value) return

  AMap = await AMapLoader.load({
    key: AMAP_KEY,
    version: '2.0',
    plugins: ['AMap.Geocoder'],
  })

  geocoder = new AMap.Geocoder()

  map.value = new AMap.Map('container', {
    mapStyle: 'amap://styles/normal',
    center: [118.796623, 32.059352],
    zoom: 11,
    viewMode: '2D',
  })

  map.value.on('click', async (e: any) => {
    if (pickingMode.value === 'none') return

    const lng = Number(e?.lnglat?.getLng?.() ?? e?.lnglat?.lng)
    const lat = Number(e?.lnglat?.getLat?.() ?? e?.lnglat?.lat)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return

    const currentPickingMode = pickingMode.value
    const pos: LngLatTuple = [lng, lat]

    await applyPickedLocation(currentPickingMode, pos)

    pickingMode.value = 'none'
    setTimeout(() => {
      isPanelCollapsed.value = false
    }, 200)
  })
}

const startPicking = (type: 'start' | 'end') => {
  pickingMode.value = type
  isPanelCollapsed.value = true
}

const togglePanelCollapse = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

const expandPanel = () => {
  isPanelCollapsed.value = false
}

const useCurrentLocation = async (type: 'start' | 'end') => {
  const defaultLocation: LngLatTuple = [118.7966, 32.0593]
  await applyPickedLocation(type, defaultLocation)
  map.value?.setCenter?.(defaultLocation)
}

const serializeLocation = (location: PickedLocation | null, fallbackText: string) => {
  if (location) {
    return {
      coord: `${location.lnglat[0]},${location.lnglat[1]}`,
      name: location.address,
    }
  }
  return {
    coord: fallbackText.trim(),
    name: fallbackText.trim(),
  }
}

const startNavigation = async () => {
  const originText = startPoint.value.trim()
  const destinationText = endPoint.value.trim()
  if (!originText || !destinationText) {
    window.alert('请先选择起点和终点')
    return
  }

  isNavigating.value = true

  try {
    const origin = serializeLocation(startLocation.value, originText)
    const destination = serializeLocation(endLocation.value, destinationText)

    const response = await apiGet<BackendRouteResponse>('/api/recommend-route', {
      origin: origin.coord,
      originName: origin.name,
      destination: destination.coord,
      destinationName: destination.name,
    })

    console.log('后端原始数据:', response)
    await applyRouteResponse(response)
    isNavigating.value = true

    if (window.innerWidth < 768) {
      drawerState.value = 'full'
    }
  } catch {
    isNavigating.value = false
  }
}

const resetNavigationResult = () => {
  clearRoutePolylines()
  clearAttractionMarkers()
  timelineSpots.value = []
  normalRoutes.value = []
  compareData.value = []
}

const stopNavigation = () => {
  resetNavigationResult()
  isNavigating.value = false
  if (window.innerWidth < 768) {
    drawerState.value = 'half'
  }
  fitMapToVisibleMarkers()
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

watch(
  () => route.query.mode,
  (mode) => {
    const m = typeof mode === 'string' ? mode : ''
    if (m === 'normal' || m === 'personalized' || m === 'compare') {
      planMode.value = m
    }
  },
  { immediate: true }
)

watch(
  timelineSpots,
  (spots) => {
    renderAttractionMarkers(spots)
    updateMapVisibility()
  },
  { deep: true }
)

watch(planMode, () => {
  updateMapVisibility()
})

onMounted(() => {
  initAMap()
})

onBeforeUnmount(() => {
  try {
    clearRoutePolylines()
    clearAttractionMarkers()
    map.value?.destroy?.()
  } finally {
    map.value = null
    AMap = null
    geocoder = null
    startMarker.value = null
    endMarker.value = null
    normalPolyline.value = null
    personalPolyline.value = null
    attractionMarkers.value = []
  }
})
</script>

<template>
  <div class="relative isolate w-full min-h-[calc(100vh-80px)] overflow-hidden">
    <!-- 全屏地图背景层（可点击选点） -->
    <div 
      id="container"
      class="fixed inset-0 w-full h-full -z-10 transition-transform duration-500"
      :class="{ 'cursor-crosshair': pickingMode !== 'none' }"
    >
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
        <div v-if="isNavigating" class="px-6 py-4">
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
        <div v-if="isNavigating" class="flex-1 overflow-y-auto px-6 pb-6">
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
        <div v-if="isNavigating" class="mb-5">
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
        <div v-if="isNavigating && drawerState !== 'collapsed'">
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
