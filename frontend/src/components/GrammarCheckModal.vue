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
              <div class="modal-header-title">
                <div class="modal-icon-box">
                  <MessageCircle class="h-6 w-6" />
                </div>
                <div>
                  <h2 class="modal-title">Grammar Practice</h2>
                  <p class="modal-subtitle">
                    {{ topicTitle }}
                  </p>
                </div>
              </div>
              <div class="modal-header-actions">
                <!-- Level Selector -->
                <div
                  class="flex items-center gap-1 px-2 py-1 border border-gray-200 dark:border-primary-700 rounded-md bg-gray-100 dark:bg-primary-800"
                >
                  <label
                    v-for="l in ['easy', 'medium', 'hard']"
                    :key="l"
                    class="cursor-pointer"
                  >
                    <input
                      type="radio"
                      :value="l"
                      v-model="level"
                      @change="handleLevelChange"
                      class="sr-only peer"
                    />
                    <span
                      class="px-1.5 md:px-2 py-1 text-xs rounded transition-colors peer-checked:bg-secondary-500 peer-checked:text-white text-gray-600 dark:text-primary-400 hover:text-gray-900 dark:hover:text-primary-200"
                    >
                      {{ l.charAt(0).toUpperCase() + l.slice(1) }}
                    </span>
                  </label>
                </div>
                <BaseButton
                  variant="secondary"
                  @click="generatePracticePhrase"
                  :disabled="isLoading"
                  size="sm"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  Generate Phrase
                  <kbd
                    class="hidden md:inline-block ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300"
                  >
                    Ctrl+K
                  </kbd>
                </BaseButton>
                <button @click="closeModal" class="modal-close-btn">
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Chat Container -->
            <div class="flex-1 overflow-y-auto">
              <div
                id="grammar-chat-container"
                ref="chatContainerRef"
                class="h-[50vh] min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-black modal-scrollbar"
              >
                <div
                  v-if="chatMessages.length === 0"
                  class="flex flex-col items-center justify-center text-center text-gray-500 dark:text-primary-400 h-full"
                >
                  <MessageCircle
                    class="mx-auto h-12 w-12 text-gray-400 dark:text-primary-500 mb-4"
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
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    "
                  >
                    <div
                      class="max-w-xs lg:max-w-md px-3 py-1 rounded-lg bg-gray-100 dark:bg-primary-800 text-gray-900 dark:text-primary-50 leading-tight"
                    >
                      <div v-if="message.isLoading" class="flex items-center">
                        <div
                          class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
                        ></div>
                        <span>{{ message.content }}</span>
                      </div>
                      <div
                        v-else
                        class="markdown-content"
                        :class="{
                          'correct-feedback': message.isCorrect,
                          'incorrect-feedback': message.isCorrect === false,
                          'practice-feedback':
                            message.isCorrect === undefined &&
                            message.type === 'assistant',
                        }"
                        v-html="message.content"
                      ></div>
                      <div
                        v-if="message.showTranslation && message.translation"
                        class="mt-2 p-2 rounded bg-gray-200 dark:bg-primary-800/50 border border-gray-300 dark:border-primary-700 text-blue-600 dark:text-blue-300 text-sm"
                      >
                        <span
                          class="font-medium text-xs text-blue-500 dark:text-blue-400 block mb-1"
                        >
                          ES:
                        </span>
                        {{ message.translation }}
                      </div>
                      <div class="text-xs opacity-70 mt-1 flex items-center">
                        <span>
                          {{ message.timestamp.toLocaleTimeString() }}
                        </span>
                        <button
                          v-if="
                            message.type === 'assistant' && !message.isLoading
                          "
                          @click="translateMessage(message)"
                          :disabled="message.isTranslating"
                          class="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50"
                        >
                          <span v-if="message.isTranslating">...</span>
                          <span
                            v-else-if="
                              message.showTranslation && message.translation
                            "
                          >
                            Hide ES
                          </span>
                          <span v-else>Translate to ES</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 border-t border-gray-200 dark:border-primary-700">
              <div class="flex space-x-3">
                <div class="flex-1">
                  <BaseInput
                    ref="inputRef"
                    id="grammar-input"
                    v-model="currentMessage"
                    type="text"
                    placeholder="Type your sentence here..."
                    :disabled="isLoading"
                    @keydown="handleKeyPress"
                  />
                  <div
                    class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1"
                  >
                    Press
                    <kbd
                      class="px-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                    >
                      Ctrl+F
                    </kbd>
                    to focus
                  </div>
                </div>
                <div>
                  <BaseButton
                    variant="secondary"
                    @click="sendMessage"
                    :disabled="!currentMessage.trim() || isLoading"
                  >
                    <Send v-if="!isLoading" class="h-4 w-4" />
                    <span
                      v-else
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
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
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { marked } from 'marked'
import { useToast } from '@/composables/useToast'
import { topicService } from '@/services/topicService'
import { MessageCircle, Plus, Send, X } from 'lucide-vue-next'
import { BaseButton, BaseInput } from '@/components/ui'

interface Props {
  isOpen: boolean
  topicId: string
  topicTitle: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
  isCorrect?: boolean
  translation?: string
  showTranslation?: boolean
  isTranslating?: boolean
}

interface GrammarCheckResult {
  isCorrect: boolean
  feedback: string
  suggestions?: string[]
}

const { error: showErrorToast } = useToast()

const currentMessage = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const chatContainerRef = ref<HTMLElement | null>(null)
const level = ref<'easy' | 'medium' | 'hard'>('medium')

