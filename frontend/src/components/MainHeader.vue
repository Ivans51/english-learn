<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User, signOut } from 'firebase/auth'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  currentLevel?: string
}>()

const emit = defineEmits(['level-click'])

const { isDark, toggleTheme } = useTheme()

const isLoggedIn = ref(false)
const user = ref<User | null>(null)
const isMobileMenuOpen = ref(false)

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (firebaseUser) => {
    isLoggedIn.value = !!firebaseUser
    user.value = firebaseUser
  })
})

const handleLevelClick = (level: string) => {
  emit('level-click', level)
}

const handleLogout = () => {
  const auth = getAuth()
  signOut(auth).then(() => {
    router.push('/')
  })
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <header class="bg-white dark:bg-primary-950 shadow-sm transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and main nav -->
        <div class="flex items-center space-x-4 lg:space-x-8">
          <router-link to="/" class="flex items-center">
            <img src="@/resources/images/favicon.png" alt="EnglishLearn Logo" class="h-8" />
            <span class="ml-2 text-xl font-semibold text-primary-900 dark:text-primary-50">EnglishLearn</span>
          </router-link>

          <!-- Level buttons - Hidden on mobile -->
          <div class="hidden md:flex space-x-1">
            <template v-if="$attrs['onLevel-click']">
              <button
                v-for="level in levels"
                :key="level"
                @click="handleLevelClick(level)"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded border transition-colors',
                  currentLevel === level
                    ? 'bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 border-secondary-900 dark:border-secondary-800'
                    : 'bg-white dark:bg-transparent text-primary-700 dark:text-primary-50 border-primary-300 dark:border-transparent hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-800 dark:hover:text-primary-100'
                ]"
              >
                {{ level }}
              </button>
            </template>
            <template v-else>
              <router-link
                v-for="level in levels"
                :key="level"
                :to="`/level/${level}`"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded border transition-colors',
                  currentLevel === level
                    ? 'bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 border-secondary-900 dark:border-secondary-800'
                    : 'bg-white dark:bg-transparent text-primary-700 dark:text-primary-50 border-primary-300 dark:border-transparent hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-800 dark:hover:text-primary-100'
                ]"
              >
                {{ level }}
              </router-link>
            </template>
          </div>
        </div>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center space-x-4">
          <button
            @click="toggleTheme"
            class="text-primary-500 hover:text-primary-700 dark:text-primary-50 dark:hover:text-primary-100 transition-colors cursor-pointer"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              ></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
          </button>

          <template v-if="isLoggedIn">
            <router-link
              to="/vocabulary"
              class="bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              My Vocabulary
            </router-link>
            <router-link
              to="/profile"
              class="w-8 h-8 bg-primary-900 dark:bg-primary-50 rounded-full flex items-center justify-center text-primary-50 dark:text-primary-950 text-sm font-medium transition-colors hover:bg-primary-800 dark:hover:bg-primary-100"
              title="Profile"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </router-link>
            <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer">
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
            <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              ></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-primary-200 dark:border-primary-800 mt-2 pt-4 pb-3">
        <!-- Mobile level buttons -->
        <div class="flex flex-wrap gap-2 mb-4">
          <template v-if="$attrs['onLevel-click']">
            <button
              v-for="level in levels"
              :key="level"
              @click="handleLevelClick(level)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded border transition-colors flex-1 min-w-0',
                currentLevel === level
                  ? 'bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 border-secondary-900 dark:border-secondary-800'
                  : 'bg-white dark:bg-transparent text-primary-700 dark:text-primary-50 border-primary-300 dark:border-transparent hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-800 dark:hover:text-primary-100'
              ]"
            >
              {{ level }}
            </button>
          </template>
          <template v-else>
            <router-link
              v-for="level in levels"
              :key="level"
              :to="`/level/${level}`"
              @click="isMobileMenuOpen = false"
              :class="[
                'px-3 py-2 text-sm font-medium rounded border transition-colors flex-1 min-w-0 text-center',
                currentLevel === level
                  ? 'bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 border-secondary-900 dark:border-secondary-800'
                  : 'bg-white dark:bg-transparent text-primary-700 dark:text-primary-50 border-primary-300 dark:border-transparent hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-800 dark:hover:text-primary-100'
              ]"
            >
              {{ level }}
            </router-link>
          </template>
        </div>

        <!-- Mobile user actions -->
        <div class="flex flex-col space-y-2">
          <template v-if="isLoggedIn">
            <router-link
              to="/vocabulary"
              @click="isMobileMenuOpen = false"
              class="bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-4 py-2 rounded text-sm font-medium transition-colors text-center"
            >
              My Vocabulary
            </router-link>
            <router-link
              to="/profile"
              @click="isMobileMenuOpen = false"
              class="w-full bg-primary-900 dark:bg-primary-50 rounded-full flex items-center justify-center text-primary-50 dark:text-primary-950 text-sm font-medium transition-colors hover:bg-primary-800 dark:hover:bg-primary-100 py-2"
              title="Profile"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </router-link>
            <button @click="handleLogout; isMobileMenuOpen = false" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer w-full">
              Logout
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              @click="isMobileMenuOpen = false"
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
