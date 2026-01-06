import { describe, it, expect, vi, beforeEach } from 'vitest'
import { categoryService } from './categoryService'

globalThis.fetch = vi.fn()

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_API_URL', 'http://localhost:8787')
  })

  describe('createCategory', () => {
    it('creates a new category successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'cat_123', name: 'Test Category' })
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await categoryService.createCategory('Test Category', 'user123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/categories',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Test Category', userId: 'user123' })
        })
      )
      expect(result).toEqual({ id: 'cat_123', name: 'Test Category' })
    })

    it('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request'
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Failed to create category: Bad Request')
    })

    it('uses default API URL when VITE_API_URL is not set', async () => {
      vi.unstubAllEnvs()
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'cat_123', name: 'Test' })
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      await categoryService.createCategory('Test')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/categories',
        expect.any(Object)
      )
    })
  })

  describe('updateCategory', () => {
    it('updates category with userId in query params', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'cat_123', name: 'Updated' })
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await categoryService.updateCategory(
        'cat_123',
        { name: 'Updated' },
        'user123'
      )

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/categories/cat_123?userId=user123',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('updates category without userId', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'cat_123', name: 'Updated' })
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      await categoryService.updateCategory('cat_123', { name: 'Updated' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/categories/cat_123',
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  describe('deleteCategory', () => {
    it('deletes category successfully', async () => {
      const mockResponse = { ok: true }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      await categoryService.deleteCategory('cat_123', 'user123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/categories/cat_123?userId=user123',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('deletes category without userId', async () => {
      const mockResponse = { ok: true }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      await categoryService.deleteCategory('cat_123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/categories/cat_123',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Not Found'
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

      await expect(
        categoryService.deleteCategory('cat_123')
      ).rejects.toThrow('Failed to delete category: Not Found')
    })
  })
})
