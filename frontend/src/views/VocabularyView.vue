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
      <!-- Always Visible Sidebar -->
      <div class="w-full mb-6 pb-6 border-b border-gray-600">
        <!-- Header -->
        <div class="mb-4">
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
        <div class="bg-white dark:bg-black rounded-lg p-4 transition-colors">
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

          <!-- Horizontal layout for all screen sizes -->
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
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

            <div class="flex-1">
              <label
                class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
              >
                Category
              </label>
              <div class="flex gap-2">
                <select
                  v-model="selectedCategory"
                  class="flex-1 px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  <option
                    v-for="(category, id) in categories"
                    :key="id"
                    :value="id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <button
                  @click="navigateToCategories"
                  class="px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md text-sm hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center justify-center"
                  title="Manage Categories"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex-1">
              <label
                class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
              >
                Status
              </label>
              <select
                v-model="selectedStatus"
                class="w-full px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
              >
                <option value="">All Words</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div>
        <div class="mb-4 sm:mb-6 flex justify-between">
          <div
            class="text-base sm:text-lg font-medium text-primary-900 dark:text-primary-50 mb-1"
          >
            <div>{{ Object.keys(filteredWords).length }} words</div>
            <div class="text-sm text-primary-600 dark:text-primary-400">
              {{ completedWordsCount }} completed,
              {{ pendingWordsCount }} pending
            </div>
          </div>
          <div class="flex gap-2 sm:w-80">
            <button
              @click="openTopicWordsModal"
              class="flex-1 bg-secondary-600 dark:bg-secondary-700 text-white py-2 px-3 sm:py-2 sm:px-4 rounded-md text-sm font-medium hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Layers class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span class="text-xs sm:text-sm">Add Group Words</span>
            </button>
            <button
              @click="openAddWordModal"
              class="flex-1 bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-2 px-3 sm:py-2 sm:px-4 rounded-md text-sm font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer"
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
            v-for="(word, uid) in filteredWords"
            :key="uid"
            class="rounded-lg p-1 sm:p-2 hover:shadow-md transition-all border mb-2"
            :class="[
              word.status === 'completed'
                ? 'opacity-75 bg-green-400 dark:bg-green-950'
                : 'bg-white dark:bg-black',
            ]"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
            >
              <div class="flex-1 min-w-0">
                <div class="flex sm:items-center gap-2">
                  <h3
                    class="text-lg sm:text-xl font-semibold text-primary-900 dark:text-primary-50 break-words"
                  >
                    {{ word.term }}
                  </h3>
                  <button
                    @click="toggleWordDetails(uid)"
                    class="px-2 py-1 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors cursor-pointer"
                  >
                    {{ expandedWords[uid] ? 'Hide details' : 'Show details' }}
                  </button>
                </div>

                <div
                  v-if="expandedWords[uid]"
                  class="transition-all duration-300"
                >
                  <div class="space-y-2 mb-3 mt-2">
                    <p
                      class="text-primary-700 dark:text-primary-300 whitespace-pre-line"
                    >
                      {{ word.meanings.replace(/; /g, '\n') }}
                    </p>
                  </div>
                  <div
                    class="bg-primary-50 dark:bg-primary-900 p-3 rounded italic text-primary-600 dark:text-primary-400 mb-2 whitespace-pre-line"
                  >
                    "{{ word.examples.replace(/; /g, '\n') }}"
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 sm:gap-2">
                <span class="text-sm text-primary-500 dark:text-primary-400">
                  {{ word.categoryName }}
                </span>
                <button
                  @click="toggleWordStatus(uid, word.status)"
                  :class="[
                    'h-8 w-8 flex items-center justify-center rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0 transition-colors',
                    word.status === 'completed'
                      ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                      : 'text-primary-400 dark:text-primary-500 hover:text-green-600 dark:hover:text-green-400',
                  ]"
                  :title="
                    word.status === 'completed'
                      ? 'Mark as pending'
                      : 'Mark as completed'
                  "
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
                <button
                  @click="openEditWordModal(word, uid)"
                  class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-blue-600 dark:hover:text-blue-400 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
                <button
                  @click="deleteWord(uid)"
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
            v-if="Object.keys(filteredWords).length === 0 && !isLoading"
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
            <div class="flex gap-2 justify-center">
              <button
                @click="openTopicWordsModal"
                class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-secondary-600 dark:bg-secondary-700 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors cursor-pointer"
              >
                <Layers class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add Group Words
              </button>
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
                Add Single Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Word Modal -->
    <WordModal
      :is-open="showAddWordModal"
      :current-word="wordToEdit"
      :categories="categories"
      @close="closeWordModal"
      @add-word="addNewWord"
      @update-word="updateWord"
      @add-category="addNewCategory"
    />

    <!-- Topic Words Modal -->
    <TopicWordsModal
      :is-open="showTopicWordsModal"
      :user-id="userId"
      @close="closeTopicWordsModal"
      @words-created="handleTopicWordsCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Layers } from 'lucide-vue-next'
