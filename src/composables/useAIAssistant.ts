import { ref, nextTick, computed } from 'vue'

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

// 全局共享状态 - 单例模式
const conversations = ref<Conversation[]>([
  {
    id: 'conv-1',
    title: '南京三日游规划',
    preview: '帮我规划一个南京三日游行程，想去中山陵、夫子庙...',
    lastTime: '昨天',
    createdAt: new Date(Date.now() - 86400000),
    messages: [
      {
        id: 1,
        role: 'assistant',
        content: '您好！我是您的智能旅行助手。请问您想规划南京三日游吗？',
        time: '09:00',
      },
      {
        id: 2,
        role: 'user',
        content: '帮我规划一个南京三日游行程，想去中山陵、夫子庙、总统府这些地方',
        time: '09:01',
      },
      {
        id: 3,
        role: 'assistant',
        content: '好的，我来为您规划南京三日游：\n\n【第一天】中山陵 → 明孝陵 → 灵谷寺\n建议早起前往中山陵，避开人流高峰。下午游览明孝陵和灵谷寺，感受历史文化。\n\n【第二天】总统府 → 南京博物院 → 玄武湖\n上午参观总统府了解民国历史，下午去南博看藏品，傍晚漫步玄武湖。\n\n【第三天】夫子庙 → 老门东 → 秦淮河夜游\n最后一天逛秦淮风光带，品尝美食，晚上坐画舫感受夜色秦淮。',
        time: '09:02',
      },
    ],
  },
  {
    id: 'conv-2',
    title: '夫子庙美食攻略',
    preview: '推荐一些夫子庙附近的特色小吃和餐厅...',
    lastTime: '前天',
    createdAt: new Date(Date.now() - 172800000),
    messages: [
      {
        id: 1,
        role: 'assistant',
        content: '您好！我是您的智能旅行助手。有什么可以帮您的吗？',
        time: '14:00',
      },
      {
        id: 2,
        role: 'user',
        content: '推荐一些夫子庙附近的特色小吃和餐厅',
        time: '14:01',
      },
      {
        id: 3,
        role: 'assistant',
        content: '夫子庙美食推荐：\n\n🍜 **特色小吃**\n1. 鸭血粉丝汤 - 回味鸭血粉丝\n2. 盐水鸭 - 韩复兴、陆记\n3. 糖芋苗 - 莲湖糕团店\n4. 小笼包 - 蒋有记\n5. 牛肉锅贴 - 七家湾锅贴\n\n🏪 **老字号餐厅**\n• 马祥兴菜馆 - 百年老店，招牌美人肝\n• 绿柳居 - 素食名店\n• 南京大牌档 - 综合性金陵菜馆',
        time: '14:02',
      },
    ],
  },
  {
    id: 'conv-3',
    title: '中山陵门票预约',
    preview: '中山陵需要提前预约吗？门票怎么买？',
    lastTime: '3天前',
    createdAt: new Date(Date.now() - 259200000),
    messages: [
      {
        id: 1,
        role: 'assistant',
        content: '您好！我可以帮您了解景点门票信息。',
        time: '10:30',
      },
      {
        id: 2,
        role: 'user',
        content: '中山陵需要提前预约吗？门票怎么买？',
        time: '10:31',
      },
      {
        id: 3,
        role: 'assistant',
        content: '中山陵门票信息：\n\n📋 **预约须知**\n• 中山陵陵寝免费开放，但需要提前预约\n• 建议提前1-3天在"钟山风景区"微信公众号预约\n• 每天限流，节假日更需提前\n\n🎫 **其他景点门票**\n• 明孝陵：70元\n• 灵谷寺：35元\n• 音乐台：10元\n• 联票更划算：100元\n\n💡 **建议**\n建议购买钟山风景区联票，性价比最高！',
        time: '10:32',
      },
    ],
  },
])

const currentConversationId = ref<string | null>(null)
const inputMessage = ref('')
const isTyping = ref(false)

// 当前会话的消息
const currentMessages = computed(() => {
  if (!currentConversationId.value) return []
  const conv = conversations.value.find(c => c.id === currentConversationId.value)
  return conv?.messages || []
})

// 当前会话
const currentConversation = computed(() => {
  if (!currentConversationId.value) return null
  return conversations.value.find(c => c.id === currentConversationId.value) || null
})

