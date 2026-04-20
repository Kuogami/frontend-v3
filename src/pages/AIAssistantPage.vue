<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
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
  Clock
} from 'lucide-vue-next'
import { useAIAssistant } from '../composables/useAIAssistant'

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

// 功能引导快捷指令
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

// 当前视图
const currentView = computed(() => {
  return currentConversationId.value ? 'chat' : 'history'
})

onMounted(() => {
  scrollToBottom()
})

// 监听视图切换，滚动到底部
watch(currentConversationId, () => {
  scrollToBottom()
})

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

// 多模态功能占位
const handleImageUpload = () => {
  console.log('图片上传功能开发中...')
}

const handleVoiceInput = () => {
  console.log('语音输入功能开发中...')
}
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-gradient-to-b from-sky-50/80 to-white/90 overflow-hidden">
    <!-- 历史列表视图 -->
    <template v-if="currentView === 'history'">
      <!-- 顶部导航栏 -->
      <header class="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 backdrop-blur-xl bg-white/70 border-b border-sky-100/50 safe-area-top">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-lg shadow-sky-200/50">
              <Bot class="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 class="font-semibold text-[var(--color-carbon)] text-base md:text-lg">AI 旅行助手</h1>
              <p class="text-xs md:text-sm text-[var(--color-carbon-light)]">您的智能旅行伙伴</p>
            </div>
          </div>
        </div>
      </header>

      <!-- 主内容区 -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
          <!-- 新建会话按钮 -->
          <button
            @click="handleNewConversation"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 md:py-5 bg-gradient-to-r from-[#00A3FF] to-sky-400 text-white font-medium text-base md:text-lg rounded-2xl hover:shadow-xl hover:shadow-sky-200/50 transition-all active:scale-[0.98] mb-6 md:mb-8"
          >
            <Plus class="w-5 h-5 md:w-6 md:h-6" />
            <span>新建会话</span>
          </button>

          <!-- 历史会话列表 -->
          <div class="space-y-3 md:space-y-4">
            <h2 class="text-sm font-medium text-[var(--color-carbon-light)] flex items-center gap-2 mb-4">
              <Clock class="w-4 h-4" />
              历史会话
            </h2>
            
            <div
              v-for="conv in conversations"
              :key="conv.id"
              @click="handleSelectConversation(conv.id)"
              class="group p-4 md:p-5 bg-white/60 backdrop-blur-sm hover:bg-white/80 border border-sky-100/30 hover:border-sky-200/50 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-sky-100/50 active:scale-[0.99]"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-4 flex-1 min-w-0">
                  <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 border border-sky-100/50">
                    <MessageSquare class="w-5 h-5 text-[#00A3FF]" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-[var(--color-carbon)] text-base truncate">{{ conv.title }}</h3>
                    <p class="text-sm text-[var(--color-carbon-light)] mt-1.5 truncate">{{ conv.preview }}</p>
                    <p class="text-xs text-[var(--color-carbon-light)]/70 mt-2">{{ conv.lastTime }}</p>
                  </div>
                </div>
                <button
                  @click="(e) => handleDeleteConversation(e, conv.id)"
                  class="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-all flex-shrink-0"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="conversations.length === 0" class="py-16 text-center">
              <div class="w-24 h-24 mx-auto rounded-3xl bg-sky-50 flex items-center justify-center mb-6">
                <MessageSquare class="w-12 h-12 text-[#00A3FF]/30" />
              </div>
              <p class="text-[var(--color-carbon)] font-medium text-lg">暂无历史会话</p>
              <p class="text-[var(--color-carbon-light)] mt-2">点击上方按钮开始您的第一次对话</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 聊天视图 -->
    <template v-else>
      <!-- 顶部导航栏 -->
      <header class="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 backdrop-blur-xl bg-white/70 border-b border-sky-100/50 safe-area-top">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              @click="backToHistory"
              class="p-2 -ml-1 rounded-xl hover:bg-sky-100 text-[var(--color-carbon-light)] hover:text-[#00A3FF] transition-colors"
              title="返回列表"
            >
              <ChevronLeft class="w-6 h-6" />
            </button>
            <div class="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-md shadow-sky-200/50">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="font-semibold text-[var(--color-carbon)] text-sm md:text-base">AI 旅行助手</h1>
              <p class="text-xs text-[var(--color-carbon-light)] flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                在线
              </p>
            </div>
          </div>
          <button
            @click="clearMessages"
            class="p-2.5 rounded-xl hover:bg-red-50 text-[var(--color-carbon-light)] hover:text-red-500 transition-colors"
            title="清空对话"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <!-- 消息区域 -->
      <div 
        ref="chatContainer" 
        class="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 scroll-smooth"
      >
        <div class="max-w-3xl mx-auto space-y-4 md:space-y-5">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="[
              'flex gap-2.5 md:gap-3',
              message.role === 'user' ? 'flex-row-reverse' : ''
            ]"
          >
            <!-- 头像 -->
            <div
              :class="[
                'w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm',
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-[#00A3FF] to-sky-400' 
                  : 'bg-gradient-to-br from-[var(--color-carbon)] to-slate-600'
              ]"
            >
              <Bot v-if="message.role === 'assistant'" class="w-4 h-4 text-white" />
              <User v-else class="w-4 h-4 text-white" />
            </div>
            
            <!-- Apple 风格非对称圆角气泡 -->
            <div
              :class="[
                'max-w-[85%] md:max-w-[75%] px-4 py-3 shadow-sm',
                message.role === 'assistant' 
                  ? 'bg-white/60 backdrop-blur-sm text-[var(--color-carbon)] rounded-[4px_20px_20px_20px]' 
                  : 'bg-[#00A3FF] text-white rounded-[20px_4px_20px_20px]'
              ]"
            >
              <p class="text-sm md:text-[15px] whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
              <p 
                :class="[
                  'text-[10px] md:text-xs mt-2 opacity-70',
                  message.role === 'assistant' ? 'text-[var(--color-carbon-light)]' : 'text-white/80'
                ]"
              >
                {{ message.time }}
              </p>
            </div>
          </div>

          <!-- 天蓝色光感波动"思考中"动画 -->
          <div v-if="isTyping" class="flex gap-2.5 md:gap-3">
            <div class="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div class="bg-white/60 backdrop-blur-sm px-5 py-4 rounded-[4px_20px_20px_20px] shadow-sm">
              <div class="flex items-center gap-2">
                <div class="thinking-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="text-xs text-[var(--color-carbon-light)] ml-1">思考中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部输入区域 -->
      <div class="flex-shrink-0 border-t border-sky-100/50 bg-white/80 backdrop-blur-xl safe-area-bottom">
        <!-- 功能引导快捷指令横向滚动区 -->
        <div class="px-4 py-3 border-b border-sky-50">
          <div class="max-w-3xl mx-auto">
            <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              <button
                v-for="cmd in quickCommands"
                :key="cmd.label"
                @click="handleQuickAction(cmd.prompt)"
                class="flex items-center gap-1.5 px-3 py-2 bg-sky-50/80 hover:bg-sky-100 text-[#00A3FF] text-xs md:text-sm font-medium rounded-full transition-all whitespace-nowrap flex-shrink-0 border border-sky-100/50 hover:border-sky-200 hover:shadow-sm active:scale-95"
              >
                <span class="text-sm">{{ cmd.emoji }}</span>
                <span>{{ cmd.label }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 输入框区域 -->
        <div class="px-4 py-3 md:py-4">
          <div class="max-w-3xl mx-auto flex items-center gap-2 md:gap-3">
            <!-- 多模态按钮组 -->
            <div class="flex items-center gap-1">
              <button
                @click="handleImageUpload"
                class="p-2.5 rounded-xl text-[var(--color-carbon-light)] hover:text-[#00A3FF] hover:bg-sky-50 transition-colors"
                title="上传图片"
              >
                <Image class="w-5 h-5" />
              </button>
              <button
                @click="handleVoiceInput"
                class="p-2.5 rounded-xl text-[var(--color-carbon-light)] hover:text-[#00A3FF] hover:bg-sky-50 transition-colors"
                title="语音输入"
              >
                <Mic class="w-5 h-5" />
              </button>
            </div>
            
            <!-- 输入框 -->
            <div class="flex-1 relative">
              <input
                v-model="inputMessage"
                @keyup.enter="handleSend"
                type="text"
                placeholder="输入您的问题..."
                class="w-full px-4 py-3 md:py-3.5 bg-sky-50/60 rounded-2xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/50 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 focus:bg-white transition-all text-sm md:text-base"
              />
            </div>
            
            <!-- 发送按钮 -->
            <button
              @click="handleSend"
              :disabled="!inputMessage.trim()"
              :class="[
                'p-3 md:p-3.5 rounded-2xl transition-all flex-shrink-0',
                inputMessage.trim() 
                  ? 'bg-gradient-to-r from-[#00A3FF] to-sky-400 text-white hover:shadow-lg hover:shadow-sky-200/50 active:scale-95' 
                  : 'bg-sky-100 text-sky-300 cursor-not-allowed'
              ]"
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
/* 隐藏滚动条 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 安全区域适配 */
.safe-area-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}
.safe-area-bottom {
  padding-bottom: max(0rem, env(safe-area-inset-bottom));
}

/* 天蓝色光感波动动画 */
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

/* 平滑滚动 */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
