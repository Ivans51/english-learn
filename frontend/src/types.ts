export interface VocabularyWord {
  term: string
  categoryId: string
  categoryName: string
  meanings: string
  examples: string
  status?: 'pending' | 'completed'
}

export interface CreateVocabularyWordRequest {
  term: string
  meanings: string
  examples: string
  categoryName: string
  userId?: string
}

export interface Category {
  name: string
}

export interface VocabularyCollection {
  [wordUid: string]: VocabularyWord
}

export interface CategoryCollection {
  [categoryId: string]: Category
}

export interface VocabularyData {
  vocabulary: VocabularyCollection
  categories: CategoryCollection
}

export interface Topic {
  id: string
  title: string
  createdAt: string
}

export interface CreateTopicWordsRequest {
  topic: string
  categoryName: string
  userId?: string
}

export interface CreateTopicWordsResponse {
  createdWords: VocabularyWord[]
  categoryId: string
}
