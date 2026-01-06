import { describe, it, expect } from 'vitest'
import {
  ErrorResponses,
  SuccessResponses,
  validateRequiredFields,
  createErrorResponse,
  createSuccessResponse
} from '../errors'

const mockCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

async function getResponseBody(response: Response): Promise<string> {
  return await response.text()
}

describe('errors', () => {
  describe('createErrorResponse', () => {
    it('creates error response with correct status', async () => {
      const response = createErrorResponse('Error message', 400, mockCorsHeaders)
      expect(response.status).toBe(400)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toBe('Error message')
    })

    it('includes CORS headers', () => {
      const response = createErrorResponse('Error', 500, mockCorsHeaders)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('sets content-type to application/json', () => {
      const response = createErrorResponse('Error', 400, mockCorsHeaders)
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })

  describe('createSuccessResponse', () => {
    it('creates success response with correct status', async () => {
      const response = createSuccessResponse({ data: 'test' }, 200, mockCorsHeaders)
      expect(response.status).toBe(200)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.data).toBe('test')
    })

    it('handles 201 created status', () => {
      const response = createSuccessResponse({ id: '123' }, 201, mockCorsHeaders)
      expect(response.status).toBe(201)
    })

    it('includes CORS headers', () => {
      const response = createSuccessResponse({ success: true }, 200, mockCorsHeaders)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('ErrorResponses', () => {
    it('returns 400 for badRequest', async () => {
      const response = ErrorResponses.badRequest('Invalid input', mockCorsHeaders)
      expect(response.status).toBe(400)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toBe('Invalid input')
    })

    it('returns 404 for notFound', async () => {
      const response = ErrorResponses.notFound('Resource not found', mockCorsHeaders)
      expect(response.status).toBe(404)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toBe('Resource not found')
    })

    it('returns 500 for internalServerError', async () => {
      const response = ErrorResponses.internalServerError('Server error', mockCorsHeaders)
      expect(response.status).toBe(500)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toBe('Server error')
    })

    it('returns 400 for invalidRequestBody', async () => {
      const response = ErrorResponses.invalidRequestBody(mockCorsHeaders)
      expect(response.status).toBe(400)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toBe('Invalid request body')
    })

    it('returns 400 for missingRequiredField', async () => {
      const response = ErrorResponses.missingRequiredField('name', mockCorsHeaders)
      expect(response.status).toBe(400)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toContain('name')
    })

    it('returns 400 for missingRequiredFields', async () => {
      const response = ErrorResponses.missingRequiredFields('name, email', mockCorsHeaders)
      expect(response.status).toBe(400)

      const body = JSON.parse(await getResponseBody(response))
      expect(body.error).toContain('name, email')
    })
  })

  describe('SuccessResponses', () => {
    it('returns 201 for created', () => {
      const response = SuccessResponses.created({ id: '123' }, mockCorsHeaders)
      expect(response.status).toBe(201)
    })

    it('returns 200 for ok', () => {
      const response = SuccessResponses.ok({ success: true }, mockCorsHeaders)
      expect(response.status).toBe(200)
    })
  })

  describe('validateRequiredFields', () => {
    it('returns null when all fields present', () => {
      const body = { name: 'test', email: 'test@test.com' }
      const result = validateRequiredFields(body, ['name', 'email'], mockCorsHeaders)
      expect(result).toBeNull()
    })

    it('returns error response when field missing', () => {
      const body = { name: 'test' }
      const result = validateRequiredFields(body, ['name', 'email'], mockCorsHeaders)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })

    it('returns error for multiple missing fields', async () => {
      const body = {}
      const result = validateRequiredFields(body, ['name', 'email', 'age'], mockCorsHeaders)
      const responseBody = JSON.parse(await getResponseBody(result as Response))
      expect(responseBody.error).toContain('name')
      expect(responseBody.error).toContain('email')
      expect(responseBody.error).toContain('age')
    })

    it('considers empty string as missing', () => {
      const body = { name: '', count: 1, active: true }
      const result = validateRequiredFields(body, ['name', 'count', 'active'], mockCorsHeaders)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })

    it('considers 0 as missing (falsy value check)', () => {
      const body = { name: 'test', count: 0, active: true }
      const result = validateRequiredFields(body, ['name', 'count', 'active'], mockCorsHeaders)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })

    it('considers false as missing (falsy value check)', () => {
      const body = { name: 'test', count: 1, active: false }
      const result = validateRequiredFields(body, ['name', 'count', 'active'], mockCorsHeaders)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })

    it('considers null as missing', () => {
      const body = { name: 'test', count: null, active: true }
      const result = validateRequiredFields(body, ['name', 'count', 'active'], mockCorsHeaders)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })
  })
})
