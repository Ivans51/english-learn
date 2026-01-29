export interface Env {
  // Define your environment bindings here
  GEMINI_API_KEY: string;
  OPENROUTER_API_KEY: string;
  MISTRAL_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
}

export interface Category {
  name: string;
}

export interface VocabularyWord {
  term: string;
  categoryId: string;
  categoryName: string;
  description: string;
  status?: 'pending' | 'completed';
}

export interface VocabularyCollection {
  [wordUid: string]: VocabularyWord;
}

export interface CategoryCollection {
  [categoryId: string]: Category;
}

export interface CreateVocabularyWordRequest {
  term: string;
  description: string;
  categoryName: string;
  userId?: string;
}

export interface ExplainRequest {
  word: string;
  skipCategorySuggestion?: boolean;
}

export interface ExplainResponse {
  description: string;
  suggestedCategory?: string;
}

export interface GrammarCheckRequest {
  input: string;
  topic: string;
  userId?: string;
}

export interface PracticePhraseRequest {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId?: string;
}

export interface Topic {
  title: string;
  createdAt: string;
}

export interface TopicCollection {
  [topicId: string]: Topic;
}

export interface CreateTopicRequest {
  title: string;
  userId?: string;
}

export interface UpdateTopicRequest {
  title?: string;
}

export interface TopicWord {
  term: string;
  description: string;
}

export interface CreateTopicWordsRequest {
  words: string;
  userId?: string;
}

export interface CreateCategoryRequest {
  name: string;
  userId?: string;
}