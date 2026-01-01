<template>
  <main
    class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors"
  >
    <main-header />

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center mb-4">
          <button
            @click="handleBackNavigation"
            class="mr-4 p-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
            title="Go back"
          >
            <ArrowLeft class="w-6 h-6" />
          </button>
          <div>
            <h1
              class="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-50"
            >
              Manage Categories
            </h1>
            <p
              class="text-sm sm:text-base text-primary-600 dark:text-primary-400"
            >
              Organize and manage your vocabulary categories
            </p>
          </div>
        </div>
      </div>

      <!-- Add new category form -->
      <div class="bg-white dark:bg-black rounded-lg p-6 mb-6 transition-colors">
        <h2
          class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-4"
        >
          Add New Category
        </h2>
        <div class="flex gap-2">
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="Enter category name..."
            class="flex-1 px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md text-sm bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
            @keyup.enter="handleAddCategory"
          />
          <button
            @click="handleAddCategory"
            :disabled="!newCategoryName.trim() || isCreating"
            class="px-6 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md text-sm font-medium hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span
              v-if="isCreating"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></span>
            <Plus v-else class="w-4 h-4" />
            {{ isCreating ? 'Adding...' : 'Add Category' }}
          </button>
        </div>
      </div>

      <!-- Categories list -->
      <div class="bg-white dark:bg-black rounded-lg p-6 transition-colors">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-primary-900 dark:text-primary-50">
            Existing Categories ({{ Object.keys(categories).length }})
          </h2>
          <button
            @click="loadCategories"
            :disabled="isLoading"
            class="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
            Refresh
          </button>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"
          ></div>
          <span class="ml-2 text-sm text-primary-600 dark:text-primary-400">
            Loading...
          </span>
        </div>

        <div
          v-else-if="Object.keys(categories).length === 0"
          class="text-center py-8"
        >
          <div
            class="mx-auto h-16 w-16 text-primary-400 dark:text-primary-500 mb-4"
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              ></path>
            </svg>
          </div>
          <h3
            class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-2"
          >
            No categories yet
          </h3>
          <p class="text-sm text-primary-500 dark:text-primary-400">
            Create your first category above to start organizing your
            vocabulary!
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(category, id) in categories"
            :key="id"
            class="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900 rounded-lg border border-primary-200 dark:border-primary-700"
          >
            <!-- Category name (editable) -->
            <div class="flex-1 min-w-0 mr-4">
              <input
                v-if="editingCategory === String(id)"
                v-model="editingName"
                type="text"
                class="w-full px-3 py-2 text-sm bg-white dark:bg-primary-800 border border-primary-300 dark:border-primary-600 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary-500 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500"
                @keyup.enter="handleSaveEdit(String(id))"
                @keyup.escape="cancelEdit"
                ref="editInput"
              />
              <span
                v-else
                class="text-sm text-primary-900 dark:text-primary-50 cursor-pointer hover:text-primary-700 dark:hover:text-primary-200 font-medium"
                @click="startEdit(String(id), category.name)"
              >
                {{ category.name }}
              </span>

              <!-- Word count for this category -->
              <span class="ml-2 text-xs text-primary-500 dark:text-primary-400">
                ({{ getWordCountForCategory(String(id)) }} words)
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2">
              <!-- Edit button -->
              <button
                v-if="editingCategory !== String(id)"
                @click="startEdit(String(id), category.name)"
                class="p-2 text-primary-600 dark:text-primary-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                title="Edit category"
              >
                <Edit3 class="w-4 h-4" />
              </button>

              <!-- Save button -->
              <button
                v-if="editingCategory === String(id)"
                @click="handleSaveEdit(String(id))"
                :disabled="
                  !editingName.trim() ||
                  editingName === category.name ||
                  isUpdating
                "
                class="p-2 text-primary-600 dark:text-primary-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Save changes"
              >
                <span
                  v-if="isUpdating"
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-400"
                ></span>
                <Check v-else class="w-4 h-4" />
              </button>

              <!-- Cancel button -->
              <button
                v-if="editingCategory === String(id)"
                @click="cancelEdit"
                class="p-2 text-primary-600 dark:text-primary-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                title="Cancel editing"
              >
                <X class="w-4 h-4" />
              </button>

              <!-- Delete button -->
              <button
                @click="handleDeleteCategory(String(id), category.name)"
                :disabled="isDeleting"
                class="p-2 text-primary-600 dark:text-primary-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete category and all related words"
              >
                <span
                  v-if="isDeleting"
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 dark:border-red-400"
                ></span>
                <Trash2 v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
// Watch for user changes
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-vue-next'
import MainHeader from '@/components/MainHeader.vue'
import { fireSwal } from '@/utils/swalUtils'
import { useToast } from '@/composables/useToast'
import { vocabularyWordsService } from '@/services/vocabularyService'
import { categoryService } from '@/services/categoryService'
import { useAuth } from '@/composables/useAuth'
import type { CategoryCollection, VocabularyData } from '@/types'

