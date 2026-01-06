import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireSwal, defaultConfirmButtonClass, defaultCancelButtonClass } from './swalUtils'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  },
  SweetAlertOptions: Object
}))

describe('swalUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fireSwal', () => {
    it('calls Swal.fire with merged options', async () => {
      const Swal = await import('sweetalert2')
      const mockSwal = vi.mocked(Swal.default)
      mockSwal.fire.mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false })

      await fireSwal({ title: 'Test' })

      expect(mockSwal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          customClass: expect.objectContaining({
            popup: 'bg-primary-900 border border-primary-700 text-primary-50',
            title: 'text-primary-50',
            htmlContainer: 'text-primary-300',
            confirmButton: defaultConfirmButtonClass,
            cancelButton: defaultCancelButtonClass
          }),
          buttonsStyling: false
        })
      )
    })

    it('allows overriding custom classes', async () => {
      const Swal = await import('sweetalert2')
      const mockSwal = vi.mocked(Swal.default)
      mockSwal.fire.mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false })

      await fireSwal({
        title: 'Test',
        customClass: {
          confirmButton: 'custom-button-class'
        }
      })

      expect(mockSwal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          customClass: expect.objectContaining({
            confirmButton: 'custom-button-class'
          })
        })
      )
    })
  })

  describe('defaultConfirmButtonClass', () => {
    it('contains expected Tailwind classes for dark theme', () => {
      expect(defaultConfirmButtonClass).toContain('bg-red-600')
      expect(defaultConfirmButtonClass).toContain('text-white')
      expect(defaultConfirmButtonClass).toContain('hover:bg-red-700')
    })
  })

  describe('defaultCancelButtonClass', () => {
    it('contains expected Tailwind classes for dark theme', () => {
      expect(defaultCancelButtonClass).toContain('bg-gray-600')
      expect(defaultCancelButtonClass).toContain('text-white')
      expect(defaultCancelButtonClass).toContain('hover:bg-gray-700')
    })
  })
})
