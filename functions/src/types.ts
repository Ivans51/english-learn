export interface Env {
  // Define your environment bindings here
  GEMINI_API_KEY: string;
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
  meanings: string;
  examples: string;
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
  meanings: string;
  examples: string;
  categoryName: string;
  userId?: string;
}

export interface ExplainRequest {
  word: string;
}

export interface GrammarCheckRequest {
  input: string;
  topic: string;
  userId?: string;
}

export interface GrammarCheckResponse {
  isCorrect: boolean;
  feedback: string;
  suggestions?: string[];
}

export interface PracticePhraseRequest {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId?: string;
}

export interface PracticePhraseResponse {
  phrase: string;
  translation?: string;
  grammarFocus?: string;
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