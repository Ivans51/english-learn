import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  corsHeaders,
  generateExplanationPrompt,
  generateGrammarCheckPrompt,
  generateTopicWordsPrompt,
  addHTMLMarkup
} from '../utils'

describe('utils', () => {
  describe('corsHeaders', () => {
    it('contains correct CORS headers', () => {
      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*')
      expect(corsHeaders['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS')
      expect(corsHeaders['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization')
    })
  })

  describe('generateExplanationPrompt', () => {
    it('creates prompt with correct word', () => {
      const prompt = generateExplanationPrompt('hello')
      expect(prompt).toContain('hello')
      expect(prompt).toContain('definition')
      expect(prompt).toContain('Examples')
    })

    it('includes plain text format requirement', () => {
      const prompt = generateExplanationPrompt('test')
      expect(prompt).toContain('plain text')
      expect(prompt).toContain('bold headers')
      expect(prompt).toContain('no JSON')
    })

    it('requests 2-4 meanings', () => {
      const prompt = generateExplanationPrompt('run')
      expect(prompt).toContain('2-4')
    })
  })

  describe('generateGrammarCheckPrompt', () => {
    it('includes sentence and topic in prompt', () => {
      const prompt = generateGrammarCheckPrompt('I go home', 'present tense')
      expect(prompt).toContain('I go home')
      expect(prompt).toContain('present tense')
      expect(prompt).toContain('isCorrect')
      expect(prompt).toContain('feedback')
      expect(prompt).toContain('suggestions')
    })

    it('requests JSON response format', () => {
      const prompt = generateGrammarCheckPrompt('Test sentence', 'topic')
      expect(prompt).toContain('JSON object')
    })

    it('mentions markdown formatting', () => {
      const prompt = generateGrammarCheckPrompt('Test', 'Test topic')
      expect(prompt).toContain('**bold**')
    })
  })

  describe('generateTopicWordsPrompt', () => {
    it('includes topic in prompt', () => {
      const prompt = generateTopicWordsPrompt('fruits')
      expect(prompt).toContain('fruits')
    })

    it('includes JSON array format requirement', () => {
      const prompt = generateTopicWordsPrompt('animals')
      expect(prompt).toContain('JSON array')
    })

    it('includes term structure requirements', () => {
      const prompt = generateTopicWordsPrompt('food')
      expect(prompt).toContain('"term"')
      expect(prompt).toContain('Meanings')
      expect(prompt).toContain('Examples')
    })

    it('requests 20-30 words', () => {
      const prompt = generateTopicWordsPrompt('sports')
      expect(prompt).toContain('20-30')
    })

    it('mentions bold formatting for vocabulary terms', () => {
      const prompt = generateTopicWordsPrompt('technology')
      expect(prompt).toContain('**bold text**')
    })
  })

  describe('addHTMLMarkup', () => {
    it('formats important grammar terms with bold', () => {
      const result = addHTMLMarkup(
        'The subject and verb should agree',
        'The subject and verb'
      )
      expect(result).toContain('**subject**')
      expect(result).toContain('**verb**')
    })

    it('formats modal verbs and recommendations with bold', () => {
      const result = addHTMLMarkup(
        'You should try harder',
        'You try harder'
      )
      expect(result).toContain('**should**')
      expect(result).toContain('**try**')
    })

    it('formats common mistakes with emphasis', () => {
      const result = addHTMLMarkup(
        'This is incorrect and has an error',
        'This is incorrect'
      )
      expect(result).toContain('*incorrect*')
      expect(result).toContain('*error*')
    })

    it('includes grammar analysis heading', () => {
      const result = addHTMLMarkup(
        'Some feedback text',
        'User sentence'
      )
      expect(result).toContain('## Grammar Analysis')
      expect(result).toContain('User sentence')
    })

    it('includes feedback heading', () => {
      const result = addHTMLMarkup(
        'Some feedback text',
        'User sentence'
      )
      expect(result).toContain('## Feedback')
    })
  })
})
