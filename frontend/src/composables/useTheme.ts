import { computed, ref, watch } from 'vue'

// Global theme state - shared across all components
const isDark = ref(false)
let isInitialized = false

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  if (isInitialized) return

  const stored = localStorage.getItem('theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateDocumentClass()
  isInitialized = true
}

const updateDocumentClass = () => {
  if (typeof document !== 'undefined') {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

// Watch for changes and update localStorage
watch(isDark, (newValue) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
  }
  updateDocumentClass()
})

export const useTheme = () => {
  // Initialize theme if not already done
  if (!isInitialized) {
    initializeTheme()
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
  }

  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
    initializeTheme,
  }
}
