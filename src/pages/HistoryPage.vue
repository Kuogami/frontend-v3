<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, Clock, Trash2, Play, ChevronDown, ChevronUp, Scale } from 'lucide-vue-next'
import { apiDelete, apiGet } from '../services/api'

const router = useRouter()

type BackendRoutePlan = {
  distance?: number
  duration?: number
}

type BackendRouteRecord = {
  id: number
  originName?: string
  originCoord?: string
  destinationName?: string
  destinationCoord?: string
  normalRoute?: BackendRoutePlan | null
  personalRoute?: BackendRoutePlan | null
  viaAttractionNames?: string[]
  reasonHighlights?: string[]
  addTime?: string
}

type PlanResult = {
  start: string
  end: string
  via?: string[]
  distanceKm: number
  durationMin: number
}

type HistoryRecord = {
  id: number
  title: string
  date: string
  selectedPlan: 'personalized' | 'normal'
  normal: PlanResult
  personalized: PlanResult
}

const travelHistory = ref<HistoryRecord[]>([])
const normalFold = ref<Record<number, boolean>>({})

const totalDistance = computed(() => {
  const sum = travelHistory.value.reduce((acc, item) => acc + (item.personalized.distanceKm || 0), 0)
  return Math.round(sum * 10) / 10
})

const totalDurationMin = computed(() => travelHistory.value.reduce((acc, item) => acc + (item.personalized.durationMin || 0), 0))

const formatDuration = (mins: number) => {
  if (!mins || mins <= 0) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h <= 0) return `${m} 分钟`
  if (m === 0) return `${h} 小时`
  return `${h} 小时 ${m} 分钟`
}

const formatDate = (raw?: string) => {
  if (!raw) return '待定'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleDateString('zh-CN')
}

const fallbackName = (name?: string, coord?: string) => name?.trim() || coord?.trim() || '待定'
const metersToKm = (meters?: number) => (!meters || meters <= 0 ? 0 : Math.round((meters / 1000) * 10) / 10)
const secondsToMinutes = (seconds?: number) => (!seconds || seconds <= 0 ? 0 : Math.max(1, Math.round(seconds / 60)))

const mapRecord = (item: BackendRouteRecord): HistoryRecord => {
  const start = fallbackName(item.originName, item.originCoord)
  const end = fallbackName(item.destinationName, item.destinationCoord)
  const via = (item.viaAttractionNames || []).filter(Boolean)
  const selectedPlan = via.length > 0 || !!item.personalRoute ? 'personalized' : 'normal'

  return {
    id: item.id,
    title: `${start} → ${end}`,
    date: formatDate(item.addTime),
    selectedPlan,
    normal: {
      start,
      end,
      distanceKm: metersToKm(item.normalRoute?.distance),
      durationMin: secondsToMinutes(item.normalRoute?.duration),
    },
    personalized: {
      start,
      via,
      end,
      distanceKm: metersToKm(item.personalRoute?.distance || item.normalRoute?.distance),
      durationMin: secondsToMinutes(item.personalRoute?.duration || item.normalRoute?.duration),
    },
  }
}

const loadHistory = async () => {
  const data = await apiGet<BackendRouteRecord[]>('/api/user/routes/history')
  travelHistory.value = (data || []).map(mapRecord)
}

const formatRouteText = (plan: PlanResult) => {
  const via = plan.via?.length ? ` → ${plan.via.join(' → ')}` : ''
  return `${plan.start}${via} → ${plan.end}`
}

const isNormalOpen = (recordId: number) => Boolean(normalFold.value[recordId])

const toggleNormal = (recordId: number) => {
  normalFold.value = { ...normalFold.value, [recordId]: !normalFold.value[recordId] }
}

const removeRecord = async (id: number) => {
  await apiDelete<null>(`/api/user/routes/history/${id}`)
  travelHistory.value = travelHistory.value.filter((item) => item.id !== id)
  const next = { ...normalFold.value }
  delete next[id]
  normalFold.value = next
}

const restartRecord = (record: HistoryRecord) => {
  router.push({
    path: '/route',
    query: {
      mode: record.selectedPlan,
      from: 'history',
    },
  })
}

