<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-75" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-primary-900 dark:bg-primary-950 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                {{
                  isEditing ? 'Edit Vocabulary Word' : 'Add New Vocabulary Word'
                }}
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none p-1.5 rounded-md hover:bg-primary-800"
                >
                  <svg
                    class="h-5 w-5"
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
              </DialogTitle>
              <div class="mt-2">
                <p class="text-xs text-primary-300">
                  Add a new word to your personal vocabulary collection.
                </p>
              </div>

              <form @submit.prevent="addOrUpdateWord" class="mt-4 space-y-3">
                <div>
                  <label
                    for="term"
                    class="block text-xs font-medium text-primary-50 mb-1"
                  >
                    Word
                  </label>
                  <div class="relative">
                  <input
                    type="text"
                    id="term"
                    ref="wordInputRef"
                    v-model="termLowerCase"
                    placeholder="Enter the word"
                    @keydown.enter="handleEnterKey"
                    class="w-full px-3 py-2 pr-20 border border-primary-700 rounded-md text-xs bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    @click="generateDescription"
                    :disabled="isGenerating || !formData.term.trim()"
                    class="absolute right-1 top-1 bottom-1 px-2.5 text-xs font-medium rounded bg-secondary-600 text-white hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ isGenerating ? '...' : 'Generate' }}
                  </button>
                  </div>
                </div>

                <div class="mt-2">
                  <span class="text-[10px] text-primary-300">
                    Default category:
                  </span>
                  <div class="flex gap-3 mt-1">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        v-model="defaultCategory"
                        value="learning"
                        class="w-4 h-4 text-secondary-500 bg-primary-800 border-primary-600 focus:ring-secondary-500 focus:ring-offset-primary-900"
                      />
                      <span class="text-xs text-primary-300">Learning</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        v-model="defaultCategory"
                        value=""
                        class="w-4 h-4 text-secondary-500 bg-primary-800 border-primary-600 focus:ring-secondary-500 focus:ring-offset-primary-900"
                      />
                      <span class="text-xs text-primary-300">
                        Generate New!
                      </span>
                    </label>
                  </div>
                </div>

                <div v-if="formData.categoryName" class="mt-2">
                  <span class="text-[10px] text-primary-300">Category:</span>
                  <span class="ml-2 text-xs text-primary-50">
                    {{ formData.categoryName }}
                  </span>
                </div>

                <div
                  v-if="formData.descriptionText"
                  class="mt-2 space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                >
                  <div v-if="formData.descriptionText">
                    <label
                      class="block text-[10px] font-medium text-primary-300 mb-1"
                    >
                      Description
                    </label>
                    <div
                      class="text-xs text-primary-50 bg-primary-800/50 p-2 rounded border border-primary-700/50 prose prose-invert prose-sm max-w-none description-content"
                      v-html="renderedDescription"
                    ></div>
                  </div>
                </div>

                <div v-if="errorMessage" class="mt-2 p-2.5 bg-red-900/50 border border-red-700 rounded-md">
                  <p class="text-xs text-red-200">{{ errorMessage }}</p>
                </div>

                <div class="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    @click="closeModal"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-700 px-4 py-2 text-xs font-medium text-primary-50 hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="!isFormValid || isSubmitting"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-50 text-primary-950 px-4 py-2 text-xs font-medium hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Word') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { marked } from 'marked'
import { useToast } from '@/composables/useToast'

import type { VocabularyWord, ExplainWordResponse } from '@/types'

const { error: showErrorToast } = useToast()

const emit = defineEmits(['close', 'word-saved', 'error'])

const initialFormData = {
  term: '',
  descriptionText: '',
  categoryName: '',
}

const props = defineProps<{
  isOpen: boolean
  currentWord: VocabularyWord | null
  categories?: Record<string, { name: string }>
  userId: string
  wordUid?: string
}>()

const formData = ref({ ...initialFormData })
const isGenerating = ref(false)
const isSubmitting = ref(false)
const wordInputRef = ref<HTMLInputElement>()
const renderedDescription = ref('')
const defaultCategory = ref('learning')
const errorMessage = ref('')

onMounted(() => {
  marked.setOptions({
    breaks: true,
    gfm: true,
  })
})

