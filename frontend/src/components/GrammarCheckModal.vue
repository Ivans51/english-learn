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
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-primary-900 dark:bg-primary-950 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-2xl font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                <div class="flex items-center">
                  <div
                    class="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 mr-3"
                  >
                    <MessageCircle
                      class="h-6 w-6 text-primary-600 dark:text-primary-300"
                    />
                  </div>
                  <div>
                    <div>Grammar Practice</div>
                    <div class="text-sm text-primary-300 font-normal">
                      Topic: {{ topicTitle }}
                    </div>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none cursor-pointer"
                >
                  <X class="h-6 w-6" />
                </button>
              </DialogTitle>

              <div class="mt-6">
                <p class="text-sm text-primary-300">
                  Practice your English grammar! Type a sentence and I'll help
                  you improve it.
                </p>
              </div>

              <!-- Chat Container -->
              <div class="mt-6">
                <div
                  id="chat-container"
                  class="h-96 overflow-y-auto border border-primary-700 rounded-lg p-4 bg-primary-800 dark:bg-primary-900"
                >
                  <div
                    v-if="chatMessages.length === 0"
                    class="text-center text-primary-400 py-8"
                  >
                    <MessageCircle
                      class="mx-auto h-12 w-12 text-primary-500 mb-4"
                    />
                    <p>Start practicing your English grammar!</p>
                    <p class="text-sm mt-2">
                      Type a sentence and I'll help you improve it.
                    </p>
                  </div>

                  <div v-else class="space-y-4">
                    <div
                      v-for="message in chatMessages"
                      :key="message.id"
                      class="flex"
                      :class="
                        message.type === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      "
                    >
                      <div
                        class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-primary-700 dark:bg-black text-primary-50"
                      >
                        <div v-if="message.isLoading" class="flex items-center">
                          <div
                            class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
                          ></div>
                          <span>{{ message.content }}</span>
                        </div>
                        <div
                          v-else
                          class="markdown-content whitespace-pre-wrap"
                          v-html="message.content"
                        ></div>
                        <div class="text-xs opacity-70 mt-1">
                          {{ message.timestamp.toLocaleTimeString() }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Input Area -->
              <div class="mt-6">
                <div class="flex space-x-3">
                  <div class="flex-1">
                    <input
                      ref="inputRef"
                      type="text"
                      v-model="currentMessage"
                      @keydown="handleKeyPress"
                      @input="forceCapitalization"
                      placeholder="Type your sentence here..."
                      autocapitalize="sentences"
                      class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                      :disabled="isLoading"
                    />
                  </div>
                  <div>
                    <button
                      @click="sendMessage"
                      :disabled="!currentMessage.trim() || isLoading"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-950 bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Send v-if="!isLoading" class="h-4 w-4" />
                      <span
                        v-else
                        class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-950"
                      ></span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  @click="generatePracticePhrase"
                  :disabled="isLoading"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 transition-colors cursor-pointer"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  Generate Practice Phrase
                </button>
                <button
                  @click="closeModal"
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-700 px-4 py-2 text-sm font-medium text-primary-50 hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors cursor-pointer"
                >
                  Close
                </button>
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
import { marked } from 'marked'
import { useToast } from '@/composables/useToast'
import { topicService } from '@/services/topicService'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { MessageCircle, Plus, Send, X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  topicTitle: string
  topicId: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface GrammarCheckResult {
  isCorrect: boolean
  feedback: string
  suggestions?: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { success: showSuccessToast, error: showErrorToast } = useToast()

const currentMessage = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

// Configure marked options for better rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // Enable GitHub flavored markdown
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

const resetModal = () => {
  currentMessage.value = ''
  chatMessages.value = []
  isLoading.value = false
}

const closeModal = () => {
  resetModal()
  emit('close')
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''
  isLoading.value = true

  // Add user message to chat
  const userChatMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content: userMessage,
    timestamp: new Date(),
  }
  chatMessages.value.push(userChatMessage)

  // Add loading message
  const loadingMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    type: 'assistant',
    content: 'Checking your grammar...',
    timestamp: new Date(),
    isLoading: true,
  }
  chatMessages.value.push(loadingMessage)
  scrollToBottom()

  await nextTick()

  try {
    // Use topic service to check grammar
    const result = await topicService.checkGrammar(
      props.topicTitle,
      userMessage,
      'anonymous',
    )

    // Remove loading message
    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    // Add assistant response
    const formattedContent = await formatGrammarFeedback(result)
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: formattedContent,
      timestamp: new Date(),
    }
    chatMessages.value.push(assistantMessage)

    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error checking grammar:', error)

    // Remove loading message and show error
    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    const errorContent = await renderMarkdown(
      '## ⚠️ Error\n\nSorry, I encountered an error while checking your grammar. Please try again.',
    )
    const errorMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: errorContent,
      timestamp: new Date(),
    }
    chatMessages.value.push(errorMessage)

    showErrorToast('Failed to check grammar. Please try again.')
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
    focusInput()
  }
}

