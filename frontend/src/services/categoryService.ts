class CategoryService {
  private readonly apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'
  }

  async updateCategory(
    categoryId: string,
    updates: { name: string },
    userId?: string,
  ): Promise<{ id: string; name: string }> {
    const url = userId
      ? `${this.apiBaseUrl}/api/categories/${categoryId}?userId=${userId}`
      : `${this.apiBaseUrl}/api/categories/${categoryId}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`)
    }

    return await response.json()
  }

  async deleteCategory(categoryId: string, userId?: string): Promise<void> {
    const url = userId
      ? `${this.apiBaseUrl}/api/categories/${categoryId}?userId=${userId}`
      : `${this.apiBaseUrl}/api/categories/${categoryId}`
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.statusText}`)
    }
  }
}

export const categoryService = new CategoryService()
