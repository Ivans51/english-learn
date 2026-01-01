<template>
  <Transition
    name="modal"
    appear
    appear-active-class="transition-opacity duration-300"
    appear-from-class="opacity-0"
    appear-to-class="opacity-100"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="closeModal"
    >
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>

        <!-- Modal -->
        <Transition
          name="modal-content"
          appear
          appear-active-class="transition-all duration-300"
          appear-from-class="opacity-0 scale-95 translate-y-4"
          appear-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            class="relative bg-primary-900 dark:bg-primary-950 rounded-lg shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto border border-primary-700"
            @click.stop
          >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-primary-700">
          <h2 class="text-xl font-semibold text-primary-50">
            Word Details
          </h2>
          <button
            @click="closeModal"
            class="text-primary-400 hover:text-primary-200 focus:outline-none transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Word Term -->
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-primary-50 mb-2">
              {{ word.term }}
            </h3>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-800 text-primary-200">
              {{ word.categoryName }}
            </span>
          </div>

          <!-- Meanings -->
          <div class="mb-6">
            <h4 class="text-lg font-medium text-primary-50 mb-3 flex items-center">
              <svg
                class="w-5 h-5 mr-2 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
              Meanings
            </h4>
            <div class="bg-primary-800 rounded-lg p-4">
              <p class="text-primary-300 whitespace-pre-line leading-relaxed">
                {{ word.meanings.replace(/; /g, '\n') }}
              </p>
            </div>
          </div>

          <!-- Examples -->
          <div class="mb-6">
            <h4 class="text-lg font-medium text-primary-50 mb-3 flex items-center">
              <svg
                class="w-5 h-5 mr-2 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                ></path>
              </svg>
              Examples
            </h4>
            <div class="bg-secondary-900 rounded-lg p-4">
              <p class="text-secondary-300 whitespace-pre-line leading-relaxed italic">
                "{{ word.examples.replace(/; /g, '\n') }}"
              </p>
            </div>
          </div>

            <!-- Status Badge -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="[
                    localWordStatus === 'completed'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  ]"
                >
                  {{ localWordStatus === 'completed' ? 'Completed' : 'Pending' }}
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-center space-x-2 pt-4 border-t border-primary-700">
                <button
                  @click="toggleWordStatus"
                  :class="[
                    'h-8 w-8 flex items-center justify-center rounded border cursor-pointer transition-colors',
                    localWordStatus === 'completed'
                      ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border-green-300 dark:border-green-600'
                      : 'text-primary-400 dark:text-primary-500 hover:text-green-600 dark:hover:text-green-400 border-primary-300 dark:border-primary-600',
                  ]"
                  :title="
                    localWordStatus === 'completed'
                      ? 'Mark as pending'
                      : 'Mark as completed'
                  "
                >
                  <CheckCircle2
                    class="w-4 h-4"
                  />
                </button>
                <button
                  @click="openEditModal"
                  class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-blue-600 dark:hover:text-blue-400 rounded border border-primary-300 dark:border-primary-600 cursor-pointer transition-colors"
                  title="Edit word"
                >
                  <Edit3
                    class="w-4 h-4"
                  />
                </button>
                <button
                  @click="handleDelete"
                  class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded border border-primary-300 dark:border-primary-600 cursor-pointer transition-colors"
                  title="Delete word"
                >
                  <Trash2
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </div>
        </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { VocabularyWord } from '@/types'
import { CheckCircle2, Edit3, Trash2, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  word: VocabularyWord
  wordUid: string
}

interface Emits {
  (e: 'close'): void
  (e: 'toggle-status', wordUid: string, currentStatus?: 'pending' | 'completed'): void
  (e: 'edit-word', word: VocabularyWord, wordUid: string): void
  (e: 'delete-word', wordUid: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive state for immediate UI updates
const localWordStatus = ref(props.word.status)

// Watch for prop changes to update local state
watch(() => props.word.status, (newStatus) => {
  localWordStatus.value = newStatus
})

const closeModal = () => {
  emit('close')
}

const toggleWordStatus = () => {
  // Update local state immediately for instant UI feedback
  localWordStatus.value = localWordStatus.value === 'completed' ? 'pending' : 'completed'
  emit('toggle-status', props.wordUid, props.word.status)
}

const openEditModal = () => {
  emit('edit-word', props.word, props.wordUid)
  closeModal()
}

const handleDelete = () => {
  emit('delete-word', props.wordUid)
  closeModal()
}
</script>

<style scoped>
/* Modal backdrop transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Modal content transitions */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(4px);
}

.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
