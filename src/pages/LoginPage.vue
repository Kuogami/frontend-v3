<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-vue-next'
import { useUser } from '../composables/useUser'

const router = useRouter()
const { login } = useUser()

// 切换登录/注册模式
const isLoginMode = ref(true)

// 表单数据
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const username = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// 表单验证
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const isPasswordValid = computed(() => {
  return password.value.length >= 6
})

const isConfirmPasswordValid = computed(() => {
  return confirmPassword.value === password.value && confirmPassword.value.length > 0
})

const isFormValid = computed(() => {
  if (isLoginMode.value) {
    return isEmailValid.value && isPasswordValid.value
  }
  return isEmailValid.value && isPasswordValid.value && isConfirmPasswordValid.value && username.value.trim().length > 0
})

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 登录/注册成功，跳转首页
    router.push('/')
  } catch (error) {
    errorMessage.value = isLoginMode.value ? '登录失败，请检查邮箱和密码' : '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 切换模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
  password.value = ''
  confirmPassword.value = ''
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-50/50">
    <!-- 顶部导航 -->
    <header class="flex-shrink-0 px-4 py-4 md:px-6">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
        <span class="text-sm font-medium">返回</span>
      </button>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
      <div class="w-full max-w-md">
        <!-- Logo 和标题 -->
        <div class="text-center mb-8 md:mb-10">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00A3FF] to-sky-400 flex items-center justify-center shadow-xl shadow-sky-200/50 mb-5">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--color-carbon)] mb-2">
            {{ isLoginMode ? '欢迎回来' : '创建账户' }}
          </h1>
          <p class="text-[var(--color-carbon-light)] text-sm md:text-base">
            {{ isLoginMode ? '登录以继续您的旅行计划' : '注册开启您的智能旅行之旅' }}
          </p>
        </div>

        <!-- 登录/注册表单卡片 -->
        <div class="bg-white/60 backdrop-blur-xl rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/30 p-6 md:p-8">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- 错误提示 -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="errorMessage"
                class="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
              >
                {{ errorMessage }}
              </div>
            </Transition>

            <!-- 用户名（仅注册时显示） -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-if="!isLoginMode" class="space-y-2">
                <label class="block text-sm font-medium text-[var(--color-carbon)]">
                  用户名
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-carbon-light)]">
                    <User class="w-5 h-5" />
                  </div>
                  <input
                    v-model="username"
                    type="text"
                    placeholder="请输入用户名"
                    class="w-full pl-12 pr-4 py-3.5 bg-sky-50/50 border border-sky-100 rounded-xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/50 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 focus:border-[#00A3FF]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </Transition>

            <!-- 邮箱 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-[var(--color-carbon)]">
                邮箱地址
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-carbon-light)]">
                  <Mail class="w-5 h-5" />
                </div>
                <input
                  v-model="email"
                  type="email"
                  placeholder="请输入邮箱"
                  class="w-full pl-12 pr-4 py-3.5 bg-sky-50/50 border border-sky-100 rounded-xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/50 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 focus:border-[#00A3FF]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <!-- 密码 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-[var(--color-carbon)]">
                密码
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-carbon-light)]">
                  <Lock class="w-5 h-5" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="w-full pl-12 pr-12 py-3.5 bg-sky-50/50 border border-sky-100 rounded-xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/50 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 focus:border-[#00A3FF]/30 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] transition-colors"
                >
                  <Eye v-if="showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="!isLoginMode && password.length > 0 && !isPasswordValid" class="text-xs text-amber-600">
                密码至少需要 6 个字符
              </p>
            </div>

            <!-- 确认密码（仅注册时显示） -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-if="!isLoginMode" class="space-y-2">
                <label class="block text-sm font-medium text-[var(--color-carbon)]">
                  确认密码
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-carbon-light)]">
                    <Lock class="w-5 h-5" />
                  </div>
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="请再次输入密码"
                    class="w-full pl-12 pr-12 py-3.5 bg-sky-50/50 border border-sky-100 rounded-xl text-[var(--color-carbon)] placeholder:text-[var(--color-carbon-light)]/50 outline-none focus:ring-2 focus:ring-[#00A3FF]/20 focus:border-[#00A3FF]/30 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-carbon-light)] hover:text-[var(--color-carbon)] transition-colors"
                  >
                    <Eye v-if="showConfirmPassword" class="w-5 h-5" />
                    <EyeOff v-else class="w-5 h-5" />
                  </button>
                </div>
                <p v-if="confirmPassword.length > 0 && !isConfirmPasswordValid" class="text-xs text-amber-600">
                  两次密码输入不一致
                </p>
              </div>
            </Transition>

            <!-- 忘记密码（仅登录时显示） -->
            <div v-if="isLoginMode" class="flex justify-end">
              <button
                type="button"
                class="text-sm text-[#00A3FF] hover:text-sky-600 transition-colors"
              >
                忘记密码？
              </button>
            </div>

            <!-- 提交按钮 -->
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              :class="[
                'w-full py-4 rounded-xl font-medium text-white transition-all',
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-[#00A3FF] to-sky-400 hover:shadow-xl hover:shadow-sky-200/50 active:scale-[0.98]'
                  : 'bg-sky-200 cursor-not-allowed'
              ]"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
              <span v-else>{{ isLoginMode ? '登录' : '注册' }}</span>
            </button>
          </form>

          <!-- 切换登录/注册 -->
          <div class="mt-6 pt-6 border-t border-sky-100/50 text-center">
            <p class="text-sm text-[var(--color-carbon-light)]">
              {{ isLoginMode ? '还没有账户？' : '已有账户？' }}
              <button
                @click="toggleMode"
                class="text-[#00A3FF] font-medium hover:text-sky-600 transition-colors ml-1"
              >
                {{ isLoginMode ? '去注册' : '去登录' }}
              </button>
            </p>
          </div>
        </div>

        <!-- 其他登录方式 -->
        <div class="mt-8 text-center">
          <p class="text-sm text-[var(--color-carbon-light)] mb-4">其他登录方式</p>
          <div class="flex items-center justify-center gap-4">
            <button class="w-12 h-12 rounded-xl bg-white/60 backdrop-blur border border-sky-100/50 flex items-center justify-center hover:bg-white hover:shadow-lg hover:shadow-sky-100/30 transition-all">
              <svg class="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#1AAD19" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
            </button>
            <button class="w-12 h-12 rounded-xl bg-white/60 backdrop-blur border border-sky-100/50 flex items-center justify-center hover:bg-white hover:shadow-lg hover:shadow-sky-100/30 transition-all">
              <svg class="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#1296db" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
              </svg>
            </button>
            <button class="w-12 h-12 rounded-xl bg-white/60 backdrop-blur border border-sky-100/50 flex items-center justify-center hover:bg-white hover:shadow-lg hover:shadow-sky-100/30 transition-all">
              <svg class="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#E6162D" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97-.001c-1.542 0-1.84.733-1.84 1.81v2.373h3.675l-.479 3.71h-3.196V24H10.23v-7.887H7.106v-3.71h3.124V9.692c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.174h.21z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
