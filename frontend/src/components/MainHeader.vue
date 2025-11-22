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
</script>

<template>
  <header class="bg-white dark:bg-primary-950 shadow-sm transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center">
            <span class="text-2xl">⭐</span>
            <span class="ml-2 text-xl font-semibold text-primary-900 dark:text-primary-50">EnglishLearn</span>
          </router-link>

          <!-- Level buttons -->
          <div class="flex space-x-1">
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

        <div class="flex items-center space-x-4">
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
      </div>
    </div>
  </header>
</template>