const renderMarkdown = async (markdownText: string): Promise<string> => {
  try {
    return await marked(markdownText)
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return markdownText
  }
}

watch(
  () => formData.value.descriptionText,
  (newDescription) => {
    if (newDescription) {
      renderMarkdown(newDescription).then((html) => {
        renderedDescription.value = html
      })
    } else {
      renderedDescription.value = ''
    }
  },
  { immediate: true },
)

const isEditing = computed(() => !!props.currentWord)

// Computed property to check if form is valid for submission
const isFormValid = computed(() => {
  return formData.value.term.trim() && formData.value.descriptionText.trim()
})

// Computed property for term with automatic lowercase conversion
const termLowerCase = computed({
  get: () => formData.value.term,
  set: (value: string) => {
    formData.value.term = value.toLowerCase()
  },
})

// Watch for currentWord changes to handle form population/reset
watch(
  () => props.currentWord,
  (currentWordVal) => {
    if (currentWordVal) {
      formData.value.term = currentWordVal.term
      formData.value.descriptionText = currentWordVal.description
      formData.value.categoryName = currentWordVal.categoryName
    }
  },
)

// Watch for modal open state to handle focus and form reset
watch(
  () => props.isOpen,
  async (isOpenVal) => {
    if (!isOpenVal) {
      resetForm()
    } else if (!props.currentWord) {
      // Reset form when opening for a new word (not editing)
      resetForm()
      await nextTick()
      wordInputRef.value?.focus()
    } else {
      await nextTick()
      wordInputRef.value?.focus()
    }
  },
  { immediate: true },
)

// Watch for modal open state to handle focus and UI state
watch(
  () => props.isOpen,
  async (isOpenVal) => {
    if (!isOpenVal) {
      resetForm()
    } else {
      await nextTick()
      wordInputRef.value?.focus()
    }
  },
)

function closeModal() {
  emit('close')
}

function resetForm() {
  Object.assign(formData.value, initialFormData)
  defaultCategory.value = 'learning'
}

function handleEnterKey(event: KeyboardEvent) {
  event.preventDefault() // Prevent form submission
  event.stopPropagation() // Stop event bubbling
  generateDescription() // Call the generate description function
}

async function generateDescription() {
  if (formData.value.term.trim()) {
    isGenerating.value = true
    try {
      const { vocabularyWordsService } =
        await import('@/services/vocabularyService')
      const skipCategorySuggestion = defaultCategory.value !== ''
      const response: ExplainWordResponse =
        await vocabularyWordsService.explainWord(
          formData.value.term,
          skipCategorySuggestion,
        )

      formData.value.descriptionText = response.description

      if (response.suggestedCategory && !skipCategorySuggestion) {
        const suggested = response.suggestedCategory.trim()
        formData.value.categoryName = suggested
      } else if (defaultCategory.value) {
        formData.value.categoryName = defaultCategory.value
      }
    } catch (error) {
      console.warn('Failed to generate description:', error)
    } finally {
      isGenerating.value = false
    }
  }
}

async function addOrUpdateWord() {
  if (!props.userId) {
    emit('error', 'User ID is required')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const { vocabularyWordsService } = await import('@/services/vocabularyService')

    if (isEditing.value && props.currentWord && props.wordUid) {
      const updatedWord = await vocabularyWordsService.updateWord(
        props.wordUid,
        {
          term: formData.value.term,
          description: formData.value.descriptionText,
          categoryName: formData.value.categoryName,
        },
        props.userId,
      )
      emit('word-saved', updatedWord)
      closeModal()
    } else {
      const createdWord = await vocabularyWordsService.createWord(
        {
          term: formData.value.term,
          description: formData.value.descriptionText,
          categoryName: formData.value.categoryName,
          userId: props.userId,
        },
        props.userId,
      )
      emit('word-saved', createdWord)
      resetForm()
      closeModal()
    }
  } catch (error) {
    console.error('Error saving vocabulary word:', error)
    const errorMsg = isEditing.value 
      ? 'Failed to update word. Please try again.'
      : 'Failed to create word. Please try again.'
    errorMessage.value = errorMsg
    showErrorToast(errorMsg)
    emit('error', errorMsg)
  } finally {
    isSubmitting.value = false
  }
}
</script>
