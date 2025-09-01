import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import VocabularyView from '@/views/VocabularyView.vue'
import LevelView from '@/views/LevelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: VocabularyView
    },
    {
      path: '/level/:level',
      name: 'level',
      component: LevelView
    }
  ],
})

export default router
