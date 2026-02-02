<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-75" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-900 dark:bg-primary-950 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-xl font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                <div class="flex items-center">
                  <Mic class="w-5 h-5 mr-2 text-secondary-500" />
                  Voice Practice
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="generatePhrase"
                    :disabled="isGenerating"
                    class="py-1.5 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center cursor-pointer"
                  >
                    <RefreshCw class="w-4 h-4 mr-1.5" />
                    Regenerate
                  </button>
                  <button
                    @click="closeModal"
                    class="text-primary-400 hover:text-primary-200 focus:outline-none p-1.5 rounded-md hover:bg-primary-800 transition-colors cursor-pointer"
                  >
                    <X class="w-5 h-5" />
                  </button>
                </div>
              </DialogTitle>

              <div class="mt-4">
                <p class="text-sm text-primary-300">
                  Practice pronunciation for:
                </p>
                <p class="text-lg font-bold text-secondary-400 mt-1">
                  {{ targetWord }}
                </p>
              </div>

              <div class="mt-4">
                <label class="block text-sm font-medium text-primary-50 mb-2">
                  Difficulty Level
                </label>
                <div class="flex gap-2">
                  <button
                    v-for="level in ['easy', 'medium', 'hard']"
                    :key="level"
                    @click="difficulty = level as 'easy' | 'medium' | 'hard'"
                    class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                    :class="[
                      difficulty === level
                        ? 'bg-secondary-600 text-white'
                        : 'bg-primary-800 text-primary-300 hover:bg-primary-700'
                    ]"
                  >
                    {{ level.charAt(0).toUpperCase() + level.slice(1) }}
                  </button>
                </div>
              </div>

              <div class="mt-4">
                <label class="block text-sm font-medium text-primary-50 mb-2">
                  Practice Phrases
                </label>
                <div
                  v-if="isGenerating"
                  class="bg-primary-800 rounded-lg p-4 text-center"
                >
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary-500 mx-auto"></div>
                  <p class="text-sm text-primary-400 mt-2">Generating phrases...</p>
                </div>
                <div
                  v-else-if="currentPhraseData?.senses && currentPhraseData.senses.length > 0"
                  class="space-y-2"
                >
                  <div
                    v-for="(sense, index) in currentPhraseData.senses"
                    :key="index"
                    @click="selectSense(sense)"
                    class="bg-primary-800 rounded-lg p-3 cursor-pointer transition-all border-2"
                    :class="[
                      selectedSense?.phrase === sense.phrase
                        ? 'border-secondary-500 bg-primary-750'
                        : 'border-transparent hover:bg-primary-750'
                    ]"
                  >
                    <div class="flex items-start justify-between">
                      <p class="text-primary-50 font-medium flex-1">
                        "{{ sense.phrase }}"
                      </p>
                      <span
                        class="text-xs px-2 py-0.5 rounded ml-2"
                        :class="[
                          sense.senseType === 'literal' ? 'bg-blue-900/50 text-blue-300' :
                          sense.senseType === 'idiomatic' ? 'bg-purple-900/50 text-purple-300' :
                          sense.senseType === 'slang' ? 'bg-red-900/50 text-red-300' :
                          sense.senseType === 'colloquial' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-gray-700 text-gray-300'
                        ]"
                      >
                        {{ sense.senseType || 'literal' }}
                      </span>
                    </div>
                    <p
                      v-if="sense.translation"
                      class="text-primary-400 text-sm mt-1"
                    >
                      {{ sense.translation }}
                    </p>
                    <p
                      v-if="sense.grammarFocus"
                      class="text-primary-500 text-xs mt-1"
                    >
                      {{ sense.grammarFocus }}
                    </p>
                  </div>
                  <p v-if="!selectedSense" class="text-primary-400 text-sm text-center py-2">
                    Click on a phrase to select it for practice
                  </p>
                </div>
                <p v-else class="text-primary-400 text-sm text-center py-4">
                  Click "Generate" to create practice phrases
                </p>
              </div>

              <div class="mt-6">
                <button
                  @click="toggleRecording"
                  :disabled="!currentPhrase || isEvaluating"
                  class="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                  :class="[
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-secondary-600 text-white hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  ]"
                >
                  <Mic
                    v-if="!isRecording"
                    class="w-5 h-5 mr-2"
                  />
                  <Square
                    v-else
                    class="w-5 h-5 mr-2"
                  />
                  {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
                </button>
              </div>

              <div
                v-if="isRecording"
                class="mt-4 flex items-center justify-center"
              >
                <div class="flex space-x-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-2 bg-red-500 rounded-full animate-pulse"
                    :style="{
                      height: `${10 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.1}s`
                    }"
                  ></div>
                </div>
                <span class="ml-3 text-sm text-red-400">Recording...</span>
              </div>

              <div
                v-if="isEvaluating"
                class="mt-4 bg-primary-800 rounded-lg p-4 text-center"
              >
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500 mx-auto"></div>
                <p class="text-sm text-primary-400 mt-2">Analyzing your pronunciation...</p>
              </div>

              <div
                v-if="result"
                class="mt-4 bg-primary-800 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-primary-50">Pronunciation Score</span>
                  <span
                    class="text-2xl font-bold"
                    :class="[
                      result.score >= 80 ? 'text-green-500' :
                      result.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    ]"
                  >
                    {{ result.score }}%
                  </span>
                </div>

                <div class="mb-3">
                  <p class="text-xs text-primary-400 mb-1">You said:</p>
                  <p class="text-primary-200 text-sm">"{{ result.transcription }}"</p>
                </div>

                <div
                  class="p-3 rounded-lg"
                  :class="[
                    result.isCorrect
                      ? 'bg-green-900/30 border border-green-700'
                      : 'bg-yellow-900/30 border border-yellow-700'
                  ]"
                >
                  <p class="text-xs text-primary-400 mb-1">
                    {{ result.isCorrect ? '✓ Great job!' : '💡 Feedback' }}
                  </p>
                  <p
                    class="text-sm"
                    :class="result.isCorrect ? 'text-green-200' : 'text-yellow-200'"
                  >
                    {{ result.feedback }}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                <button
                  @click="closeModal"
                  class="px-4 py-2 bg-primary-700 text-primary-50 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { Mic, RefreshCw, Square, X } from 'lucide-vue-next'
