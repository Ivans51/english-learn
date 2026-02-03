<template>
  <main
    class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors"
  >
    <main-header />

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-1">
          <button
            @click="handleBackNavigation"
            class="p-1.5 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200 rounded transition-colors"
            title="Go back"
          >
            <ArrowLeft class="w-6 h-6" />
          </button>
          <h1
            class="text-2xl font-semibold text-primary-900 dark:text-primary-50"
          >
            Categories
          </h1>
        </div>
      </div>

      <!-- Search and count -->
      <div class="flex items-center gap-2 mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search categories..."
            class="flex-1 px-3 py-1.5 text-base bg-transparent border-b border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:border-secondary-500 transition-colors"
            ref="searchInput"
          />
          <span class="text-base text-primary-400 dark:text-primary-500">
          {{ filteredCategoriesCount }} / {{ Object.keys(categories).length }}
        </span>
      </div>

      <!-- Categories list -->
      <div>
        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b border-primary-500"
          ></div>
        </div>

        <div
          v-else-if="Object.keys(filteredCategories).length === 0"
          class="text-center py-8"
        >
          <p class="text-lg text-primary-500 dark:text-primary-400">
            {{ searchQuery ? 'No matching categories' : 'No categories yet' }}
          </p>
        </div>

        <div v-else class="space-y-1">
          <div
            v-for="(category, id) in filteredCategories"
            :key="id"
            class="flex items-center justify-between py-2 px-1 border-b border-primary-100 dark:border-primary-800 last:border-0"
          >
            <!-- Category name (editable) -->
            <div class="flex-1 min-w-0 mr-3">
              <input
                v-if="editingCategory === String(id)"
                v-model="editingName"
                type="text"
                class="w-full px-2 py-1 text-lg bg-transparent border-b border-secondary-500 focus:outline-none text-primary-900 dark:text-primary-50"
                @keyup.enter="handleSaveEdit(String(id))"
                @keyup.escape="cancelEdit"
                ref="editInput"
              />
              <span
                v-else
                class="text-lg text-primary-700 dark:text-primary-300 cursor-pointer hover:text-primary-900 dark:hover:text-primary-100"
                @click="startEdit(String(id), category.name)"
              >
                {{ category.name }}
              </span>
              <span class="ml-2 text-sm text-primary-400 dark:text-primary-500">
                {{ getWordCountForCategory(String(id)) }} words
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1">
              <!-- Edit button -->
              <button
                v-if="editingCategory !== String(id)"
                @click="startEdit(String(id), category.name)"
                class="p-1.5 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 rounded transition-colors"
                title="Edit category"
              >
                <Edit3 class="w-5 h-5" />
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
                class="p-1.5 text-primary-400 hover:text-green-600 dark:hover:text-green-400 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Save changes"
              >
                <span
                  v-if="isUpdating"
                  class="animate-spin rounded-full h-3.5 w-3.5 border-b border-primary-500"
                ></span>
                <Check v-else class="w-5 h-5" />
              </button>

              <!-- Cancel button -->
              <button
                v-if="editingCategory === String(id)"
                @click="cancelEdit"
                class="p-1.5 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 rounded transition-colors"
                title="Cancel editing"
              >
                <X class="w-5 h-5" />
              </button>

              <!-- Delete button -->
              <button
                @click="handleDeleteCategory(String(id), category.name)"
                class="p-1.5 text-primary-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                title="Delete category and all related words"
              >
                <Trash2 v-if="!isLoading" class="w-5 h-5" />
                <span
                  v-else
                  class="animate-spin rounded-full h-3.5 w-3.5 border-b border-primary-500"
                ></span>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  Edit3,
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

const searchQuery = ref('')
const editingCategory = ref<string | null>(null)
const editingName = ref('')
const editInput = ref<HTMLInputElement>()
const searchInput = ref<HTMLInputElement>()

// Loading states for different operations
const isUpdating = ref(false)

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

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return categories.value

  const filtered: CategoryCollection = {}
  for (const [id, category] of Object.entries(categories.value)) {
    if (category.name.toLowerCase().includes(query)) {
      filtered[id] = category
    }
  }
  return filtered
})

const filteredCategoriesCount = computed(() => Object.keys(filteredCategories.value).length)

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
  const trimmedName = editingName.value.trim()
  const currentCategory = categories.value[categoryId]
  const oldName = currentCategory?.name

  if (!trimmedName || trimmedName === oldName) {
    cancelEdit()
    return
  }

  isUpdating.value = true
  try {
    await categoryService.updateCategory(
      categoryId,
      { name: trimmedName },
      userId.value,
    )

    await loadCategories()

    showSuccessToast(
      `Category updated from "${oldName}" to "${trimmedName}"!`,
      2000,
    )
  } catch (error) {
    console.error('Error updating category:', error)
    showErrorToast('Failed to update category. Please try again.')
  } finally {
    isUpdating.value = false
    cancelEdit()
  }
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
    isLoading.value = true
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
      isLoading.value = false
    }
  }
}

onMounted(async () => {
  // Wait for auth to resolve before loading categories
  if (!authLoading.value) {
    await loadCategories()
  }

  nextTick(() => {
    searchInput.value?.focus()
  })
})

// Watch for auth loading to complete
watch(authLoading, async (loading) => {
  if (!loading) {
    await loadCategories()
  }
})
</script>
