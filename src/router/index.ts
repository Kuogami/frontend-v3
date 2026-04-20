import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AttractionsPage from '../pages/AttractionsPage.vue'
import RoutePlanPage from '../pages/RoutePlanPage.vue'
import AIAssistantPage from '../pages/AIAssistantPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import FavoritesPage from '../pages/FavoritesPage.vue'
import HistoryPage from '../pages/HistoryPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/attractions',
    name: 'attractions',
    component: AttractionsPage,
  },
  {
    path: '/route',
    name: 'route',
    component: RoutePlanPage,
  },
  {
    path: '/ai-assistant',
    name: 'ai-assistant',
    component: AIAssistantPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesPage,
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