const goCompare = () => {
  router.push({
    path: '/route',
    query: {
      mode: 'compare',
      from: 'history',
    },
  })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadHistory().catch(() => {
    travelHistory.value = []
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50/80 to-white/90">
    <header class="sticky top-0 z-10 border-b border-sky-100/50 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-6">
      <div class="mx-auto flex max-w-3xl items-center gap-3">
        <button
          class="rounded-xl p-2 -ml-2 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-100 hover:text-[var(--color-carbon)]"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-carbon)]">旅行记录</h1>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div class="mb-5 rounded-3xl bg-white/60 p-5 shadow-[0_12px_40px_rgba(147,177,207,0.22)] backdrop-blur-xl md:mb-6 md:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-[var(--color-carbon-light)]">累计里程</p>
            <p class="mt-1 text-2xl font-bold text-[#00A3FF] md:text-3xl">{{ totalDistance }} km</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-[var(--color-carbon-light)]">累计耗时</p>
            <p class="mt-2 text-base font-semibold text-[var(--color-carbon)] md:text-lg">{{ formatDuration(totalDurationMin) }}</p>
          </div>
        </div>
      </div>

      <div v-if="travelHistory.length === 0" class="py-20 text-center">
        <p class="text-lg font-medium text-[var(--color-carbon)]">暂无旅行记录</p>
        <p class="mt-2 text-[var(--color-carbon-light)]">开始规划路线后，历史记录会显示在这里。</p>
      </div>

      <div v-else class="space-y-4 md:space-y-6">
        <div
          v-for="record in travelHistory"
          :key="record.id"
          class="overflow-hidden rounded-3xl bg-white/60 shadow-[0_10px_34px_rgba(147,177,207,0.18)] transition-all hover:shadow-[0_16px_48px_rgba(147,177,207,0.24)] backdrop-blur-xl"
        >
          <div class="p-5 md:p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex items-center gap-3">
                  <h3 class="truncate text-base font-semibold text-[var(--color-carbon)] md:text-lg">{{ record.title }}</h3>
                  <span class="rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-[#00A3FF] shadow-sm shadow-sky-100/40 backdrop-blur-xl">
                    个性化路线
                  </span>
                </div>
                <p class="mt-1 truncate text-sm text-[var(--color-carbon-light)]">{{ formatRouteText(record.personalized) }}</p>
                <div class="mt-3 flex flex-wrap gap-3 text-sm text-[var(--color-carbon-light)]">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 backdrop-blur">
                    <Calendar class="w-4 h-4" />
                    {{ record.date }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 backdrop-blur">
                    <Clock class="w-4 h-4" />
                    {{ formatDuration(record.personalized.durationMin) }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 backdrop-blur">
                    <span class="h-2 w-2 rounded-full bg-[#00A3FF]"></span>
                    {{ record.personalized.distanceKm }} km
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="rounded-xl bg-[#00A3FF] px-4 py-2 text-sm font-medium text-white shadow-md shadow-sky-200 transition-colors hover:bg-sky-500"
                  @click="restartRecord(record)"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Play class="w-4 h-4" />
                    再次开启
                  </span>
                </button>
                <button
                  class="rounded-xl bg-white/60 p-2.5 text-[var(--color-carbon-light)] transition-colors hover:bg-red-50 hover:text-red-500 backdrop-blur"
                  title="删除记录"
                  @click="removeRecord(record.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="rounded-full bg-sky-50/70 px-3 py-1 text-xs font-medium text-sky-700">起点：{{ record.personalized.start }}</span>
              <span
                v-for="(via, index) in record.personalized.via || []"
                :key="`${record.id}-${index}`"
                class="rounded-full bg-sky-50/70 px-3 py-1 text-xs font-medium text-sky-700"
              >
                途经：{{ via }}
              </span>
              <span class="rounded-full bg-sky-50/70 px-3 py-1 text-xs font-medium text-sky-700">终点：{{ record.personalized.end }}</span>
            </div>
          </div>

          <div class="px-5 pb-5 md:px-6 md:pb-6">
            <button
              class="flex w-full items-center justify-between rounded-2xl bg-white/50 px-4 py-3 transition-colors hover:bg-white/60 backdrop-blur"
              @click="toggleNormal(record.id)"
            >
              <span class="text-sm font-medium text-[var(--color-carbon)]">
                {{ isNormalOpen(record.id) ? '收起普通路线' : '查看普通路线' }}
              </span>
              <ChevronUp v-if="isNormalOpen(record.id)" class="w-4 h-4 text-[var(--color-carbon-light)]" />
              <ChevronDown v-else class="w-4 h-4 text-[var(--color-carbon-light)]" />
            </button>

            <div v-if="isNormalOpen(record.id)" class="mt-3 rounded-2xl bg-white/50 px-4 py-4 backdrop-blur">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[var(--color-carbon)]">普通路线</p>
                  <p class="mt-1 truncate text-sm text-[var(--color-carbon-light)]">{{ record.normal.start }} → {{ record.normal.end }}</p>
                  <div class="mt-3 flex flex-wrap gap-3 text-sm text-[var(--color-carbon-light)]">
                    <span class="inline-flex items-center gap-1.5">
                      <Clock class="w-4 h-4" />
                      {{ formatDuration(record.normal.durationMin) }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full bg-[#00A3FF]"></span>
                      {{ record.normal.distanceKm }} km
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs font-medium text-[var(--color-carbon-light)]">与个性化对比</p>
                  <div class="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 shadow-sm shadow-sky-100/40 backdrop-blur">
                    <Scale class="w-4 h-4 text-[#00A3FF]" />
                    <span class="text-xs font-semibold text-[var(--color-carbon)]">
                      {{ Math.round((record.personalized.distanceKm - record.normal.distanceKm) * 10) / 10 }} km /
                      {{ record.personalized.durationMin - record.normal.durationMin }} 分钟
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <button
                  class="rounded-xl bg-white/60 px-4 py-2 text-sm font-medium text-[var(--color-carbon)] transition-colors hover:bg-white backdrop-blur"
                  @click="goCompare()"
                >
                  重新对比
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
