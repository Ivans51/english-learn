<script setup lang="ts">
import MainHeader from '@/components/MainHeader.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <MainHeader />

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1
          class="text-4xl font-bold text-primary-900 dark:text-primary-50 sm:text-5xl md:text-6xl transition-colors"
        >
          Welcome to EnglishLearn
        </h1>
        <p
          class="mt-3 max-w-md mx-auto text-base text-primary-500 dark:text-primary-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl transition-colors"
        >
          Build your English vocabulary with our intelligent learning platform.
          Save words, track progress, and expand your language skills.
        </p>
        <p
          v-if="!isAuthenticated()"
          class="mt-4 text-sm text-primary-400 dark:text-primary-500 transition-colors"
        >
          Sign in to save your progress and build your personal vocabulary
          collection
        </p>
        <p
          v-else
          class="mt-4 text-sm text-primary-400 dark:text-primary-500 transition-colors"
        >
          Keep up the great work and continue your journey to fluency!
        </p>

        <div class="mt-8">
          <router-link
            v-if="!isAuthenticated()"
            to="/login"
            class="inline-block bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-8 py-3 rounded-md text-lg font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors"
          >
            Get Started - It's Free! 🚀
          </router-link>
        </div>
      </div>

      <!-- How It Works Section -->
      <div
        class="mt-20 bg-primary-100 dark:bg-black rounded-2xl p-8 transition-colors"
      >
        <h2
          class="text-3xl font-bold text-center text-primary-900 dark:text-primary-50 mb-12"
        >
          How It Works
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
            >
              1
            </div>
            <h3
              class="font-semibold text-primary-900 dark:text-primary-50 mb-2"
            >
              Save Words
            </h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Build your personal vocabulary collection as you learn
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
            >
              2
            </div>
            <h3
              class="font-semibold text-primary-900 dark:text-primary-50 mb-2"
            >
              Organize & Track
            </h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Categorize words by level, status, and custom tags
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
            >
              3
            </div>
            <h3
              class="font-semibold text-primary-900 dark:text-primary-50 mb-2"
            >
              Master Vocabulary
            </h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Review and practice to expand your English vocabulary
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="bg-white dark:bg-primary-950 border-t border-primary-200 dark:border-primary-700 mt-20 transition-colors"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-center text-sm text-primary-500 dark:text-primary-400">
          © 2025 EnglishLearn. Empowering language learners worldwide.
        </p>
      </div>
    </footer>
  </div>
</template>
