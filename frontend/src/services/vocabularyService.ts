import type { VocabularyWord } from '@/types'

export interface CreateVocabularyWordRequest {
  word: string
  definition: string
  example: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  status: 'learning' | 'mastered'
  category: string
  userId?: string
}

class VocabularyWordsService {
  private baseUrl = '/api/vocabulary-words'
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'
  }

  async createWord(wordData: CreateVocabularyWordRequest, userId?: string): Promise<VocabularyWord> {
    const requestData = { ...wordData, userId: userId || wordData.userId }
    const response = await fetch(`${this.apiBaseUrl}/api/vocabulary-words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create vocabulary word: ${response.statusText}`)
    }

    return response.json()
  }

  async getWords(userId?: string): Promise<VocabularyWord[]> {
    const url = userId ? `${this.apiBaseUrl}/api/vocabulary-words?userId=${userId}` : `${this.apiBaseUrl}/api/vocabulary-words`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary words: ${response.statusText}`)
    }

    return await response.json()
  }

  async updateWord(wordId: string, updates: Partial<VocabularyWord>, userId?: string): Promise<VocabularyWord> {
    const url = userId ? `${this.apiBaseUrl}/api/vocabulary-words/${wordId}?userId=${userId}` : `${this.apiBaseUrl}/api/vocabulary-words/${wordId}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update vocabulary word: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteWord(wordId: string, userId?: string): Promise<void> {
    const url = userId ? `${this.apiBaseUrl}/api/vocabulary-words/${wordId}?userId=${userId}` : `${this.apiBaseUrl}/api/vocabulary-words/${wordId}`
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete vocabulary word: ${response.statusText}`)
    }
  }

  saveWord(word: string, definition: string, userId: string = 'anonymous'): Promise<VocabularyWord> {
    return this.createWord({
      word,
      definition,
      example: `Example usage of "${word}" in conversation.`,
      level: 'B1',
      status: 'learning',
      category: 'Chat Words',
      userId
    }, userId)
  }
}

export const vocabularyWordsService = new VocabularyWordsService()
