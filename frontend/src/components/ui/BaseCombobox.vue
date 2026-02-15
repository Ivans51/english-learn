<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'

interface Option {
  id: string
  name: string
}

interface Props {
  modelValue: string | null
  options: Option[]
  placeholder?: string
  allowClear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  allowClear: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'create-new': [name: string]
}>()

const query = ref('')

const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find((opt) => opt.id === props.modelValue) || null
})

const filteredOptions = computed(() => {
  const options = props.options.filter((opt) =>
    opt.name.toLowerCase().includes(query.value.toLowerCase()),
  )
  if (props.allowClear && query.value === '') {
    return [{ id: '__uncategorized__', name: 'Uncategorized' }, ...options]
  }
  return options
})

const showCreateOption = computed(() => {
  if (query.value === '') return false
  const normalizedQuery = query.value.toLowerCase().trim()
  return !props.options.some(
    (opt) => opt.name.toLowerCase() === normalizedQuery,
  )
})

const displayValue = (option: unknown): string => {
  const opt = option as Option | null
  return opt?.name || ''
}

function handleChange(option: Option | null) {
  if (!option) return
  if (option.id === '__uncategorized__') {
    query.value = ''
    emit('update:modelValue', null)
    return
  }
  query.value = ''
  emit('update:modelValue', option.id)
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  query.value = target.value
}

function handleEnterKey() {
  if (showCreateOption.value && query.value.trim()) {
    emit('create-new', query.value.trim())
  }
}

function handleCreateClick() {
  if (query.value.trim()) {
    emit('create-new', query.value.trim())
  }
}

watch(
  () => props.modelValue,
  () => {
    const selected = props.options.find((opt) => opt.id === props.modelValue)
    if (selected) {
      query.value = ''
    }
  },
)
</script>

<template>
  <Combobox :model-value="selectedOption" @update:model-value="handleChange">
    <div class="relative">
      <ComboboxInput
        :displayValue="displayValue"
        @change="handleInputChange"
        @keydown.enter="handleEnterKey"
        :placeholder="placeholder"
        class="w-full px-3 py-1.5 border border-primary-700 rounded-md text-base bg-primary-800 text-primary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
      />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
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
      </ComboboxButton>
      <ComboboxOptions
        v-if="filteredOptions.length > 0 || showCreateOption"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-primary-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="option in filteredOptions"
          :key="option.id"
          :value="option"
          v-slot="{ active, selected }"
        >
          <li
            :class="[
              'relative cursor-default select-none py-2 pl-10 pr-4',
              active ? 'bg-secondary-500 text-white' : 'text-primary-100',
            ]"
          >
            <span
              :class="[
                'block truncate',
                selected ? 'font-medium' : 'font-normal',
              ]"
            >
              {{ option.name }}
            </span>
            <span
              v-if="selected"
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-300"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </li>
        </ComboboxOption>
        <ComboboxOption
          v-if="showCreateOption"
          :value="{ id: '__create__', name: query }"
          v-slot="{ active }"
          @click="handleCreateClick"
        >
          <li
            :class="[
              'relative cursor-default select-none py-2 pl-10 pr-4',
              active ? 'bg-secondary-500 text-white' : 'text-secondary-300',
            ]"
          >
            + Create "{{ query }}"
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>