import MainHeader from '@/components/MainHeader.vue'
import WordModal from '@/components/WordModal.vue'
import TopicWordsModal from '@/components/TopicWordsModal.vue'
import { fireSwal } from '../utils/swalUtils'
import { vocabularyWordsService } from '@/services/vocabularyService'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import type {
  CategoryCollection,
  VocabularyData,
  VocabularyWord,
} from '@/types'

// Extended interface for editing that includes the UID
interface EditableVocabularyWord extends VocabularyWord {
  _uid?: string
}

const router = useRouter()
const { user: firebaseUser, loading: authLoading } = useAuth()
const { success: showSuccessToast, error: showErrorToast } = useToast()
const userId = ref('anonymous')

// New data structure
const vocabularyData = ref<VocabularyData | null>(null)
const categories = ref<CategoryCollection>({})
const isLoading = ref(false)

const searchQuery = ref('')
const selectedLevel = ref('') // Keep for MainHeader compatibility
const selectedCategory = ref('')
const selectedStatus = ref('pending') // Filter by completion status - default to pending
const showAddWordModal = ref(false)
const wordToEdit = ref<EditableVocabularyWord | null>(null)
const expandedWords = ref<Record<string, boolean>>({})
const showTopicWordsModal = ref(false)

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
  if (!vocabularyData.value || !vocabularyData.value.vocabulary) return {}

  return Object.entries(vocabularyData.value.vocabulary).reduce(
    (acc, [uid, word]) => {
      const q = searchQuery.value.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        word.term.toLowerCase().includes(q) ||
        word.meanings.toLowerCase().includes(q) ||
        word.examples.toLowerCase().includes(q)

      const matchesCategory =
        !selectedCategory.value || word.categoryId === selectedCategory.value

      const matchesStatus =
        !selectedStatus.value || word.status === selectedStatus.value

      if (matchesSearch && matchesCategory && matchesStatus) {
        acc[uid] = word
      }

      return acc
    },
    {} as Record<string, VocabularyWord>,
  )
})

const completedWordsCount = computed(() => {
  return Object.values(filteredWords.value).filter(
    (word) => word.status === 'completed',
  ).length
})

const pendingWordsCount = computed(() => {
  return Object.values(filteredWords.value).filter(
    (word) => word.status !== 'completed',
  ).length
})

const handleLevelClick = (level: string) => {
  // Level filtering removed in new structure
  console.log('Level click:', level)
}

const deleteWord = async (wordUid: string) => {
  const result = await fireSwal({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      await vocabularyWordsService.deleteWord(wordUid, userId.value)
      // Remove from local data
      if (vocabularyData.value && vocabularyData.value.vocabulary[wordUid]) {
        delete vocabularyData.value.vocabulary[wordUid]
      }
    } catch (error) {
      console.error('Error deleting word:', error)
      showErrorToast('Failed to delete word. Please try again.')
    }
  }
}

