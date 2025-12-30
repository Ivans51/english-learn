import type { Topic } from '@/types'

interface TopicApiResponse {
  id: string
  title: string
  createdAt: string
}

class TopicService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'

  async getTopics(userId: string): Promise<Topic[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/topics?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const topics: TopicApiResponse[] = await response.json()
      return topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        createdAt: topic.createdAt,
      }))
    } catch (error) {
      console.error('Error fetching topics:', error)
      return []
    }
  }

  async createTopic(topicData: { title: string; userId: string }): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/api/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const topic: TopicApiResponse = await response.json()
      return {
        id: topic.id,
        title: topic.title,
        createdAt: topic.createdAt,
      }
    } catch (error) {
      console.error('Error creating topic:', error)
      throw error
    }
  }

  async updateTopic(topicId: string, updateData: { title?: string }, userId: string): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/api/topics/${topicId}?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const topic: TopicApiResponse = await response.json()
      return {
        id: topic.id,
        title: topic.title,
        createdAt: topic.createdAt,
      }
    } catch (error) {
      console.error('Error updating topic:', error)
      throw error
    }
  }

  async deleteTopic(topicId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/topics/${topicId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      throw error
    }
  }

  async checkGrammar(topicTitle: string, userInput: string, userId: string): Promise<{ feedback: string; isCorrect: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grammar-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicTitle,
          input: userInput,
          userId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking grammar:', error)
      throw error
    }
  }

  async generatePracticePhrase(topicTitle: string, userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/practice-phrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicTitle,
          difficulty: 'medium',
          userId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.phrase
    } catch (error) {
      console.error('Error generating practice phrase:', error)
      throw error
    }
  }
}

export const topicService = new TopicService()
