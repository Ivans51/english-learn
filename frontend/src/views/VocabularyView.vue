<template>
  <main
    class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors"
  >
    <main-header />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Always Visible Sidebar -->
      <div class="w-full mb-6 pb-6 border-b border-gray-600">
        <!-- Header -->
        <div class="mb-4">
          <div class="flex items-center mb-2">
            <BookOpen
              class="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400"
            />
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
            <Search
              class="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
            />
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
                  <option value="">select category</option>
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
                  <Settings class="w-4 h-4" />
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
              <Plus class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
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
          <!-- Grid Layout -->
          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            <div
              v-for="(word, uid) in filteredWords"
              :key="uid"
              class="rounded-lg p-4 hover:shadow-lg transition-all border bg-white dark:bg-black relative"
              @click="toggleWordDetails(uid)"
              :class="[
                word.status === 'completed'
                  ? 'opacity-75 bg-green-50 dark:bg-green-950'
                  : '',
              ]"
            >
              <!-- Delete Button -->
              <button
                @click.stop="deleteWord(uid)"
                class="absolute top-2 right-2 h-6 w-6 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer transition-colors z-10"
                title="Delete word"
              >
                <X
                  class="w-3 h-3"
                />
              </button>

              <!-- Word Header -->
              <div class="flex items-start justify-center cursor-pointer pr-8">
                <h3
                  class="text-lg font-semibold text-primary-900 dark:text-primary-50 break-words leading-tight"
                >
                  {{ word.term }}
                </h3>
              </div>

              <!-- Word is now centered, actions moved to details modal -->
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
              <BookOpen
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                class="w-full h-full"
              />
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
                <Plus class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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

    <!-- Word Details Modal -->
    <WordDetailsModal
      v-if="selectedWordForDetails"
      :is-open="showWordDetailsModal"
      :word="selectedWordForDetails.word"
      :word-uid="selectedWordForDetails.uid"
      @close="closeWordDetailsModal"
      @toggle-status="toggleWordStatus"
      @edit-word="openEditWordModal"
      @delete-word="deleteWord"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Layers, Plus, Search, Settings, X } from 'lucide-vue-next'
import MainHeader from '@/components/MainHeader.vue'
import WordModal from '@/components/WordModal.vue'
import TopicWordsModal from '@/components/TopicWordsModal.vue'
import WordDetailsModal from '@/components/WordDetailsModal.vue'
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

const selectedCategory = ref('')
const selectedStatus = ref('pending') // Filter by completion status - default to pending
const showAddWordModal = ref(false)
const wordToEdit = ref<EditableVocabularyWord | null>(null)
const showWordDetailsModal = ref(false)
const selectedWordForDetails = ref<{
  word: VocabularyWord
  uid: string
} | null>(null)
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
        Object.keys(categories.value).length === 0 ||
        word.categoryId === selectedCategory.value

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
  const newCategoryId = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

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
  const word = vocabularyData.value?.vocabulary[wordUid]
  if (word) {
    selectedWordForDetails.value = { word, uid: wordUid }
    showWordDetailsModal.value = true
  }
}

const closeWordDetailsModal = () => {
  showWordDetailsModal.value = false
  selectedWordForDetails.value = null
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
