export interface VocabularyWord {
  id: string
  word: string
  definition: string
  example: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  status: 'learning' | 'mastered'
  category: string
  createdAt: string
}
