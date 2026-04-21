<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mail, Phone, MapPin, Edit3, Settings, Shield, Bell, Check, X } from 'lucide-vue-next'
import { useUser } from '../composables/useUser'
import { apiGet, apiPost } from '../services/api'

const router = useRouter()

type UserProfileResponse = {
  name?: string
  avatar?: string
  tagJson?: string
  favoritesCount?: number
  ratingsCount?: number
}

const { userInfo, userInitial, refreshCurrentUser } = useUser()

const profile = ref({
  avatar: '',
  name: '旅行者',
  email: 'traveler@example.com',
  phone: '138****8888',
  location: '江苏省南京市',
  joinDate: '当前账号',
  bio: '热爱旅行，喜欢探索未知的风景和文化。',
})

const isEditing = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
})

const preferenceOptions = ref<string[]>([
  '历史文化',
  '自然风光',
  '美食探索',
  '城市地标',
  '亲子休闲',
])

const preferences = ref<string[]>([])

const avatarSrc = computed(() => profile.value.avatar || userInfo.value?.avatar || '')

const stats = ref([
  { label: '收藏景点', value: 0 },
  { label: '评分记录', value: 0 },
  { label: '偏好标签', value: 0 },
  { label: '账号状态', value: 0 },
])

const loadLocalExtras = () => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const u = JSON.parse(storedUserInfo) as { email?: string; avatar?: string }
      profile.value.email = u.email || profile.value.email
      profile.value.avatar = u.avatar || profile.value.avatar
    }
  } catch {
    // ignore
  }

  try {
    const storedProfile = localStorage.getItem('profileExtra')
    if (storedProfile) {
      const extra = JSON.parse(storedProfile) as Partial<typeof profile.value>
      profile.value = { ...profile.value, ...extra }
    }
  } catch {
    // ignore
  }
}

