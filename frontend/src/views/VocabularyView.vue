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
          <button @click="openAddWordModal"
            class="w-full bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-3 px-4 rounded-md font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
              </path>
            </svg>
            Add New Word
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1">
          <div class="mb-6">
            <h2 class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-1">{{ filteredWords.length }} words</h2>
          </div>

          <!-- Vocabulary List -->
          <div class="space-y-4">
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
                  <button @click="toggleWordStatus(word)" :class="[
                    'h-8 flex items-center justify-center px-3 text-sm font-medium rounded transition-colors border border-white dark:border-primary-800 cursor-pointer',
                    word.status === 'mastered'
                      ? 'bg-black dark:bg-black text-white dark:text-white hover:bg-primary-800 dark:hover:bg-primary-700'
                      : 'bg-black dark:bg-black text-white dark:text-white hover:bg-primary-800 dark:hover:bg-primary-700'
                  ]">
                    {{ word.status === 'mastered' ? 'Mark as Learning' : 'Mark as Mastered' }}
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
            <div v-if="filteredWords.length === 0" class="text-center py-12">
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
  import { ref, computed } from 'vue'
  import MainHeader from '@/components/MainHeader.vue'
  import WordModal from '@/components/WordModal.vue'
  import Swal from 'sweetalert2' // Import Swal for DismissReason
  import { fireSwal } from '../utils/swalUtils'

interface VocabularyWord {
  id: string
  word: string
  definition: string
  example: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  status: 'learning' | 'mastered'
  category: string
  createdAt: Date
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Mock data with sample words
const vocabularyWords = ref<VocabularyWord[]>([
  {
    id: '1',
    word: 'Amazing',
    definition: 'causing great surprise or wonder; extraordinary',
    example: 'The view from the mountain was absolutely amazing.',
    level: 'B1',
    status: 'learning',
    category: 'Adjectives',
    createdAt: new Date('2024-01-14')
  },
  {
    id: '2',
    word: 'Brilliant',
    definition: 'exceptionally clever or talented',
    example: 'She came up with a brilliant solution to the problem.',
    level: 'B2',
    status: 'mastered',
    category: 'Describing People',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    word: 'Sophisticated',
    definition: 'having great knowledge or experience',
    example: 'The restaurant has a sophisticated atmosphere.',
    level: 'C1',
    status: 'learning',
    category: 'Advanced Vocabulary',
    createdAt: new Date('2024-01-24')
  }
])

const searchQuery = ref('')
const selectedLevel = ref('')
const filterLevel = ref('')
const selectedStatus = ref('')
const showAddWordModal = ref(false)
const wordToEdit = ref<VocabularyWord | null>(null)

const filteredWords = computed(() => {
  return vocabularyWords.value.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesHeaderLevel = !selectedLevel.value || word.level === selectedLevel.value
    const matchesFilterLevel = !filterLevel.value || word.level === filterLevel.value
    const matchesStatus = !selectedStatus.value || word.status === selectedStatus.value

    return matchesSearch && matchesHeaderLevel && matchesFilterLevel && matchesStatus
  })
})

const handleLevelClick = (level: string) => {
  selectedLevel.value = selectedLevel.value === level ? '' : level
}

const toggleWordStatus = (word: VocabularyWord) => {
  word.status = word.status === 'mastered' ? 'learning' : 'mastered'
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
    const index = vocabularyWords.value.findIndex(w => w.id === wordId)
    if (index > -1) {
      vocabularyWords.value.splice(index, 1)
    }
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openAddWordModal = () => {
  wordToEdit.value = null; // Ensure no word is being edited
  showAddWordModal.value = true;
};

const openEditWordModal = (word: VocabularyWord) => {
  wordToEdit.value = word;
  showAddWordModal.value = true;
};

const closeWordModal = () => {
  showAddWordModal.value = false;
  wordToEdit.value = null; // Clear the word being edited
};

const addNewWord = (word: VocabularyWord) => {
  vocabularyWords.value.unshift(word)
  closeWordModal() // Close modal after adding
}

const updateWord = (updatedWord: VocabularyWord) => {
  const index = vocabularyWords.value.findIndex(w => w.id === updatedWord.id);
  if (index !== -1) {
    vocabularyWords.value[index] = updatedWord;
  }
  closeWordModal(); // Close modal after updating
};
</script>
