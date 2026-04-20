<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Utensils,
  Maximize2,
  Minus,
  Plus,
  ChevronLeft,
  Trash2,
  MessageSquare
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

// 面板状态
const isOpen = ref(false)
const isMinimized = ref(false)

// 响应式检测
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

// 仅在景点浏览和路线规划页面显示悬浮按钮
const shouldShowFab = computed(() => {
  const allowedPaths = ['/attractions', '/route']
  return allowedPaths.includes(route.path)
})

// 当前视图：history | chat
const currentView = computed(() => {
  return currentConversationId.value ? 'chat' : 'history'
})

// 切换面板
const togglePanel = () => {
  if (isMinimized.value) {
    isMinimized.value = false
  } else {
    isOpen.value = !isOpen.value
  }
}

// 关闭面板
const closePanel = () => {
  isOpen.value = false
  isMinimized.value = false
}

// 最小化面板
const minimizePanel = () => {
  isMinimized.value = true
}

// 跳转全屏页面
const goFullScreen = () => {
  closePanel()
  router.push('/ai-assistant')
}

// 处理发送消息
const handleSend = () => {
  sendMessage()
}

// 处理新建会话
const handleNewConversation = () => {
  createNewConversation()
}

// 处理选择会话
const handleSelectConversation = (id: string) => {
  selectConversation(id)
}

// 处理删除会话
const handleDeleteConversation = (e: Event, id: string) => {
  e.stopPropagation()
  deleteConversation(id)
}

// 图标组件映射
const iconComponents: Record<string, typeof MapPin> = {
  MapPin,
  Calendar,
  Utensils,
}
</script>

