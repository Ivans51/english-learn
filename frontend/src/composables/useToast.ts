import { ref } from 'vue'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<ToastMessage[]>([])

export const useToast = () => {
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    toasts.value.push(newToast)

    // Auto-remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(newToast.id)
      }, toast.duration || 5000)
    }

    return newToast.id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  const success = (message: string, duration?: number) => {
    return addToast({ message, type: 'success', duration })
  }

  const error = (message: string, duration?: number) => {
    return addToast({ message, type: 'error', duration })
  }

  const warning = (message: string, duration?: number) => {
    return addToast({ message, type: 'warning', duration })
  }

  const info = (message: string, duration?: number) => {
    return addToast({ message, type: 'info', duration })
  }

  return {
    toasts: toasts.value,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}
