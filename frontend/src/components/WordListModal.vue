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
          <div class="modal-container modal-lg" @click.stop>
            <!-- Header -->
            <div class="modal-header">
              <h2 class="modal-title">Add Group Words</h2>
              <button @click="closeModal" class="modal-close-btn">
                <X class="h-5 w-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <p class="text-base text-gray-700 dark:text-primary-300 mb-4">
                Enter comma-separated words, and we'll automatically generate
                descriptions and suggest appropriate categories for each word.
              </p>

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
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
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
