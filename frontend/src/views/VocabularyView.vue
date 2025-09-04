<template>
  <main class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <main-header
      :current-level="selectedLevel"
      @level-click="handleLevelClick"
    />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <div class="w-80 flex-shrink-0">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center mb-2">
              <svg class="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                </path>
              </svg>
              <h1 class="text-2xl font-bold text-primary-900 dark:text-primary-50">My Vocabulary</h1>
            </div>
            <p class="text-primary-600 dark:text-primary-400">Your personal collection of English words</p>
          </div>

          <!-- Search & Filter -->
          <div
            class="bg-black dark:bg-black rounded-lg border border-primary-200 dark:border-primary-700 p-4 mb-6 transition-colors">
            <h3 class="font-medium text-primary-900 dark:text-primary-50 mb-4 flex items-center">
              <svg class="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z">
                </path>
              </svg>
              Search & Filter
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Search Words</label>
                <input type="text" v-model="searchQuery" placeholder="Search vocabulary..."
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors" />
              </div>

              <div>
                <label class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Level</label>
                <select v-model="filterLevel"
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors">
                  <option value="">All Levels</option>
                  <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Progress</label>
                <select v-model="selectedStatus"
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors">
                  <option value="">All Words</option>
                  <option value="learning">Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Add New Word Button -->
          <div class="space-y-3">
            <button @click="openAddWordModal"
              class="w-full bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-3 px-4 rounded-md font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                </path>
              </svg>
              Add New Word
            </button>

          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1">
          <div class="mb-6">
            <h2 class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-1">{{ filteredWords.length }} words</h2>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            <span class="ml-3 text-primary-600 dark:text-primary-400">Loading vocabulary...</span>
          </div>

          <!-- Vocabulary List -->
          <div v-else class="space-y-4">
            <div v-for="word in filteredWords" :key="word.id"
              class="bg-black dark:bg-black rounded-lg border border-primary-200 dark:border-primary-700 p-6 hover:shadow-md transition-all">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h3 class="text-xl font-semibold text-primary-900 dark:text-primary-50 mr-3">{{ word.word }}</h3>
                    <span
                      class="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded">
                      {{ word.level }}
                    </span>
                    <span class="ml-2 text-sm text-primary-500 dark:text-primary-400">{{ word.category }}</span>
                    <span v-if="word.status === 'mastered'"
                      class="ml-2 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                      Mastered
                    </span>
                  </div>

                  <p class="text-primary-700 dark:text-primary-300 mb-3">{{ word.definition }}</p>

                  <div class="bg-primary-50 dark:bg-primary-900 p-3 rounded italic text-primary-600 dark:text-primary-400 mb-3">
                    "{{ word.example }}"
                  </div>

                  <p class="text-sm text-primary-500 dark:text-primary-400">Added on {{ formatDate(word.createdAt) }}</p>
                </div>

                <div class="flex items-center space-x-2 ml-4">


                  <button
                    @click="toggleWordStatus(word)"
                    :class="getStatusButtonClass(word)">
                    {{ getStatusButtonText(word) }}
                  </button>

                  <button
                    @click="openEditWordModal(word)"
                    class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-300 rounded border border-white dark:border-primary-800 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                      </path>
                    </svg>
                  </button>

                  <button @click="deleteWord(word.id)"
                    class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded border border-white dark:border-primary-800 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                      </path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredWords.length === 0 && !isLoading" class="text-center py-12">
              <div class="mx-auto h-24 w-24 text-primary-400 dark:text-primary-500 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                  </path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-2">No vocabulary words yet</h3>
              <p class="text-primary-500 dark:text-primary-400 mb-6">
                Start building your personal vocabulary collection by adding new words.
              </p>
              <button @click="openAddWordModal"
                class="inline-flex items-center px-4 py-2 bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 text-sm font-medium rounded-md hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors cursor-pointer">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                  </path>
                </svg>
                Add Your First Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Word Modal -->
    <WordModal
      :isOpen="showAddWordModal"
      :currentWord="wordToEdit"
      @close="closeWordModal"
      @add-word="addNewWord"
      @update-word="updateWord"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import WordModal from '@/components/WordModal.vue'
import { fireSwal } from '../utils/swalUtils'
import { vocabularyWordsService } from '@/services/vocabularyService'
import { useAuth } from '@/composables/useAuth'
import type { VocabularyWord } from '@/types'

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const { user: firebaseUser, loading: authLoading } = useAuth()
const userId = ref('anonymous')
const vocabularyWords = ref<VocabularyWord[]>([])
const isLoading = ref(false)

const searchQuery = ref('')
const selectedLevel = ref('')
const filterLevel = ref('')
const selectedStatus = ref('')
const showAddWordModal = ref(false)
const wordToEdit = ref<VocabularyWord | null>(null)

// Watch for changes in the firebaseUser
watch(firebaseUser, async (newUser) => {
  if (newUser) {
    userId.value = newUser.uid
  } else {
    userId.value = 'anonymous'
  }
  // Reload words when user changes
  if (!authLoading.value) {
    await loadWordsFromFirebase()
  }
}, { immediate: true })

