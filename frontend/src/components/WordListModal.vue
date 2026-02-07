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
                class="text-xl font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                Add Group Words
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none p-1.5 rounded-md hover:bg-primary-800"
                >
                  <X class="h-5 w-5" />
                </button>
              </DialogTitle>
              <div class="mt-2">
                <p class="text-base text-primary-300">
                  Enter comma-separated words, and we'll automatically generate
                  descriptions and suggest appropriate categories for each word.
                </p>
              </div>

              <!-- Single Step: Words Input Only -->
              <div class="mt-4 space-y-3">
                <div>
                  <BaseInput
                    id="words"
                    ref="wordsInputRef"
                    v-model="words"
                    type="textarea"
                    placeholder="e.g., apples, grapes, oranges, bananas"
                    required
                    @keydown.ctrl.enter.prevent="createTopicWords"
                    @keydown.enter.ctrl.prevent="createTopicWords"
                  />
                </div>

                <div class="flex justify-end gap-2">
                  <BaseButton
                    variant="secondary"
                    type="button"
                    @click="createTopicWords"
                    :disabled="!words.trim() || isCreating"
                  >
                    <Loader2
                      v-if="isCreating"
                      class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white"
                    />
                    <Sparkles
                      v-else
                      class="-ml-1 mr-1.5 h-4.5 w-4.5 text-white"
                    />
                    {{
                      isCreating
                        ? 'Creating Words...'
                        : 'Generate & Create Words'
                    }}
                  </BaseButton>
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
import { BaseButton, BaseInput } from '@/components/ui'

import { vocabularyWordsService } from '@/services/vocabularyService'

const emit = defineEmits(['close', 'words-created'])

const props = defineProps<{
  isOpen: boolean
  userId?: string
}>()

const words = ref('')
const isCreating = ref(false)
const wordsInputRef = ref<InstanceType<typeof BaseInput>>()

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
