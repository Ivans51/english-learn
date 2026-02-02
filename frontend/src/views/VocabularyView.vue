<template>
  <main
    class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors"
  >
    <main-header />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Always Visible Sidebar -->
      <div class="w-full mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-600">
        <!-- Header -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <BookOpen
                class="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400"
              />
              <h1
                class="text-lg sm:text-xl font-bold text-primary-900 dark:text-primary-50"
              >
                My Vocabulary
              </h1>
            </div>
              <button
                @click="showSearchFilter = !showSearchFilter"
                class="sm:hidden p-2.5 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                title="Toggle filters"
              >
                <Search v-if="!showSearchFilter" class="w-5 h-5" />
                <X v-else class="w-5 h-5" />
              </button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div
          class="hidden sm:block bg-white dark:bg-black rounded-lg p-4 transition-colors"
        >
          <h3
            class="font-medium text-primary-900 dark:text-primary-50 mb-4 flex items-center justify-between"
          >
            <div class="flex items-center">
              <Search
                class="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
              />
              Search & Filter
            </div>
            <div class="flex gap-3">
              <label
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="selectedStatus"
                  value=""
                  class="w-4 h-4 text-secondary-600 dark:text-secondary-400 focus:ring-secondary-500 border-gray-300 dark:border-gray-600"
                />
                <span class="ml-2 text-xs text-primary-700 dark:text-primary-300">All</span>
              </label>
              <label
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="selectedStatus"
                  value="pending"
                  class="w-4 h-4 text-secondary-600 dark:text-secondary-400 focus:ring-secondary-500 border-gray-300 dark:border-gray-600"
                />
                <span class="ml-2 text-xs text-primary-700 dark:text-primary-300">Pending</span>
              </label>
              <label
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="selectedStatus"
                  value="completed"
                  class="w-4 h-4 text-secondary-600 dark:text-secondary-400 focus:ring-secondary-500 border-gray-300 dark:border-gray-600"
                />
                <span class="ml-2 text-sm text-primary-700 dark:text-primary-300">Completed</span>
              </label>
            </div>
          </h3>

          <!-- Horizontal layout for all screen sizes -->
          <div class="flex flex-col gap-4">
            <div class="flex-1 hidden sm:block">
              <label
                class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
              >
                Search & Category
              </label>
              <div class="flex gap-2">
                <input
                  type="search"
                  v-model="searchQuery"
                  placeholder="Search..."
                  class="w-3/4 px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                />
                <select
                  v-model="selectedCategory"
                  class="w-1/4 px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
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
          </div>
        </div>

        <!-- Mobile Search & Filter (collapsible) -->
        <div
          v-if="showSearchFilter"
          class="sm:hidden bg-white dark:bg-black rounded-lg p-4 transition-colors"
        >
          <h3
            class="font-medium text-primary-900 dark:text-primary-50 mb-4 flex flex-col gap-3"
          >
            <div class="flex items-center">
              <Search
                class="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
              />
              Search & Filter
            </div>
            <div class="flex gap-3">
              <label
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="selectedStatus"
                  value=""
                  class="w-4 h-4 text-secondary-600 dark:text-secondary-400 focus:ring-secondary-500 border-gray-300 dark:border-gray-600"
                />
                <span class="ml-2 text-xs text-primary-700 dark:text-primary-300">All</span>
              </label>
              <label
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="selectedStatus"
                  value="pending"
                  class="w-4 h-4 text-secondary-600 dark:text-secondary-400 focus:ring-secondary-500 border-gray-300 dark:border-gray-600"
                />
                <span class="ml-2 text-xs text-primary-700 dark:text-primary-300">Pending</span>
              </label>
              <label
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="selectedStatus"
                  value="completed"
                  class="w-4 h-4 text-secondary-600 dark:text-secondary-400 focus:ring-secondary-500 border-gray-300 dark:border-gray-600"
                />
                <span class="ml-2 text-sm text-primary-700 dark:text-primary-300">Completed</span>
              </label>
            </div>
          </h3>

          <div class="flex flex-col gap-4">
            <div class="w-full">
              <label
                class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
              >
                Search & Category
              </label>
              <div class="flex gap-2">
                <input
                  type="search"
                  v-model="searchQuery"
                  placeholder="Search..."
                  class="w-3/4 px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
                />
                <select
                  v-model="selectedCategory"
                  class="w-1/4 px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
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
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div>
        <div class="mb-4 sm:mb-6">
          <div class="flex flex-col sm:flex-row justify-between gap-4">
            <div
              class="text-base sm:text-base font-medium text-primary-900 dark:text-primary-50"
            >
              <div class="text-lg sm:text-lg font-bold">
                {{ Object.keys(filteredWords).length }} words
              </div>
              <div class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                {{ completedWordsCount }} completed,
                {{ pendingWordsCount }} pending
              </div>
            </div>
            <div class="flex flex-wrap sm:flex-nowrap gap-2 sm:w-auto sm:min-w-[400px] items-center">
              <button
                @click="openTopicWordsModal"
                class="flex-1 sm:flex-none bg-secondary-600 dark:bg-secondary-700 text-white py-2.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs font-medium hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors flex items-center justify-center cursor-pointer whitespace-nowrap"
              >
                <Layers class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span class="text-xs sm:text-sm">Add Group Words</span>
              </button>
              <button
                @click="openAddWordModal"
                class="flex-1 sm:flex-none bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-2.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer whitespace-nowrap"
              >
                <Plus class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span class="text-xs sm:text-sm">Add New Word</span>
              </button>
              <button
                @click="viewMode = 'grid'"
                class="p-2.5 rounded-md transition-colors flex-shrink-0"
                :class="viewMode === 'grid' ? 'bg-secondary-600 text-white' : 'text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800'"
                title="Grid view"
              >
                <div class="grid grid-cols-2 gap-0.5 w-5 h-5">
                  <div class="bg-current rounded-sm"></div>
                  <div class="bg-current rounded-sm"></div>
                  <div class="bg-current rounded-sm"></div>
                  <div class="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                @click="viewMode = 'list'"
                class="p-2.5 rounded-md transition-colors flex-shrink-0"
                :class="viewMode === 'list' ? 'bg-secondary-600 text-white' : 'text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800'"
                title="List view"
              >
                <List class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="mt-4 sm:hidden">
            <div class="flex gap-2 w-full">
              <select
                v-model="selectedCategory"
                class="flex-1 px-3 py-2 border border-primary-300 dark:border-primary-800 rounded-md text-xs bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
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
                class="px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md text-xs hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center justify-center"
                title="Manage Categories"
              >
                <Settings class="w-4 h-4" />
              </button>
            </div>
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
            class="text-xs sm:text-sm text-primary-600 dark:text-primary-400"
          >
            Loading vocabulary...
          </span>
        </div>

        <!-- Vocabulary List -->
        <div v-else>
          <!-- Grid Layout -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            <div
              v-for="(word, uid) in filteredWords"
              :key="uid"
              class="rounded-lg p-4 hover:shadow-lg transition-all border bg-white dark:bg-black relative min-h-[100px] flex flex-col items-center justify-center cursor-pointer"
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
                class="absolute top-2 right-2 h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer transition-colors z-10"
                title="Delete word"
              >
                <X class="w-4 h-4" />
              </button>

              <!-- Word Header -->
              <h3
                class="text-base font-semibold text-primary-900 dark:text-primary-50 break-words leading-tight line-clamp-2 text-center w-full px-2"
              >
                {{ word.term }}
              </h3>

              <!-- Word is now centered, actions moved to details modal -->
            </div>
          </div>

          <!-- List Layout -->
          <div
            v-else
            class="vocabulary-list-view flex flex-col gap-3"
          >
            <div
              v-for="(word, uid) in filteredWords"
              :key="uid"
              class="rounded-lg p-4 hover:shadow-md transition-all border bg-white dark:bg-black relative cursor-pointer"
              @click="toggleWordDetails(uid)"
              :class="[
                word.status === 'completed'
                  ? 'opacity-75 bg-green-50 dark:bg-green-950'
                  : '',
              ]"
            >
              <div class="flex items-center justify-between pr-8">
                <div class="flex-1">
                  <h3
                    class="text-base font-semibold text-primary-900 dark:text-primary-50 break-words"
                  >
                    {{ word.term }}
                  </h3>
                </div>
                <div class="ml-4 flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-[10px] rounded-full"
                    :class="[
                      word.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    ]"
                  >
                    {{ word.status }}
                  </span>
                  <button
                    @click.stop="openVoicePracticeModal(word.term)"
                    class="h-10 w-10 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-green-600 dark:hover:text-green-400 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
                    title="Practice pronunciation"
                  >
                    <Mic class="w-5 h-5" />
                  </button>
                  <button
                    @click="openGrammarCheck(uid, word.term)"
                    class="h-10 w-10 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-blue-600 dark:hover:text-blue-400 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
                    title="Practice grammar"
                  >
                    <MessageCircle class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Delete Button -->
              <button
                @click.stop="deleteWord(uid)"
                class="absolute top-2 right-2 h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer transition-colors z-10"
                title="Delete word"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="Object.keys(filteredWords).length === 0 && !isLoading"
            class="text-center py-8 sm:py-12 px-4"
          >
          <div
            class="mx-auto h-14 w-14 sm:h-20 sm:w-20 text-primary-400 dark:text-primary-500 mb-4"
          >
              <BookOpen
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                class="w-full h-full"
              />
            </div>
            <h3
              class="text-sm sm:text-base font-medium text-primary-900 dark:text-primary-50 mb-2"
            >
              No vocabulary words yet
            </h3>
            <p
              class="text-xs sm:text-sm text-primary-500 dark:text-primary-400 mb-6 max-w-sm mx-auto"
            >
              Start building your personal vocabulary collection by adding new
              words.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Word Modal -->
    <WordModal
      :is-open="showAddWordModal"
      :current-word="wordToEdit"
      :categories="categories"
      :user-id="userId"
      :word-uid="(wordToEdit as EditableVocabularyWord)?._uid"
      @close="closeWordModal"
      @word-saved="handleWordOperation"
    />

    <!-- Create by Topic Words Modal -->
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
      @grammar-check="openGrammarCheck"
      @voice-practice="handleWordDetailsVoicePractice"
      @delete-word="deleteWord"
    />

    <!-- Voice Practice Modal -->
    <VoicePracticeModal
      :is-open="showVoicePracticeModal"
      :target-word="selectedWordForVoicePractice"
      @close="showVoicePracticeModal = false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Layers, List, MessageCircle, Mic, Plus, Search, Settings, X } from 'lucide-vue-next'
