export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
}

export interface ChatRequest {
  message: string
  topicId: string
  userId?: string
  topicTitle?: string
}

export interface ChatResponse {
  message: string
  messageId: string
  timestamp: string
}

export interface ChatHistoryResponse {
  messages: ChatMessage[]
}

class ChatService {
  private readonly apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(
        `Chat API error: ${response.status} ${response.statusText}`,
      )
    }

    return await response.json()
  }

  async getChatHistory(
    topicId: string,
    userId: string = 'anonymous',
  ): Promise<ChatHistoryResponse> {
    const response = await fetch(
      `${this.apiBaseUrl}/api/chat/history?topicId=${topicId}&userId=${userId}`,
    )

    if (!response.ok) {
      throw new Error(
        `Chat history API error: ${response.status} ${response.statusText}`,
      )
    }

    return await response.json()
  }

  async clearChatHistory(
    topicId: string,
    userId: string = 'anonymous',
  ): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/chat/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topicId, userId }),
    })

    if (!response.ok) {
      throw new Error(
        `Clear chat API error: ${response.status} ${response.statusText}`,
      )
    }
  }

  async explainWord(word: string): Promise<{ definition: string }> {
    const response = await fetch(`${this.apiBaseUrl}/api/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    })

    if (!response.ok) {
      throw new Error(
        `Explain API error: ${response.status} ${response.statusText}`,
      )
    }

    return await response.json()
  }
}

export const chatService = new ChatService()
