<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bot,
  Send,
  User,
  Trash2,
  Image,
  Mic,
  Navigation,
  Car,
  Utensils,
  Calendar,
  MapPin,
  Cloud,
  Ticket,
  Hotel,
  Plus,
  ChevronLeft,
  MessageSquare,
  Clock,
} from 'lucide-vue-next'
import { useAIAssistant } from '../composables/useAIAssistant'

const router = useRouter()

const {
  conversations,
  currentConversationId,
  currentMessages,
  inputMessage,
  isTyping,
  chatContainer,
  sendMessage,
  handleQuickAction,
  clearMessages,
  scrollToBottom,
  createNewConversation,
  selectConversation,
  backToHistory,
  deleteConversation,
} = useAIAssistant()

const quickCommands = ref([
  { emoji: '📅', label: '规划三日游', prompt: '帮我规划一个三日游行程', icon: Calendar },
  { emoji: '🍜', label: '找南京美食', prompt: '推荐南京特色美食和餐厅', icon: Utensils },
  { emoji: '🚗', label: '交通建议', prompt: '请给我一些出行交通建议', icon: Car },
  { emoji: '🎯', label: '热门景点', prompt: '推荐当前热门景点', icon: MapPin },
  { emoji: '🌤️', label: '天气查询', prompt: '查询旅行目的地天气', icon: Cloud },
  { emoji: '🎫', label: '门票攻略', prompt: '如何购买景点门票最划算', icon: Ticket },
  { emoji: '🏨', label: '住宿推荐', prompt: '推荐性价比高的住宿', icon: Hotel },
  { emoji: '📍', label: '导航帮助', prompt: '帮我规划最佳路线', icon: Navigation },
])

const currentView = computed(() => (currentConversationId.value ? 'chat' : 'history'))

onMounted(() => {
  scrollToBottom()
})

watch(currentConversationId, () => {
  scrollToBottom()
})

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

const goBack = () => {
  if (currentConversationId.value) {
    backToHistory()
    return
  }

  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/ai-assistant')
}

const handleImageUpload = () => {
  window.alert('图片上传功能尚未接入。')
}

const handleVoiceInput = () => {
  window.alert('语音输入功能尚未接入。')
}
</script>

