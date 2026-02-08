<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!-- Backdrop -->
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <!-- Sidebar Panel -->
      <div
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-black shadow-xl overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-primary-200 dark:border-gray-800 bg-white dark:bg-black"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center"
            >
              <Library
                class="w-5 h-5 text-secondary-600 dark:text-secondary-400"
              />
            </div>
            <div>
              <h2
                class="text-lg font-bold text-primary-900 dark:text-primary-50"
              >
                Categories
              </h2>
              <p class="text-xs text-primary-500 dark:text-primary-400">
                Manage your word collections
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-primary-400 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-300 hover:bg-primary-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            title="Close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Search -->
        <div
          class="p-4 border-b border-primary-200 dark:border-gray-800 bg-primary-50/50 dark:bg-gray-900/50"
        >
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Search class="w-4 h-4 text-primary-400 dark:text-primary-500" />
            </div>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search categories..."
              class="w-full pl-10 pr-20 py-2.5 text-sm bg-secondary-100 dark:bg-secondary-900/30 border-2 border-secondary-200 dark:border-secondary-700 rounded-xl text-primary-900 dark:text-primary-50 placeholder-primary-500 dark:placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span
                class="text-xs font-medium text-primary-600 dark:text-primary-300 bg-white/80 dark:bg-gray-700/80 px-2.5 py-1 rounded-full backdrop-blur-sm"
              >
                {{ filteredCategoriesCount }}/{{
                  Object.keys(localCategories).length
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Categories List -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Loading -->
          <div
            v-if="isLoading"
            class="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div
              class="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 dark:border-gray-700 border-t-secondary-500"
            ></div>
            <span class="text-sm text-primary-500 dark:text-primary-400">
              Loading categories...
            </span>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="Object.keys(filteredCategories).length === 0"
            class="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div
              class="w-16 h-16 mb-4 rounded-full bg-primary-100 dark:bg-gray-800 flex items-center justify-center"
            >
              <Search class="w-8 h-8 text-primary-400 dark:text-primary-500" />
            </div>
            <p class="text-primary-600 dark:text-primary-300 font-medium mb-1">
              {{ searchQuery ? 'No matching categories' : 'No categories yet' }}
            </p>
            <p
              v-if="searchQuery"
              class="text-sm text-primary-400 dark:text-primary-500"
            >
              Try adjusting your search
            </p>
          </div>

          <!-- Categories -->
          <div v-else class="space-y-3">
            <div
              v-for="(category, id) in filteredCategories"
              :key="id"
              :class="[
                'group relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out',
                selectedCategory === id
                  ? 'bg-secondary-600 dark:bg-secondary-700 border-secondary-600 dark:border-secondary-500 shadow-md shadow-secondary-200 dark:shadow-secondary-900/30'
                  : 'bg-transparent border-primary-200 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-secondary-50/30 dark:hover:bg-secondary-900/20',
              ]"
              @click="handleSelectCategory(String(id))"
            >
              <!-- Selection indicator -->
              <div
                v-if="selectedCategory === id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary-500 dark:bg-secondary-400 rounded-r-full"
              ></div>

              <div class="flex-1 min-w-0 mr-3">
                <input
                  v-if="editingCategory === String(id)"
                  v-model="editingName"
                  type="text"
                  class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-secondary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500/20 text-primary-900 dark:text-primary-50 transition-all"
                  @keyup.enter="handleSaveEdit(String(id))"
                  @keyup.escape="cancelEdit"
                  @click.stop
                  ref="editInput"
                />
                <div v-else class="flex flex-col gap-1">
                  <span
                    :class="[
                      'text-base font-semibold truncate',
                      selectedCategory === id
                        ? 'text-white'
                        : 'text-primary-800 dark:text-primary-200',
                    ]"
                  >
                    {{ category.name }}
                  </span>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit',
                      selectedCategory === id
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400',
                    ]"
                  >
                    {{ getWordCountForCategory(String(id)) }} words
                  </span>
                </div>
              </div>

              <!-- Action buttons -->
              <div
                class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                @click.stop
              >
                <!-- Edit button -->
                <button
                  v-if="
                    editingCategory !== String(id) &&
                    category.name !== 'learning'
                  "
                  @click="startEdit(String(id), category.name)"
                  class="p-2 bg-primary-100 dark:bg-gray-700 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 hover:bg-primary-200 dark:hover:bg-gray-600 rounded-lg border border-primary-200 dark:border-gray-600 shadow-sm hover:shadow transition-all duration-200"
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
                  class="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg border border-green-300 dark:border-green-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Save changes"
                >
                  <span
                    v-if="isUpdating"
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"
                  ></span>
                  <Check v-else class="w-4 h-4" />
                </button>

                <!-- Cancel button -->
                <button
                  v-if="editingCategory === String(id)"
                  @click="cancelEdit"
                  class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow transition-all duration-200"
                  title="Cancel editing"
                >
                  <X class="w-4 h-4" />
                </button>

                <!-- Delete button -->
                <button
                  v-if="category.name !== 'learning'"
                  @click="handleDeleteCategory(String(id), category.name)"
                  class="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800 shadow-sm hover:shadow transition-all duration-200"
                  title="Delete category and all related words"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Check, Edit3, Library, Search, Trash2, X } from 'lucide-vue-next'
import { fireSwal } from '@/utils/swalUtils'
import { useToast } from '@/composables/useToast'
import { categoryService } from '@/services/categoryService'
import type { CategoryCollection, VocabularyData } from '@/types'

interface Props {
  isOpen: boolean
  categories: CategoryCollection
  vocabularyData: VocabularyData | null
  userId: string
  selectedCategory: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  selectCategory: [categoryId: string]
  updateCategories: []
}>()

const { success: showSuccessToast, error: showErrorToast } = useToast()

// Local reactive copy of categories
const localCategories = ref<CategoryCollection>({})
const isLoading = ref(false)

// Sync local categories with prop
watch(
  () => props.categories,
  (newCategories) => {
    localCategories.value = { ...newCategories }
  },
  { immediate: true },
)

const searchQuery = ref('')
const editingCategory = ref<string | null>(null)
const editingName = ref('')
const editInput = ref<HTMLInputElement>()
const isUpdating = ref(false)

const getWordCountForCategory = (categoryId: string): number => {
  if (!props.vocabularyData || !props.vocabularyData.vocabulary) return 0

  return Object.values(props.vocabularyData.vocabulary).filter(
    (word) => word.categoryId === categoryId,
  ).length
}

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return localCategories.value

  const filtered: CategoryCollection = {}
  for (const [id, category] of Object.entries(localCategories.value)) {
    if (category.name.toLowerCase().includes(query)) {
      filtered[id] = category
    }
  }
  return filtered
})

const filteredCategoriesCount = computed(
  () => Object.keys(filteredCategories.value).length,
)

const handleSelectCategory = (categoryId: string) => {
  emit('selectCategory', categoryId)
  emit('close')
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
  const currentCategory = localCategories.value[categoryId]
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
      props.userId,
    )

    emit('updateCategories')

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
      await categoryService.deleteCategory(categoryId, props.userId)

      emit('updateCategories')

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
</script>