import { voicePracticeService } from '@/services/voicePracticeService'
import { useToast } from '@/composables/useToast'
import type { VoicePracticePhrase, VoicePracticePhraseSense, VoicePracticeResult } from '@/types'

const props = defineProps<{
  isOpen: boolean
  targetWord: string
}>()

const emit = defineEmits(['close'])

const { error: showErrorToast } = useToast()

const difficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const currentPhrase = ref('')
const currentPhraseData = ref<VoicePracticePhrase | null>(null)
const selectedSense = ref<VoicePracticePhraseSense | null>(null)
const isGenerating = ref(false)
const isRecording = ref(false)
const isEvaluating = ref(false)
const result = ref<VoicePracticeResult | null>(null)

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const closeModal = () => {
  stopRecording()
  emit('close')
}

const generatePhrase = async () => {
  if (!props.targetWord.trim()) return

  isGenerating.value = true
  result.value = null
  selectedSense.value = null
  currentPhrase.value = ''

  try {
    const data = await voicePracticeService.generatePhrase(
      props.targetWord,
      difficulty.value,
    )
    currentPhraseData.value = data
    if (data.senses && data.senses.length > 0) {
      selectedSense.value = data.senses[0]
      currentPhrase.value = data.senses[0].phrase
    }
  } catch {
    showErrorToast('Failed to generate phrase. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

const selectSense = (sense: VoicePracticePhraseSense) => {
  selectedSense.value = sense
  currentPhrase.value = sense.phrase
  result.value = null
}

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      await evaluatePronunciation(audioBlob)

      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch {
    showErrorToast('Unable to access microphone. Please check permissions.')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

const evaluatePronunciation = async (audioBlob: Blob) => {
  if (!currentPhrase.value) return

  isEvaluating.value = true

  try {
    const evaluationResult = await voicePracticeService.evaluateVoice(
      audioBlob,
      currentPhrase.value,
    )
    result.value = evaluationResult
  } catch (error) {
    console.error('Evaluation error:', error)
    showErrorToast('Failed to evaluate pronunciation. Please try again.')
  } finally {
    isEvaluating.value = false
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      result.value = null
      generatePhrase()
    }
  },
)

watch(difficulty, () => {
  if (props.isOpen && currentPhraseData.value?.senses?.length) {
    generatePhrase()
  }
})
</script>