const filteredWords = computed(() => {
  return vocabularyWords.value.filter(word => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      q === '' ||
      word.word.toLowerCase().includes(q) ||
      word.definition.toLowerCase().includes(q)
    const matchesHeaderLevel = !selectedLevel.value || word.level === selectedLevel.value
    const matchesFilterLevel = !filterLevel.value || word.level === filterLevel.value
    const matchesStatus = !selectedStatus.value || word.status === selectedStatus.value

    return matchesSearch && matchesHeaderLevel && matchesFilterLevel && matchesStatus
  })
})

const handleLevelClick = (level: string) => {
  selectedLevel.value = selectedLevel.value === level ? '' : level
}



/**
 * Returns a fully-typed class string for the status button.
 * Centralizing this logic avoids complex inline template expressions.
 */
function getStatusButtonClass(word: VocabularyWord): string {
  const base =
    'h-8 flex items-center justify-center px-3 text-sm font-medium rounded transition-colors border border-white dark:border-primary-800 cursor-pointer'
  // Example extension: change styles based on status. Keep it typed and explicit.
  if (word.status === 'mastered') {
    return `${base} bg-black dark:bg-black text-white dark:text-white hover:bg-primary-800 dark:hover:bg-primary-700`
  } else {
    return `${base} bg-black dark:bg-black text-white dark:text-white hover:bg-primary-800 dark:hover:bg-primary-700`
  }
}

/**
 * Separated text logic for clarity and easier testing.
 */
function getStatusButtonText(word: VocabularyWord): string {
  return word.status === 'mastered' ? 'Mark as Learning' : 'Mark as Mastered'
}

const deleteWord = async (wordId: string) => {
  const result = await fireSwal({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  });

  if (result.isConfirmed) {
    try {
      await vocabularyWordsService.deleteWord(wordId, userId.value)
      const index = vocabularyWords.value.findIndex(w => w.id === wordId)
      if (index > -1) {
        vocabularyWords.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting word:', error)
      await fireSwal({
        title: 'Error',
        text: 'Failed to delete word. Please try again.',
        icon: 'error',
      })
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openAddWordModal = () => {
  wordToEdit.value = null // Ensure no word is being edited
  showAddWordModal.value = true
}

const openEditWordModal = (word: VocabularyWord) => {
  wordToEdit.value = { ...word } // clone to avoid direct mutation while editing
  showAddWordModal.value = true
}

const closeWordModal = () => {
  showAddWordModal.value = false
  wordToEdit.value = null
}

const addNewWord = async (word: VocabularyWord) => {
  try {
    const newWord = await vocabularyWordsService.createWord({
      word: word.word,
      definition: word.definition,
      example: word.example,
      level: word.level,
      status: word.status,
      category: word.category,
      userId: userId.value
    }, userId.value)
    vocabularyWords.value.unshift(newWord)
    closeWordModal()
  } catch (error) {
    console.error('Error creating vocabulary word:', error)
    await fireSwal({
      title: 'Error',
      text: 'Failed to create word. Please try again.',
      icon: 'error',
    })
  }
}

const updateWord = async (updatedWord: VocabularyWord) => {
  try {
    const updated = await vocabularyWordsService.updateWord(updatedWord.id, updatedWord, userId.value)
    const index = vocabularyWords.value.findIndex(w => w.id === updatedWord.id)
    if (index !== -1) {
      vocabularyWords.value[index] = updated
    }
    closeWordModal()
  } catch (error) {
    console.error('Error updating vocabulary word:', error)
    await fireSwal({
      title: 'Error',
      text: 'Failed to update word. Please try again.',
      icon: 'error',
    })
  }
}

const toggleWordStatus = async (word: VocabularyWord) => {
  try {
    const newStatus = word.status === 'mastered' ? 'learning' : 'mastered'
    await vocabularyWordsService.updateWord(word.id, { status: newStatus }, userId.value)
    word.status = newStatus
  } catch (error) {
    console.error('Error updating word status:', error)
    await fireSwal({
      title: 'Error',
      text: 'Failed to update word status. Please try again.',
      icon: 'error',
    })
  }
}

const loadWordsFromFirebase = async () => {
  try {
    isLoading.value = true
    const firebaseWords = await vocabularyWordsService.getWords(userId.value)
    vocabularyWords.value = firebaseWords || []
  } catch (error) {
    console.error('Error loading words from Firebase:', error)
    vocabularyWords.value = []
    await fireSwal({
      title: 'Error',
      text: 'Failed to load words from Firebase. Please try again.',
      icon: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Wait for auth to resolve before loading words
  if (!authLoading.value) {
    await loadWordsFromFirebase()
  }
})

// Watch for auth loading to complete
watch(authLoading, async (loading) => {
  if (!loading) {
    await loadWordsFromFirebase()
  }
})
</script>
