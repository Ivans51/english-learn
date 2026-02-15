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
      class="fixed inset-0 z-50 overflow-y-auto"
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
          <div class="modal-container modal-sm" @click.stop>
            <!-- Header -->
            <div class="modal-header">
              <h2 class="modal-title">
                {{ isEditing ? 'Edit Topic' : 'Add New Topic' }}
              </h2>
              <button @click="closeModal" class="modal-close-btn">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <p class="text-sm text-gray-600 dark:text-primary-300 mb-4">
                Topic to organize your learning content.
              </p>

              <form @submit.prevent="addOrUpdateTopic" class="space-y-4">
                <div>
                  <BaseInput
                    id="title"
                    v-model="formData.title"
                    placeholder="Enter topic title"
                    required
                    @input="forceLowercase"
                  />
                </div>

                <div class="flex justify-end gap-3">
                  <BaseButton variant="secondary" @click="closeModal">
                    Cancel
                  </BaseButton>
                  <BaseButton variant="primary" type="submit">
                    {{ isEditing ? 'Save Changes' : 'Add Topic' }}
                  </BaseButton>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseButton, BaseInput } from '@/components/ui'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'add-topic', 'update-topic'])

interface Topic {
  id: string
  title: string
  createdAt: string
}

const initialFormData = {
  title: '',
}

const props = defineProps<{
  isOpen: boolean
  currentTopic: Topic | null
}>()

const formData = ref({ ...initialFormData })

const isEditing = computed(() => !!props.currentTopic)

// Watch for changes in currentTopic prop to populate form for editing
watch(
  () => props.currentTopic,
  (newVal) => {
    if (newVal) {
      // Populate formData with existing topic data for editing
      formData.value.title = newVal.title
    } else {
      // Reset formData for adding a new topic
      Object.assign(formData.value, initialFormData)
    }
  },
  { immediate: true },
)

// Reset form when modal opens and currentTopic is null (add mode)
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue && !props.currentTopic) {
      Object.assign(formData.value, initialFormData)
    }
  },
)

function closeModal() {
  emit('close')
}

function forceLowercase(event: Event) {
  const target = event.target as HTMLInputElement
  target.value = target.value.toLowerCase()
  formData.value.title = target.value
}

function addOrUpdateTopic() {
  if (isEditing.value && props.currentTopic) {
    // Update existing topic
    const updatedTopic: Topic = {
      ...props.currentTopic,
      title: formData.value.title,
    }
    emit('update-topic', updatedTopic)
  } else {
    // Add new topic - emit just the title data for the service
    emit('add-topic', { title: formData.value.title })
  }
  closeModal()
}
</script>
