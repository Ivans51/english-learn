import type {
  CreateTopicWordsRequest,
  CreateTopicWordsResponse,
  CreateVocabularyWordRequest,
  VocabularyData,
  VocabularyWord,
} from '@/types'

class VocabularyWordsService {
  private readonly apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'
  }

  async createWord(
    wordData: CreateVocabularyWordRequest,
    userId?: string,
  ): Promise<VocabularyWord> {
    const requestData = { ...wordData, userId: userId || wordData.userId }
    const response = await fetch(`${this.apiBaseUrl}/api/vocabulary-words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to create vocabulary word: ${response.statusText}`,
      )
    }

    return response.json()
  }

  async getWords(userId?: string): Promise<VocabularyData> {
    const url = userId
      ? `${this.apiBaseUrl}/api/vocabulary-words?userId=${userId}`
      : `${this.apiBaseUrl}/api/vocabulary-words`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch vocabulary words: ${response.statusText}`,
      )
    }

    return await response.json()
  }

  async updateWord(
    wordUid: string,
    updates: Partial<VocabularyWord>,
    userId?: string,
  ): Promise<VocabularyWord> {
    const url = userId
      ? `${this.apiBaseUrl}/api/vocabulary-words/${wordUid}?userId=${userId}`
      : `${this.apiBaseUrl}/api/vocabulary-words/${wordUid}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to update vocabulary word: ${response.statusText}`,
      )
    }

    return response.json()
  }

  async deleteWord(wordUid: string, userId?: string): Promise<void> {
    const url = userId
      ? `${this.apiBaseUrl}/api/vocabulary-words/${wordUid}?userId=${userId}`
      : `${this.apiBaseUrl}/api/vocabulary-words/${wordUid}`
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(
        `Failed to delete vocabulary word: ${response.statusText}`,
      )
    }
  }

  async explainWord(word: string, skipCategorySuggestion = false): Promise<{ description: string; suggestedCategory?: string }> {
    const response = await fetch(`${this.apiBaseUrl}/api/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word, skipCategorySuggestion }),
    })

    if (!response.ok) {
      throw new Error(
        `Explain API error: ${response.status} ${response.statusText}`,
      )
    }

    return await response.json()
  }

  async createTopicWords(
    requestData: CreateTopicWordsRequest,
  ): Promise<CreateTopicWordsResponse> {
    const response = await fetch(`${this.apiBaseUrl}/api/create-topic-words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create topic words: ${response.statusText}`)
    }

    return await response.json()
  }
}

export const vocabularyWordsService = new VocabularyWordsService()
