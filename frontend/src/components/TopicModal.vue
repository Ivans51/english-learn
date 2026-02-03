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
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-900 dark:bg-primary-950 p-6 text-left align-middle shadow-xl transition-all border border-primary-700"
            >
              <DialogTitle
                as="h3"
                class="text-2xl font-semibold leading-6 text-primary-50 flex justify-between items-center"
              >
                {{ isEditing ? 'Edit Topic' : 'Add New Topic' }}
                <button
                  @click="closeModal"
                  class="text-primary-400 hover:text-primary-200 focus:outline-none"
                >
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-primary-300">
                  Topic to organize your learning content.
                </p>
              </div>

              <form @submit.prevent="addOrUpdateTopic" class="mt-6 space-y-4">
                <div>
                  <BaseInput
                    id="title"
                    v-model="formData.title"
                    placeholder="Enter topic title"
                    required
                    @input="forceLowercase"
                  />
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <BaseButton variant="secondary" @click="closeModal">
                    Cancel
                  </BaseButton>
                  <BaseButton variant="primary" type="submit">
                    {{ isEditing ? 'Save Changes' : 'Add Topic' }}
                  </BaseButton>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { BaseButton, BaseInput } from '@/components/ui'

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
