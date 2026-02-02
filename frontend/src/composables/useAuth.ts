import { onMounted, onUnmounted, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth'

export interface LoginCredentials {
  email: string
  password: string
}

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

  const login = async (
    credentials: LoginCredentials,
  ): Promise<void> => {
    await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
  }

  const register = async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const getAuthErrorMessage = (error: unknown): string => {
    if (error instanceof Error && 'code' in error) {
      const authError = error as { code: string }
      switch (authError.code) {
        case 'auth/invalid-credential':
          return 'Invalid email or password. Please try again.'
        case 'auth/user-not-found':
          return 'No account found with this email.'
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.'
        case 'auth/email-already-in-use':
          return 'This email is already registered.'
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.'
        case 'auth/invalid-email':
          return 'Please enter a valid email address.'
        default:
          return 'An unexpected error occurred. Please try again later.'
      }
    }
    return 'An unknown error occurred.'
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    getAuthErrorMessage,
  }
}
