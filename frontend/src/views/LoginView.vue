<template>
  <div
    class="min-h-screen bg-primary-50 dark:bg-primary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <img
          src="../resources/images/logo.png"
          alt="English Learning Logo"
          class="h-24 mx-auto bg-white p-2 rounded"
        />
        <h2
          class="mt-6 text-center text-3xl font-extrabold text-primary-900 dark:text-primary-50"
        >
          Sign in to your account
        </h2>
        <p
          class="mt-2 text-center text-sm text-primary-600 dark:text-primary-400"
        >
          Or
          <router-link
            to="/register"
            class="font-medium text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300"
          >
            create a new account
          </router-link>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-black py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors"
      >
        <div
          v-if="errorMessage"
          class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline">{{ errorMessage }}</span>
        </div>
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-primary-700 dark:text-primary-300"
            >
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
                class="appearance-none block w-full px-3 py-2 border border-primary-300 dark:border-primary-900 rounded-md placeholder-primary-400 dark:placeholder-primary-500 bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-primary-700 dark:text-primary-300"
            >
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
                class="appearance-none block w-full px-3 py-2 border border-primary-300 dark:border-primary-900 rounded-md placeholder-primary-400 dark:placeholder-primary-500 bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm transition-colors pr-10"
                placeholder="Enter your password"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
                >
                  <Eye v-if="passwordFieldType === 'password'" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
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
              <label
                for="remember-me"
                class="ml-2 block text-sm text-primary-900 dark:text-primary-300"
              >
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a
                href="#"
                class="font-medium text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300"
              >
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
                  <Loader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Signing in...
                </span>
              <span v-else>Sign in</span>
            </button>
          </div>

          <div class="mt-4 text-center">
            <button
              type="button"
              @click="router.push('/register')"
              class="w-full py-2 px-4 border border-primary-300 dark:border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-700 dark:text-primary-300 bg-white dark:bg-primary-800 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
            >
              Create an account
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

const router = useRouter()
const { login, getAuthErrorMessage } = useAuth()

const isLoading = ref(false)
const errorMessage = ref('')
const passwordFieldType = ref<'password' | 'text'>('password')

const form = reactive<LoginForm>({
  email: '',
  password: '',
  rememberMe: false,
})

const togglePasswordVisibility = (): void => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

const handleLogin = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await login({ email: form.email, password: form.password })
    router.push('/vocabulary')
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = getAuthErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>
