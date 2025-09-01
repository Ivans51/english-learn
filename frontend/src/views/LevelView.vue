<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <main-header :current-level="currentLevel" @level-click="handleLevelClick" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Level Header -->
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <span :class="[
            'px-3 py-1 text-sm font-medium rounded-full mr-4',
            getLevelBadgeClass(currentLevel)
          ]">
            {{ currentLevel }}
          </span>
          <h1 class="text-3xl font-bold text-primary-900 dark:text-primary-50">{{ getLevelTitle(currentLevel) }}</h1>
        </div>
        <p class="text-primary-700 dark:text-primary-200 text-lg">{{ getLevelDescription(currentLevel) }}</p>
      </div>

      <!-- Topics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="topic in currentTopics"
          :key="topic.id"
          class="bg-white dark:bg-primary-950 rounded-lg border border-white dark:border-primary-800 p-6 hover:shadow-lg transition-all cursor-pointer"
          @click="openTopic(topic)"
        >
          <!-- Topic Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-50">{{ topic.title }}</h3>
            <span :class="[
              'px-2 py-1 text-xs font-medium rounded',
              topic.difficulty === 'Easy' ? 'bg-white dark:bg-white text-success-700 dark:text-success-200' :
              topic.difficulty === 'Medium' ? 'bg-white dark:bg-white text-warning-700 dark:text-warning-200' :
              'bg-white dark:bg-white text-error-700 dark:text-error-200'
            ]">
              {{ topic.difficulty }}
            </span>
          </div>

          <!-- Topic Description -->
          <p class="text-primary-700 dark:text-primary-300 text-sm mb-4">{{ topic.description }}</p>

          <!-- Topic Stats -->
          <div class="flex items-center justify-between text-sm text-primary-500 dark:text-primary-400 mb-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ topic.duration }} min
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
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

      <!-- Empty State -->
      <div v-if="currentTopics.length === 0" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-primary-400 dark:text-primary-500 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-primary-900 dark:text-primary-50 mb-2">No topics available yet</h3>
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'

const route = useRoute()
const router = useRouter()

interface Topic {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  duration: number
  tags: string[]
  level: string
}

const currentLevel = ref(route.params.level as string || 'A1')

const handleLevelClick = (level: string) => {
  currentLevel.value = level
  router.push({ name: 'level', params: { level } })
}

watch(() => route.params.level, (newLevel) => {
  if (newLevel) {
    currentLevel.value = newLevel as string
  }
})

// Mock topics data
const allTopics = ref<Topic[]>([
  {
    id: '1',
    title: 'Greetings and Introductions',
    description: 'Learn how to greet people and introduce yourself in various situations.',
    difficulty: 'Easy',
    duration: 15,
    tags: ['basics', 'conversation', 'social'],
    level: 'A1'
  },
  {
    id: '2',
    title: 'Numbers and Time',
    description: 'Master basic numbers, telling time, and talking about dates.',
    difficulty: 'Easy',
    duration: 20,
    tags: ['numbers', 'time', 'daily life'],
    level: 'A1'
  },
  {
    id: '3',
    title: 'Family and Relationships',
    description: 'Vocabulary and expressions for talking about family members and relationships.',
    difficulty: 'Easy',
    duration: 18,
    tags: ['family', 'relationships', 'personal'],
    level: 'A1'
  },
  {
    id: '4',
    title: 'Past Tense Stories',
    description: 'Learn to tell stories and talk about past events using past tense.',
    difficulty: 'Medium',
    duration: 25,
    tags: ['grammar', 'past tense', 'storytelling'],
    level: 'A2'
  },
  {
    id: '5',
    title: 'Future Plans',
    description: 'Express future plans, intentions, and predictions.',
    difficulty: 'Medium',
    duration: 22,
    tags: ['future', 'plans', 'predictions'],
    level: 'A2'
  },
  {
    id: '6',
    title: 'Expressing Opinions',
    description: 'Learn to express and discuss opinions on various topics.',
    difficulty: 'Medium',
    duration: 30,
    tags: ['opinions', 'discussion', 'debate'],
    level: 'B1'
  },
  {
    id: '7',
    title: 'Business Communication',
    description: 'Professional communication skills for workplace situations.',
    difficulty: 'Hard',
    duration: 35,
    tags: ['business', 'professional', 'workplace'],
    level: 'B2'
  },
  {
    id: '8',
    title: 'Academic Writing',
    description: 'Advanced writing techniques for academic and formal contexts.',
    difficulty: 'Hard',
    duration: 40,
    tags: ['writing', 'academic', 'formal'],
    level: 'C1'
  },
  {
    id: '9',
    title: 'Cultural Nuances',
    description: 'Understanding cultural context and subtle language differences.',
    difficulty: 'Hard',
    duration: 45,
    tags: ['culture', 'nuances', 'advanced'],
    level: 'C2'
  }
])

const currentTopics = computed(() => {
  return allTopics.value.filter(topic => topic.level === currentLevel.value)
})

const getLevelTitle = (level: string) => {
  const titles = {
    'A1': 'Beginner Level',
    'A2': 'Elementary Level',
    'B1': 'Intermediate Level',
    'B2': 'Upper-Intermediate Level',
    'C1': 'Advanced Level',
    'C2': 'Proficiency Level'
  }
  return titles[level as keyof typeof titles] || 'Unknown Level'
}

const getLevelDescription = (level: string) => {
  const descriptions = {
    'A1': 'Learn basic English for everyday situations and simple conversations.',
    'A2': 'Build upon basics with more complex conversations and everyday situations.',
    'B1': 'Express opinions, discuss topics, and handle more complex situations.',
    'B2': 'Discuss abstract topics and express ideas with greater fluency and precision.',
    'C1': 'Master complex language structures and discuss sophisticated topics.',
    'C2': 'Achieve native-like fluency with nuanced expressions and cultural understanding.'
  }
  return descriptions[level as keyof typeof descriptions] || 'Unknown level description.'
}

const getLevelBadgeClass = (level: string) => {
  const classes = {
    // Current level always uses primary colors
    'A1': 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    'A2': 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    'B1': 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    'B2': 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    'C1': 'bg-white dark:bg-white text-primary-950 dark:text-primary-950',
    'C2': 'bg-white dark:bg-white text-primary-950 dark:text-primary-950'
  }
  // The badge class for the current level in the main content should always look "active"
  return classes[level as keyof typeof classes] || 'bg-white dark:bg-white text-primary-950 dark:text-primary-950'
}

const openTopic = (topic: Topic) => {
  // For now, just log the topic - later we can navigate to a topic detail page
  console.log('Opening topic:', topic)
  // router.push(`/topic/${topic.id}`)
}
</script>
