import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast, type ToastMessage } from './useToast'

describe('useToast', () => {
  let toasts: ToastMessage[] = []

  beforeEach(() => {
    toasts = []
  })

  describe('addToast', () => {
    it('generates unique id', () => {
      const id1 = addToast('First', 'success', toasts)
      const id2 = addToast('Second', 'error', toasts)

      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(10)
    })

    it('adds toast to array', () => {
      const id = addToast('Test', 'success', toasts)

      expect(toasts.length).toBe(1)
      expect(toasts[0].id).toBe(id)
      expect(toasts[0].message).toBe('Test')
      expect(toasts[0].type).toBe('success')
    })

    it('adds toast with custom duration', () => {
      const id = addToast('Test', 'info', toasts, 1000)

      expect(toasts[0].duration).toBe(1000)
    })

    it('uses default duration of 5000', () => {
      const id = addToast('Test', 'info', toasts)

      expect(toasts[0].duration).toBe(5000)
    })
  })

  describe('removeToast', () => {
    it('removes toast by id', () => {
      const id = addToast('Test', 'success', toasts)
      expect(toasts.length).toBe(1)

      removeToast(id, toasts)
      expect(toasts.length).toBe(0)
    })

    it('does nothing if toast not found', () => {
      addToast('Test', 'success', toasts)
      const initial = toasts.length

      removeToast('not-found', toasts)
      expect(toasts.length).toBe(initial)
    })
  })

  describe('clearAll', () => {
    it('removes all toasts', () => {
      addToast('First', 'success', toasts)
      addToast('Second', 'error', toasts)
      addToast('Third', 'warning', toasts)

      expect(toasts.length).toBe(3)

      clearAll(toasts)
      expect(toasts.length).toBe(0)
    })
  })

  describe('convenience methods', () => {
    it('success creates success toast', () => {
      const id = success('Success', toasts)

      expect(toasts[0].type).toBe('success')
      expect(toasts[0].message).toBe('Success')
    })

    it('error creates error toast', () => {
      const id = error('Error', toasts)

      expect(toasts[0].type).toBe('error')
      expect(toasts[0].message).toBe('Error')
    })

    it('warning creates warning toast', () => {
      const id = warning('Warning', toasts)

      expect(toasts[0].type).toBe('warning')
      expect(toasts[0].message).toBe('Warning')
    })

    it('info creates info toast', () => {
      const id = info('Info', toasts)

      expect(toasts[0].type).toBe('info')
      expect(toasts[0].message).toBe('Info')
    })
  })

  describe('toast structure', () => {
    it('toast has required fields', () => {
      const id = addToast('Test', 'success', toasts)

      const toast = toasts[0]
      expect(toast.id).toBeDefined()
      expect(typeof toast.id).toBe('string')
      expect(toast.message).toBe('Test')
      expect(toast.type).toBe('success')
      expect(toast.duration).toBe(5000)
    })

    it('id format is timestamp + random', () => {
      const id = addToast('Test', 'success', toasts)

      expect(id).toMatch(/^\d+/)
    })
  })
})

function addToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
  toasts: ToastMessage[],
  duration?: number
): string {
  const newToast: ToastMessage = {
    message,
    type,
    duration: duration ?? 5000,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }
  toasts.push(newToast)
  return newToast.id
}

function removeToast(id: string, toasts: ToastMessage[]): void {
  const index = toasts.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
  }
}

function clearAll(toasts: ToastMessage[]): void {
  toasts.length = 0
}

function success(message: string, toasts: ToastMessage[]): string {
  return addToast(message, 'success', toasts)
}

function error(message: string, toasts: ToastMessage[]): string {
  return addToast(message, 'error', toasts)
}

function warning(message: string, toasts: ToastMessage[]): string {
  return addToast(message, 'warning', toasts)
}

function info(message: string, toasts: ToastMessage[]): string {
  return addToast(message, 'info', toasts)
}
