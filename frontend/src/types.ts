export interface VocabularyWord {
  term: string
  categoryId: string
  categoryName: string
  meanings: string
  examples: string
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
