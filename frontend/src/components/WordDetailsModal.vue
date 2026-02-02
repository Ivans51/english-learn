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
            class="relative bg-primary-900 dark:bg-primary-950 rounded-lg shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] flex flex-col"
            @click.stop
          >
            <!-- Close Button -->
            <button
              @click="closeModal"
              class="absolute top-3 right-3 text-primary-400 hover:text-primary-200 focus:outline-none transition-colors z-10 p-1.5 rounded-md hover:bg-primary-800"
            >
              <X class="w-5 h-5" />
            </button>

            <!-- Content -->
            <div class="p-4 overflow-y-auto custom-scrollbar">
              <!-- Word Term -->
              <div class="mb-4 pr-8">
                <h2 class="text-xl font-bold text-primary-50">
                  {{ word.term }}
                </h2>
                <span class="text-xs text-primary-400">
                  category: {{ word.categoryName }}
                </span>
              </div>

              <hr class="mb-3 border-primary-700" />

              <!-- Description -->
              <div class="mb-4">
                <h4 class="text-base font-medium text-primary-50 mb-2 flex items-center">
                  <svg
                    class="w-4 h-4 mr-2 text-primary-400"
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
                  Description
                </h4>
                <div class="bg-primary-800/50 rounded-lg p-3 max-h-64 overflow-y-auto custom-scrollbar">
                  <div class="text-primary-200 leading-relaxed prose prose-invert prose-sm max-w-none description-content" v-html="renderedDescription"></div>
                </div>
              </div>

              <!-- Status Badge & Actions -->
              <div class="flex items-center justify-between pt-3 border-t border-primary-700">
                <div class="flex items-center gap-2">
                  <button
                    @click="toggleWordStatus"
                    class="text-xs px-2.5 py-1 rounded cursor-pointer transition-colors hover:opacity-80"
                    :class="[
                      localWordStatus === 'completed'
                        ? 'bg-green-900/60 text-green-200'
                        : 'bg-yellow-900/40 text-yellow-200'
                    ]"
                    title="Click to change status"
                  >
                    {{ localWordStatus === 'completed' ? 'completed' : 'pending' }}
                  </button>
                  <span class="text-[10px] text-primary-500">click to toggle</span>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1.5">
                  <button
                    @click="handleVoicePractice"
                    class="h-9 w-9 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-green-600 dark:hover:text-green-400 rounded border border-primary-300 dark:border-primary-600 cursor-pointer transition-colors"
                    title="Practice pronunciation"
                  >
                    <Mic class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleGrammarCheck"
                    class="h-9 w-9 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-blue-600 dark:hover:text-blue-400 rounded border border-primary-300 dark:border-primary-600 cursor-pointer transition-colors"
                    title="Practice grammar"
                  >
                    <MessageCircle class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete"
                    class="h-9 w-9 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded border border-primary-300 dark:border-primary-600 cursor-pointer transition-colors"
                    title="Delete word"
                  >
                    <Trash2 class="w-4 h-4" />
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
import { MessageCircle, Mic, Trash2, X } from 'lucide-vue-next'
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
  (e: 'grammar-check', wordUid: string, term: string): void
  (e: 'voice-practice', term: string): void
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

const handleDelete = () => {
  emit('delete-word', props.wordUid)
  closeModal()
}

const handleVoicePractice = () => {
  emit('voice-practice', props.word.term)
}

const handleGrammarCheck = () => {
  emit('grammar-check', props.wordUid, props.word.term)
}

// Markdown rendering
const renderedDescription = ref('')

// Configure marked options for better rendering
onMounted(() => {
  marked.setOptions({
    breaks: true,
    gfm: true,
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

// Update rendered description when word changes
watch(() => props.word.description, (newDescription) => {
  if (newDescription) {
    renderMarkdown(newDescription).then(html => {
      renderedDescription.value = html
    })
  }
}, { immediate: true })
</script>
