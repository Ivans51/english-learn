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
            <BaseInput
              id="category-search"
              v-model="searchQuery"
              type="text"
              placeholder="Search categories..."
            >
              <template #suffix>
                <span
                  class="text-xs font-medium text-primary-600 dark:text-primary-300 bg-white/80 dark:bg-gray-700/80 px-2.5 py-1 rounded-full backdrop-blur-sm"
                >
                  {{ filteredCategoriesCount }}/{{
                    Object.keys(localCategories).length
                  }}
                </span>
              </template>
            </BaseInput>
          </div>
        </div>

        <!-- Categories List -->
        <div class="flex-1 overflow-y-auto p-4">
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
          <div v-else class="space-y-2">
            <!-- Uncategorized Virtual Row -->
            <div
              v-if="uncategorizedCount > 0"
              :class="[
                'group relative flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out',
                selectedCategory === null
                  ? 'border-l-4 border-l-secondary-500 bg-transparent'
                  : 'bg-transparent border-primary-200 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-secondary-50/30 dark:hover:bg-secondary-900/20',
              ]"
              @click="handleSelectUncategorized"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <Inbox class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div class="flex flex-col gap-0.5">
                  <span
                    :class="[
                      'text-sm font-semibold truncate',
                      selectedCategory === null
                        ? 'text-secondary-600 dark:text-secondary-400'
                        : 'text-primary-800 dark:text-primary-200',
                    ]"
                  >
                    Uncategorized
                  </span>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit',
                      selectedCategory === null
                        ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                    ]"
                  >
                    {{ uncategorizedCount }}
                    {{ pluralize(uncategorizedCount, 'word', 'words') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Category Cards -->
            <div
              v-for="(category, id) in filteredCategories"
              :key="id"
              :class="[
                'group relative flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out',
                selectedCategory === id
                  ? 'border-l-4 border-l-secondary-500 bg-transparent'
                  : 'bg-transparent border-primary-200 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-secondary-50/30 dark:hover:bg-secondary-900/20',
              ]"
              @click="handleSelectCategory(String(id))"
            >
              <div class="flex items-center gap-3">
                <div class="flex flex-col gap-0.5">
                  <input
                    v-if="editingCategory === String(id)"
                    v-model="editingName"
                    type="text"
                    class="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border-2 border-secondary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500/20 text-primary-900 dark:text-primary-50 transition-all"
                    @keyup.enter="handleSaveEdit(String(id))"
                    @keyup.escape="cancelEdit"
                    @click.stop
                    ref="editInput"
                  />
                  <div v-else>
                    <span
                      :class="[
                        'text-sm font-semibold truncate',
                        selectedCategory === id
                          ? 'text-secondary-600 dark:text-secondary-400'
                          : 'text-primary-800 dark:text-primary-200',
                      ]"
                    >
                      {{ category.name }}
                    </span>
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ml-2',
                        selectedCategory === id
                          ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400'
                          : getWordCountForCategory(String(id)) === 0
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            : 'bg-primary-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400',
                      ]"
                    >
                      {{ getWordCountForCategory(String(id)) }}
                      {{
                        pluralize(
                          getWordCountForCategory(String(id)),
                          'word',
                          'words',
                        )
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Dropdown Menu -->
              <div class="relative dropdown-container" @click.stop>
                <button
                  v-if="editingCategory !== String(id)"
                  @click="
                    openDropdown =
                      openDropdown === String(id) ? null : String(id)
                  "
                  class="p-1.5 text-primary-400 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-300 hover:bg-primary-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  title="More actions"
                >
                  <MoreHorizontal class="w-4 h-4" />
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="openDropdown === String(id)"
                  class="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1"
                >
                  <button
                    @click="startEdit(String(id), category.name)"
                    class="w-full px-3 py-2 text-left text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit3 class="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    @click="handleMoveToUncategorized(String(id))"
                    class="w-full px-3 py-2 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2"
                  >
                    <Inbox class="w-4 h-4" />
                    Move to Uncategorized
                  </button>
                  <button
                    @click="handleDeleteCategory(String(id), category.name)"
                    class="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 class="w-4 h-4" />
                    Delete
                  </button>
                </div>

                <!-- Save/Cancel buttons when editing -->
                <div
                  v-if="editingCategory === String(id)"
                  class="flex items-center gap-1"
                >
                  <button
                    @click="handleSaveEdit(String(id))"
                    :disabled="
                      !editingName.trim() ||
                      editingName === category.name ||
                      isUpdating
                    "
                    class="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg border border-green-300 dark:border-green-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Save changes"
                  >
                    <span
                      v-if="isUpdating"
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"
                    ></span>
                    <Check v-else class="w-4 h-4" />
                  </button>
                  <button
                    @click="cancelEdit"
                    class="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow transition-all duration-200"
                    title="Cancel editing"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with Create Button -->
        <div
          class="p-4 border-t border-primary-200 dark:border-gray-800 bg-white dark:bg-black"
        >
          <div v-if="!isCreating">
            <button
              @click="startCreate"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-900/50 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 transition-all duration-200 font-medium"
            >
              <Plus class="w-5 h-5" />
              Add Category
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="Category name"
              class="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-secondary-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 text-primary-900 dark:text-primary-50 transition-all"
              @keyup.enter="handleCreateCategory"
              @keyup.escape="cancelCreate"
              ref="creatingInput"
            />
            <button
              @click="handleCreateCategory"
              :disabled="!newCategoryName.trim() || isUpdating"
              class="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-xl border border-green-300 dark:border-green-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Save"
            >
              <span
                v-if="isUpdating"
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"
              ></span>
              <Check v-else class="w-5 h-5" />
            </button>
            <button
              @click="cancelCreate"
              class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow transition-all duration-200"
              title="Cancel"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  Check,
  Edit3,
  Inbox,
  Library,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'
import { fireSwal } from '@/utils/swalUtils'
import { useToast } from '@/composables/useToast'
import { categoryService } from '@/services/categoryService'
import { vocabularyWordsService } from '@/services/vocabularyService'
import { BaseInput } from '@/components/ui'
import type { CategoryCollection, VocabularyData } from '@/types'

interface Props {
  isOpen: boolean
  categories: CategoryCollection
  vocabularyData: VocabularyData | null
  userId: string
  selectedCategory: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  selectCategory: [categoryId: string | null]
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
const isCreating = ref(false)
const newCategoryName = ref('')
const creatingInput = ref<HTMLInputElement>()
const openDropdown = ref<string | null>(null)

const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural

const uncategorizedCount = computed(() => {
  if (!props.vocabularyData?.vocabulary) return 0
  return Object.values(props.vocabularyData.vocabulary).filter(
    (word) => !word.categoryId,
  ).length
})

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

const closeDropdown = () => {
  openDropdown.value = null
}

const handleSelectCategory = (categoryId: string) => {
  emit('selectCategory', categoryId)
  emit('close')
}

const handleSelectUncategorized = () => {
  emit('selectCategory', null)
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

const startCreate = () => {
  isCreating.value = true
  newCategoryName.value = ''

  nextTick(() => {
    const inputElement = creatingInput.value
    if (inputElement && typeof inputElement.focus === 'function') {
      inputElement.focus()
    } else {
      setTimeout(() => {
        const fallbackElement = creatingInput.value
        if (fallbackElement && typeof fallbackElement.focus === 'function') {
          fallbackElement.focus()
        }
      }, 50)
    }
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newCategoryName.value = ''
}

const handleCreateCategory = async () => {
  const trimmedName = newCategoryName.value.trim()

  if (!trimmedName) {
    cancelCreate()
    return
  }

  isUpdating.value = true
  try {
    await categoryService.createCategory(trimmedName, props.userId)

    emit('updateCategories')

    showSuccessToast(`Category "${trimmedName}" created!`, 2000)
    cancelCreate()
  } catch (error) {
    console.error('Error creating category:', error)
    showErrorToast('Failed to create category. Please try again.')
  } finally {
    isUpdating.value = false
  }
}

const handleMoveToUncategorized = async (categoryId: string) => {
  const wordCount = getWordCountForCategory(categoryId)

  if (wordCount === 0) {
    showErrorToast('No words to move.')
    return
  }

  isLoading.value = true
  closeDropdown()
  try {
    const wordsToMove = Object.entries(props.vocabularyData?.vocabulary || {})
      .filter(([, word]) => word.categoryId === categoryId)
      .map(([uid]) => uid)

    for (const wordUid of wordsToMove) {
      await vocabularyWordsService.updateWord(
        wordUid,
        { categoryId: null, categoryName: 'Uncategorized' },
        props.userId,
      )
    }

    await categoryService.deleteCategory(categoryId, props.userId)

    emit('updateCategories')

    showSuccessToast(
      `${wordCount} ${pluralize(wordCount, 'word', 'words')} moved to Uncategorized!`,
      3000,
    )
  } catch (error) {
    console.error('Error moving to uncategorized:', error)
    showErrorToast('Failed to move words. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleDeleteCategory = async (
  categoryId: string,
  categoryName: string,
) => {
  const wordCount = getWordCountForCategory(categoryId)
  closeDropdown()

  if (wordCount > 0) {
    const result = await fireSwal({
      title: `Delete "${categoryName}"?`,
      html: `This category has ${wordCount} ${pluralize(wordCount, 'word', 'words')}. What would you like to do?`,
      icon: 'warning',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Delete all',
      confirmButtonColor: '#dc2626',
      denyButtonText: 'Move to Uncategorized',
      denyButtonColor: '#f59e0b',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      isLoading.value = true
      try {
        await categoryService.deleteCategory(categoryId, props.userId)

        emit('updateCategories')

        showSuccessToast(
          `Category "${categoryName}" deleted along with ${wordCount} ${pluralize(wordCount, 'word', 'words')}!`,
          3000,
        )
      } catch (error) {
        console.error('Error deleting category:', error)
        showErrorToast('Failed to delete category. Please try again.')
      } finally {
        isLoading.value = false
      }
    } else if (result.isDenied) {
      await handleMoveToUncategorized(categoryId)
    }
  } else {
    const result = await fireSwal({
      title: 'Are you sure?',
      text: `This will delete the category "${categoryName}". This action cannot be undone.`,
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

        showSuccessToast(`Category "${categoryName}" deleted!`, 2000)
      } catch (error) {
        console.error('Error deleting category:', error)
        showErrorToast('Failed to delete category. Please try again.')
      } finally {
        isLoading.value = false
      }
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-container')) {
    closeDropdown()
  }
}
</script>
