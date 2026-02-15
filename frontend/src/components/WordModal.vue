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
        <div class="modal-backdrop"></div>

        <!-- Modal -->
        <Transition
          name="modal-content"
          appear
          appear-active-class="transition-all duration-300"
          appear-from-class="opacity-0 scale-95 translate-y-4"
          appear-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div class="modal-container modal-lg h-[80vh]" @click.stop>
            <!-- Header -->
            <div class="modal-header">
              <h2 class="modal-title">
                {{
                  isEditing ? 'Edit Vocabulary Word' : 'Add New Vocabulary Word'
                }}
              </h2>
              <button
                @click="closeModal"
                class="modal-close-btn absolute top-3 right-3 z-10"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-4 flex-1 flex flex-col min-h-0">
              <form
                @submit.prevent="addOrUpdateWord"
                class="space-y-3 flex flex-col min-h-0"
              >
                <div class="flex-shrink-0">
                  <div class="relative">
                    <BaseInput
                      id="term"
                      ref="wordInputRef"
                      v-model="termLowerCase"
                      placeholder="Enter the word"
                      @keydown.enter="handleEnterKey"
                      required
                    />
                    <BaseButton
                      variant="secondary"
                      type="button"
                      @click="generateDescription"
                      :disabled="isGenerating || !formData.term.trim()"
                      class="absolute right-1 top-1 bottom-1 !py-1 !text-sm"
                    >
                      {{ isGenerating ? '...' : 'Generate' }}
                    </BaseButton>
                  </div>
                </div>

                <div class="mt-3 flex-shrink-0">
                  <label
                    class="block text-sm text-gray-700 dark:text-primary-300 mb-1"
                  >
                    Category
                  </label>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <BaseCombobox
                        id="category"
                        v-model="selectedCategoryId"
                        :options="categoriesList"
                        placeholder="Search categories..."
                        allow-clear
                        @create-new="handleCreateNewCategory"
                      />
                      <BaseButton
                        :variant="autoDetectMode ? 'primary' : 'secondary'"
                        size="sm"
                        type="button"
                        @click="enableAutoDetect"
                      >
                        ✨ Auto
                      </BaseButton>
                    </div>
                  </div>
                </div>

                <div v-if="!autoDetectMode" class="mt-3 flex-shrink-0">
                  <span class="text-sm text-gray-700 dark:text-primary-300">
                    Category:
                  </span>
                  <span
                    class="ml-2 text-base text-gray-900 dark:text-primary-50"
                  >
                    {{ getSelectedCategoryDisplayName() }}
                  </span>
                </div>

                <div
                  v-if="formData.descriptionText"
                  class="mt-3 flex-1 flex flex-col min-h-0"
                >
                  <h4
                    class="text-base font-medium text-gray-900 dark:text-primary-50 mb-2 flex items-center"
                  >
                    <BookOpen
                      class="w-4 h-4 mr-2 text-gray-500 dark:text-primary-400"
                    />
                    Description
                  </h4>
                  <div
                    class="bg-gray-100 dark:bg-primary-800/50 rounded-lg p-3 flex-1 overflow-y-auto custom-scrollbar"
                  >
                    <div
                      class="text-gray-800 dark:text-primary-200 leading-relaxed prose prose-invert max-w-none description-content"
                      v-html="renderedDescription"
                    ></div>
                  </div>
                </div>

                <div
                  v-if="errorMessage"
                  class="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-md flex-shrink-0"
                >
                  <p class="text-base text-red-200">{{ errorMessage }}</p>
                </div>

                <div class="mt-4 flex justify-end gap-3 flex-shrink-0">
                  <BaseButton
                    variant="primary"
                    type="submit"
                    :disabled="!isFormValid || isSubmitting"
                  >
                    {{
                      isSubmitting
                        ? 'Saving...'
                        : isEditing
                          ? 'Save Changes'
                          : 'Add Word'
                    }}
                  </BaseButton>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import { BookOpen, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { BaseButton, BaseInput, BaseCombobox } from '@/components/ui'

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
const wordInputRef = ref<InstanceType<typeof BaseInput>>()
const renderedDescription = ref('')
const selectedCategoryId = ref('')
const customCategoryName = ref('')
const errorMessage = ref('')
const autoDetectMode = ref(false)

const categoriesList = computed(() => {
  const cats = props.categories || {}
  return Object.entries(cats).map(([id, cat]) => ({ id, name: cat.name }))
})

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
  const hasTerm = formData.value.term.trim()
  const hasDescription = formData.value.descriptionText.trim()
  const hasCategory =
    autoDetectMode.value ||
    formData.value.categoryName.trim() ||
    selectedCategoryId.value === ''
  return hasTerm && hasDescription && hasCategory
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
      const catName = currentWordVal.categoryName?.toLowerCase()
      const matchedId = Object.keys(props.categories || {}).find(
        (id) => props.categories?.[id]?.name?.toLowerCase() === catName,
      )
      if (matchedId) {
        selectedCategoryId.value = matchedId
        updateCategoryFromSelection()
      }
    }
  },
)

function updateCategoryFromSelection() {
  console.log(selectedCategoryId.value)
  if (autoDetectMode.value) {
    formData.value.categoryName = ''
    return
  }
  if (!selectedCategoryId.value || selectedCategoryId.value === '') {
    formData.value.categoryName = ''
    return
  }
  if (selectedCategoryId.value.startsWith('custom-')) {
    return
  }
  const category = categoriesList.value.find(
    (c) => c.id === selectedCategoryId.value,
  )
  formData.value.categoryName = category?.name || ''
}

function getSelectedCategoryDisplayName(): string {
  if (autoDetectMode.value) {
    return '✨ Auto-detect'
  }
  if (selectedCategoryId.value && selectedCategoryId.value !== '') {
    if (selectedCategoryId.value.startsWith('custom-')) {
      return formData.value.categoryName || ''
    }
    const category = categoriesList.value.find(
      (c) => c.id === selectedCategoryId.value,
    )
    return category?.name || formData.value.categoryName || ''
  }
  return 'Uncategorized'
}

function enableAutoDetect() {
  autoDetectMode.value = true
  selectedCategoryId.value = ''
  formData.value.categoryName = ''
}

function handleCreateNewCategory(name: string) {
  autoDetectMode.value = false
  const newId = `custom-${Date.now()}`
  selectedCategoryId.value = newId
  formData.value.categoryName = name
}

watch([selectedCategoryId, autoDetectMode], updateCategoryFromSelection, {
  immediate: true,
})

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

function closeModal() {
  emit('close')
}

function resetForm() {
  Object.assign(formData.value, initialFormData)
  selectedCategoryId.value = ''
  customCategoryName.value = ''
  autoDetectMode.value = false
}

function handleEnterKey(event: KeyboardEvent) {
  event.preventDefault() // Prevent form submission
  event.stopPropagation() // Stop event bubbling
  generateDescription() // Call the generate description function
}

async function generateDescription() {
  if (formData.value.term.trim()) {
    updateCategoryFromSelection()
    isGenerating.value = true
    try {
      const { vocabularyWordsService } =
        await import('@/services/vocabularyService')
      const skipCategorySuggestion =
        selectedCategoryId.value !== '' || !autoDetectMode.value
      const response: ExplainWordResponse =
        await vocabularyWordsService.explainWord(
          formData.value.term,
          skipCategorySuggestion,
        )

      formData.value.descriptionText = response.description

      if (response.suggestedCategory && autoDetectMode.value) {
        formData.value.categoryName = response.suggestedCategory.trim()
        autoDetectMode.value = false
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
    const { vocabularyWordsService } =
      await import('@/services/vocabularyService')

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