const { success: showSuccessToast, error: showErrorToast } = useToast()
const { user: firebaseUser, loading: authLoading } = useAuth()
const router = useRouter()

// Function to handle back navigation
const handleBackNavigation = () => {
  router.push('/vocabulary')
}

const categories = ref<CategoryCollection>({})
const vocabularyData = ref<VocabularyData | null>(null)
const isLoading = ref(false)

const newCategoryName = ref('')
const editingCategory = ref<string | null>(null)
const editingName = ref('')
const editInput = ref<HTMLInputElement>()

// Loading states for different operations
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)

const userId = ref('anonymous')

// Watch for changes in the firebaseUser
watch(
  firebaseUser,
  async (newUser) => {
    if (newUser) {
      userId.value = newUser.uid
    } else {
      userId.value = 'anonymous'
    }
    // Reload categories when user changes
    if (!authLoading.value) {
      await loadCategories()
    }
  },
  { immediate: true },
)

const loadCategories = async () => {
  try {
    isLoading.value = true
    const data = await vocabularyWordsService.getWords(userId.value)
    vocabularyData.value = data
    categories.value = data.categories
  } catch (error) {
    console.error('Error loading categories:', error)
    showErrorToast('Failed to load categories. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const getWordCountForCategory = (categoryId: string): number => {
  if (!vocabularyData.value || !vocabularyData.value.vocabulary) return 0

  return Object.values(vocabularyData.value.vocabulary).filter(
    (word) => word.categoryId === categoryId,
  ).length
}

const handleAddCategory = async () => {
  if (newCategoryName.value.trim()) {
    isCreating.value = true
    try {
      // Create the category via API
      await categoryService.createCategory(
        newCategoryName.value.trim(),
        userId.value,
      )

      // Reload categories from backend to ensure consistency
      await loadCategories()

      showSuccessToast(
        `Category "${newCategoryName.value.trim()}" added successfully!`,
        2000,
      )
      newCategoryName.value = ''
    } catch (error) {
      console.error('Error adding category:', error)
      showErrorToast('Failed to add category. Please try again.')
    } finally {
      isCreating.value = false
    }
  }
}

const startEdit = (categoryId: string, currentName: string) => {
  editingCategory.value = categoryId
  editingName.value = currentName

  nextTick(() => {
    const inputElement = editInput.value
    if (inputElement && typeof inputElement.focus === 'function') {
      inputElement.focus()
      inputElement.select()
    } else {
      // Fallback: try again after a short delay
      setTimeout(() => {
        const fallbackElement = editInput.value
        if (fallbackElement && typeof fallbackElement.focus === 'function') {
          fallbackElement.focus()
          fallbackElement.select()
        }
      }, 50)
    }
  })
}

const handleSaveEdit = async (categoryId: string) => {
  if (
    editingName.value.trim() &&
    editingName.value.trim() !== categories.value[categoryId]?.name
  ) {
    const oldName = categories.value[categoryId]?.name || 'Unknown Category'

    isUpdating.value = true
    try {
      // Update via API
      await categoryService.updateCategory(
        categoryId,
        { name: editingName.value.trim() },
        userId.value,
      )

      // Reload data from backend to ensure consistency
      await loadCategories()

      showSuccessToast(
        `Category updated from "${oldName}" to "${editingName.value.trim()}"!`,
        2000,
      )
    } catch (error) {
      console.error('Error updating category:', error)
      showErrorToast('Failed to update category. Please try again.')
    } finally {
      isUpdating.value = false
    }
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingCategory.value = null
  editingName.value = ''
}

const handleDeleteCategory = async (
  categoryId: string,
  categoryName: string,
) => {
  const wordCount = getWordCountForCategory(categoryId)

  const result = await fireSwal({
    title: 'Are you sure?',
    text: `This will delete the category "${categoryName}"${wordCount > 0 ? ` and all ${wordCount} vocabulary words associated with it` : ''}. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    confirmButtonColor: '#dc2626',
  })

  if (result.isConfirmed) {
    isDeleting.value = true
    try {
      // Delete via API (this will also delete all related vocabulary words)
      await categoryService.deleteCategory(categoryId, userId.value)

      // Reload categories from backend to ensure UI is up-to-date
      await loadCategories()

      showSuccessToast(
        `Category "${categoryName}" deleted${wordCount > 0 ? ` along with ${wordCount} related words` : ''}!`,
        3000,
      )
    } catch (error) {
      console.error('Error deleting category:', error)
      showErrorToast('Failed to delete category. Please try again.')
    } finally {
      isDeleting.value = false
    }
  }
}

onMounted(async () => {
  // Wait for auth to resolve before loading categories
  if (!authLoading.value) {
    await loadCategories()
  }
})

// Watch for auth loading to complete
watch(authLoading, async (loading) => {
  if (!loading) {
    await loadCategories()
  }
})
</script>
