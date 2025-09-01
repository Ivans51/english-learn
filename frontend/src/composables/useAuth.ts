import { ref, onMounted, onUnmounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'

export function useAuth() {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const auth = getAuth()

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const isAuthenticated = () => user.value !== null

  return {
    user,
    loading,
    isAuthenticated
  }
}
