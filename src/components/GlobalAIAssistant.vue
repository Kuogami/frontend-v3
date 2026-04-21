<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  MapPin,
  Calendar,
  Utensils,
  Maximize2,
  Plus,
  ChevronLeft,
  Trash2,
  MessageSquare,
} from 'lucide-vue-next'
import { useAIAssistant } from '../composables/useAIAssistant'

const route = useRoute()
const router = useRouter()

const {
  conversations,
  currentConversationId,
  currentMessages,
  inputMessage,
  isTyping,
  chatContainer,
  quickActions,
  sendMessage,
  handleQuickAction,
  createNewConversation,
  selectConversation,
  backToHistory,
  deleteConversation,
} = useAIAssistant()

const isOpen = ref(false)
const isMinimized = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const shouldShowFab = computed(() => ['/attractions', '/route'].includes(route.path))
const currentView = computed(() => (currentConversationId.value ? 'chat' : 'history'))

const togglePanel = () => {
  if (isMinimized.value) {
    isMinimized.value = false
    return
  }
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
  isMinimized.value = false
}

const goFullScreen = () => {
  closePanel()
  router.push('/ai-assistant')
}

const handleSend = () => {
  sendMessage()
}

const handleNewConversation = () => {
  createNewConversation()
}

const handleSelectConversation = (id: string) => {
  selectConversation(id)
}

const handleDeleteConversation = (e: Event, id: string) => {
  e.stopPropagation()
  deleteConversation(id)
}

