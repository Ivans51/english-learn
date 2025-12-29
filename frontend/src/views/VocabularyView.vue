<template>
  <main
    class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors"
  >
    <main-header
      :current-level="selectedLevel"
      @level-click="handleLevelClick"
    />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div class="flex gap-4 lg:gap-8">
        <!-- Desktop Sidebar -->
        <div class="hidden lg:block w-80 flex-shrink-0">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center mb-2">
              <svg
                class="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
              <h1
                class="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-50"
              >
                My Vocabulary
              </h1>
            </div>
            <p
              class="text-sm sm:text-base text-primary-600 dark:text-primary-400"
            >
              Your personal collection of English words
            </p>
          </div>

          <!-- Search & Filter -->
          <div
            class="bg-white dark:bg-black rounded-lg p-4 mb-6 transition-colors"
          >
            <h3
              class="font-medium text-primary-900 dark:text-primary-50 mb-4 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                ></path>
              </svg>
              Search & Filter
            </h3>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
                >
                  Search Words
                </label>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search vocabulary..."
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
                >
                  Level
                </label>
                <select
                  v-model="filterLevel"
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                >
                  <option value="">All Levels</option>
                  <option v-for="level in levels" :key="level" :value="level">
                    {{ level }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
                >
                  Progress
                </label>
                <select
                  v-model="selectedStatus"
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                >
                  <option value="">All Words</option>
                  <option value="learning">Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Add New Word Button -->
          <div class="space-y-3">
            <button
              @click="openAddWordModal"
              class="w-full bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-2 px-3 sm:py-3 sm:px-4 rounded-md text-sm sm:font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer"
            >
              <svg
                class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              <span class="text-xs sm:text-sm">Add New Word</span>
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1">
          <!-- Mobile Search & Filter -->
          <div
            class="lg:hidden bg-white dark:bg-black rounded-lg p-4 mb-6 transition-colors"
          >
            <h3
              class="font-medium text-primary-900 dark:text-primary-50 mb-4 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                ></path>
              </svg>
              Search & Filter
            </h3>

            <!-- Horizontal layout for mobile -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <label
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
                >
                  Search Words
                </label>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search vocabulary..."
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
                >
                  Level
                </label>
                <select
                  v-model="filterLevel"
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                >
                  <option value="">All Levels</option>
                  <option v-for="level in levels" :key="level" :value="level">
                    {{ level }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
                >
                  Progress
                </label>
                <select
                  v-model="selectedStatus"
                  class="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                >
                  <option value="">All Words</option>
                  <option value="learning">Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
              <div class="sm:col-span-2 lg:col-span-1">
                <button
                  @click="openAddWordModal"
                  class="w-full bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-2 px-3 sm:py-1 sm:px-4 rounded-md text-sm font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg
                    class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span class="text-xs sm:text-sm">Add New Word</span>
                </button>
              </div>
            </div>
          </div>

          <div class="mb-4 sm:mb-6">
            <h2
              class="text-base sm:text-lg font-medium text-primary-900 dark:text-primary-50 mb-1"
            >
              {{ filteredWords.length }} words
            </h2>
          </div>

          <!-- Loading Indicator -->
          <div
            v-if="isLoading"
            class="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12 gap-3"
          >
            <div
              class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 dark:border-primary-400"
            ></div>
            <span
              class="text-sm sm:text-base text-primary-600 dark:text-primary-400"
            >
              Loading vocabulary...
            </span>
          </div>

          <!-- Vocabulary List -->
          <div v-else>
            <div
              v-for="word in filteredWords"
              :key="word.id"
              class="bg-white dark:bg-black rounded-lg p-1 sm:p-2 hover:shadow-md transition-all border-2 border-b-primary"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex sm:items-center gap-2">
                    <h3
                      class="text-lg sm:text-xl font-semibold text-primary-900 dark:text-primary-50 break-words"
                    >
                      {{ word.word }}
                    </h3>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="word.status === 'mastered'"
                        class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded flex-shrink-0"
                      >
                        Mastered
                      </span>
                      <button
                        @click="toggleWordDetails(word.id)"
                        class="px-2 py-1 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors cursor-pointer"
                      >
                        {{
                          expandedWords[word.id]
                            ? 'Hide details'
                            : 'Show details'
                        }}
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="expandedWords[word.id]"
                    class="transition-all duration-300"
                  >
                    <p class="text-primary-700 dark:text-primary-300 mb-3 mt-2">
                      {{ word.definition }}
                    </p>
                    <div
                      class="bg-primary-50 dark:bg-primary-900 p-3 rounded italic text-primary-600 dark:text-primary-400"
                    >
                      "{{ word.example }}"
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-2">
                  <span class="text-sm text-primary-500 dark:text-primary-400">
                    {{ word.category }}
                  </span>
                  <span
                    class="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded"
                  >
                    {{ word.level }}
                  </span>
                  <button
                    @click="toggleWordStatus(word)"
                    :class="getStatusButtonClass(word)"
                    class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-8 flex-shrink-0"
                  >
                    {{ getStatusButtonText(word) }}
                  </button>

                  <button
                    @click="openEditWordModal(word)"
                    class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-300 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      ></path>
                    </svg>
                  </button>

                  <button
                    @click="deleteWord(word.id)"
                    class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="filteredWords.length === 0 && !isLoading"
              class="text-center py-8 sm:py-12 px-4"
            >
              <div
                class="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-primary-400 dark:text-primary-500 mb-4"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  class="w-full h-full"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              </div>
              <h3
                class="text-base sm:text-lg font-medium text-primary-900 dark:text-primary-50 mb-2"
              >
                No vocabulary words yet
              </h3>
              <p
                class="text-sm sm:text-base text-primary-500 dark:text-primary-400 mb-6 max-w-sm mx-auto"
              >
                Start building your personal vocabulary collection by adding new
                words.
              </p>
              <button
                @click="openAddWordModal"
                class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 text-xs sm:text-sm font-medium rounded-md hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors cursor-pointer"
              >
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
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
import { computed, onMounted, ref, watch } from 'vue'
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
const selectedStatus = ref('learning')
const showAddWordModal = ref(false)
const wordToEdit = ref<VocabularyWord | null>(null)
const expandedWords = ref<Record<string, boolean>>({})

// Watch for changes in the firebaseUser
watch(
  firebaseUser,
  async (newUser) => {
    if (newUser) {
      userId.value = newUser.uid
    } else {
      userId.value = 'anonymous'
    }
    // Reload words when user changes
    if (!authLoading.value) {
      await loadWordsFromFirebase()
    }
  },
  { immediate: true },
)

const filteredWords = computed(() => {
  return vocabularyWords.value.filter((word) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      q === '' ||
      word.word.toLowerCase().includes(q) ||
      word.definition.toLowerCase().includes(q)
    const matchesHeaderLevel =
      !selectedLevel.value || word.level === selectedLevel.value
    const matchesFilterLevel =
      !filterLevel.value || word.level === filterLevel.value
    const matchesStatus =
      !selectedStatus.value || word.status === selectedStatus.value

    return (
      matchesSearch && matchesHeaderLevel && matchesFilterLevel && matchesStatus
    )
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
    'h-8 flex items-center justify-center px-2 sm:px-3 text-xs sm:text-sm font-medium rounded transition-colors border border-white dark:border-primary-800 cursor-pointer whitespace-nowrap'
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
  })

  if (result.isConfirmed) {
    try {
      await vocabularyWordsService.deleteWord(wordId, userId.value)
      const index = vocabularyWords.value.findIndex((w) => w.id === wordId)
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
    const newWord = await vocabularyWordsService.createWord(
      {
        word: word.word,
        definition: word.definition,
        example: word.example,
        level: word.level,
        status: word.status,
        category: word.category,
        userId: userId.value,
      },
      userId.value,
    )
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
    const updated = await vocabularyWordsService.updateWord(
      updatedWord.id,
      updatedWord,
      userId.value,
    )
    const index = vocabularyWords.value.findIndex(
      (w) => w.id === updatedWord.id,
    )
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
    await vocabularyWordsService.updateWord(
      word.id,
      { status: newStatus },
      userId.value,
    )
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

const toggleWordDetails = (wordId: string) => {
  expandedWords.value[wordId] = !expandedWords.value[wordId]
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
