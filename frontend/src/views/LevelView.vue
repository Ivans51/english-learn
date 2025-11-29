<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <main-header
      :current-level="currentLevel"
      @level-click="handleLevelClick"
    />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Level Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <div class="flex items-center mb-4">
            <span
              :class="[
                'px-3 py-1 text-sm font-medium rounded-full mr-4',
                getLevelBadgeClass(currentLevel),
              ]"
            >
              {{ currentLevel }}
            </span>
            <h1
              class="text-3xl font-bold text-primary-900 dark:text-primary-50"
            >
              {{ getLevelTitle(currentLevel) }}
            </h1>
          </div>
          <p class="text-primary-700 dark:text-primary-200 text-lg">
            {{ getLevelDescription(currentLevel) }}
          </p>
        </div>
        <!-- Add New Topic Button -->
        <button
          @click="
            showAddTopicModal = true
            resetNewTopicForm()
          "
          class="inline-flex items-center px-4 py-2 bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900 text-sm font-medium rounded-md hover:bg-primary-800 dark:hover:bg-primary-200 transition-colors"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Add New Topic
        </button>
      </div>

      <!-- Topics Grid -->
      <div v-if="loadingTopics" class="text-center py-12">
        <p class="text-primary-500 dark:text-primary-400">Loading topics...</p>
      </div>
      <div
        v-else-if="currentTopics.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="topic in currentTopics"
          :key="topic.id"
          class="bg-white dark:bg-black rounded-lg dark:border-primary-800 pt-12 px-6 pb-6 hover:shadow-lg transition-all cursor-pointer relative group"
        >
          <!-- Edit Button (visible on hover) -->
          <button
            @click.stop="editTopic(topic)"
            class="absolute top-3 right-10 p-1 rounded-full bg-primary-100 dark:bg-primary-800 text-blue-500 transition-colors cursor-pointer"
            title="Edit topic"
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
          <!-- Delete Button (visible on hover) -->
          <button
            @click.stop="confirmDeleteTopic(topic)"
            class="absolute top-3 right-3 p-1 rounded-full bg-primary-100 dark:bg-primary-800 text-red-500 transition-colors cursor-pointer"
            title="Delete topic"
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

          <div @click="openTopic(topic)">
            <!-- Topic Header -->
            <div class="flex items-center justify-between mb-4">
              <h3
                class="text-lg font-semibold text-primary-900 dark:text-primary-50"
              >
                {{ topic.title }}
                <!-- Difficulty Badge -->
                <span
                  :class="[
                    'ml-3 px-2 py-1 text-xs font-medium rounded',
                    topic.difficulty === 'Easy'
                      ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
                      : topic.difficulty === 'Medium'
                        ? 'bg-accent-100 dark:bg-accent-800 text-accent-700 dark:text-accent-200'
                        : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200',
                  ]"
                >
                  {{ topic.difficulty }}
                </span>
              </h3>
            </div>

            <!-- Topic Description -->
            <p class="text-primary-700 dark:text-primary-300 text-sm mb-4">
              {{ topic.description }}
            </p>

            <!-- Topic Stats -->
            <div
              class="flex items-center justify-between text-sm text-primary-500 dark:text-primary-400 mb-4"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {{ topic.duration }} min
              </div>
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
                Practice Chat
              </div>
            </div>

            <!-- Topic Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in topic.tags"
                :key="tag"
                class="px-2 py-1 text-xs bg-black dark:bg-black text-white dark:text-white rounded"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div
          class="mx-auto h-24 w-24 text-primary-400 dark:text-primary-500 mb-4"
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
          class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-2"
        >
          No topics available yet
        </h3>
        <p class="text-primary-500 dark:text-primary-400 mb-6">
          We're working on adding more content for this level. Check back soon!
        </p>
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 text-sm font-medium rounded-md hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors"
        >
          Back to Home
        </router-link>
      </div>

      <!-- Add/Edit Topic Modal -->
      <div
        v-if="showAddTopicModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="fixed inset-0 bg-primary-950 bg-opacity-75 transition-opacity"
          @click="
            showAddTopicModal = false
            resetNewTopicForm()
          "
        ></div>
        <div
          class="bg-white dark:bg-primary-900 rounded-lg shadow-xl overflow-hidden transform transition-all sm:max-w-lg sm:w-full p-6 relative"
        >
          <h3
            class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-6"
          >
            {{ isEditing ? 'Edit Topic' : 'Add New Topic' }}
          </h3>
          <form @submit.prevent="saveTopic">
            <div class="space-y-4">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  v-model="newTopicForm.title"
                  class="mt-1 block w-full rounded-md border-primary-300 dark:border-primary-700 shadow-sm focus:border-primary-500 focus:ring-primary-400 dark:bg-primary-800 dark:text-primary-50 sm:text-sm p-2 placeholder-primary-400 dark:placeholder-primary-500"
                  required
                />
              </div>
              <div>
                <label
                  for="description"
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="newTopicForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-primary-300 dark:border-primary-700 shadow-sm focus:border-primary-500 focus:ring-primary-400 dark:bg-primary-800 dark:text-primary-50 sm:text-sm p-2 placeholder-primary-400 dark:placeholder-primary-500"
                  required
                ></textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    for="level"
                    class="block text-sm font-medium text-primary-700 dark:text-primary-300"
                  >
                    Level
                  </label>
                  <select
                    id="level"
                    v-model="newTopicForm.level"
                    class="mt-1 block w-full rounded-md border-primary-300 dark:border-primary-700 shadow-sm focus:border-primary-500 focus:ring-primary-400 dark:bg-primary-800 dark:text-primary-50 sm:text-sm p-2"
                    required
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper-Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficiency</option>
                  </select>
                </div>
                <div>
                  <label
                    for="difficulty"
                    class="block text-sm font-medium text-primary-700 dark:text-primary-300"
                  >
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    v-model="newTopicForm.difficulty"
                    class="mt-1 block w-full rounded-md border-primary-300 dark:border-primary-700 shadow-sm focus:border-primary-500 focus:ring-primary-400 dark:bg-primary-800 dark:text-primary-50 sm:text-sm p-2"
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  for="duration"
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300"
                >
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  v-model.number="newTopicForm.duration"
                  class="mt-1 block w-full rounded-md border-primary-300 dark:border-primary-700 shadow-sm focus:border-primary-500 focus:ring-primary-400 dark:bg-primary-800 dark:text-primary-50 sm:text-sm p-2 placeholder-primary-400 dark:placeholder-primary-500"
                  required
                  min="5"
                />
              </div>
              <div>
                <label
                  for="tags"
                  class="block text-sm font-medium text-primary-700 dark:text-primary-300"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  v-model="newTopicForm.tagsInput"
                  class="mt-1 block w-full rounded-md border-primary-300 dark:border-primary-700 shadow-sm focus:border-primary-500 focus:ring-primary-400 dark:bg-primary-800 dark:text-primary-50 sm:text-sm p-2 placeholder-primary-400 dark:placeholder-primary-500"
                  placeholder="e.g., basics, conversation, social"
                />
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="
                  showAddTopicModal = false
                  resetNewTopicForm()
                "
                class="px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 rounded-md border border-primary-300 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium rounded-md bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900 hover:bg-primary-800 dark:hover:bg-primary-200 transition-colors"
              >
                {{ isEditing ? 'Update Topic' : 'Add Topic' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <ToastNotification v-model="toasts" ref="toastComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import ToastNotification, {
  type Toast as ToastType,
} from '@/components/ToastNotification.vue'
import {
  type CreateTopicRequest,
  type Topic,
  topicService,
} from '@/services/topicService'
import SweetAlertService from '@/services/sweetAlertService.ts'

const route = useRoute()
const router = useRouter()

const currentLevel = ref((route.params.level as string) || 'A1')
const allTopics = ref<Topic[]>([])
const loadingTopics = ref(true)
const showAddTopicModal = ref(false)
const isEditing = ref(false)
const editingTopicId = ref<string | null>(null)

const toasts = ref<ToastType[]>([])
const toastComponent = ref<InstanceType<typeof ToastNotification>>()

const newTopicForm = ref<CreateTopicRequest & { tagsInput?: string }>({
  title: '',
  description: '',
  difficulty: 'Easy',
  duration: 15,
  tags: [],
  level: currentLevel.value,
  tagsInput: '',
})

const handleLevelClick = (level: string) => {
  currentLevel.value = level
  router.push({ name: 'level', params: { level } })
}

watch(currentLevel, (newLevel) => {
  newTopicForm.value.level = newLevel // Update level in form when currentLevel changes
  loadTopics()
})

watch(
  () => route.params.level,
  (newLevel) => {
    if (newLevel) {
      currentLevel.value = newLevel as string
    }
  },
)

// Load topics on component mount and when currentLevel changes
onMounted(() => {
  loadTopics()
})

const loadTopics = async () => {
  loadingTopics.value = true
  try {
    allTopics.value = await topicService.getAllTopics()
  } catch (error) {
    console.error('Failed to load topics:', error)
    toastComponent.value?.addToast({
      message: 'Failed to load topics. Please try again later.',
      type: 'error',
      duration: 5000,
    })
  } finally {
    loadingTopics.value = false
  }
}

const saveTopic = async () => {
  if (
    !newTopicForm.value.title.trim() ||
    !newTopicForm.value.description.trim()
  ) {
    toastComponent.value?.addToast({
      message: 'Title and Description are required.',
      type: 'error',
      duration: 3000,
    })
    return
  }

  // Parse tags from input string
  newTopicForm.value.tags = newTopicForm.value.tagsInput
    ? newTopicForm.value.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : []

  try {
    if (isEditing.value && editingTopicId.value) {
      // Update existing topic
      await topicService.updateTopic(editingTopicId.value, {
        id: editingTopicId.value, // Ensure ID is part of the update request
        title: newTopicForm.value.title,
        description: newTopicForm.value.description,
        difficulty: newTopicForm.value.difficulty,
        duration: newTopicForm.value.duration,
        tags: newTopicForm.value.tags,
        level: newTopicForm.value.level,
      })
      toastComponent.value?.addToast({
        message: 'Topic updated successfully!',
        type: 'success',
        duration: 3000,
      })
    } else {
      // Create new topic
      await topicService.createTopic(newTopicForm.value)
      toastComponent.value?.addToast({
        message: 'Topic created successfully!',
        type: 'success',
        duration: 3000,
      })
    }

    resetNewTopicForm()
    showAddTopicModal.value = false
    await loadTopics() // Reload topics after successful operation
  } catch (error) {
    console.error('Error saving topic:', error)
    toastComponent.value?.addToast({
      message: `Failed to ${isEditing.value ? 'update' : 'create'} topic. Please try again.`,
      type: 'error',
      duration: 5000,
    })
  }
}

const editTopic = (topic: Topic) => {
  isEditing.value = true
  editingTopicId.value = topic.id
  newTopicForm.value = {
    ...topic,
    tagsInput: (topic.tags ?? []).join(', '), // Convert array back to string for editing, safely handling undefined/null
  }
  showAddTopicModal.value = true
}

const confirmDeleteTopic = async (topic: Topic) => {
  const isConfirmed = await SweetAlertService.confirm(
    'Are you sure?',
    `You are about to delete the topic "${topic.title}". This action cannot be undone.`,
    'warning',
    'Yes, delete it!',
  )

  if (isConfirmed.isConfirmed) {
    try {
      await topicService.deleteTopic(topic.id)
      toastComponent.value?.addToast({
        message: 'Topic deleted successfully!',
        type: 'success',
        duration: 3000,
      })
      await loadTopics() // Reload topics after deletion
    } catch (error) {
      console.error('Error deleting topic:', error)
      toastComponent.value?.addToast({
        message: 'Failed to delete topic. Please try again.',
        type: 'error',
        duration: 5000,
      })
    }
  }
}

const resetNewTopicForm = () => {
  newTopicForm.value = {
    title: '',
    description: '',
    difficulty: 'Easy',
    duration: 15,
    tags: [],
    level: currentLevel.value, // Keep the current level as default
    tagsInput: '',
  }
  isEditing.value = false
  editingTopicId.value = null
}

const currentTopics = computed(() => {
  return allTopics.value.filter((topic) => topic.level === currentLevel.value)
})

const getLevelTitle = (level: string) => {
  const titles = {
    A1: 'Beginner Level',
    A2: 'Elementary Level',
    B1: 'Intermediate Level',
    B2: 'Upper-Intermediate Level',
    C1: 'Advanced Level',
    C2: 'Proficiency Level',
  }
  return titles[level as keyof typeof titles] || 'Unknown Level'
}

const getLevelDescription = (level: string) => {
  const descriptions = {
    A1: 'Learn basic English for everyday situations and simple conversations.',
    A2: 'Build upon basics with more complex conversations and everyday situations.',
    B1: 'Express opinions, discuss topics, and handle more complex situations.',
    B2: 'Discuss abstract topics and express ideas with greater fluency and precision.',
    C1: 'Master complex language structures and discuss sophisticated topics.',
    C2: 'Achieve native-like fluency with nuanced expressions and cultural understanding.',
  }
  return (
    descriptions[level as keyof typeof descriptions] ||
    'Unknown level description.'
  )
}

const getLevelBadgeClass = (level: string) => {
  const classes = {
    // Current level always uses primary colors
    A1: 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    A2: 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    B1: 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    B2: 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    C1: 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    C2: 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
  }
  // The badge class for the current level in the main content should always look "active"
  return (
    classes[level as keyof typeof classes] ||
    'bg-white dark:bg-white text-primary-950 dark:text-primary-950'
  )
}

const openTopic = (topic: Topic) => {
  // Navigate to the chat view for this topic
  router.push({ name: 'chat', params: { topicId: topic.id } })
}
</script>
