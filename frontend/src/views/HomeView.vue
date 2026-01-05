<script setup lang="ts">
import { computed } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()

const steps = [
  {
    number: 1,
    title: 'Save Words',
    description: 'Build your personal vocabulary collection as you learn',
  },
  {
    number: 2,
    title: 'Organize & Track',
    description: 'Categorize words by level, status, and custom tags',
  },
  {
    number: 3,
    title: 'Master Vocabulary',
    description: 'Review and practice to expand your English vocabulary',
  },
]

const greetingMessage = computed(() =>
  isAuthenticated()
    ? 'Keep up the great work and continue your journey to fluency!'
    : 'Sign in to save your progress and build your personal vocabulary collection',
)

const ctaText = computed(() =>
  isAuthenticated() ? 'Go to Dashboard' : "Get Started - It's Free! 🚀",
)

const ctaLink = computed(() => (isAuthenticated() ? '/vocabulary' : '/login'))
</script>

<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <MainHeader />

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
          class="mt-4 text-sm text-primary-400 dark:text-primary-500 transition-colors"
        >
          {{ greetingMessage }}
        </p>

        <div class="mt-8">
          <router-link
            :to="ctaLink"
            class="inline-block bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-8 py-3 rounded-md text-lg font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors"
          >
            {{ ctaText }}
          </router-link>
        </div>
      </div>

      <section
        class="mt-20 bg-primary-100 dark:bg-black rounded-2xl p-8 transition-colors"
        aria-labelledby="how-it-works-title"
      >
        <h2
          id="how-it-works-title"
          class="text-3xl font-bold text-center text-primary-900 dark:text-primary-50 mb-12"
        >
          How It Works
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="step in steps" :key="step.number" class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
            >
              {{ step.number }}
            </div>
            <h3
              class="font-semibold text-primary-900 dark:text-primary-50 mb-2"
            >
              {{ step.title }}
            </h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              {{ step.description }}
            </p>
          </div>
        </div>
      </section>
    </main>

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
