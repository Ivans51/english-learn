<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: Component
  iconPosition?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  iconPosition: 'start',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() => {
  const base =
    'inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants = {
    primary:
      'bg-primary-50 text-primary-950 hover:bg-primary-100 focus-visible:ring-primary-500',
    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-500',
    accent:
      'bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500',
    ghost:
      'text-primary-700 dark:text-primary-50 hover:bg-primary-200 dark:hover:bg-primary-800 focus-visible:ring-primary-500',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600',
  }

  return `${base} ${sizes[props.size]} ${variants[props.variant]}`
})
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <component
      :is="icon"
      v-if="icon && iconPosition === 'start'"
      class="w-4 h-4"
    />
    <slot />
    <component
      :is="icon"
      v-if="icon && iconPosition === 'end'"
      class="w-4 h-4"
    />
  </button>
</template>
