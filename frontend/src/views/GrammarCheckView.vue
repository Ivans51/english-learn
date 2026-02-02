<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <MainHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors cursor-pointer mb-4"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          <span class="text-sm font-medium">Back to Topics</span>
        </button>

        <div class="border-b border-gray-600 pb-6">
          <div class="flex justify-between items-start">
            <div class="flex items-center">
              <div
                class="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 mr-3"
              >
                <MessageCircle
                  class="h-6 w-6 text-primary-600 dark:text-primary-300"
                />
              </div>
              <div>
                <h1
                  class="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-50"
                >
                  Grammar Practice
                </h1>
                <p
                  class="text-sm sm:text-base text-primary-600 dark:text-primary-400 mt-1"
                >
                  Topic: {{ topicTitle }}
                </p>
              </div>
            </div>
            <button
              @click="generatePracticePhrase"
              :disabled="isLoading"
              class="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 transition-colors cursor-pointer"
            >
              <Plus class="h-4 w-4 mr-2" />
              Generate Phrase
              <kbd class="ml-2 px-1.5 py-0.5 text-xs bg-gray-700 rounded border border-gray-500 font-mono">Ctrl+K</kbd>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-sm text-primary-600 dark:text-primary-400">
          Practice your English grammar! Type a sentence and I'll help you
          improve it.
        </p>
      </div>

      <div class="mt-6">
        <div
          id="chat-container"
          class="h-[calc(100vh-400px)] min-h-[300px] max-h-[600px] overflow-y-auto rounded-lg p-4 bg-black"
        >
          <div
            v-if="chatMessages.length === 0"
            class="flex flex-col items-center justify-center text-center text-primary-400 h-full"
          >
            <MessageCircle class="mx-auto h-12 w-12 text-primary-500 mb-4" />
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
              :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-xs lg:max-w-md px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-50 leading-tight"
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
                    'practice-feedback': message.isCorrect === undefined && message.type === 'assistant'
                  }"
                  v-html="message.content"
                ></div>
                <div
                  v-if="message.showTranslation && message.translation"
                  class="mt-2 p-2 rounded bg-primary-800/50 border border-primary-700 text-blue-300 text-sm"
                >
                  <span class="font-medium text-xs text-blue-400 block mb-1">ES:</span>
                  {{ message.translation }}
                </div>
                <div class="text-xs opacity-70 mt-1 flex items-center">
                  <span>{{ message.timestamp.toLocaleTimeString() }}</span>
                  <button
                    v-if="message.type === 'assistant' && !message.isLoading"
                    @click="translateMessage(message)"
                    :disabled="message.isTranslating"
                    class="ml-2 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                  >
                    <span v-if="message.isTranslating">...</span>
                    <span v-else-if="message.showTranslation && message.translation">Hide ES</span>
                    <span v-else>Translate to ES</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              class="w-full px-3 py-2 border border-primary-700 rounded-md text-sm bg-black dark:bg-primary-900 text-primary-50 dark:text-primary-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
              :disabled="isLoading"
            />
            <div class="text-xs text-gray-500 mt-1 ml-1">
              Press <kbd class="px-1 bg-gray-700 rounded">Ctrl+F</kbd> to focus
            </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { useToast } from '@/composables/useToast'
import { topicService } from '@/services/topicService'
import { MessageCircle, Plus, Send } from 'lucide-vue-next'
import MainHeader from '@/components/MainHeader.vue'

interface Props {
  topicId: string
  topicTitle: string
}

const props = defineProps<Props>()

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

const router = useRouter()
const { error: showErrorToast } = useToast()

const currentMessage = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const from = ref(sessionStorage.getItem('grammarCheckFrom') || '/learning-topics')

const goBack = () => {
  router.push(from.value)
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

    const { content: formattedContent, isCorrect } = await formatGrammarFeedback(result)
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
    focusInput()
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
            .map((s: string, i: number) => `${i + 1}. ${typeof s === 'string' ? s.replace(/^["']|["']$/g, '') : s}`)
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
    focusInput()
  }
}

const scrollToBottom = async () => {
  const chatContainer = document.getElementById('chat-container')
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

const forceCapitalization = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

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

const handleGlobalKeydown = (event: KeyboardEvent) => {
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
  focusInput()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
#chat-container::-webkit-scrollbar {
  width: 8px;
}

#chat-container::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

#chat-container::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

#chat-container::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
