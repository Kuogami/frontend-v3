import { computed, nextTick, ref, watch } from 'vue'
import { apiPost } from '../services/api'

export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  lastTime: string
  messages: Message[]
  createdAt: Date
}

type AiChatRequestMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AiChatResponse = {
  answer: string
  model?: string
}

const STORAGE_KEY = 'aiAssistantConversations'
const CURRENT_ID_KEY = 'aiAssistantCurrentConversationId'

const nowTime = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

const formatRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) return '刚刚'
  if (diff < day) return '今天'
  if (diff < day * 2) return '昨天'
  return date.toLocaleDateString('zh-CN')
}

const assistantGreeting = () => '您好，我是 AI 旅行助手。我可以帮您规划路线、推荐景点美食、解释页面功能，也可以结合当前页面给出操作建议。'

const parseStoredConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Array<Omit<Conversation, 'createdAt'> & { createdAt: string }>
    return parsed.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }))
  } catch {
    return []
  }
}

const conversations = ref<Conversation[]>(parseStoredConversations())
const currentConversationId = ref<string | null>(
  typeof window === 'undefined' ? null : localStorage.getItem(CURRENT_ID_KEY),
)
const inputMessage = ref('')
const isTyping = ref(false)

if (conversations.value.length === 0) {
  conversations.value = []
}

const persistState = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
  if (currentConversationId.value) {
    localStorage.setItem(CURRENT_ID_KEY, currentConversationId.value)
  } else {
    localStorage.removeItem(CURRENT_ID_KEY)
  }
}

watch(conversations, persistState, { deep: true })
watch(currentConversationId, persistState)

const currentMessages = computed(() => {
  if (!currentConversationId.value) return []
  return conversations.value.find((item) => item.id === currentConversationId.value)?.messages || []
})

const currentConversation = computed(() => {
  if (!currentConversationId.value) return null
  return conversations.value.find((item) => item.id === currentConversationId.value) || null
})

const chatContainer = ref<HTMLElement | null>(null)

const quickActions = [
  { icon: 'MapPin', label: '推荐景点', prompt: '请推荐一些南京必去的景点' },
  { icon: 'Calendar', label: '三日游规划', prompt: '帮我规划一个南京三日游行程' },
  { icon: 'Utensils', label: '美食建议', prompt: '推荐南京特色美食和餐厅' },
]

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const createNewConversation = () => {
  const conversation: Conversation = {
    id: `conv-${Date.now()}`,
    title: '新对话',
    preview: '开始新的对话',
    lastTime: '刚刚',
    createdAt: new Date(),
    messages: [
      {
        id: Date.now(),
        role: 'assistant',
        content: assistantGreeting(),
        time: nowTime(),
      },
    ],
  }

  conversations.value.unshift(conversation)
  currentConversationId.value = conversation.id
  return conversation.id
}

const ensureConversation = () => {
  if (!currentConversationId.value) {
    createNewConversation()
  }
  return conversations.value.find((item) => item.id === currentConversationId.value) || null
}

const selectConversation = (id: string) => {
  currentConversationId.value = id
}

const backToHistory = () => {
  currentConversationId.value = null
}

const deleteConversation = (id: string) => {
  conversations.value = conversations.value.filter((item) => item.id !== id)
  if (currentConversationId.value === id) {
    currentConversationId.value = null
  }
}

const buildAiRequestMessages = (messages: Message[]): AiChatRequestMessage[] =>
  messages
    .filter((item) => item.content.trim())
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }))

const requestAiAnswer = async (messages: Message[]) => {
  const page = typeof window !== 'undefined' ? window.location.pathname : '/ai-assistant'
  const response = await apiPost<AiChatResponse>('/api/ai/chat', {
    page,
    context: '智能旅游网站前端会话',
    messages: buildAiRequestMessages(messages),
  })
  return response.answer?.trim() || 'AI 暂时没有返回有效内容，请稍后再试。'
}

const updateConversationSummary = (conversation: Conversation, messageText: string) => {
  conversation.preview = messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '')
  conversation.lastTime = '刚刚'
  if (conversation.title === '新对话') {
    conversation.title = messageText.slice(0, 15) + (messageText.length > 15 ? '...' : '')
  }
}

const sendMessage = async (customMessage?: string) => {
  const messageText = (customMessage ?? inputMessage.value).trim()
  if (!messageText || isTyping.value) return

  const conversation = ensureConversation()
  if (!conversation) return

  const userMessage: Message = {
    id: Date.now(),
    role: 'user',
    content: messageText,
    time: nowTime(),
  }

  conversation.messages.push(userMessage)
  updateConversationSummary(conversation, messageText)
  inputMessage.value = ''
  isTyping.value = true
  await scrollToBottom()

  try {
    const answer = await requestAiAnswer(conversation.messages)
    conversation.messages.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: answer,
      time: nowTime(),
    })
  } catch (error) {
    conversation.messages.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: error instanceof Error ? error.message : 'AI 助手请求失败，请稍后再试。',
      time: nowTime(),
    })
  } finally {
    isTyping.value = false
    conversation.lastTime = formatRelativeTime(conversation.createdAt)
    await scrollToBottom()
  }
}

const handleQuickAction = (prompt: string) => {
  sendMessage(prompt)
}

const clearMessages = () => {
  if (!currentConversationId.value) return
  const conversation = conversations.value.find((item) => item.id === currentConversationId.value)
  if (!conversation) return

  conversation.title = '新对话'
  conversation.preview = '开始新的对话'
  conversation.lastTime = '刚刚'
  conversation.messages = [
    {
      id: Date.now(),
      role: 'assistant',
      content: assistantGreeting(),
      time: nowTime(),
    },
  ]
}

export function useAIAssistant() {
  return {
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    inputMessage,
    isTyping,
    chatContainer,
    quickActions,
    sendMessage,
    handleQuickAction,
    clearMessages,
    scrollToBottom,
    createNewConversation,
    selectConversation,
    backToHistory,
    deleteConversation,
  }
}
