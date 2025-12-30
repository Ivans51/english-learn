<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import TopicModal from '@/components/TopicModal.vue'
import { topicService } from '@/services/topicService'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { fireSwal } from '../utils/swalUtils'
import type { Topic } from '@/types'

const { user: firebaseUser, loading: authLoading } = useAuth()
const { success: showSuccessToast, error: showErrorToast } = useToast()
const userId = ref('anonymous')

const topics = ref<Topic[]>([])
const isLoading = ref(false)

const showAddTopicModal = ref(false)
const topicToEdit = ref<Topic | null>(null)

// Modal functions
const openAddTopicModal = () => {
  topicToEdit.value = null
  showAddTopicModal.value = true
}

const openEditTopicModal = (topic: Topic) => {
  topicToEdit.value = { ...topic }
  showAddTopicModal.value = true
}

const closeTopicModal = () => {
  showAddTopicModal.value = false
  topicToEdit.value = null
}

const loadTopicsFromFirebase = async () => {
  try {
    isLoading.value = true
    const topicsData = await topicService.getTopics(userId.value)
    topics.value = topicsData
  } catch (error) {
    console.error('Error loading topics from Firebase:', error)
    topics.value = []
    showErrorToast('Failed to load topics. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const addNewTopic = async (topicData: { title: string }) => {
  try {
    const newTopic = await topicService.createTopic({
      title: topicData.title,
      userId: userId.value,
    })

    // Add to local topics array
    topics.value.push(newTopic)

    showSuccessToast('Topic created successfully!', 2000)
  } catch (error) {
    console.error('Error creating topic:', error)
    showErrorToast('Failed to create topic. Please try again.')
  }
}

const updateTopic = async (updatedTopic: Topic) => {
  try {
    const updated = await topicService.updateTopic(
      updatedTopic.id,
      { title: updatedTopic.title },
      userId.value
    )

    // Update local topics array
    const index = topics.value.findIndex(t => t.id === updatedTopic.id)
    if (index !== -1) {
      topics.value[index] = updated
    }

    showSuccessToast('Topic updated successfully!', 2000)
  } catch (error) {
    console.error('Error updating topic:', error)
    showErrorToast('Failed to update topic. Please try again.')
  }
}

const deleteTopic = async (topicId: string) => {
  const result = await fireSwal({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      await topicService.deleteTopic(topicId, userId.value)

      // Remove from local topics array
      const index = topics.value.findIndex(t => t.id === topicId)
      if (index !== -1) {
        topics.value.splice(index, 1)
      }

      showSuccessToast('Topic has been deleted!', 2000)
    } catch (error) {
      console.error('Error deleting topic:', error)
      showErrorToast('Failed to delete topic. Please try again.')
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load topics when user changes
watch(
  firebaseUser,
  async (newUser) => {
    if (newUser) {
      userId.value = newUser.uid
    } else {
      userId.value = 'anonymous'
    }
    // Reload topics when user changes
    if (!authLoading.value) {
      await loadTopicsFromFirebase()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  // Wait for auth to resolve before loading topics
  if (!authLoading.value) {
    await loadTopicsFromFirebase()
  }
})

// Watch for auth loading to complete
watch(authLoading, async (loading) => {
  if (!loading) {
    await loadTopicsFromFirebase()
  }
})
</script>

<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <MainHeader />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Header Section -->
      <div class="w-full mb-6 pb-6 border-b border-gray-600">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            <h1
              class="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-50"
            >
              Learning by Topics
            </h1>
          </div>
          <p
            class="text-sm sm:text-base text-primary-600 dark:text-primary-400"
          >
            Organize your English learning by topics and categories
          </p>
        </div>
      </div>

      <!-- Topics List Section -->
      <div>
        <div class="mb-4 sm:mb-6 flex justify-between">
          <div class="text-base sm:text-lg font-medium text-primary-900 dark:text-primary-50 mb-1">
            <div>{{ topics.length }} topics</div>
            <div class="text-sm text-primary-600 dark:text-primary-400">
              Manage your learning topics
            </div>
          </div>
          <div class="sm:w-40">
            <button
              @click="openAddTopicModal"
              class="w-full bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 py-2 px-3 sm:py-2 sm:px-4 rounded-md text-sm font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors flex items-center justify-center cursor-pointer"
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
              <span class="text-xs sm:text-sm">Add New Topic</span>
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
            Loading topics...
          </span>
        </div>

        <!-- Topics List -->
        <div v-else>
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="bg-white dark:bg-black rounded-lg p-4 hover:shadow-md transition-all border mb-3"
          >
            <div class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex sm:items-center gap-2">
                  <h3
                    class="text-lg sm:text-xl font-semibold text-primary-900 dark:text-primary-50 break-words"
                  >
                    {{ topic.title }}
                  </h3>
                </div>
                <div class="mt-2">
                  <p class="text-sm text-primary-600 dark:text-primary-400">
                    Created: {{ formatDate(topic.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 sm:gap-2">
                <button
                  @click="openEditTopicModal(topic)"
                  class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-blue-600 dark:hover:text-blue-400 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
                <button
                  @click="deleteTopic(topic.id)"
                  class="h-8 w-8 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-red-600 dark:hover:text-red-400 rounded border border-white dark:border-primary-800 cursor-pointer flex-shrink-0"
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
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="topics.length === 0 && !isLoading"
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>
            <h3
              class="text-base sm:text-lg font-medium text-primary-900 dark:text-primary-50 mb-2"
            >
              No topics created yet
            </h3>
            <p
              class="text-sm sm:text-base text-primary-500 dark:text-primary-400 mb-6 max-w-sm mx-auto"
            >
              Start organizing your learning by creating your first topic.
            </p>
            <button
              @click="openAddTopicModal"
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
              Create Your First Topic
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Topic Modal -->
    <TopicModal
      :is-open="showAddTopicModal"
      :current-topic="topicToEdit"
      @close="closeTopicModal"
      @add-topic="addNewTopic"
      @update-topic="updateTopic"
    />
  </div>
</template>
