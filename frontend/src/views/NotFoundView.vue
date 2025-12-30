<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 transition-colors"
  >
    <MainHeader />

    <div class="flex items-center justify-center p-4 pt-20">
      <div class="max-w-4xl w-full">
        <div
          class="bg-white/95 dark:bg-primary backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center shadow-xl dark:shadow-2xl transition-colors"
        >
          <!-- 404 Image -->
          <div class="mb-8 flex justify-center">
            <img
              src="@/resources/images/404.png"
              alt="404 Not Found"
              class="w-64 h-auto md:w-80 lg:w-96 xl:w-[28rem] filter drop-shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <!-- Description -->
          <p
            class="text-base md:text-lg text-primary-600 dark:text-primary-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Oops! The page you're looking for seems to have wandered off into
            the digital wilderness. Don't worry, it happens to the best of us.
          </p>

          <!-- Action Buttons -->
          <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <router-link
              to="/"
              class="inline-flex items-center gap-2 bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-primary-800 dark:hover:bg-primary-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span class="text-xl">🏠</span>
              Go to Home
            </router-link>

            <button
              @click="goBack"
              class="inline-flex items-center gap-2 bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 border-2 border-primary-300 dark:border-primary-600 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <span class="text-xl">←</span>
              Go Back
            </button>
          </div>

          <!-- Additional Help Text -->
          <p class="text-sm text-primary-500 dark:text-primary-400 mt-8">
            Need help? Try checking the URL or
            <router-link
              to="/"
              class="text-primary-700 dark:text-primary-300 hover:underline font-medium"
            >
              return to our homepage
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainHeader from '@/components/MainHeader.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<!-- No custom styles needed - using Tailwind CSS classes -->
