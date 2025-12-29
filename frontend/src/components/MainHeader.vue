<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  currentLevel?: string
}>()

const { isDark, toggleTheme } = useTheme()

const isLoggedIn = ref(false)
const user = ref<User | null>(null)
const isMobileMenuOpen = ref(false)

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (firebaseUser) => {
    isLoggedIn.value = !!firebaseUser
    user.value = firebaseUser
  })
})

const handleLogout = () => {
  const auth = getAuth()
  signOut(auth).then(() => {
    router.push('/')
  })
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleLogoutAndCloseMenu = () => {
  isMobileMenuOpen.value = false
  handleLogout()
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
              src="@/resources/images/favicon.png"
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
          <template v-if="isLoggedIn">
            <router-link
              to="/vocabulary"
              class="text-primary-700 dark:text-primary-50 hover:text-primary-900 dark:hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              My Vocabulary
            </router-link>
            <router-link
              to="/profile"
              class="text-primary-700 dark:text-primary-50 hover:text-primary-900 dark:hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Profile
            </router-link>
          </template>
        </div>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center space-x-4">
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

          <template v-if="isLoggedIn">
            <button
              @click="handleLogout"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors"
            >
              Sign In
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
            :title="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <svg
              v-if="!isMobileMenuOpen"
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
            <svg
              v-else
              class="w-6 h-6"
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
      </div>

      <!-- Mobile menu -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-primary-200 dark:border-primary-800 mt-2 pt-4 pb-3"
      >
        <!-- Mobile user actions -->
        <div class="flex flex-col space-y-2">
          <template v-if="isLoggedIn">
            <router-link
              to="/vocabulary"
              @click="closeMobileMenu"
              class="bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-4 py-2 rounded text-sm font-medium transition-colors text-center"
            >
              My Vocabulary
            </router-link>
            <router-link
              to="/profile"
              @click="closeMobileMenu"
              class="text-primary-700 dark:text-primary-50 hover:text-primary-900 dark:hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Profile
            </router-link>
            <button
              @click="handleLogoutAndCloseMenu"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer w-full"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              @click="closeMobileMenu"
              class="bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors text-center"
            >
              Sign In
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
