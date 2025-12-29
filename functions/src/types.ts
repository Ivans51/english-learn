export interface Env {
  // Define your environment bindings here
  GEMINI_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  status: 'learning' | 'mastered';
  category: string;
  createdAt: string;
}

export interface CreateVocabularyWordRequest {
  word: string;
  definition: string;
  example: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  status: 'learning' | 'mastered';
  category: string;
  userId?: string;
}

export interface ExplainRequest {
  word: string;
}