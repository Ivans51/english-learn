<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string | null
  id?: string
  label?: string
  options: Option[]
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const selectClasses = computed(() => [
  'input-field',
  'appearance-none',
  'cursor-pointer',
])

function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value || null)
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-primary-300 dark:text-primary-300 mb-1"
    >
      {{ label }}
    </label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue ?? ''"
        :required="required"
        :disabled="disabled"
        :class="selectClasses"
        @change="handleChange"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3"
      >
        <svg
          class="h-5 w-5 text-primary-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
