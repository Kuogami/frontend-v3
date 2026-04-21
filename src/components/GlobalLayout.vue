<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './NavBar.vue'
import GlobalAIAssistant from './GlobalAIAssistant.vue'

const route = useRoute()
const isRouteFullscreen = computed(() => route.name === 'route')
</script>

<template>
  <div :class="['min-h-screen flex flex-col', isRouteFullscreen ? 'bg-transparent' : 'bg-[var(--color-background)]']">
    <!-- 置顶毛玻璃导航栏 -->
    <NavBar />
    
    <!-- 全局 AI 助手悬浮组件 -->
    <GlobalAIAssistant />
    
    <!-- 主内容区域 - 直达底部，带 safe-area 边距 -->
    <main :class="['flex-1 pt-20 pb-safe', isRouteFullscreen ? 'bg-transparent' : '']">
      <div :class="isRouteFullscreen ? 'w-full min-h-[calc(100vh-80px)]' : 'max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12'">
        <slot />
      </div>
    </main>
  </div>
</template>
