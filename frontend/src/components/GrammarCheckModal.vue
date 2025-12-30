<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
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
  gfm: true // Enable GitHub flavored markdown
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
    timestamp: new Date()
  }
  chatMessages.value.push(userChatMessage)

  // Add loading message
  const loadingMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    type: 'assistant',
    content: 'Checking your grammar...',
    timestamp: new Date(),
    isLoading: true
  }
  chatMessages.value.push(loadingMessage)
  scrollToBottom()

  await nextTick()

  try {
    // Use topic service to check grammar
    const result = await topicService.checkGrammar(
      props.topicTitle,
      userMessage,
      'anonymous'
    )

    // Remove loading message
    chatMessages.value = chatMessages.value.filter(msg => !msg.isLoading)

    // Add assistant response
    const formattedContent = await formatGrammarFeedback(result)
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: formattedContent,
      timestamp: new Date()
    }
    chatMessages.value.push(assistantMessage)

    // Scroll to bottom
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('Error checking grammar:', error)

    // Remove loading message and show error
    chatMessages.value = chatMessages.value.filter(msg => !msg.isLoading)

    const errorContent = await renderMarkdown('## ⚠️ Error\n\nSorry, I encountered an error while checking your grammar. Please try again.')
    const errorMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: errorContent,
      timestamp: new Date()
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

const formatGrammarFeedback = async (result: GrammarCheckResult | string | unknown): Promise<string> => {
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
    if (parsedResult && typeof parsedResult === 'object' && 'isCorrect' in parsedResult) {
      const result = parsedResult as GrammarCheckResult
      if (result.isCorrect) {
        const feedback = `## ✅ Great job!\n\nYour sentence is grammatically correct.\n\n${result.feedback || 'Well done!'}`
        return await renderMarkdown(feedback)
      } else {
        let feedback = `## ❌ Areas for improvement\n\n${result.feedback || 'Please review your grammar.'}`

        if (result.suggestions && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
          const suggestionsText = result.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
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
    isLoading: true
  }
  chatMessages.value.push(loadingMessage)

  await nextTick()
  scrollToBottom()

  try {
    // Use topic service to generate practice phrase
    const result = await topicService.generatePracticePhrase(
      props.topicTitle,
      'anonymous'
    )

    // Remove loading message
    chatMessages.value = chatMessages.value.filter(msg => !msg.isLoading)

    // Add practice phrase with markdown formatting
    const phraseContent = `## 📝 Practice Phrase\n\n**Topic:** ${props.topicTitle}\n\n"${result}"`
    const renderedPhrase = await renderMarkdown(phraseContent)

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: renderedPhrase,
      timestamp: new Date()
    }
    chatMessages.value.push(assistantMessage)

    showSuccessToast('New practice phrase generated!')

    // Scroll to bottom
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('Error generating practice phrase:', error)

    // Remove loading message and show error
    chatMessages.value = chatMessages.value.filter(msg => !msg.isLoading)

    const errorContent = await renderMarkdown('## ⚠️ Error\n\nSorry, I encountered an error while generating a practice phrase. Please try again.')
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: errorContent,
      timestamp: new Date()
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

const scrollToBottom = () => {
  const chatContainer = document.getElementById('chat-container')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Watch for modal open/close to reset state and autofocus
watch(() => props.isOpen, (newIsOpen) => {
  if (newIsOpen) {
    focusInput()
  } else {
    resetModal()
  }
})
</script>

<style>
/* Markdown styling */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  font-weight: 600;
  color: rgb(250 250 250); /* text-primary-50 */
  margin-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.125rem; /* text-lg */
  border-bottom: 1px solid rgb(75 85 99); /* border-primary-600 */
  padding-bottom: 0.25rem;
}

.markdown-content h3 {
  font-size: 1rem; /* text-base */
}

.markdown-content p {
  margin-bottom: 0.5rem;
  color: rgb(250 250 250); /* text-primary-50 */
}

.markdown-content strong {
  font-weight: 600;
  color: rgb(34 197 94); /* text-secondary-400 */
}

.markdown-content em {
  font-style: italic;
  color: rgb(209 213 219); /* text-primary-300 */
}

.markdown-content ul,
.markdown-content ol {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
  padding-left: 0;
}

.markdown-content li {
  margin-bottom: 0.125rem;
  color: rgb(250 250 250); /* text-primary-50 */
  line-height: 1.4;
}

.markdown-content ul li {
  list-style-type: disc;
  list-style-position: outside;
}

.markdown-content ol {
  counter-reset: item;
}

.markdown-content ol li {
  list-style-type: decimal;
  list-style-position: outside;
  margin-left: 0.5rem;
}

/* Fix for ordered list formatting issues */
.markdown-content ol {
  margin-top: 0;
  padding-top: 0;
}

.markdown-content ol + p {
  margin-top: 0.5rem;
}

/* Handle nested lists that might be causing spacing issues */
.markdown-content ol > li {
  margin-bottom: 0.25rem;
}

.markdown-content ol > li > p {
  margin: 0.25rem 0;
}

.markdown-content blockquote {
  border-left: 4px solid rgb(34 197 94); /* border-secondary-500 */
  padding-left: 1rem;
  font-style: italic;
  color: rgb(209 213 219); /* text-primary-300 */
  margin: 0.5rem 0;
}

.markdown-content code {
  background-color: rgb(31 41 55); /* bg-primary-800 */
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem; /* text-sm */
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; /* font-mono */
  color: rgb(34 197 94); /* text-secondary-300 */
}

.markdown-content pre {
  background-color: rgb(31 41 55); /* bg-primary-800 */
  padding: 0.75rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}
</style>

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
                  <div class="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 mr-3">
                    <svg class="h-6 w-6 text-primary-600 dark:text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div>Grammar Practice</div>
                    <div class="text-sm text-primary-300 font-normal">Topic: {{ topicTitle }}</div>
                  </div>
                </div>
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

              <div class="mt-6">
                <p class="text-sm text-primary-300">
                  Practice your English grammar! Type a sentence and I'll help you improve it.
                </p>
              </div>

              <!-- Chat Container -->
              <div class="mt-6">
                <div
                  id="chat-container"
                  class="h-96 overflow-y-auto border border-primary-700 rounded-lg p-4 bg-primary-800 dark:bg-primary-900"
                >
                  <div v-if="chatMessages.length === 0" class="text-center text-primary-400 py-8">
                    <svg class="mx-auto h-12 w-12 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Start practicing your English grammar!</p>
                    <p class="text-sm mt-2">Type a sentence and I'll help you improve it.</p>
                  </div>

                  <div v-else class="space-y-4">
                    <div
                      v-for="message in chatMessages"
                      :key="message.id"
                      class="flex"
                      :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
                    >
                      <div
                        class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-primary-700 dark:bg-black text-primary-50"
                      >
                        <div v-if="message.isLoading" class="flex items-center">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          <span>{{ message.content }}</span>
                        </div>
                        <div v-else class="markdown-content whitespace-pre-wrap" v-html="message.content"></div>
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
                      @keypress="handleKeyPress"
                      placeholder="Type your sentence here..."
                      class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-primary-800 text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                      :disabled="isLoading"
                    />
                  </div>
                  <div>
                    <button
                      @click="sendMessage"
                      :disabled="!currentMessage.trim() || isLoading"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-950 bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg v-if="!isLoading" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-950"></div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  @click="generatePracticePhrase"
                  :disabled="isLoading"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 transition-colors"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Practice Phrase
                </button>
                <button
                  @click="closeModal"
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-700 px-4 py-2 text-sm font-medium text-primary-50 hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
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