import { marked } from 'marked'
import MainHeader from '@/components/MainHeader.vue'
import WordModal from '@/components/WordModal.vue'
import TopicWordsModal from '@/components/TopicWordsModal.vue'
import WordDetailsModal from '@/components/WordDetailsModal.vue'
import VoicePracticeModal from '@/components/VoicePracticeModal.vue'
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
const showSearchFilter = ref(false)
const showVoicePracticeModal = ref(false)
const selectedWordForVoicePractice = ref('')
const viewMode = ref<'grid' | 'list'>(
  (localStorage.getItem('vocabularyViewMode') as 'grid' | 'list') || 'grid'
)
const initialLoadComplete = ref(false)

watch(viewMode, (newMode) => {
  localStorage.setItem('vocabularyViewMode', newMode)
})

watch(selectedCategory, (newCategory) => {
  if (initialLoadComplete.value) {
    localStorage.setItem('vocabularySelectedCategory', newCategory)
  }
})

const renderedDescriptions = ref<Record<string, string>>({})

const openGrammarCheck = (uid: string, term: string) => {
  sessionStorage.setItem('grammarCheckFrom', '/vocabulary')
  router.push(`/grammar-check/${uid}/${encodeURIComponent(term)}`)
}

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
        word.description.toLowerCase().includes(q)

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

