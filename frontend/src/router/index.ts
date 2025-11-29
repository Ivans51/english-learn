import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import VocabularyView from '@/views/VocabularyView.vue'
import LevelView from '@/views/LevelView.vue'
import ChatView from '@/views/ChatView.vue'
import ProfileView from '@/views/ProfileView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: VocabularyView,
      meta: { requiresAuth: true },
    },
    {
      path: '/level/:level',
      name: 'level',
      component: LevelView,
      meta: { requiresAuth: true },
    },
    {
      path: '/chat/:topicId',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    // Catch-all route for 404 Not Found
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

// Navigation guard to check authentication state
router.beforeEach(async (to, from, next) => {
  const auth = getAuth()

  // Wait for auth state to be determined
  const isAuthenticated = await new Promise<boolean>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(!!user)
    })
  })

  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  } else if (
    (to.name === 'login' || to.name === 'register') &&
    isAuthenticated
  ) {
    // Redirect authenticated users away from login/register pages
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
