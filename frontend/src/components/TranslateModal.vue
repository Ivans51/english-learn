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
            <!-- Header -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-primary-700 gap-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div
                    class="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-800 mr-3"
                  >
                    <Languages class="h-6 w-6 text-primary-300" />
                  </div>
                  <div>
                    <h2 class="text-lg sm:text-xl font-bold text-primary-50">
                      Translate
                    </h2>
                    <p class="text-sm text-primary-400 mt-1" v-if="word">
                      Word: {{ word }}
                    </p>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none transition-colors p-1.5 rounded-md hover:bg-primary-800 sm:hidden"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
              <div class="flex items-center gap-2">
                <!-- Language Direction Selector -->
                <select
                  v-model="translationDirection"
                  @change="handleDirectionChange"
                  class="flex-1 sm:flex-none px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                >
                  <option value="es-en">Spanish → English</option>
                  <option value="en-es">English → Spanish</option>
                </select>
                <button
                  @click="closeModal"
                  class="hidden sm:block text-primary-400 hover:text-primary-200 focus:outline-none transition-colors p-1.5 rounded-md hover:bg-primary-800"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto flex flex-col">
              <!-- Phrase Display -->
              <div class="p-4 border-b border-primary-700">
                <div
                  v-if="currentPhrase?.style || currentPhrase?.grammarFocus"
                  class="mb-2 flex flex-wrap gap-2"
                >
                  <span
                    v-if="currentPhrase.style"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-800 text-primary-300 border border-primary-700"
                  >
                    {{ currentPhrase.style }} - {{ currentPhrase.grammarFocus }}
                  </span>
                </div>
                <div
                  v-if="currentPhrase"
                  class="rounded-lg p-4 text-lg font-medium"
                  :class="phraseBoxClass"
                >
                  {{ currentPhrase.phrase }}
                </div>
                <div v-else-if="isGeneratingPhrase" class="text-center py-4">
                  <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"
                  ></div>
                  <p class="text-primary-400 text-sm mt-2">
                    Generating phrase...
                  </p>
                </div>
              </div>

              <!-- Result Display -->
              <div v-if="lastResult" class="p-4 border-b border-primary-700">
                <div
                  class="rounded-lg p-4"
                  :class="
                    lastResult.isCorrect
                      ? 'bg-green-900/50 border border-green-700'
                      : 'bg-red-900/50 border border-red-700'
                  "
                >
                  <div class="flex items-center mb-2">
                    <span
                      class="text-lg font-bold"
                      :class="
                        lastResult.isCorrect ? 'text-green-400' : 'text-red-400'
                      "
                    >
                      {{ lastResult.isCorrect ? '✓ Correct!' : '✗ Incorrect' }}
                    </span>
                  </div>
                  <div v-if="!lastResult.isCorrect" class="text-primary-200">
                    <p class="mb-2">
                      <span class="text-primary-400">Correct translation:</span>
                      <span class="ml-2 font-medium text-green-400">
                        {{ currentPhrase?.translation }}
                      </span>
                    </p>
                    <p v-if="lastResult.feedback" class="text-red-300 text-sm">
                      {{ lastResult.feedback }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Input Area -->
              <div class="p-4 flex-1 flex flex-col">
                <div class="flex-1 flex flex-col">
                  <label class="text-xs text-primary-400 mb-2">
                    Your translation:
                  </label>
                  <textarea
                    ref="translationInput"
                    v-model="userTranslation"
                    @keydown="handleKeyPress"
                    @input="forceCapitalization"
                    @focus="handleInputFocus"
                    :placeholder="`Type the translation in ${targetLanguageName}...`"
                    rows="3"
                    class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-black text-primary-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors resize-none"
                    :disabled="isLoading || isGeneratingPhrase"
                  ></textarea>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between mt-4">
                  <BaseButton
                    variant="secondary"
                    @click="generateNewPhrase"
                    :disabled="isLoading || isGeneratingPhrase || !word"
                    size="sm"
                    title="Generate new phrase (Ctrl+K)"
                  >
                    <RefreshCw
                      v-if="!isGeneratingPhrase"
                      class="h-4 w-4 mr-2"
                    />
                    <span
                      v-else
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
                    ></span>
                    New Phrase
                    <kbd
                      class="ml-2 px-1.5 py-0.5 text-xs bg-primary-950 rounded border border-primary-600 text-primary-400"
                    >
                      Ctrl+K
                    </kbd>
                  </BaseButton>

                  <BaseButton
                    variant="primary"
                    @click="checkTranslation"
                    :disabled="
                      !userTranslation.trim() || isLoading || isGeneratingPhrase
                    "
                  >
                    <span v-if="!isLoading">Check</span>
                    <span
                      v-else
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-950"
                    ></span>
                  </BaseButton>
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
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { topicService } from '@/services/topicService'
import { Languages, X, RefreshCw } from 'lucide-vue-next'
import { BaseButton } from '@/components/ui'

interface Props {
  isOpen: boolean
  word: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { error: showErrorToast } = useToast()

const translationInput = ref<HTMLTextAreaElement | null>(null)
const userTranslation = ref('')
const currentPhrase = ref<{
  phrase: string
  translation: string
  grammarFocus?: string
  style?: 'literal' | 'colloquial' | 'idiomatic' | 'formal'
} | null>(null)
const isLoading = ref(false)
const isGeneratingPhrase = ref(false)
const lastResult = ref<{ isCorrect: boolean; feedback?: string } | null>(null)
const translationDirection = ref<'es-en' | 'en-es'>('es-en')

const targetLanguage = computed(() =>
  translationDirection.value === 'es-en' ? 'en' : 'es',
)
const targetLanguageName = computed(() =>
  targetLanguage.value === 'es' ? 'Spanish' : 'English',
)

const phraseBoxClass = computed(() => {
  if (!lastResult.value) {
    return 'bg-primary-800 border border-primary-700 text-primary-50'
  }
  return lastResult.value.isCorrect
    ? 'bg-green-900/50 border border-green-700 text-green-100'
    : 'bg-red-900/50 border border-red-700 text-red-100'
})

// Register/unregister global keyboard shortcuts when modal opens/closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleGlobalKeyPress)
    } else {
      window.removeEventListener('keydown', handleGlobalKeyPress)
      // Reset modal when closing to ensure clean state on next open
      resetModal()
    }
  },
)

