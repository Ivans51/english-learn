<template>
  <teleport to="body">
    <transition-group
      name="toast"
      tag="div"
      class="fixed bottom-4 right-4 z-50 space-y-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm',
          getToastClass(toast.type),
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          <svg
            v-else-if="toast.type === 'warning'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>

        <!-- Message -->
        <div class="flex-1">
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>

        <!-- Close Button -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Props {
  modelValue: Toast[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [toasts: Toast[]]
}>()

const toasts = ref<Toast[]>([])

onMounted(() => {
  toasts.value = props.modelValue
})

// Auto-remove toasts after duration when they are added
const autoRemoveToast = (toast: Toast) => {
  if (toast.duration !== 0) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration || 5000)
  }
}

const getToastClass = (type: Toast['type']): string => {
  const classes = {
    success:
      'bg-black/80 text-white border border-success-500 backdrop-blur-sm',
    error: 'bg-black/80 text-white border border-error-500 backdrop-blur-sm',
    warning:
      'bg-black/80 text-white border border-warning-500 backdrop-blur-sm',
    info: 'bg-black/80 text-white border border-primary-500 backdrop-blur-sm',
  }
  return classes[type]
}

const removeToast = (id: string) => {
  const updatedToasts = toasts.value.filter((t) => t.id !== id)
  toasts.value = updatedToasts
  emit('update:modelValue', updatedToasts)
}

// Expose methods for programmatic usage
defineExpose({
  addToast: (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    const updatedToasts = [...toasts.value, newToast]
    toasts.value = updatedToasts
    emit('update:modelValue', updatedToasts)

    // Auto-remove after duration
    autoRemoveToast(newToast)
  },
  removeToast,
  clearAll: () => {
    toasts.value = []
    emit('update:modelValue', [])
  },
})
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
