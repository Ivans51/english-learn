<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  id?: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  required?: boolean
  autocomplete?: string
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const inputRef = ref<HTMLInputElement>()

defineExpose({
  focus: () => inputRef.value?.focus() || textareaRef.value?.focus(),
})
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
      <textarea
        v-if="type === 'textarea'"
        ref="textareaRef"
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :class="[
          'input-field resize-none',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
          $slots.suffix ? '!pr-10' : '',
        ]"
        @input="
          emit(
            'update:modelValue',
            ($event.target as HTMLTextAreaElement).value,
          )
        "
      />
      <input
        v-else
        ref="inputRef"
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :class="[
          'input-field',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
          $slots.suffix ? '!pr-10' : '',
        ]"
        @input="
          emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <div
        v-if="$slots.suffix"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