<template>
  <div class="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-b from-sky-50/80 to-white/90">
    <button
      v-if="currentView === 'chat'"
      @click="goBack"
      class="fixed top-24 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/55 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg shadow-sky-100/40 backdrop-blur-xl transition-all duration-200 hover:-translate-x-0.5 hover:scale-[1.02] hover:bg-white/75 md:left-6"
    >
      <ChevronLeft class="w-4 h-4" />
      <span>返回</span>
    </button>

    <template v-if="currentView === 'history'">
      <header class="safe-area-top flex-shrink-0 border-b border-sky-100/50 bg-white/70 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
        <div class="mx-auto flex max-w-4xl items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00A3FF] to-sky-400 shadow-lg shadow-sky-200/50 md:h-12 md:w-12">
              <Bot class="w-5 h-5 text-white md:w-6 md:h-6" />
            </div>
            <div>
              <h1 class="text-base font-semibold text-[var(--color-carbon)] md:text-lg">AI 旅行助手</h1>
              <p class="text-xs text-[var(--color-carbon-light)] md:text-sm">您的智能旅行伙伴</p>
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
          <button
            @click="handleNewConversation"
            class="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#00A3FF] to-sky-400 px-6 py-4 text-base font-medium text-white transition-all hover:shadow-xl hover:shadow-sky-200/50 active:scale-[0.98] md:mb-8 md:py-5 md:text-lg"
          >
            <Plus class="w-5 h-5 md:w-6 md:h-6" />
            <span>新建会话</span>
          </button>

          <div class="space-y-3 md:space-y-4">
            <h2 class="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--color-carbon-light)]">
              <Clock class="w-4 h-4" />
              历史会话
            </h2>

            <div
              v-for="conv in conversations"
              :key="conv.id"
              class="group cursor-pointer rounded-2xl border border-sky-100/30 bg-white/60 p-4 backdrop-blur-sm transition-all hover:border-sky-200/50 hover:bg-white/80 hover:shadow-lg hover:shadow-sky-100/50 active:scale-[0.99] md:p-5"
              @click="handleSelectConversation(conv.id)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 flex-1 items-start gap-4">
                  <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-sky-100/50 bg-sky-50">
                    <MessageSquare class="w-5 h-5 text-[#00A3FF]" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-base font-medium text-[var(--color-carbon)]">{{ conv.title }}</h3>
                    <p class="mt-1.5 truncate text-sm text-[var(--color-carbon-light)]">{{ conv.preview }}</p>
                    <p class="mt-2 text-xs text-[var(--color-carbon-light)]/70">{{ conv.lastTime }}</p>
                  </div>
                </div>
                <button
                  class="flex-shrink-0 rounded-xl p-2 text-[var(--color-carbon-light)] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  @click="(e) => handleDeleteConversation(e, conv.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="conversations.length === 0" class="py-16 text-center">
              <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-50">
                <MessageSquare class="w-12 h-12 text-[#00A3FF]/30" />
              </div>
              <p class="text-lg font-medium text-[var(--color-carbon)]">暂无历史会话</p>
              <p class="mt-2 text-[var(--color-carbon-light)]">点击上方按钮开始您的第一次对话</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <header class="safe-area-top flex-shrink-0 border-b border-sky-100/50 bg-white/70 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
        <div class="mx-auto flex max-w-3xl items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              class="rounded-xl p-2 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-100 hover:text-[#00A3FF]"
              title="返回列表"
              @click="backToHistory"
            >
              <ChevronLeft class="w-6 h-6" />
            </button>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 shadow-md shadow-sky-200/50 md:h-11 md:w-11">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="text-sm font-semibold text-[var(--color-carbon)] md:text-base">AI 旅行助手</h1>
              <p class="flex items-center gap-1.5 text-xs text-[var(--color-carbon-light)]">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse md:h-2 md:w-2"></span>
                在线
              </p>
            </div>
          </div>
          <button
            class="rounded-xl p-2.5 text-[var(--color-carbon-light)] transition-colors hover:bg-red-50 hover:text-red-500"
            title="清空对话"
            @click="clearMessages"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </header>

      <div ref="chatContainer" class="scroll-smooth flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
        <div class="mx-auto max-w-3xl space-y-4 md:space-y-5">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="['flex gap-2.5 md:gap-3', message.role === 'user' ? 'flex-row-reverse' : '']"
          >
            <div
              :class="[
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-sm md:h-9 md:w-9 md:rounded-2xl',
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
                'max-w-[85%] px-4 py-3 shadow-sm md:max-w-[75%]',
                message.role === 'assistant'
                  ? 'rounded-[4px_20px_20px_20px] bg-white/60 text-[var(--color-carbon)] backdrop-blur-sm'
                  : 'rounded-[20px_4px_20px_20px] bg-[#00A3FF] text-white',
              ]"
            >
              <p class="whitespace-pre-wrap text-sm leading-relaxed md:text-[15px]">{{ message.content }}</p>
              <p
                :class="[
                  'mt-2 text-[10px] opacity-70 md:text-xs',
                  message.role === 'assistant' ? 'text-[var(--color-carbon-light)]' : 'text-white/80',
                ]"
              >
                {{ message.time }}
              </p>
            </div>
          </div>

          <div v-if="isTyping" class="flex gap-2.5 md:gap-3">
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 shadow-sm md:h-9 md:w-9 md:rounded-2xl">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div class="rounded-[4px_20px_20px_20px] bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm">
              <div class="flex items-center gap-2">
                <div class="thinking-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="ml-1 text-xs text-[var(--color-carbon-light)]">思考中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom flex-shrink-0 border-t border-sky-100/50 bg-white/80 backdrop-blur-xl">
        <div class="border-b border-sky-50 px-4 py-3">
          <div class="mx-auto max-w-3xl">
            <div class="scrollbar-hide -mb-1 flex items-center gap-2 overflow-x-auto pb-1">
              <button
                v-for="cmd in quickCommands"
                :key="cmd.label"
                class="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-100/50 bg-sky-50/80 px-3 py-2 text-xs font-medium text-[#00A3FF] transition-all hover:border-sky-200 hover:bg-sky-100 hover:shadow-sm active:scale-95 md:text-sm"
                @click="handleQuickAction(cmd.prompt)"
              >
                <span class="text-sm">{{ cmd.emoji }}</span>
                <span>{{ cmd.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="px-4 py-3 md:py-4">
          <div class="mx-auto flex max-w-3xl items-center gap-2 md:gap-3">
            <div class="flex items-center gap-1">
              <button
                class="rounded-xl p-2.5 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-50 hover:text-[#00A3FF]"
                title="上传图片"
                @click="handleImageUpload"
              >
                <Image class="w-5 h-5" />
              </button>
              <button
                class="rounded-xl p-2.5 text-[var(--color-carbon-light)] transition-colors hover:bg-sky-50 hover:text-[#00A3FF]"
                title="语音输入"
                @click="handleVoiceInput"
              >
                <Mic class="w-5 h-5" />
              </button>
            </div>

            <div class="relative flex-1">
              <input
                v-model="inputMessage"
                type="text"
                placeholder="输入您的问题..."
                class="w-full rounded-2xl bg-sky-50/60 px-4 py-3 text-sm text-[var(--color-carbon)] outline-none transition-all placeholder:text-[var(--color-carbon-light)]/50 focus:bg-white focus:ring-2 focus:ring-[#00A3FF]/20 md:py-3.5 md:text-base"
                @keyup.enter="handleSend"
              />
            </div>

            <button
              :disabled="!inputMessage.trim()"
              :class="[
                'flex-shrink-0 rounded-2xl p-3 transition-all md:p-3.5',
                inputMessage.trim()
                  ? 'bg-gradient-to-r from-[#00A3FF] to-sky-400 text-white hover:shadow-lg hover:shadow-sky-200/50 active:scale-95'
                  : 'cursor-not-allowed bg-sky-100 text-sky-300',
              ]"
              @click="handleSend"
            >
              <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.safe-area-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(0rem, env(safe-area-inset-bottom));
}

.thinking-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 20px;
}

.thinking-wave span {
  width: 4px;
  height: 4px;
  background: linear-gradient(180deg, #00A3FF 0%, #00D4FF 100%);
  border-radius: 50%;
  animation: wave 1.2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(0, 163, 255, 0.5);
}

.thinking-wave span:nth-child(1) { animation-delay: 0s; }
.thinking-wave span:nth-child(2) { animation-delay: 0.1s; }
.thinking-wave span:nth-child(3) { animation-delay: 0.2s; }
.thinking-wave span:nth-child(4) { animation-delay: 0.3s; }
.thinking-wave span:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% {
    transform: scaleY(1);
    opacity: 0.5;
  }

  50% {
    transform: scaleY(2.5);
    opacity: 1;
    box-shadow: 0 0 12px rgba(0, 163, 255, 0.8);
  }
}

.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
