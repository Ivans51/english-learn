<template>
  <div class="h-screen bg-primary-50 dark:bg-primary-950 transition-colors flex flex-col">
    <MainHeader :current-level="topic?.level" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full min-h-0">
      <!-- Chat Header -->
      <div class="bg-white dark:bg-primary-950 border-b border-primary-200 dark:border-primary-800 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-lg font-semibold text-primary-900 dark:text-primary-50">{{ topic?.title }}</h1>
            <p class="text-sm text-primary-600 dark:text-primary-400">Conversational Practice</p>
          </div>

          <!-- Clear History Button -->
          <button
            @click="clearChatHistory"
            class="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-colors"
            title="Clear chat history"
          >
            <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>

        <!-- Right side tabs -->
        <div class="flex space-x-1">
          <button
            @click="activeTab = 'chat'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'chat'
                ? 'bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900'
                : 'text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800'
            ]"
          >
            Chat
          </button>
          <button
            @click="activeTab = 'explanations'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors relative',
              activeTab === 'explanations'
                ? 'bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900'
                : 'text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800'
            ]"
          >
            Explanations
            <span v-if="explanations.length > 0" class="absolute -top-1 -right-1 bg-warning-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ explanations.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'saved'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors relative',
              activeTab === 'saved'
                ? 'bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900'
                : 'text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800'
            ]"
          >
            Saved Words
            <span v-if="savedWords.length > 0" class="absolute -top-1 -right-1 bg-success-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ savedWords.length }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex min-h-0 h-full">
        <!-- Chat Section -->
        <div
          :class="[
            'transition-all duration-300 flex flex-col min-h-0 h-full',
            activeTab === 'chat' ? 'flex-1' : 'w-2/3'
          ]"
        >
          <!-- Messages Area -->
          <div class="flex-1 overflow-y-auto min-h-0 h-full p-6 space-y-4" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.sender === 'user'
                    ? 'bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900'
                    : 'bg-white dark:bg-primary-950 text-primary-900 dark:text-primary-100 border border-primary-200 dark:border-primary-700'
                ]"
              >
                <div
                  v-html="highlightSelectableText(message.content)"
                  class="text-sm"
                  @click="handleWordClick($event)"
                ></div>
                <div class="text-xs opacity-70 mt-1">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100 border border-primary-200 dark:border-primary-700 px-4 py-2 rounded-lg">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="p-6 border-t border-primary-200 dark:border-primary-800">
            <div class="flex space-x-2">
              <input
                v-model="newMessage"
                @keydown.enter.prevent="sendMessage"
                type="text"
                placeholder="Type your message..."
                class="flex-1 px-4 py-2 border border-primary-200 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-950 text-primary-900 dark:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              >
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="px-4 py-2 bg-primary-950 dark:bg-primary-100 text-white dark:text-primary-900 rounded-lg hover:bg-primary-800 dark:hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div
          v-if="activeTab !== 'chat'"
          class="w-1/3 bg-white dark:bg-primary-950 border-l border-primary-200 dark:border-primary-800 flex flex-col"
        >
          <!-- Explanations Tab -->
          <div v-if="activeTab === 'explanations'" class="flex-1 overflow-y-auto p-6">
            <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-50 mb-4">Word Explanations</h3>
            <div v-if="explanations.length === 0" class="text-center py-8">
              <div class="text-primary-400 dark:text-primary-500 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <p class="text-primary-600 dark:text-primary-400 text-sm">Select words in the chat to get explanations</p>
            </div>
            <div class="space-y-4">
              <div
                v-for="explanation in explanations"
                :key="explanation.id"
                class="bg-primary-50 dark:bg-primary-800 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-primary-900 dark:text-primary-100">{{ explanation.word }}</h4>
                  <button
                    @click="saveWord(explanation.word, explanation.definition)"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                    title="Save to vocabulary"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                  </button>
                </div>
                <p class="text-sm text-primary-700 dark:text-primary-300 mb-2">{{ explanation.definition }}</p>
                <div class="text-xs text-primary-500 dark:text-primary-400">{{ formatTime(explanation.timestamp) }}</div>
              </div>
            </div>
          </div>

          <!-- Saved Words Tab -->
          <div v-if="activeTab === 'saved'" class="flex-1 overflow-y-auto p-6">
            <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-50 mb-4">Saved Words</h3>
            <div v-if="savedWords.length === 0" class="text-center py-8">
              <div class="text-primary-400 dark:text-primary-500 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
              </div>
              <p class="text-primary-600 dark:text-primary-400 text-sm">No saved words yet</p>
            </div>
            <div class="space-y-3">
              <div
                v-for="word in savedWords"
                :key="word.id"
                class="bg-primary-50 dark:bg-primary-800 rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-medium text-primary-900 dark:text-primary-100">{{ word.word }}</h4>
                  <button
                    @click="removeSavedWord(word.id)"
                    class="text-error-500 hover:text-error-700 dark:hover:text-error-400"
                    title="Remove from saved words"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                <p class="text-sm text-primary-700 dark:text-primary-300 mb-1">{{ word.definition }}</p>
                <div class="text-xs text-primary-500 dark:text-primary-400">Saved {{ formatTime(word.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Word Selection Tooltip -->
    <WordTooltip
      :visible="showTooltip"
      :selected-word="selectedText"
      :position="tooltipPosition"
      @explain="explainWord"
      @save="saveSelectedWord"
      @pronounce="pronounceWord"
      @close="showTooltip = false"
    />

    <!-- Toast Notifications -->
    <ToastNotification v-model="toasts" ref="toastComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import WordTooltip from '@/components/WordTooltip.vue'
import ToastNotification, { type Toast as ToastType } from '@/components/ToastNotification.vue'
import { chatService, type ChatMessage as APIChatMessage } from '@/services/chatService'
import { useAuth } from '@/composables/useAuth' // Import useAuth composable

const route = useRoute()
const router = useRouter()
const { user: firebaseUser, loading: authLoading } = useAuth() // Use the useAuth composable

interface Topic {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  duration: number
  tags: string[]
  level: string
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface WordExplanation {
  id: string
  word: string
  definition: string
  timestamp: Date
}

interface SavedWord {
  id: string
  word: string
  definition: string
  timestamp: Date
}

// Reactive data
const activeTab = ref<'chat' | 'explanations' | 'saved'>('chat')
const messages = ref<Message[]>([])
const newMessage = ref('')
const isTyping = ref(false)
const explanations = ref<WordExplanation[]>([])
const savedWords = ref<SavedWord[]>([])
const messagesContainer = ref<HTMLElement>()

// Word selection tooltip
const showTooltip = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')
const preventTooltipClose = ref(false) // New flag to prevent immediate tooltip close

// Toast notifications
const toasts = ref<ToastType[]>([])
const toastComponent = ref<InstanceType<typeof ToastNotification>>()

// Mock topic data (in real app, this would come from props or API)
const topic = ref<Topic>({
  id: route.params.topicId as string || '1',
  title: 'Greetings and Introductions',
  description: 'Learn how to greet people and introduce yourself in various situations.',
  difficulty: 'Easy',
  duration: 15,
  tags: ['basics', 'conversation', 'social'],
  level: 'A1'
})

// User ID for chat history (in production, this would come from authentication)
const userId = ref('anonymous') // Will store Firebase UID or 'anonymous'

// Watch for changes in the firebaseUser (from useAuth)
watch(firebaseUser, async (newUser) => {
  if (newUser) {
    userId.value = newUser.uid
  } else {
    userId.value = 'anonymous'
  }
  // Initialize chat or reload history when userId changes
  if (!authLoading.value) { // Only initialize if authentication state is resolved
    await initializeChat()
  }
}, { immediate: true }) // Run immediately to catch initial auth state

// Initialize chat
const initializeChat = async () => {
  // Load chat history only if userId is available (from onAuthStateChanged)
  // The onMounted hook ensures initializeChat is called AFTER userId is set.
  if (userId.value && userId.value !== 'anonymous') { // Ensure userId is actually set (not just initial anonymous)
    await loadChatHistory()

    // If no history exists, add initial AI message
    if (messages.value.length === 0) {
      messages.value = [
        {
          id: '1',
          content: `Hello! I'm here to help you practice "${topic.value.title}". Let's have a conversation! Feel free to ask questions, share your thoughts, or practice the vocabulary. You can also select any word in our conversation to get explanations or save it to your vocabulary.`,
          sender: 'ai',
          timestamp: new Date()
        }
      ]
    }
  } else if (!authLoading.value && messages.value.length === 0) {
    // If auth is resolved and no user, but chat is empty, show initial message
    messages.value = [
      {
        id: '1',
        content: `Hello! I'm here to help you practice "${topic.value.title}". Let's have a conversation! Feel free to ask questions, share your thoughts, or practice the vocabulary. You can also select any word in our conversation to get explanations or save it to your vocabulary.`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]
  }
}

const loadChatHistory = async () => {
  try {
    const data = await chatService.getChatHistory(topic.value.id, userId.value)

    if (data.messages && data.messages.length > 0) {
      messages.value = data.messages.map((msg: APIChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))

      // Scroll to bottom after loading history
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Failed to load chat history:', error)
    // Continue with empty chat if history fails to load
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const messageContent = newMessage.value.trim()
  newMessage.value = ''

  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    content: messageContent,
    sender: 'user',
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  // Show AI typing indicator
  isTyping.value = true

  try {
    // Call the API using the chat service
    const data = await chatService.sendMessage({
      message: messageContent,
      topicId: topic.value.id,
      userId: userId.value
    })

    const aiResponse: Message = {
      id: data.messageId,
      content: data.message,
      sender: 'ai',
      timestamp: new Date(data.timestamp)
    }

    isTyping.value = false
    messages.value.push(aiResponse)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    isTyping.value = false

    // Fallback to mock response
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: "I apologize, but I'm having trouble connecting to the server right now. Please try again in a moment.",
      sender: 'ai',
      timestamp: new Date()
    }
    messages.value.push(aiResponse)
    await nextTick()
    scrollToBottom()

    // Show error toast
    toastComponent.value?.addToast({
      message: 'Connection error. Please check your internet connection.',
      type: 'error',
      duration: 5000
    })
  }
}

const clearChatHistory = async () => {
  try {
    await chatService.clearChatHistory(topic.value.id, userId.value)

    // Reset local messages to initial state
    messages.value = [
      {
        id: '1',
        content: `Hello! I'm here to help you practice "${topic.value.title}". Let's have a conversation! Feel free to ask questions, share your thoughts, or practice the vocabulary. You can also select any word in our conversation to get explanations or save it to your vocabulary.`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]

    // Show success toast
    toastComponent.value?.addToast({
      message: 'Chat history cleared successfully!',
      type: 'success',
      duration: 3000
    })
  } catch (error) {
    console.error('Failed to clear chat history:', error)

    // Show error toast
    toastComponent.value?.addToast({
      message: 'Failed to clear chat history. Please try again.',
      type: 'error',
      duration: 4000
    })
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const highlightSelectableText = (content: string): string => {
  // Add selectable styling to words
  return content.replace(/\b(\w+)\b/g, '<span class="selectable-word cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 rounded px-1 transition-colors">$1</span>')
}

const handleWordClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // Check if the clicked element is a selectable word
  if (target && target.classList.contains('selectable-word') && target.textContent) {
    const rect = target.getBoundingClientRect()

    selectedText.value = target.textContent.trim()

    // Position tooltip
    tooltipPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    }

    showTooltip.value = true
    preventTooltipClose.value = true // Prevent immediate close

    // Allow the global click listener to function after a short delay
    setTimeout(() => {
      preventTooltipClose.value = false
    }, 100) // Short delay to let the current click event propagate
  }
}

// Hide tooltip on click outside
document.addEventListener('click', (event) => {
  if (preventTooltipClose.value) {
    // If we just opened the tooltip, prevent this click from closing it
    return;
  }
  const target = event.target as HTMLElement
  if (showTooltip.value && !target.closest('.tooltip-content')) {
    showTooltip.value = false
  }
})

const explainWord = async (word?: string) => {
  const wordToExplain = word || selectedText.value
  if (!wordToExplain) return

  showTooltip.value = false

  // Check if word already explained
  const existing = explanations.value.find(e => e.word.toLowerCase() === wordToExplain.toLowerCase())
  if (existing) {
    activeTab.value = 'explanations'
    return
  }

  // Mock explanation (in real app, this would be an API call)
  const explanation: WordExplanation = {
    id: Date.now().toString(),
    word: wordToExplain,
    definition: generateWordDefinition(wordToExplain),
    timestamp: new Date()
  }

  explanations.value.unshift(explanation)
  activeTab.value = 'explanations'

  // Show success toast
  toastComponent.value?.addToast({
    message: `"${wordToExplain}" explained successfully!`,
    type: 'success',
    duration: 3000
  })

  // Clear selection
}

const generateWordDefinition = (word: string): string => {
  // Mock definitions (in real app, this would come from a dictionary API)
  const definitions: Record<string, string> = {
    'hello': 'A greeting used when meeting someone or starting a conversation.',
    'practice': 'To do something repeatedly in order to improve your skill.',
    'conversation': 'A talk between two or more people where ideas and information are exchanged.',
    'vocabulary': 'All the words used by a particular person or in a particular language.',
    'excellent': 'Extremely good; of very high quality.',
    'progress': 'Forward movement or development toward a goal.',
    'introduce': 'To present someone by name to another person so they can get to know each other.',
    'confidence': 'The feeling of being certain about your abilities or having trust in yourself.'
  }

  return definitions[word.toLowerCase()] || `A word commonly used in English conversations. Practice using "${word}" in different contexts to improve your fluency.`
}

const saveSelectedWord = (word?: string) => {
  const wordToSave = word || selectedText.value
  if (!wordToSave) return

  showTooltip.value = false

  // Check if word already saved
  const existing = savedWords.value.find(w => w.word.toLowerCase() === wordToSave.toLowerCase())
  if (existing) {
    activeTab.value = 'saved'
    return
  }

  const savedWord: SavedWord = {
    id: Date.now().toString(),
    word: wordToSave,
    definition: generateWordDefinition(wordToSave),
    timestamp: new Date()
  }

  savedWords.value.unshift(savedWord)

  // Show success toast
  toastComponent.value?.addToast({
    message: `"${wordToSave}" saved to vocabulary!`,
    type: 'success',
    duration: 3000
  })
  activeTab.value = 'saved'

  // Clear selection
}

const saveWord = (word: string, definition: string) => {
  // Check if word already saved
  const existing = savedWords.value.find(w => w.word.toLowerCase() === word.toLowerCase())
  if (existing) return

  const savedWord: SavedWord = {
    id: Date.now().toString(),
    word,
    definition,
    timestamp: new Date()
  }

  savedWords.value.unshift(savedWord)
}

const removeSavedWord = (id: string) => {
  const word = savedWords.value.find(w => w.id === id)
  savedWords.value = savedWords.value.filter(w => w.id !== id)

  // Show info toast
  if (word) {
    toastComponent.value?.addToast({
      message: `"${word.word}" removed from vocabulary`,
      type: 'info',
      duration: 2000
    })
  }
}

const pronounceWord = (word?: string) => {
  const wordToPronounce = word || selectedText.value
  if (!wordToPronounce) return

  showTooltip.value = false

  // Use Web Speech API to pronounce the word
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(wordToPronounce)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    utterance.volume = 0.8
    speechSynthesis.speak(utterance)

    // Show info toast
    toastComponent.value?.addToast({
      message: `Pronouncing "${wordToPronounce}"`,
      type: 'info',
      duration: 2000
    })
  } else {
    // Show error toast
    toastComponent.value?.addToast({
      message: 'Speech synthesis not supported in your browser',
      type: 'error',
      duration: 4000
    })
  }

  // Clear selection
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.selectable-word {
  user-select: text;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
