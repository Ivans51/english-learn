<template>
  <teleport to="body">
    <div
      v-if="visible"
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
      class="fixed z-50 bg-white dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg shadow-lg p-2 tooltip-content"
    >
      <div class="flex flex-col space-y-1 min-w-[150px]">
        <div class="px-3 py-1 text-sm font-medium text-primary-900 dark:text-primary-100 border-b border-primary-200 dark:border-primary-700 mb-1">
          "{{ selectedWord }}"
        </div>

        <button
          @click="$emit('explain', selectedWord)"
          class="px-3 py-2 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-700 rounded flex items-center space-x-2 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <span>Explain</span>
        </button>

        <button
          @click="$emit('save', selectedWord)"
          class="px-3 py-2 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-700 rounded flex items-center space-x-2 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
          <span>Save to Vocabulary</span>
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  selectedWord: string
  position: {
    x: number
    y: number
  }
}

defineProps<Props>()

defineEmits<{
  explain: [word: string]
  save: [word: string]
  pronounce: [word: string]
  close: []
}>()
</script>

<style scoped>
.tooltip-content {
  transform: translateX(-50%);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
