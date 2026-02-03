<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { BaseButton } from '@/components/ui'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { isAuthenticated, loading } = useAuth()

const isMobileMenuOpen = ref(false)

onMounted(() => {
  watch(
    () => loading.value,
    (isLoading) => {
      if (!isLoading && !isAuthenticated()) {
        const protectedRoutes = ['/vocabulary', '/profile']
        if (protectedRoutes.includes(router.currentRoute.value.path)) {
          router.push('/login')
        }
      }
    },
    { immediate: true }
  )
})

const handleLogout = async () => {
  const { auth } = await import('@/firebase')
  const { signOut } = await import('firebase/auth')
  await signOut(auth)
  router.push('/')
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleLogoutAndCloseMenu = async () => {
  isMobileMenuOpen.value = false
  await handleLogout()
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="bg-white dark:bg-black shadow-sm transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and main nav -->
        <div class="flex items-center space-x-6 lg:space-x-8">
          <router-link to="/" class="flex items-center">
            <img
              src="@/resources/images/logo.png"
              alt="EnglishLearn Logo"
              class="h-8"
            />
            <span
              class="ml-2 text-xl font-semibold text-primary-900 dark:text-primary-50"
            >
              EnglishLearn
            </span>
          </router-link>

          <!-- Navigation links -->
          <template v-if="isAuthenticated()">
            <router-link
              to="/vocabulary"
              class="hidden md:inline-block text-primary-700 dark:text-primary-50 hover:text-primary-900 dark:hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              My Vocabulary
            </router-link>
          </template>
        </div>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="!loading">
            <template v-if="isAuthenticated()">
              <router-link
                to="/profile"
                class="hidden md:inline-block text-primary-700 dark:text-primary-50 hover:text-primary-900 dark:hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </router-link>
            </template>
          </template>
          <button
            @click="toggleTheme"
            class="text-primary-500 hover:text-primary-700 dark:text-primary-50 dark:hover:text-primary-100 transition-colors cursor-pointer"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg
              v-if="!isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              ></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
          </button>

          <template v-if="isAuthenticated()">
            <BaseButton variant="secondary" @click="handleLogout">
              Logout
            </BaseButton>
          </template>
          <template v-else>
            <router-link to="/login">
              <BaseButton variant="primary">
                Sign In
              </BaseButton>
            </router-link>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center space-x-2">
          <button
            @click="toggleTheme"
            class="text-primary-500 hover:text-primary-700 dark:text-primary-50 dark:hover:text-primary-100 transition-colors cursor-pointer p-1"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg
              v-if="!isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              ></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
          </button>

          <button
            @click="toggleMobileMenu"
            class="text-primary-700 dark:text-primary-100 hover:text-primary-900 dark:hover:text-primary-50 transition-colors cursor-pointer p-1"
            title="Open menu"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu overlay -->
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/90 z-50 flex flex-col justify-center items-center min-h-screen"
        @click="closeMobileMenu"
      >
        <!-- Close button area (top) -->
        <div class="absolute top-4 right-4" @click.stop>
          <button
            @click="closeMobileMenu"
            class="text-white hover:text-gray-300 transition-colors p-2"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Menu items -->
        <div class="flex flex-col space-y-8 text-center mobile-menu" @click.stop>
          <template v-if="isAuthenticated()">
            <router-link
              to="/vocabulary"
              @click="closeMobileMenu"
              class="text-white text-2xl font-medium hover:text-gray-300 transition-colors"
            >
              My Vocabulary
            </router-link>
            <router-link
              to="/profile"
              @click="closeMobileMenu"
              class="text-white text-2xl font-medium hover:text-gray-300 transition-colors"
            >
              Profile
            </router-link>
            <button
              @click="handleLogoutAndCloseMenu"
              class="text-white text-2xl font-medium hover:text-gray-300 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              @click="closeMobileMenu"
              class="text-white text-2xl font-medium hover:text-gray-300 transition-colors"
            >
              Sign In
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.router-link-active {
  color: var(--color-primary-900);
  position: relative;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: var(--color-primary-900);
  border-radius: 1px;
}

.dark .router-link-active {
  color: var(--color-primary-100);
}

.dark .router-link-active::after {
  background-color: var(--color-primary-100);
}

.router-link-exact-active {
  color: var(--color-primary-900);
  position: relative;
}

.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: var(--color-primary-900);
  border-radius: 1px;
}

.dark .router-link-exact-active {
  color: var(--color-primary-100);
}

.dark .router-link-exact-active::after {
  background-color: var(--color-primary-100);
}

.mobile-menu .router-link-active {
  color: var(--color-primary-300);
  font-weight: 600;
}

.mobile-menu .router-link-exact-active {
  color: var(--color-primary-300);
  font-weight: 600;
}
</style>
