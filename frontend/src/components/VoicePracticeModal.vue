<template>
  <Transition
    name="modal"
    appear
    appear-active-class="transition-opacity duration-300"
    appear-from-class="opacity-0"
    appear-to-class="opacity-100"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] overflow-y-auto"
      @click="closeModal"
    >
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="modal-backdrop"></div>

        <!-- Modal -->
        <Transition
          name="modal-content"
          appear
          appear-active-class="transition-all duration-300"
          appear-from-class="opacity-0 scale-95 translate-y-4"
          appear-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            class="modal-container modal-lg h-[90vh] flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="modal-header shrink-0">
              <div class="modal-header-title">
                <div class="modal-icon-box">
                  <Mic class="w-5 h-5" />
                </div>
                <h2 class="modal-title">Voice Practice</h2>
              </div>
              <div class="modal-header-actions">
                <!-- Level Selector -->
                <div
                  class="flex items-center gap-1 px-2 py-1 border border-gray-200 dark:border-primary-700 rounded-md bg-gray-100 dark:bg-primary-800"
                >
                  <label
                    v-for="l in ['easy', 'medium', 'hard']"
                    :key="l"
                    class="cursor-pointer"
                  >
                    <input
                      type="radio"
                      :value="l"
                      v-model="level"
                      @change="handleLevelChange"
                      class="sr-only peer"
                    />
                    <span
                      class="px-1.5 sm:px-2 py-1 text-xs rounded transition-colors peer-checked:bg-secondary-500 peer-checked:text-white text-gray-600 dark:text-primary-400 hover:text-gray-900 dark:hover:text-primary-200"
                    >
                      {{ l.charAt(0).toUpperCase() + l.slice(1) }}
                    </span>
                  </label>
                </div>
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="generatePhrase"
                  :disabled="isGenerating"
                >
                  <RefreshCw class="w-4 h-4 mr-1.5" />
                  <span class="hidden sm:inline">Regenerate</span>
                  <span class="sm:hidden">New</span>
                </BaseButton>
                <button @click="closeModal" class="modal-close-btn">
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="modal-body flex-1 overflow-y-auto">
              <p class="text-xs text-gray-600 dark:text-primary-300">
                Practice pronunciation for:
              </p>
              <p
                class="text-base font-bold text-secondary-600 dark:text-secondary-400 mt-1"
              >
                {{ targetWord }}
              </p>

              <div class="mt-4">
                <label
                  class="block text-xs font-medium text-gray-700 dark:text-primary-50 mb-2"
                >
                  Practice Phrases
                </label>
                <div
                  v-if="isGenerating"
                  class="bg-gray-100 dark:bg-primary-800 rounded-lg p-4 text-center"
                >
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary-500 mx-auto"
                  ></div>
                  <p class="text-xs text-gray-500 dark:text-primary-400 mt-2">
                    Generating phrases...
                  </p>
                </div>
                <div
                  v-else-if="
                    currentPhraseData?.senses &&
                    currentPhraseData.senses.length > 0
                  "
                  class="space-y-2"
                >
                  <div
                    v-for="(sense, index) in currentPhraseData.senses"
                    :key="index"
                    @click="selectSense(sense)"
                    class="bg-gray-100 dark:bg-primary-800 rounded-lg p-3 cursor-pointer transition-all border-2"
                    :class="[
                      selectedSense?.phrase === sense.phrase
                        ? 'border-secondary-500 bg-gray-200 dark:bg-primary-700'
                        : 'border-transparent hover:bg-gray-200 dark:hover:bg-primary-700',
                    ]"
                  >
                    <div class="flex items-start justify-between">
                      <p
                        class="text-gray-900 dark:text-primary-50 font-medium flex-1 pr-2"
                      >
                        "{{ sense.phrase }}"
                      </p>
                      <div class="flex items-center gap-2 shrink-0">
                        <span
                          class="text-xs px-2 py-0.5 rounded"
                          :class="[
                            sense.senseType === 'literal'
                              ? 'bg-blue-900/50 text-blue-300'
                              : sense.senseType === 'idiomatic'
                                ? 'bg-purple-900/50 text-purple-300'
                                : sense.senseType === 'slang'
                                  ? 'bg-red-900/50 text-red-300'
                                  : sense.senseType === 'colloquial'
                                    ? 'bg-yellow-900/50 text-yellow-300'
                                    : 'bg-gray-700 text-gray-300',
                          ]"
                        >
                          {{ sense.senseType || 'literal' }}
                        </span>
                        <button
                          @click.stop="speakText(sense.phrase)"
                          :disabled="isPlaying"
                          class="px-2 rounded-md hover:bg-gray-200 dark:hover:bg-primary-600 transition-colors text-gray-600 dark:text-primary-400 hover:text-gray-900 dark:hover:text-primary-200 disabled:opacity-50 cursor-pointer"
                          title="Listen to pronunciation"
                        >
                          <Volume2
                            class="w-6 h-6"
                            :class="{ 'animate-pulse': isPlaying }"
                          />
                        </button>
                      </div>
                    </div>
                    <p
                      v-if="sense.translation"
                      class="text-gray-600 dark:text-primary-400 text-sm mt-1"
                    >
                      {{ sense.translation }}
                    </p>
                    <p
                      v-if="sense.grammarFocus"
                      class="text-gray-500 dark:text-primary-500 text-xs mt-1"
                    >
                      {{ sense.grammarFocus }}
                    </p>
                  </div>
                  <p
                    v-if="!selectedSense"
                    class="text-gray-500 dark:text-primary-400 text-xs text-center py-2"
                  >
                    Click on a phrase to select it for practice
                  </p>
                </div>
                <p
                  v-else
                  class="text-gray-500 dark:text-primary-400 text-xs text-center py-4"
                >
                  Click "Generate" to create practice phrases
                </p>
              </div>
            </div>

            <!-- Footer with Recording Button -->
            <div
              class="modal-footer shrink-0 border-t border-gray-200 dark:border-primary-700 p-4 bg-white dark:bg-primary-900 space-y-3"
            >
              <button
                @click="toggleRecording"
                :disabled="!currentPhrase || isEvaluating"
                class="w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                :class="[
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-secondary-600 text-white hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed',
                ]"
              >
                <Mic v-if="!isRecording" class="w-5 h-5 mr-2" />
                <Square v-else class="w-5 h-5 mr-2" />
                {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
              </button>

              <div v-if="isRecording" class="flex items-center justify-center">
                <div class="flex space-x-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-2 bg-red-500 rounded-full animate-pulse"
                    :style="{
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: `${i * 0.1}s`,
                    }"
                  ></div>
                </div>
                <span class="ml-3 text-xs text-red-400">Recording...</span>
              </div>

              <div
                v-if="isEvaluating"
                class="bg-gray-100 dark:bg-primary-800 rounded-lg p-4 text-center"
              >
                <div
                  class="animate-spin rounded-full h-7 w-7 border-b-2 border-secondary-500 mx-auto"
                ></div>
                <p class="text-xs text-gray-500 dark:text-primary-400 mt-2">
                  Analyzing your pronunciation...
                </p>
              </div>

              <div
                v-if="result"
                class="bg-gray-100 dark:bg-primary-800 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-primary-50"
                  >
                    Pronunciation Score
                  </span>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xl font-bold"
                      :class="[
                        result.score >= 80
                          ? 'text-green-500'
                          : result.score >= 60
                            ? 'text-yellow-500'
                            : 'text-red-500',
                      ]"
                    >
                      {{ result.score }}%
                    </span>
                    <button
                      @click="result = null"
                      class="p-1 hover:bg-gray-200 dark:hover:bg-primary-700 rounded transition-colors text-gray-600 dark:text-primary-400 hover:text-gray-900 dark:hover:text-primary-200"
                      title="Clear result"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <p class="text-xs text-gray-600 dark:text-primary-400 mb-1">
                    You said:
                  </p>
                  <p class="text-gray-800 dark:text-primary-200 text-sm">
                    "{{ result.transcription }}"
                  </p>
                </div>

                <div
                  class="p-2.5 rounded-lg"
                  :class="[
                    result.isCorrect
                      ? 'bg-green-900/30 border border-green-700'
                      : 'bg-yellow-900/30 border border-yellow-700',
                  ]"
                >
                  <p class="text-xs text-gray-600 dark:text-primary-400 mb-1">
                    {{ result.isCorrect ? '✓ Great job!' : '💡 Feedback' }}
                  </p>
                  <p
                    class="text-sm"
                    :class="
                      result.isCorrect ? 'text-green-200' : 'text-yellow-200'
                    "
                  >
                    {{ result.feedback }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Mic, RefreshCw, Square, X, Volume2 } from 'lucide-vue-next'