<template>
  <!-- 悬浮按钮 -->
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
      @click="togglePanel"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#00A3FF]/90 backdrop-blur-xl text-white shadow-lg shadow-sky-300/40 hover:bg-[#00A3FF] hover:scale-110 transition-all duration-300 flex items-center justify-center group"
    >
      <MessageCircle class="w-6 h-6 group-hover:scale-110 transition-transform" />
      <!-- 未读消息提示点 -->
      <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
    </button>
  </Transition>

  <!-- PC端侧边面板 -->
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
      class="fixed top-20 right-6 bottom-6 w-[400px] z-50 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-sky-200/50 border border-white/50 flex flex-col overflow-hidden"
    >
      <!-- 历史列表视图 -->
      <template v-if="currentView === 'history'">
        <!-- 面板头部 -->
        <div class="p-4 border-b border-sky-100/50 flex items-center justify-between bg-gradient-to-r from-sky-50/50 to-white/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-md shadow-sky-200">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-[var(--color-carbon)]">AI 旅行助手</h3>
              <p class="text-xs text-[var(--color-carbon-light)]">历史会话</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="goFullScreen"
              class="p-2 rounded-lg hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
              title="全屏模式"
            >
              <Maximize2 class="w-4 h-4" />
            </button>
            <button
              @click="closePanel"
              class="p-2 rounded-lg hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-colors"
              title="关闭"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 新建会话按钮 -->
        <div class="p-3 border-b border-sky-100/30">
          <button
            @click="handleNewConversation"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00A3FF] to-sky-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200/50 transition-all active:scale-[0.98]"
          >
            <Plus class="w-5 h-5" />
            <span>新建会话</span>
          </button>
        </div>

        <!-- 会话列表 -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            @click="handleSelectConversation(conv.id)"
            class="group p-3 bg-white/50 hover:bg-sky-50/80 border border-sky-100/30 hover:border-sky-200/50 rounded-xl cursor-pointer transition-all"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare class="w-4 h-4 text-[#00A3FF]" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-[var(--color-carbon)] text-sm truncate">{{ conv.title }}</h4>
                  <p class="text-xs text-[var(--color-carbon-light)] mt-0.5 truncate">{{ conv.preview }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-xs text-[var(--color-carbon-light)]">{{ conv.lastTime }}</span>
                <button
                  @click="(e) => handleDeleteConversation(e, conv.id)"
                  class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-all"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="conversations.length === 0" class="py-12 text-center">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <MessageSquare class="w-8 h-8 text-[#00A3FF]/40" />
            </div>
            <p class="text-[var(--color-carbon-light)] text-sm">暂无历史会话</p>
            <p class="text-[var(--color-carbon-light)] text-xs mt-1">点击上方按钮开始新对话</p>
          </div>
        </div>
      </template>

      <!-- 聊天视图 -->
      <template v-else>
        <!-- 面板头部 - 带返回按钮 -->
        <div class="p-4 border-b border-sky-100/50 flex items-center justify-between bg-gradient-to-r from-sky-50/50 to-white/50">
          <div class="flex items-center gap-2">
            <button
              @click="backToHistory"
              class="p-2 -ml-1 rounded-lg hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
              title="返回列表"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-sm">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-[var(--color-carbon)] text-sm">AI 旅行助手</h3>
              <p class="text-xs text-[var(--color-carbon-light)] flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                在线
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="goFullScreen"
              class="p-2 rounded-lg hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
              title="全屏模式"
            >
              <Maximize2 class="w-4 h-4" />
            </button>
            <button
              @click="minimizePanel"
              class="p-2 rounded-lg hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
              title="最小化"
            >
              <Minus class="w-4 h-4" />
            </button>
            <button
              @click="closePanel"
              class="p-2 rounded-lg hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-colors"
              title="关闭"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 消息区域 -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="[
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : ''
            ]"
          >
            <div
              :class="[
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-[#00A3FF] to-sky-400' 
                  : 'bg-[var(--color-carbon)]'
              ]"
            >
              <Bot v-if="message.role === 'assistant'" class="w-4 h-4 text-white" />
              <User v-else class="w-4 h-4 text-white" />
            </div>
            <div
              :class="[
                'max-w-[75%] px-3.5 py-2.5 text-sm shadow-sm',
                message.role === 'assistant' 
                  ? 'bg-white/60 backdrop-blur-sm text-[var(--color-carbon)] rounded-[4px_16px_16px_16px]' 
                  : 'bg-[#00A3FF] text-white rounded-[16px_4px_16px_16px]'
              ]"
            >
              <p class="whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
              <p 
                :class="[
                  'text-xs mt-1.5',
                  message.role === 'assistant' ? 'text-[var(--color-carbon-light)]' : 'text-white/70'
                ]"
              >
                {{ message.time }}
              </p>
            </div>
          </div>

          <!-- 输入中提示 -->
          <div v-if="isTyping" class="flex gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center flex-shrink-0">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div class="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-[4px_16px_16px_16px] shadow-sm">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce shadow-[0_0_6px_rgba(0,163,255,0.6)]" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce shadow-[0_0_6px_rgba(0,163,255,0.6)]" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce shadow-[0_0_6px_rgba(0,163,255,0.6)]" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="px-4 py-2 border-t border-sky-100/50 flex items-center gap-2 bg-white/50">
          <Sparkles class="w-4 h-4 text-[#00A3FF] flex-shrink-0" />
          <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              v-for="action in quickActions"
              :key="action.label"
              @click="handleQuickAction(action.prompt)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-[#00A3FF] text-xs font-medium rounded-full hover:bg-sky-100 transition-colors whitespace-nowrap"
            >
              <component :is="iconComponents[action.icon]" class="w-3 h-3" />
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="p-4 border-t border-sky-100/50 bg-white/50">
          <div class="flex items-center gap-3">
            <input
              v-model="inputMessage"
              @keyup.enter="handleSend"
              type="text"
              placeholder="输入您的问题..."
              class="flex-1 px-4 py-2.5 bg-sky-50/60 rounded-xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/60 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 transition-all text-sm"
            />
            <button
              @click="handleSend"
              :disabled="!inputMessage.trim()"
              :class="[
                'p-2.5 rounded-xl transition-all',
                inputMessage.trim() 
                  ? 'bg-[#00A3FF] text-white hover:bg-[#00A3FF]/90 shadow-md shadow-sky-200' 
                  : 'bg-sky-100 text-sky-300 cursor-not-allowed'
              ]"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </Transition>

  <!-- 最小化状态的悬浮气泡 -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <button
      v-if="isMinimized && !isMobile"
      @click="isMinimized = false"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-white/80 backdrop-blur-xl shadow-lg shadow-sky-200/50 border border-white/50 flex items-center gap-3 hover:bg-white transition-colors group"
    >
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center">
        <Bot class="w-4 h-4 text-white" />
      </div>
      <span class="text-sm font-medium text-[var(--color-carbon)]">继续对话</span>
      <X 
        @click.stop="closePanel"
        class="w-4 h-4 text-[var(--color-carbon-light)] hover:text-red-500 transition-colors"
      />
    </button>
  </Transition>

  <!-- 移动端底部抽屉 -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="translate-y-full"
  >
    <div
      v-if="isOpen && isMobile"
      class="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl shadow-sky-200/50 flex flex-col overflow-hidden"
    >
      <!-- 拖动把手 -->
      <div class="flex justify-center py-3">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <!-- 历史列表视图 - 移动端 -->
      <template v-if="currentView === 'history'">
        <!-- 头部 -->
        <div class="px-5 pb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-md shadow-sky-200">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-[var(--color-carbon)]">AI 旅行助手</h3>
              <p class="text-xs text-[var(--color-carbon-light)]">选择或新建会话</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goFullScreen"
              class="p-2 rounded-lg hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
            >
              <Maximize2 class="w-5 h-5" />
            </button>
            <button
              @click="closePanel"
              class="p-2 rounded-lg hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 新建会话按钮 -->
        <div class="px-5 pb-4">
          <button
            @click="handleNewConversation"
            class="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#00A3FF] to-sky-400 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-sky-200/50 transition-all active:scale-[0.98]"
          >
            <Plus class="w-5 h-5" />
            <span>新建会话</span>
          </button>
        </div>

        <!-- 会话列表 -->
        <div class="flex-1 overflow-y-auto px-5 space-y-3 pb-safe">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            @click="handleSelectConversation(conv.id)"
            class="group p-4 bg-white/60 hover:bg-sky-50/80 border border-sky-100/30 hover:border-sky-200/50 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare class="w-5 h-5 text-[#00A3FF]" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-[var(--color-carbon)] truncate">{{ conv.title }}</h4>
                  <p class="text-sm text-[var(--color-carbon-light)] mt-1 truncate">{{ conv.preview }}</p>
                </div>
              </div>
              <span class="text-xs text-[var(--color-carbon-light)] flex-shrink-0">{{ conv.lastTime }}</span>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="conversations.length === 0" class="py-16 text-center">
            <div class="w-20 h-20 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <MessageSquare class="w-10 h-10 text-[#00A3FF]/40" />
            </div>
            <p class="text-[var(--color-carbon-light)]">暂无历史会话</p>
            <p class="text-[var(--color-carbon-light)] text-sm mt-1">点击上方按钮开始新对话</p>
          </div>
        </div>
      </template>

      <!-- 聊天视图 - 移动端 -->
      <template v-else>
        <!-- 头部 - 带返回按钮 -->
        <div class="px-4 pb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              @click="backToHistory"
              class="p-2 -ml-1 rounded-lg hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
            >
              <ChevronLeft class="w-6 h-6" />
            </button>
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-sm">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-[var(--color-carbon)]">AI 旅行助手</h3>
              <p class="text-xs text-[var(--color-carbon-light)] flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                在线
              </p>
            </div>
          </div>
          <button
            @click="closePanel"
            class="p-2 rounded-lg hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 消息区域 -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto px-5 space-y-4">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="[
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : ''
            ]"
          >
            <div
              :class="[
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-[#00A3FF] to-sky-400' 
                  : 'bg-[var(--color-carbon)]'
              ]"
            >
              <Bot v-if="message.role === 'assistant'" class="w-4 h-4 text-white" />
              <User v-else class="w-4 h-4 text-white" />
            </div>
            <div
              :class="[
                'max-w-[80%] px-3.5 py-2.5 text-sm shadow-sm',
                message.role === 'assistant' 
                  ? 'bg-white/60 backdrop-blur-sm text-[var(--color-carbon)] rounded-[4px_16px_16px_16px]' 
                  : 'bg-[#00A3FF] text-white rounded-[16px_4px_16px_16px]'
              ]"
            >
              <p class="whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
              <p 
                :class="[
                  'text-xs mt-1.5',
                  message.role === 'assistant' ? 'text-[var(--color-carbon-light)]' : 'text-white/70'
                ]"
              >
                {{ message.time }}
              </p>
            </div>
          </div>

          <!-- 输入中提示 -->
          <div v-if="isTyping" class="flex gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center flex-shrink-0">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div class="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-[4px_16px_16px_16px] shadow-sm">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce shadow-[0_0_6px_rgba(0,163,255,0.6)]" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce shadow-[0_0_6px_rgba(0,163,255,0.6)]" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce shadow-[0_0_6px_rgba(0,163,255,0.6)]" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="px-5 py-3 border-t border-sky-100/50 flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-[#00A3FF] flex-shrink-0" />
          <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              v-for="action in quickActions"
              :key="action.label"
              @click="handleQuickAction(action.prompt)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-[#00A3FF] text-xs font-medium rounded-full hover:bg-sky-100 transition-colors whitespace-nowrap"
            >
              <component :is="iconComponents[action.icon]" class="w-3 h-3" />
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="p-4 border-t border-sky-100/50 pb-safe">
          <div class="flex items-center gap-3">
            <input
              v-model="inputMessage"
              @keyup.enter="handleSend"
              type="text"
              placeholder="输入您的问题..."
              class="flex-1 px-4 py-3 bg-sky-50/60 rounded-xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/60 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 transition-all"
            />
            <button
              @click="handleSend"
              :disabled="!inputMessage.trim()"
              :class="[
                'p-3 rounded-xl transition-all',
                inputMessage.trim() 
                  ? 'bg-[#00A3FF] text-white hover:bg-[#00A3FF]/90 shadow-md shadow-sky-200' 
                  : 'bg-sky-100 text-sky-300 cursor-not-allowed'
              ]"
            >
              <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </Transition>

  <!-- 移动端遮罩层 -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen && isMobile"
      @click="closePanel"
      class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
    ></div>
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

.pb-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