// Auto-generate phrase when modal opens or word changes
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && props.word) {
      await generateNewPhrase()
    }
  },
)

watch(
  () => props.word,
  async (newWord) => {
    if (props.isOpen && newWord) {
      await generateNewPhrase()
    }
  },
)

const closeModal = () => {
  emit('close')
}

const resetModal = () => {
  userTranslation.value = ''
  currentPhrase.value = null
  lastResult.value = null
  isLoading.value = false
  isGeneratingPhrase.value = false
}

const handleDirectionChange = async () => {
  if (props.word) {
    resetModal()
    await generateNewPhrase()
  }
}

const generateNewPhrase = async () => {
  if (!props.word) {
    showErrorToast('No word selected for translation practice')
    return
  }

  isGeneratingPhrase.value = true
  lastResult.value = null
  userTranslation.value = ''

  try {
    const result = await topicService.generateTranslatePhrase(
      props.word,
      translationDirection.value,
      'anonymous',
    )
    currentPhrase.value = result
  } catch (error) {
    console.error('Error generating phrase:', error)
    showErrorToast('Failed to generate phrase. Please try again.')
  } finally {
    isGeneratingPhrase.value = false
    // Focus the input after phrase generation
    nextTick(() => {
      translationInput.value?.focus()
    })
  }
}

const checkTranslation = async () => {
  if (!userTranslation.value.trim() || !currentPhrase.value) return

  isLoading.value = true

  try {
    const result = await topicService.checkTranslation(
      currentPhrase.value.phrase,
      userTranslation.value.trim(),
      translationDirection.value,
      'anonymous',
    )

    lastResult.value = {
      isCorrect: result.isCorrect,
      feedback: result.feedback,
    }
  } catch (error) {
    console.error('Error checking translation:', error)
    showErrorToast('Failed to check translation. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    checkTranslation()
  }
}

const handleGlobalKeyPress = (event: KeyboardEvent) => {
  // Ctrl+K or Cmd+K to generate new phrase
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (!isLoading.value && !isGeneratingPhrase.value && props.word) {
      generateNewPhrase()
    }
  }
}

const handleInputFocus = () => {
  // Scroll input into view when keyboard opens on mobile
  setTimeout(() => {
    translationInput.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, 300)
}

const forceCapitalization = () => {
  if (userTranslation.value.length > 0) {
    userTranslation.value =
      userTranslation.value.charAt(0).toUpperCase() +
      userTranslation.value.slice(1)
  }
}

// Cleanup event listener on component unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyPress)
})
</script>

<style scoped>
/* Custom scrollbar for the modal content */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
