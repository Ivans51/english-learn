<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import ToastNotification from '@/components/ToastNotification.vue'
import PwaReloadPrompt from '@/components/PwaReloadPrompt.vue'

const { toasts } = useToast()
</script>

<template>
  <div id="app">
    <router-view />
    <ToastNotification v-model="toasts" />
    <PwaReloadPrompt />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
