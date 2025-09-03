export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  tags: string[];
  level: string;
}

export interface CreateTopicRequest {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  tags: string[];
  level: string;
}

export interface UpdateTopicRequest {
  id: string;
  title?: string;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: number;
  tags?: string[];
  level?: string;
}

class TopicService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  }

  async getAllTopics(): Promise<Topic[]> {
    const response = await fetch(`${this.apiBaseUrl}/api/topics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getTopicById(id: string): Promise<Topic> {
    const response = await fetch(`${this.apiBaseUrl}/api/topics/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch topic ${id}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async createTopic(topicData: CreateTopicRequest): Promise<Topic> {
    const response = await fetch(`${this.apiBaseUrl}/api/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topicData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create topic: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async updateTopic(id: string, topicData: UpdateTopicRequest): Promise<Topic> {
    const response = await fetch(`${this.apiBaseUrl}/api/topics/${id}`, {
      method: 'PUT', // Or PATCH for partial updates, matching backend implementation
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topicData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update topic ${id}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async deleteTopic(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.apiBaseUrl}/api/topics/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete topic ${id}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}

export const topicService = new TopicService();