const iconComponents: Record<string, typeof MapPin> = {
  MapPin,
  Calendar,
  Utensils,
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-75"
  >
    <button
      v-if="shouldShowFab && !isOpen"
      class="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00A3FF]/90 text-white shadow-lg shadow-sky-300/40 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-[#00A3FF]"
      @click="togglePanel"
    >
      <MessageCircle class="w-6 h-6 transition-transform group-hover:scale-110" />
      <span class="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-red-500 animate-pulse"></span>
    </button>
  </Transition>

  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="isOpen && !isMobile && !isMinimized"
      class="fixed top-20 right-6 bottom-6 z-50 flex w-[400px] flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-2xl shadow-sky-200/50 backdrop-blur-xl"
    >
      <template v-if="currentView === 'history'">
        <div class="flex items-center justify-between border-b border-sky-100/50 bg-gradient-to-r from-sky-50/50 to-white/50 p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 shadow-md shadow-sky-200">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-[var(--color-carbon)]">AI 旅行助手</h3>
              <p class="text-xs text-[var(--color-carbon-light)]">历史会话</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="rounded-lg p-2 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-100 hover:text-[#00A3FF]"
              title="全屏模式"
              @click="goFullScreen"
            >
              <Maximize2 class="w-4 h-4" />
            </button>
            <button
              class="rounded-lg p-2 text-[var(--color-carbon-light)] transition-colors hover:bg-red-50 hover:text-red-500"
              title="关闭"
              @click="closePanel"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="border-b border-sky-100/30 p-3">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00A3FF] to-sky-400 px-4 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-sky-200/50 active:scale-[0.98]"
            @click="handleNewConversation"
          >
            <Plus class="w-5 h-5" />
            <span>新建会话</span>
          </button>
        </div>

        <div class="flex-1 space-y-2 overflow-y-auto p-3">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            class="group cursor-pointer rounded-xl border border-sky-100/30 bg-white/50 p-3 transition-all hover:border-sky-200/50 hover:bg-sky-50/80"
            @click="handleSelectConversation(conv.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 flex-1 items-start gap-3">
                <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100">
                  <MessageSquare class="w-4 h-4 text-[#00A3FF]" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="truncate text-sm font-medium text-[var(--color-carbon)]">{{ conv.title }}</h4>
                  <p class="mt-0.5 truncate text-xs text-[var(--color-carbon-light)]">{{ conv.preview }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-xs text-[var(--color-carbon-light)]">{{ conv.lastTime }}</span>
                <button
                  class="rounded-lg p-1.5 text-[var(--color-carbon-light)] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  @click="(e) => handleDeleteConversation(e, conv.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="conversations.length === 0" class="py-12 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <MessageSquare class="w-8 h-8 text-[#00A3FF]/40" />
            </div>
            <p class="text-sm text-[var(--color-carbon-light)]">暂无历史会话</p>
            <p class="mt-1 text-xs text-[var(--color-carbon-light)]">点击上方按钮开始新对话</p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center justify-between border-b border-sky-100/50 bg-gradient-to-r from-sky-50/50 to-white/50 p-4">
          <div class="flex items-center gap-2">
            <button
              class="rounded-lg p-2 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-100 hover:text-[#00A3FF]"
              title="返回列表"
              @click="backToHistory"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00A3FF] to-sky-400 shadow-sm">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-[var(--color-carbon)]">AI 旅行助手</h3>
              <p class="flex items-center gap-1 text-xs text-[var(--color-carbon-light)]">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                在线
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="rounded-lg p-2 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-100 hover:text-[#00A3FF]"
              title="全屏模式"
              @click="goFullScreen"
            >
              <Maximize2 class="w-4 h-4" />
            </button>
            <button
              class="rounded-lg p-2 text-[var(--color-carbon-light)] transition-colors hover:bg-red-50 hover:text-red-500"
              title="关闭"
              @click="closePanel"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref="chatContainer" class="flex-1 space-y-4 overflow-y-auto p-4">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="['flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '']"
          >
            <div
              :class="[
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm',
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-[#00A3FF] to-sky-400'
                  : 'bg-gradient-to-br from-[var(--color-carbon)] to-slate-600',
              ]"
            >
              <Bot v-if="message.role === 'assistant'" class="w-4 h-4 text-white" />
              <User v-else class="w-4 h-4 text-white" />
            </div>
            <div
              :class="[
                'max-w-[78%] px-4 py-3 shadow-sm',
                message.role === 'assistant'
                  ? 'rounded-[4px_18px_18px_18px] bg-white/60 text-[var(--color-carbon)] backdrop-blur-sm'
                  : 'rounded-[18px_4px_18px_18px] bg-[#00A3FF] text-white',
              ]"
            >
              <p class="whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
              <p :class="['mt-2 text-xs opacity-70', message.role === 'assistant' ? 'text-[var(--color-carbon-light)]' : 'text-white/70']">
                {{ message.time }}
              </p>
            </div>
          </div>

          <div v-if="isTyping" class="flex gap-3">
            <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00A3FF] to-sky-400 shadow-sm">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div class="rounded-[4px_18px_18px_18px] bg-white/60 px-4 py-3 text-sm text-[var(--color-carbon-light)] shadow-sm backdrop-blur-sm">
              AI 正在思考...
            </div>
          </div>
        </div>

        <div class="border-t border-sky-100/50 bg-white/80 backdrop-blur-xl">
          <div class="scrollbar-hide flex items-center gap-2 overflow-x-auto border-b border-sky-50 px-4 py-3">
            <button
              v-for="action in quickActions"
              :key="action.label"
              class="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-100/50 bg-sky-50/80 px-3 py-2 text-xs font-medium text-[#00A3FF] transition-all hover:border-sky-200 hover:bg-sky-100"
              @click="handleQuickAction(action.prompt)"
            >
              <component :is="iconComponents[action.icon]" class="w-3.5 h-3.5" />
              <span>{{ action.label }}</span>
            </button>
          </div>

          <div class="flex items-center gap-2 p-4">
            <div class="relative flex-1">
              <input
                v-model="inputMessage"
                type="text"
                placeholder="输入您的问题..."
                class="w-full rounded-2xl bg-sky-50/60 px-4 py-3 text-[var(--color-carbon)] outline-none transition-all placeholder:text-[var(--color-carbon-light)]/50 focus:bg-white focus:ring-2 focus:ring-[#00A3FF]/20"
                @keyup.enter="handleSend"
              />
            </div>
            <button
              :disabled="!inputMessage.trim()"
              :class="[
                'flex-shrink-0 rounded-2xl p-3 transition-all',
                inputMessage.trim()
                  ? 'bg-gradient-to-r from-[#00A3FF] to-sky-400 text-white hover:shadow-lg hover:shadow-sky-200/50'
                  : 'cursor-not-allowed bg-sky-100 text-sky-300',
              ]"
              @click="handleSend"
            >
              <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </Transition>

  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <button
      v-if="isMinimized"
      class="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/50 bg-white/80 px-4 py-3 shadow-lg shadow-sky-200/50 backdrop-blur-xl transition-colors hover:bg-white"
      @click="togglePanel"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00A3FF] to-sky-400">
        <Bot class="w-4 h-4 text-white" />
      </div>
      <span class="text-sm font-medium text-[var(--color-carbon)]">AI 旅行助手</span>
    </button>
  </Transition>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
