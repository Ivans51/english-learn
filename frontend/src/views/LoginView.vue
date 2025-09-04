<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <img src="../resources/images/logo.png" alt="English Learning Logo" class="h-24 mx-auto bg-white p-2 rounded" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-primary-900 dark:text-primary-50">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-primary-600 dark:text-primary-400">
          Or
          <router-link to="/register" class="font-medium text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300">
            create a new account
          </router-link>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-primary-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors">
        <div v-if="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline">{{ errorMessage }}</span>
        </div>
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-primary-700 dark:text-primary-300">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                class="appearance-none block w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md placeholder-primary-400 dark:placeholder-primary-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-primary-700 dark:text-primary-300">
              Password
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                id="password"
                name="password"
                :type="passwordFieldType"
                autocomplete="current-password"
                required
                v-model="form.password"
                class="appearance-none block w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md placeholder-primary-400 dark:placeholder-primary-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm transition-colors pr-10"
                placeholder="Enter your password"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" @click="togglePasswordVisibility" class="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200">
                  <svg v-if="passwordFieldType === 'password'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064 7-9.542-7 .644 0 1.274.083 1.88.238M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="form.rememberMe"
                class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-300 dark:border-primary-600 rounded bg-white dark:bg-primary-700"
              />
              <label for="remember-me" class="ml-2 block text-sm text-primary-900 dark:text-primary-300">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
              <span v-else>Sign in</span>
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-primary-300 dark:border-primary-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-primary-900 text-primary-500 dark:text-primary-400">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-primary-300 dark:border-primary-600 rounded-md shadow-sm bg-white dark:bg-primary-800 text-sm font-medium text-primary-500 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>

            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-primary-300 dark:border-primary-600 rounded-md shadow-sm bg-white dark:bg-primary-800 text-sm font-medium text-primary-500 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const passwordFieldType = ref('password')

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Pre-fill form for demo purposes
onMounted(() => {
  // Form is already pre-filled in the reactive declaration above
  console.log('Demo login form pre-filled!')
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const auth = getAuth()
    await signInWithEmailAndPassword(auth, form.email, form.password)
    console.log('Login successful! Redirecting to vocabulary...')
    router.push('/vocabulary')
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof Error && 'code' in error) {
      switch ((error as {code: string}).code) {
        case 'auth/invalid-credential':
          errorMessage.value = 'Invalid email or password. Please try again.'
          break
        default:
          errorMessage.value = 'An unexpected error occurred. Please try again later.'
      }
    } else {
      errorMessage.value = 'An unknown error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