import { voicePracticeService } from '@/services/voicePracticeService'
import { useToast } from '@/composables/useToast'
import { BaseButton } from '@/components/ui'
import type {
  VoicePracticePhrase,
  VoicePracticePhraseSense,
  VoicePracticeResult,
} from '@/types'

const props = defineProps<{
  isOpen: boolean
  targetWord: string
}>()

const emit = defineEmits(['close'])

const { error: showErrorToast } = useToast()

const currentPhrase = ref('')
const currentPhraseData = ref<VoicePracticePhrase | null>(null)
const selectedSense = ref<VoicePracticePhraseSense | null>(null)
const isGenerating = ref(false)
const isRecording = ref(false)
const isEvaluating = ref(false)
const isPlaying = ref(false)
const result = ref<VoicePracticeResult | null>(null)
const level = ref<'easy' | 'medium' | 'hard'>('medium')

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const closeModal = () => {
  stopRecording()
  emit('close')
}

const handleLevelChange = () => {
  generatePhrase()
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
      level.value,
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

const speakText = async (text: string) => {
  if (isPlaying.value) return

  isPlaying.value = true
  try {
    await voicePracticeService.speakText(text, 'en')
  } catch {
    showErrorToast('Failed to play audio')
  } finally {
    isPlaying.value = false
  }
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
</script>
