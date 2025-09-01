<script setup lang="ts">
import MainHeader from '@/components/MainHeader.vue';
import { ref } from 'vue';

const levelsData = ref([
  {
    level: 'A1',
    title: 'Beginner Level',
    description: 'Learn basic English for everyday situations and simple conversations.',
    topicsAvailable: 3
  },
  {
    level: 'A2',
    title: 'Elementary Level',
    description: 'Build upon basics with more complex conversations and everyday situations.',
    topicsAvailable: 2
  },
  {
    level: 'B1',
    title: 'Intermediate Level',
    description: 'Express opinions, discuss topics, and handle more complex situations.',
    topicsAvailable: 1
  },
  {
    level: 'B2',
    title: 'Upper-Intermediate Level',
    description: 'Discuss abstract topics and express ideas with greater fluency and precision.',
    topicsAvailable: 1
  },
  {
    level: 'C1',
    title: 'Advanced Level',
    description: 'Master complex language structures and discuss sophisticated topics.',
    topicsAvailable: 1
  },
  {
    level: 'C2',
    title: 'Proficiency Level',
    description: 'Achieve native-like fluency with nuanced expressions and cultural understanding.',
    topicsAvailable: 1
  }
]);
</script>

<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <MainHeader />

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-primary-900 dark:text-primary-50 sm:text-5xl md:text-6xl transition-colors">
          Welcome to EnglishLearn
        </h1>
        <p
          class="mt-3 max-w-md mx-auto text-base text-primary-500 dark:text-primary-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl transition-colors">
          Master English step by step with our comprehensive learning platform.
          Choose your level and start your journey to fluency.
        </p>
        <p class="mt-4 text-sm text-primary-400 dark:text-primary-500 transition-colors">
          Sign in to save your progress and build your personal vocabulary collection
        </p>

        <div class="mt-8">
          <router-link to="/login"
            class="inline-block bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-8 py-3 rounded-md text-lg font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors">
            Get Started - It's Free! 🚀
          </router-link>
        </div>

        <!-- Quick Demo Access -->
        <div class="mt-8 bg-primary-100 dark:bg-primary-900 rounded-lg p-6 max-w-md mx-auto transition-colors">
          <h3 class="font-semibold text-primary-900 dark:text-primary-50 mb-2">Quick Demo Access:</h3>
          <p class="text-sm text-primary-600 dark:text-primary-300 mb-2">
            Click the "Get Started" button above and the login form will be pre-filled for easy testing!
          </p>
          <p class="text-xs text-primary-500 dark:text-primary-400">
            Just click "Sign In" and you're in! 🎯
          </p>
        </div>
      </div>

      <!-- Level Cards -->
      <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link
          v-for="levelItem in levelsData"
          :key="levelItem.level"
          :to="`/level/${levelItem.level}`"
          class="bg-white dark:bg-primary-950 rounded-lg shadow-md p-6 hover:shadow-lg transition-all block border border-white dark:border-primary-800"
        >
          <div class="flex items-center justify-between mb-4">
            <span
              class="bg-white dark:bg-white text-primary-950 dark:text-primary-950 px-3 py-1 rounded-full text-sm font-medium"
            >{{ levelItem.level }}</span>
            <svg class="w-5 h-5 text-primary-400 dark:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-50 mb-2">{{ levelItem.title }}</h3>
          <p class="text-primary-600 dark:text-primary-300 text-sm mb-4">
            {{ levelItem.description }}
          </p>
          <div class="flex justify-between items-center">
            <span class="text-xs text-primary-500 dark:text-primary-400">{{ levelItem.topicsAvailable }} topics available</span>
            <span
              class="text-primary-900 dark:text-primary-50 hover:text-primary-800 dark:hover:text-primary-100 text-sm font-medium">Start
              Learning</span>
          </div>
        </router-link>
      </div>

      <!-- How It Works Section -->
      <div class="mt-20 bg-primary-100 dark:bg-primary-900 rounded-2xl p-8 transition-colors">
        <h2 class="text-3xl font-bold text-center text-primary-900 dark:text-primary-50 mb-12">How It Works</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              1
            </div>
            <h3 class="font-semibold text-primary-900 dark:text-primary-50 mb-2">Choose Your Level</h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Start with your current proficiency level from A1 to C2
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              2
            </div>
            <h3 class="font-semibold text-primary-900 dark:text-primary-50 mb-2">Learn the Content</h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Study topics with clear explanations and examples
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              3
            </div>
            <h3 class="font-semibold text-primary-900 dark:text-primary-50 mb-2">Save Vocabulary</h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Build your personal vocabulary collection with one click
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 dark:text-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              4
            </div>
            <h3 class="font-semibold text-primary-900 dark:text-primary-50 mb-2">Practice with Chat</h3>
            <p class="text-sm text-primary-600 dark:text-primary-300">
              Reinforce learning through interactive conversations
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-primary-950 border-t border-primary-200 dark:border-primary-700 mt-20 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-center text-sm text-primary-500 dark:text-primary-400">
          © 2025 EnglishLearn. Empowering language learners worldwide.
        </p>
      </div>
    </footer>
  </div>
</template>