// Keyboard shortcut handler for Ctrl+K / Cmd+K
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault() // Prevent browser's default behavior
    openAddWordModal()
  }
}

const openTopicWordsModal = () => {
  showTopicWordsModal.value = true
}

const closeTopicWordsModal = () => {
  showTopicWordsModal.value = false
}

const openVoicePracticeModal = (word: string) => {
  selectedWordForVoicePractice.value = word
  showWordDetailsModal.value = false
  showVoicePracticeModal.value = true
}

const handleWordDetailsVoicePractice = (term: string) => {
  closeWordDetailsModal()
  setTimeout(() => openVoicePracticeModal(term), 150)
}

const handleTopicWordsCreated = (data: { createdWords: VocabularyWord[] }) => {
  // Refresh the vocabulary data to show the new words
  setTimeout(() => loadWordsFromFirebase(), 500)

  // Auto-select the first category of the newly created words
  if (data.createdWords.length > 0) {
    const firstCategory = data.createdWords[0]?.categoryId
    if (firstCategory) {
      selectedCategory.value = firstCategory
    }
  }

  showSuccessToast(
    `${data.createdWords.length} words added successfully!`,
    2000,
  )
}

const closeWordModal = () => {
  showAddWordModal.value = false
  wordToEdit.value = null
}

const navigateToCategories = () => {
  router.push('/categories')
}

const handleWordOperation = (word: VocabularyWord) => {
  closeWordModal()
  setTimeout(() => loadWordsFromFirebase(), 500)

  // Auto-select the category of the newly created word
  if (word.categoryId) {
    selectedCategory.value = word.categoryId
  }
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

const renderMarkdown = async (markdownText: string): Promise<string> => {
  try {
    return await marked(markdownText)
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return markdownText
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

    // Render markdown for all descriptions
    const rendered: Record<string, string> = {}
    for (const [uid, word] of Object.entries(firebaseData.vocabulary)) {
      if (word.description) {
        rendered[uid] = await renderMarkdown(word.description)
      }
    }
    renderedDescriptions.value = rendered

    // Restore saved category or auto-select "Learning" on initial load
    if (!initialLoadComplete.value) {
      const savedCategory = localStorage.getItem('vocabularySelectedCategory')
      if (savedCategory && categories.value[savedCategory]) {
        selectedCategory.value = savedCategory
      } else {
        const learningCategoryId = Object.keys(categories.value).find((id) =>
          categories.value[id]?.name.toLowerCase() === 'learning',
        )
        if (learningCategoryId) {
          selectedCategory.value = learningCategoryId
        }
      }
      initialLoadComplete.value = true
    }
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

  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyboardShortcut)
})

onUnmounted(() => {
  // Clean up keyboard shortcut listener
  document.removeEventListener('keydown', handleKeyboardShortcut)
})

// Watch for auth loading to complete
watch(authLoading, async (loading) => {
  if (!loading) {
    await loadWordsFromFirebase()
  }
})
</script>
