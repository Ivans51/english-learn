import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setGlobalEnv, callMistralAPI } from '../utils'
import type { Env } from '../types'

describe('Mistral API Integration', () => {
  const mockEnv: Env = {
    GEMINI_API_KEY: 'test-gemini-key',
    MISTRAL_API_KEY: 'test-mistral-key',
    OPENROUTER_API_KEY: 'test-openrouter-key',
    FIREBASE_PROJECT_ID: 'test-project-id',
    FIREBASE_DATABASE_URL: 'test-database-url',
    FIREBASE_SERVICE_ACCOUNT_KEY: 'test-service-account-key'
  }

  beforeEach(() => {
    // Reset global env before each test
    setGlobalEnv(mockEnv)
  })

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks()
  })

  describe('setGlobalEnv', () => {
    it('should set global environment variables', () => {
      const customEnv: Env = {
        ...mockEnv,
        MISTRAL_API_KEY: 'custom-mistral-key'
      }
      
      setGlobalEnv(customEnv)
      // The function should not throw when env is set
      expect(() => callMistralAPI('test prompt')).not.toThrow()
    })

    it('should be callable multiple times', () => {
      setGlobalEnv(mockEnv)
      setGlobalEnv(mockEnv)
      expect(() => callMistralAPI('test')).not.toThrow()
    })
  })

  describe('callMistralAPI', () => {
    it('should call Mistral API with prompt without requiring explicit API key', async () => {
      // Mock the fetch call to simulate API response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked Mistral response' } }]
        })
      }
      
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
      
      const result = await callMistralAPI('Test prompt for Mistral')
      
      expect(result).toBe('Mocked Mistral response')
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://codestral.mistral.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockEnv.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should return null when global env is not initialized', async () => {
      // Reset global env
      setGlobalEnv(null as unknown as Env)
      
      const result = await callMistralAPI('test prompt')
      expect(result).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }
      
      globalThis.fetch = vi.fn().mockResolvedValue(mockErrorResponse)
      
      const result = await callMistralAPI('test prompt')
      expect(result).toBeNull()
    })

    it('should handle network errors', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      const result = await callMistralAPI('test prompt')
      expect(result).toBeNull()
    })

    it('should use the correct model (codestral-latest)', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'response' } }]
        })
      }
      
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
      
      await callMistralAPI('test')
      
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"model":"codestral-latest"')
        })
      )
    })
  })

  describe('Integration with handlers', () => {
    it('should work with explanation prompt generation', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '**Meaning:**\n• First meaning' } }]
        })
      }
      
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
      
      const { generateExplanationPrompt } = await import('../utils')
      const prompt = generateExplanationPrompt('hello')
      
      const result = await callMistralAPI(prompt)
      expect(result).toBe('**Meaning:**\n• First meaning')
      
      // Verify prompt contains expected content
      expect(prompt).toContain('hello')
      expect(prompt).toContain('comprehensive explanation')
    })

    it('should work with category suggestion prompt', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Technology' } }]
        })
      }
      
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
      
      const { generateCategorySuggestionPrompt } = await import('../utils')
      const prompt = generateCategorySuggestionPrompt('computer')
      
      const result = await callMistralAPI(prompt)
      expect(result).toBe('Technology')
    })
  })
})
