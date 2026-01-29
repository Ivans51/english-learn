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
              class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-primary-900 dark:bg-primary-950 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-2xl font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                Add Group Words
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none"
                >
                  <X class="h-6 w-6" />
                </button>
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-primary-300">
                  Enter comma-separated words, and we'll automatically generate
                  descriptions and suggest appropriate categories for each word.
                </p>
              </div>

              <!-- Single Step: Words Input Only -->
              <div class="mt-6 space-y-4">
                <div>
                  <label
                    for="words"
                    class="block text-sm font-medium text-primary-50 mb-1"
                  >
                    Words
                  </label>
                  <textarea
                    id="words"
                    ref="wordsInputRef"
                    v-model="words"
                    placeholder="e.g., apples, grapes, oranges, bananas"
                    rows="5"
                    class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors resize-none"
                    required
                  ></textarea>
                </div>

                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="closeModal"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-700 px-4 py-2 text-sm font-medium text-primary-50 hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    @click="createTopicWords"
                    :disabled="!words.trim() || isCreating"
                    class="inline-flex justify-center rounded-md border border-transparent bg-secondary-600 text-white px-4 py-2 text-sm font-medium hover:bg-secondary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Loader2
                      v-if="isCreating"
                      class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    />
                    <Sparkles v-else class="-ml-1 mr-2 h-4 w-4 text-white" />
                    {{
                      isCreating
                        ? 'Creating Words...'
                        : 'Generate & Create Words'
                    }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { Loader2, Sparkles, X } from 'lucide-vue-next'

import { vocabularyWordsService } from '@/services/vocabularyService'

const emit = defineEmits(['close', 'words-created'])

const props = defineProps<{
  isOpen: boolean
  userId?: string
}>()

const words = ref('')
const isCreating = ref(false)
const wordsInputRef = ref<HTMLTextAreaElement>()

// Watch for modal open state to handle focus
watch(
  () => props.isOpen,
  async (isOpenVal) => {
    if (isOpenVal) {
      await nextTick()
      wordsInputRef.value?.focus()
    } else {
      resetModal()
    }
  },
)

function closeModal() {
  emit('close')
}

function resetModal() {
  words.value = ''
  isCreating.value = false
}

async function createTopicWords() {
  if (!words.value.trim()) return

  isCreating.value = true
  try {
    const result = await vocabularyWordsService.createTopicWords({
      words: words.value.trim(),
      userId: props.userId || 'anonymous',
    })

    emit('words-created', { createdWords: result.createdWords })
    closeModal()
  } catch (error) {
    console.error('Failed to create topic words:', error)
    // You might want to show an error toast here
  } finally {
    isCreating.value = false
  }
}
</script>
