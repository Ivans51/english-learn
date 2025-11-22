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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-900 dark:bg-primary-950 p-6 text-left align-middle shadow-xl transition-all border border-primary-700"
            >
              <DialogTitle
                as="h3"
                class="text-2xl font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                {{ isEditing ? 'Edit Vocabulary Word' : 'Add New Vocabulary Word' }}
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none"
                >
                  <svg
                    class="h-6 w-6"
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
                <p class="text-sm text-primary-300">
                  Add a new word to your personal vocabulary collection.
                </p>
              </div>

              <form @submit.prevent="addOrUpdateWord" class="mt-6 space-y-4">
                <div>
                  <label
                    for="word"
                    class="block text-sm font-medium text-primary-50 mb-1"
                    >Word</label
                  >
                  <input
                    type="text"
                    id="word"
                    v-model="formData.word"
                    placeholder="Enter the word"
                    class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label
                    for="definition"
                    class="block text-sm font-medium text-primary-50 mb-1"
                    >Definition</label
                  >
                  <textarea
                    id="definition"
                    v-model="formData.definition"
                    placeholder="Enter the definition"
                    rows="3"
                    class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                    required
                  ></textarea>
                </div>

                <div>
                  <label
                    for="example"
                    class="block text-sm font-medium text-primary-50 mb-1"
                    >Example Sentence</label
                  >
                  <textarea
                    id="example"
                    v-model="formData.example"
                    placeholder="Enter an example sentence"
                    rows="3"
                    class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                    required
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="level"
                      class="block text-sm font-medium text-primary-50 mb-1"
                      >Level</label
                    >
                    <select
                      id="level"
                      v-model="formData.level"
                      class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                      required
                    >
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                  </div>
                  <div>
                    <label
                      for="topic"
                      class="block text-sm font-medium text-primary-50 mb-1"
                      >Topic (Optional)</label
                    >
                    <input
                      type="text"
                      id="topic"
                      v-model="formData.category"
                      placeholder="Related topic"
                      class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                    />
                  </div>
                </div>

                <!-- Display creation date for editing mode -->
                <div v-if="isEditing && currentWord?.createdAt" class="mt-4">
                  <label class="block text-sm font-medium text-primary-300 mb-1">
                    Created on <span>{{ formatDate(currentWord.createdAt) }}</span>
                  </label>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="closeModal"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-700 px-4 py-2 text-sm font-medium text-primary-50 hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-50 text-primary-950 px-4 py-2 text-sm font-medium hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    {{ isEditing ? 'Save Changes' : 'Add Word' }}
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
import { ref, watch, computed } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

import type { VocabularyWord } from '@/types'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const emit = defineEmits(['close', 'add-word', 'update-word'])

const initialFormData = {
  word: '',
  definition: '',
  example: '',
  level: 'A1' as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
  category: '',
}

const props = defineProps<{
  isOpen: boolean
  currentWord: VocabularyWord | null
}>()

const formData = ref<Pick<VocabularyWord, 'word' | 'definition' | 'example' | 'level' | 'category'>>(
  { ...initialFormData }
)

const isEditing = computed(() => !!props.currentWord)

// Watch for changes in currentWord prop to populate form for editing
watch(() => props.currentWord, (newVal) => {
  if (newVal) {
    // Populate formData with existing word data for editing
    formData.value.word = newVal.word
    formData.value.definition = newVal.definition
    formData.value.example = newVal.example
    formData.value.level = newVal.level
    formData.value.category = newVal.category
  } else {
    // Reset formData for adding a new word
    Object.assign(formData.value, initialFormData)
  }
}, { immediate: true }) // Run immediately on component mount/prop change

// Reset form when modal opens and currentWord is null (add mode)
watch(() => props.isOpen, (newValue) => {
  if (newValue && !props.currentWord) {
    Object.assign(formData.value, initialFormData)
  }
})

function closeModal() {
  emit('close')
}

function addOrUpdateWord() {
  if (isEditing.value && props.currentWord) {
    // Update existing word
    const updatedWord: VocabularyWord = {
      ...props.currentWord, // Keep existing id, status, createdAt
      word: formData.value.word,
      definition: formData.value.definition,
      example: formData.value.example,
      level: formData.value.level,
      category: formData.value.category || 'General',
    }
    emit('update-word', updatedWord)
  } else {
    // Add new word
    const wordToAdd: VocabularyWord = {
      ...formData.value,
      id: Date.now().toString(), // Simple unique ID generation
      status: 'learning', // New words always start as learning
      createdAt: new Date().toISOString(),
      category: formData.value.category || 'General', // Default category if none provided
    }
    emit('add-word', wordToAdd)
  }
  closeModal()
}
</script>