const parseTagJson = (tagJson?: string) => {
  if (!tagJson) return []
  try {
    const parsed = JSON.parse(tagJson)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

const loadProfile = async () => {
  const [me, profileData, tagOptions] = await Promise.all([
    refreshCurrentUser().catch(() => userInfo.value),
    apiGet<UserProfileResponse>('/api/user/profile'),
    apiGet<string[]>('/api/user/tag-options'),
  ])

  if (Array.isArray(tagOptions) && tagOptions.length > 0) {
    preferenceOptions.value = tagOptions
  }

  loadLocalExtras()

  profile.value.avatar = profileData.avatar || me?.avatar || profile.value.avatar
  profile.value.name = profileData.name || me?.name || profile.value.name
  profile.value.email = me?.email || profile.value.email

  preferences.value = parseTagJson(profileData.tagJson)

  stats.value = [
    { label: '收藏景点', value: profileData.favoritesCount || 0 },
    { label: '评分记录', value: profileData.ratingsCount || 0 },
    { label: '偏好标签', value: preferences.value.length },
    { label: '账号状态', value: me?.status ?? 1 },
  ]
}

const syncTagPreferences = async (nextTags: string[]) => {
  await apiPost<string>('/api/user/tags', { tags: nextTags })
  preferences.value = nextTags
  stats.value[2].value = nextTags.length
}

const startEdit = () => {
  isEditing.value = true
  form.value = {
    name: profile.value.name,
    email: profile.value.email,
    phone: profile.value.phone,
    location: profile.value.location,
    bio: profile.value.bio,
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveEdit = () => {
  profile.value = { ...profile.value, ...form.value }

  const nextUserInfo = {
    ...(userInfo.value || {}),
    name: profile.value.name || '旅行者',
    email: profile.value.email || 'traveler@example.com',
    avatar: avatarSrc.value || userInfo.value?.avatar || '',
  }

  localStorage.setItem('userInfo', JSON.stringify(nextUserInfo))
  localStorage.setItem('profileExtra', JSON.stringify({
    phone: profile.value.phone,
    location: profile.value.location,
    bio: profile.value.bio,
    email: profile.value.email,
  }))

  if (userInfo.value) {
    userInfo.value = { ...userInfo.value, ...nextUserInfo }
  }

  isEditing.value = false
}

const togglePreference = async (item: string) => {
  const next = preferences.value.includes(item)
    ? preferences.value.filter((current) => current !== item)
    : [...preferences.value, item]
  await syncTagPreferences(next)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadProfile().catch(() => {
    loadLocalExtras()
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50/80 to-white/90">
    <header class="sticky top-0 z-10 border-b border-sky-100/50 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-6">
      <div class="mx-auto flex max-w-4xl items-center gap-3">
        <button
          class="rounded-xl p-2 -ml-2 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-100 hover:text-[var(--color-carbon)]"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-carbon)]">个人中心</h1>
      </div>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <div class="rounded-3xl bg-white/60 p-6 shadow-[0_12px_40px_rgba(147,177,207,0.22)] backdrop-blur-xl">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#00A3FF] to-sky-400 text-2xl font-bold text-white shadow-lg shadow-sky-200/40">
              <img v-if="avatarSrc" :src="avatarSrc" alt="avatar" class="h-full w-full rounded-3xl object-cover" />
              <span v-else>{{ userInitial }}</span>
            </div>
            <div>
              <h2 class="text-2xl font-semibold text-[var(--color-carbon)]">{{ profile.name }}</h2>
              <p class="mt-1 text-sm text-[var(--color-carbon-light)]">{{ profile.bio }}</p>
            </div>
          </div>

          <button
            class="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-[var(--color-carbon)] shadow-sm transition-colors hover:bg-white"
            @click="startEdit"
          >
            <Edit3 class="w-4 h-4" />
            编辑资料
          </button>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-2xl bg-white/55 px-4 py-4 text-center backdrop-blur"
          >
            <p class="text-2xl font-bold text-[#00A3FF]">{{ stat.value }}</p>
            <p class="mt-1 text-sm text-[var(--color-carbon-light)]">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-3xl bg-white/60 p-6 shadow-[0_10px_34px_rgba(147,177,207,0.18)] backdrop-blur-xl">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[var(--color-carbon)]">基础信息</h3>
            <Settings class="w-5 h-5 text-[var(--color-carbon-light)]" />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <Mail class="w-4 h-4 text-[#00A3FF]" />
              <div>
                <p class="text-xs text-[var(--color-carbon-light)]">邮箱</p>
                <p class="text-sm text-[var(--color-carbon)]">{{ profile.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Phone class="w-4 h-4 text-[#00A3FF]" />
              <div>
                <p class="text-xs text-[var(--color-carbon-light)]">电话</p>
                <p class="text-sm text-[var(--color-carbon)]">{{ profile.phone }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <MapPin class="w-4 h-4 text-[#00A3FF]" />
              <div>
                <p class="text-xs text-[var(--color-carbon-light)]">所在地</p>
                <p class="text-sm text-[var(--color-carbon)]">{{ profile.location }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Shield class="w-4 h-4 text-[#00A3FF]" />
              <div>
                <p class="text-xs text-[var(--color-carbon-light)]">账号说明</p>
                <p class="text-sm text-[var(--color-carbon)]">{{ profile.joinDate }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-3xl bg-white/60 p-6 shadow-[0_10px_34px_rgba(147,177,207,0.18)] backdrop-blur-xl">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[var(--color-carbon)]">偏好标签</h3>
            <Bell class="w-5 h-5 text-[var(--color-carbon-light)]" />
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in preferenceOptions"
              :key="item"
              :class="[
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                preferences.includes(item)
                  ? 'bg-[#00A3FF] text-white shadow-sm shadow-sky-200'
                  : 'bg-white/70 text-[var(--color-carbon)] hover:bg-white',
              ]"
              @click="togglePreference(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4">
        <div class="w-full max-w-lg rounded-3xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[var(--color-carbon)]">编辑资料</h3>
            <button class="rounded-xl p-2 text-[var(--color-carbon-light)] hover:bg-slate-100" @click="cancelEdit">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-4">
            <input v-model="form.name" type="text" placeholder="姓名" class="w-full rounded-2xl bg-sky-50/70 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300" />
            <input v-model="form.email" type="email" placeholder="traveler@example.com" class="w-full rounded-2xl bg-sky-50/70 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300" />
            <input v-model="form.phone" type="text" placeholder="手机号" class="w-full rounded-2xl bg-sky-50/70 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300" />
            <input v-model="form.location" type="text" placeholder="所在地" class="w-full rounded-2xl bg-sky-50/70 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300" />
            <textarea v-model="form.bio" rows="4" placeholder="个人简介" class="w-full rounded-2xl bg-sky-50/70 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"></textarea>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button class="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[var(--color-carbon)] hover:bg-slate-50" @click="cancelEdit">
              取消
            </button>
            <button class="inline-flex items-center gap-2 rounded-2xl bg-[#00A3FF] px-4 py-3 text-sm font-medium text-white hover:bg-sky-500" @click="saveEdit">
              <Check class="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