// Reset state when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Reset state
      chatMessages.value = []
      currentMessage.value = ''
      isLoading.value = false

      // Focus input after modal animation completes
      setTimeout(() => {
        focusInput()
      }, 350)
    }
  },
)

const closeModal = () => {
  emit('close')
}

const handleLevelChange = () => {
  // Level changed - could regenerate phrase or just keep current
}

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderMarkdown = async (markdownText: string): Promise<string> => {
  try {
    return await marked(markdownText)
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return markdownText
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''
  isLoading.value = true

  const userChatMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content: userMessage,
    timestamp: new Date(),
  }
  chatMessages.value.push(userChatMessage)

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
    const result = await topicService.checkGrammar(
      props.topicTitle,
      userMessage,
      'anonymous',
    )

    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    const { content: formattedContent, isCorrect } =
      await formatGrammarFeedback(result)
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: formattedContent,
      timestamp: new Date(),
      isCorrect,
    }
    chatMessages.value.push(assistantMessage)

    await nextTick()
  } catch (error) {
    console.error('Error checking grammar:', error)

    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    const errorContent = await renderMarkdown(
      '## Error\n\nSorry, I encountered an error while checking your grammar. Please try again.',
    )
    const errorMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: errorContent,
      timestamp: new Date(),
      isCorrect: false,
    }
    chatMessages.value.push(errorMessage)

    showErrorToast('Failed to check grammar. Please try again.')
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const formatGrammarFeedback = async (
  result: GrammarCheckResult | string | unknown,
): Promise<{ content: string; isCorrect: boolean }> => {
  try {
    let parsedResult = result
    if (typeof result === 'string') {
      try {
        parsedResult = JSON.parse(result)
      } catch {
        const feedback = `## Grammar Feedback\n\n${result}`
        return { content: await renderMarkdown(feedback), isCorrect: false }
      }
    }

    if (
      parsedResult &&
      typeof parsedResult === 'object' &&
      'isCorrect' in parsedResult
    ) {
      const result = parsedResult as GrammarCheckResult

      if (result.isCorrect) {
        const feedback = `## Great job!\n\nYour sentence is grammatically correct.\n\n${result.feedback || 'Well done!'}`
        return { content: await renderMarkdown(feedback), isCorrect: true }
      } else {
        let feedback = `## Areas for improvement\n\n${result.feedback || 'Please review your grammar.'}`

        if (
          result.suggestions &&
          Array.isArray(result.suggestions) &&
          result.suggestions.length > 0
        ) {
          const suggestionsText = result.suggestions
            .map(
              (s: string, i: number) =>
                `${i + 1}. ${typeof s === 'string' ? s.replace(/^["']|["']$/g, '') : s}`,
            )
            .join('\n')
          feedback += `\n## Suggestions\n${suggestionsText}`
        }

        return { content: await renderMarkdown(feedback), isCorrect: false }
      }
    }

    const fallbackFeedback = `## Grammar Feedback\n\n${JSON.stringify(parsedResult, null, 2)}`
    return { content: await renderMarkdown(fallbackFeedback), isCorrect: false }
  } catch (error) {
    console.error('Error formatting grammar feedback:', error)
    const errorFeedback = `## Grammar Feedback\n\nSorry, there was an error processing the response.`
    return { content: await renderMarkdown(errorFeedback), isCorrect: false }
  }
}

const generatePracticePhrase = async () => {
  if (isLoading.value) return

  isLoading.value = true

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
    const result = await topicService.generatePracticePhrase(
      props.topicTitle,
      'anonymous',
      level.value,
    )

    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    const phraseContent = `## Practice Phrase\n\n**Topic:** ${props.topicTitle}\n\n"${result.phrase}"\n\n${result.grammarFocus ? `**Grammar Focus:** ${result.grammarFocus}\n\n` : ''}${result.translation ? `**Translation:** ${result.translation}\n\n` : ''}`
    const renderedPhrase = await renderMarkdown(phraseContent)

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: renderedPhrase,
      timestamp: new Date(),
    }
    chatMessages.value.push(assistantMessage)

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error generating practice phrase:', error)

    chatMessages.value = chatMessages.value.filter((msg) => !msg.isLoading)

    const errorContent = await renderMarkdown(
      '## Error\n\nSorry, I encountered an error while generating a practice phrase. Please try again.',
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
  }
}

const scrollToBottom = async () => {
  const chatContainer = chatContainerRef.value
  if (chatContainer) {
    await nextTick()
    chatContainer.scrollTop = chatContainer.scrollHeight

    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 50)
  }
}

const translateMessage = async (message: ChatMessage) => {
  if (message.isTranslating) return

  if (message.translation) {
    message.showTranslation = !message.showTranslation
    return
  }

  message.isTranslating = true

  try {
    const translation = await topicService.translateText(
      message.content.replace(/<[^>]*>/g, ''),
      'es',
    )
    message.translation = translation
    message.showTranslation = true
  } catch (error) {
    console.error('Error translating message:', error)
    showErrorToast('Failed to translate. Please try again.')
  } finally {
    message.isTranslating = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return

  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    generatePracticePhrase()
  }
  if (event.ctrlKey && event.key === 'f') {
    event.preventDefault()
    focusInput()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
#grammar-chat-container::-webkit-scrollbar {
  width: 8px;
}

#grammar-chat-container::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

#grammar-chat-container::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

#grammar-chat-container::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