const openAddWordModal = () => {
  wordToEdit.value = null // Ensure no word is being edited
  showAddWordModal.value = true
}

const openTopicWordsModal = () => {
  showTopicWordsModal.value = true
}

const closeTopicWordsModal = () => {
  showTopicWordsModal.value = false
}

const handleTopicWordsCreated = (createdWords: VocabularyWord[]) => {
  // Refresh the vocabulary data to show the new words
  setTimeout(() => loadWordsFromFirebase(), 500)
  showSuccessToast(`${createdWords.length} words added successfully!`, 2000)
}

const openEditWordModal = (word: VocabularyWord, wordUid: string) => {
  wordToEdit.value = { ...word, _uid: wordUid } // Set the word to be edited with UID
  showAddWordModal.value = true
}

const closeWordModal = () => {
  showAddWordModal.value = false
  wordToEdit.value = null
}

const navigateToCategories = () => {
  router.push('/categories')
}

const addNewWord = async (word: VocabularyWord) => {
  try {
    await vocabularyWordsService.createWord(
      {
        term: word.term,
        meanings: word.meanings,
        examples: word.examples,
        categoryName: word.categoryName,
        userId: userId.value,
      },
      userId.value,
    )
    closeWordModal()
    // Refresh to get the real data from backend
    setTimeout(() => loadWordsFromFirebase(), 500)
  } catch (error) {
    console.error('Error creating vocabulary word:', error)
    showErrorToast('Failed to create word. Please try again.')
  }
}

const updateWord = async (updatedWord: VocabularyWord) => {
  try {
    // Get the stored UID from the word object
    const wordUid = (wordToEdit.value as EditableVocabularyWord)?._uid

    if (!wordUid) {
      throw new Error('Word UID not found for update')
    }

    const updated = await vocabularyWordsService.updateWord(
      wordUid,
      {
        term: updatedWord.term,
        meanings: updatedWord.meanings,
        examples: updatedWord.examples,
        categoryName: updatedWord.categoryName,
      },
      userId.value,
    )

    // Update local data
    if (vocabularyData.value) {
      vocabularyData.value.vocabulary[wordUid] = updated
    }

    closeWordModal()
  } catch (error) {
    console.error('Error updating vocabulary word:', error)
    showErrorToast('Failed to update word. Please try again.')
  }
}

const addNewCategory = (categoryName: string) => {
  // Generate a unique ID for the new category
  const newCategoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Add the new category to the categories object
  categories.value[newCategoryId] = {
    name: categoryName.trim(),
  }

  // Also update the vocabularyData if it exists
  if (vocabularyData.value) {
    vocabularyData.value.categories[newCategoryId] = {
      name: categoryName.trim(),
    }
  }

  showSuccessToast(
    `Category "${categoryName.trim()}" added successfully!`,
    2000,
  )
}

const toggleWordStatus = async (
  wordUid: string,
  currentStatus?: 'pending' | 'completed',
) => {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

  try {
    const updated = await vocabularyWordsService.updateWord(
      wordUid,
      { status: newStatus },
      userId.value,
    )

    // Update local data
    if (vocabularyData.value) {
      vocabularyData.value.vocabulary[wordUid] = updated
    }

    showSuccessToast(`Word marked as ${newStatus}`, 2000)
  } catch (error) {
    console.error('Error updating word status:', error)
    showErrorToast('Failed to update word status. Please try again.')
  }
}

const toggleWordDetails = (wordUid: string) => {
  expandedWords.value[wordUid] = !expandedWords.value[wordUid]
}

const loadWordsFromFirebase = async () => {
  try {
    isLoading.value = true
    const firebaseData = await vocabularyWordsService.getWords(userId.value)
    vocabularyData.value = firebaseData
    categories.value = firebaseData.categories
  } catch (error) {
    console.error('Error loading words from Firebase:', error)
    vocabularyData.value = { vocabulary: {}, categories: {} }
    categories.value = {}
    showErrorToast('Failed to load words from Firebase. Please try again.')
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
