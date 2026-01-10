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
            class="relative bg-primary-900 dark:bg-primary-950 rounded-lg shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto"
            @click.stop
          >
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-primary-400 hover:text-primary-200 focus:outline-none transition-colors"
        >
          <X class="w-6 h-6" />
        </button>

        <!-- Content -->
        <div class="p-6">
          <!-- Word Term -->
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-primary-50">
              {{ word.term }}
            </h2>
            <span class="text-sm text-primary-400">
              category: {{ word.categoryName }}
            </span>
          </div>

          <hr class="border-primary-700 mb-4" />

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
              <p class="text-primary-200 whitespace-pre-line leading-relaxed">
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
            <div class="bg-primary-800 rounded-lg p-4">
              <div
                class="text-primary-200 leading-relaxed italic"
                v-html="renderedExamples"
              ></div>
            </div>
          </div>

              <!-- Status Badge -->
              <div class="flex items-center justify-between">
                <button
                  @click="toggleWordStatus"
                  class="text-sm px-3 py-1 rounded cursor-pointer transition-colors hover:opacity-80"
                  :class="[
                    localWordStatus === 'completed'
                      ? 'bg-green-900/60 text-green-200'
                      : 'bg-yellow-900/40 text-yellow-200'
                  ]"
                  title="Click to change status"
                >
                  {{ localWordStatus === 'completed' ? 'completed' : 'pending' }}
                </button>

              <!-- Action Buttons -->
              <div class="flex items-center justify-center space-x-2 pt-4 border-t border-primary-700">
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
import { Edit3, Trash2, X } from 'lucide-vue-next'
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'

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

// Markdown rendering
const renderedExamples = ref('')

// Configure marked options for better rendering
onMounted(() => {
  marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true, // Enable GitHub flavored markdown
  })
})

// Convert markdown to HTML
const renderMarkdown = async (markdownText: string): Promise<string> => {
  try {
    return await marked(markdownText)
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return markdownText
  }
}

// Update rendered examples when word changes
watch(() => props.word.examples, async (newExamples) => {
  if (newExamples) {
    // Convert semicolons to line breaks for better formatting
    const formattedExamples = newExamples.replace(/; /g, '\n')
    renderedExamples.value = await renderMarkdown(formattedExamples)
  }
}, { immediate: true })
</script>

<style scoped>
</style>