export function useAIAssistant() {
  const chatContainer = ref<HTMLElement | null>(null)

  const quickActions = [
    { icon: 'MapPin', label: '推荐景点', prompt: '请推荐一些南京必去的景点' },
    { icon: 'Calendar', label: '行程规划', prompt: '帮我规划一个三日游行程' },
    { icon: 'Utensils', label: '美食推荐', prompt: '推荐一些当地特色美食' },
  ]

  const scrollToBottom = async () => {
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }

  // 创建新会话
  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: '新对话',
      preview: '开始新的对话...',
      lastTime: '刚刚',
      createdAt: new Date(),
      messages: [
        {
          id: Date.now(),
          role: 'assistant',
          content: '您好！我是您的智能旅行助手。我可以帮您规划旅行路线、推荐景点美食、解答旅行相关问题。请问有什么可以帮您的吗？',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }
    conversations.value.unshift(newConv)
    currentConversationId.value = newConv.id
    return newConv.id
  }

  // 选择会话
  const selectConversation = (id: string) => {
    currentConversationId.value = id
  }

  // 返回历史列表
  const backToHistory = () => {
    currentConversationId.value = null
  }

  // 删除会话
  const deleteConversation = (id: string) => {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (currentConversationId.value === id) {
        currentConversationId.value = null
      }
    }
  }

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputMessage.value
    if (!messageToSend.trim()) return

    // 如果没有当前会话，创建一个新的
    if (!currentConversationId.value) {
      createNewConversation()
    }

    const conv = conversations.value.find(c => c.id === currentConversationId.value)
    if (!conv) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageToSend,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }

    conv.messages.push(userMessage)
    
    // 更新会话预览和标题
    conv.preview = messageToSend.slice(0, 30) + (messageToSend.length > 30 ? '...' : '')
    conv.lastTime = '刚刚'
    
    // 如果是新对话，用第一条消息作为标题
    if (conv.title === '新对话') {
      conv.title = messageToSend.slice(0, 15) + (messageToSend.length > 15 ? '...' : '')
    }

    inputMessage.value = ''
    isTyping.value = true

    await scrollToBottom()

    // 模拟 AI 回复
    setTimeout(async () => {
      const aiMessage: Message = {
        id: Date.now(),
        role: 'assistant',
        content: generateAIResponse(messageToSend),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      conv.messages.push(aiMessage)
      isTyping.value = false

      await scrollToBottom()
    }, 1000 + Math.random() * 500)
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  const clearMessages = () => {
    if (!currentConversationId.value) return
    const conv = conversations.value.find(c => c.id === currentConversationId.value)
    if (conv) {
      conv.messages = [
        {
          id: Date.now(),
          role: 'assistant',
          content: '您好！我是您的智能旅行助手。我可以帮您规划旅行路线、推荐景点美食、解答旅行相关问题。请问有什么可以帮您的吗？',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]
    }
  }

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

// 模拟 AI 响应生成
function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('景点') || lowerMessage.includes('推荐')) {
    return '根据您的需求，我为您推荐以下南京热门景点：\n\n1. 中山陵 - 孙中山先生陵寝，气势宏伟\n2. 夫子庙 - 秦淮风光带核心，美食云集\n3. 总统府 - 民国历史遗迹\n4. 玄武湖 - 城市明珠，休闲胜地\n\n这些景点各有特色，建议您根据兴趣和时间合理安排。需要我帮您规划具体行程吗？'
  }
  
  if (lowerMessage.includes('行程') || lowerMessage.includes('规划') || lowerMessage.includes('三日游')) {
    return '好的，我来为您规划一个精彩的南京三日游：\n\n【第一天】中山陵 → 明孝陵 → 灵谷寺\n建议早起出发，上午游览中山陵，下午明孝陵和灵谷寺。\n\n【第二天】总统府 → 南京博物院 → 玄武湖\n上午参观总统府，下午南博，傍晚玄武湖散步。\n\n【第三天】夫子庙 → 老门东 → 秦淮河\n最后一天享受秦淮风情，品尝美食，夜游秦淮河！\n\n每个景点建议游览2-3小时，记得提前预约门票！'
  }
  
  if (lowerMessage.includes('美食') || lowerMessage.includes('吃') || lowerMessage.includes('南京')) {
    return '南京有很多特色美食值得品尝：\n\n1. 盐水鸭 - 南京名片，推荐韩复兴\n2. 鸭血粉丝汤 - 回味鸭血粉丝\n3. 小笼包 - 皮薄汤多\n4. 牛肉锅贴 - 七家湾锅贴\n5. 糖芋苗 - 莲湖糕团店\n\n夫子庙和老门东是美食集中地，您想了解哪家餐厅的具体信息吗？'
  }

  if (lowerMessage.includes('交通') || lowerMessage.includes('出行')) {
    return '南京交通建议：\n\n🚇 **地铁**\n南京地铁覆盖主要景点，推荐购买一日票或三日票。\n\n🚌 **公交**\n旅游公交专线连接热门景点，如观光1号线。\n\n🚗 **打车**\n滴滴、高德打车方便快捷，景区周边可能有交通管制。\n\n💡 **建议**\n市区游览以地铁+步行为主，郊区景点可考虑包车。'
  }
  
  return '感谢您的提问！作为您的旅行助手，我建议您可以考虑以下几点：\n\n1. 根据您的时间安排，合理规划每日行程\n2. 提前预订热门景点的门票\n3. 了解当地的天气情况，做好相应准备\n\n如果您能告诉我更多关于您的旅行偏好，我可以为您提供更个性化的建议。'
}