const formatGrammarFeedback = async (
  result: GrammarCheckResult | string | unknown,
): Promise<string> => {
  try {
    // If result is a string, try to parse it as JSON
    let parsedResult = result
    if (typeof result === 'string') {
      try {
        parsedResult = JSON.parse(result)
      } catch {
        // If JSON parsing fails, treat the entire string as feedback
        const feedback = `## Grammar Feedback\n\n${result}`
        return await renderMarkdown(feedback)
      }
    }

    // Check if we have the expected structure
    if (
      parsedResult &&
      typeof parsedResult === 'object' &&
      'isCorrect' in parsedResult
    ) {
      const result = parsedResult as GrammarCheckResult
      if (result.isCorrect) {
        const feedback = `## ✅ Great job!\n\nYour sentence is grammatically correct.\n\n${result.feedback || 'Well done!'}`
        return await renderMarkdown(feedback)
      } else {
        let feedback = `## ❌ Areas for improvement\n\n${result.feedback || 'Please review your grammar.'}`

        if (
          result.suggestions &&
          Array.isArray(result.suggestions) &&
          result.suggestions.length > 0
        ) {
          const suggestionsText = result.suggestions
            .map((s: string, i: number) => `${i + 1}. ${s}`)
            .join('\n')
          feedback += `\n## Suggestions\n${suggestionsText}`
        }

        return await renderMarkdown(feedback)
      }
    }

    // Fallback: treat as general feedback
    const fallbackFeedback = `## 📝 Grammar Feedback\n\n${JSON.stringify(parsedResult, null, 2)}`
    return await renderMarkdown(fallbackFeedback)
  } catch (error) {
    console.error('Error formatting grammar feedback:', error)
    const errorFeedback = `## 📝 Grammar Feedback\n\nSorry, there was an error processing the response.`
    return await renderMarkdown(errorFeedback)
  }
}

const generatePracticePhrase = async () => {
  if (isLoading.value) return

  isLoading.value = true

  // Add loading message
  const loadingMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'assistant',
    content: 'Generating a new practice phrase...',
    timestamp: new Date(),
    isLoading: true,
  }
  chatMessages.value.push(loadingMessage)

  await nextTick()
  scrollToBottom()

  try {
    // Use topic service to generate practice phrase
    const result = await topicService.generatePracticePhrase(
      props.topicTitle,
      'anonymous',
    )

    console.log('Generated practice phrase result:', result)

    // Remove loading message
    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    // Add practice phrase with markdown formatting
    const phraseContent = `## 📝 Practice Phrase\n\n**Topic:** ${props.topicTitle}\n\n"${result.phrase}"\n\n${result.grammarFocus ? `**Grammar Focus:** ${result.grammarFocus}\n\n` : ''}${result.translation ? `**Translation:** ${result.translation}\n\n` : ''}`
    const renderedPhrase = await renderMarkdown(phraseContent)

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: renderedPhrase,
      timestamp: new Date(),
    }
    chatMessages.value.push(assistantMessage)

    showSuccessToast('New practice phrase generated!')

    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error generating practice phrase:', error)

    // Remove loading message and show error
    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    const errorContent = await renderMarkdown(
      '## ⚠️ Error\n\nSorry, I encountered an error while generating a practice phrase. Please try again.',
    )
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: errorContent,
      timestamp: new Date(),
    }
    chatMessages.value.push(errorMessage)

    showErrorToast('Failed to generate practice phrase. Please try again.')
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
    focusInput()
  }
}

const scrollToBottom = async () => {
  const chatContainer = document.getElementById('chat-container')
  if (chatContainer) {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    await nextTick()
    chatContainer.scrollTop = chatContainer.scrollHeight

    // Additional scroll to ensure we reach the very bottom
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 50)
  }
}

const forceCapitalization = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Capitalize first letter of the sentence
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }

  target.value = value
  currentMessage.value = value
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Watch for modal open/close to reset state and autofocus
watch(
  () => props.isOpen,
  (newIsOpen) => {
    if (newIsOpen) {
      focusInput()
    } else {
      resetModal()
    }
  },
)
</script>

<style>
/* GrammarCheckModal specific styles - markdown styling is now global */
</style>
