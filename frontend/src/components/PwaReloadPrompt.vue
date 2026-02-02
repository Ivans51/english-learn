<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    console.log('Service Worker registered:', registration)
  },
  onRegisterError(error: unknown) {
    console.error('Service Worker registration error:', error)
  }
})

async function close() {
  offlineReady.value = false
  needRefresh.value = false
}

async function update() {
  await updateServiceWorker(true)
}
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    class="pwa-toast fixed bottom-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 max-w-sm"
    role="alert"
  >
    <div class="flex flex-col gap-3">
      <div class="text-sm text-gray-900 dark:text-gray-100">
        <span v-if="offlineReady">
          App is ready to work offline
        </span>
        <span v-else>
          New version available! Click to update.
        </span>
      </div>
      <div class="flex gap-2 justify-end">
        <button
          v-if="needRefresh"
          @click="update"
          class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Update
        </button>
        <button
          @click="close"
          class="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          {{ offlineReady ? 'Close' : 'Dismiss' }}
        </button>
      </div>
    </div>
  </div>
</template>
