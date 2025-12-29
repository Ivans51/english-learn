import { Env, VocabularyWord } from './types';

export async function storeVocabularyWord(
  env: Env,
  userId: string = 'anonymous',
  word: VocabularyWord
): Promise<void> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/vocabularyWords/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(databaseUrl);

    let words: VocabularyWord[] = [];
    if (response.ok) {
      const existingData = await response.json();
      if (existingData && Array.isArray(existingData)) {
        words = existingData;
      } else if (existingData === null) {
        words = [];
      }
    }

    words.push(word);

    console.log('Storing vocabulary word:', words);

    await fetch(databaseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(words)
    });
  } catch (error) {
    console.error('Error storing vocabulary word:', error);
    throw error;
  }
}

export async function getVocabularyWords(
  env: Env,
  userId: string = 'anonymous'
): Promise<VocabularyWord[]> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/vocabularyWords/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(databaseUrl);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        return data;
      } else if (data === null) {
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error('Error retrieving vocabulary words:', error);
    return [];
  }
}

export async function deleteVocabularyWord(
  env: Env,
  userId: string = 'anonymous',
  wordId: string
): Promise<void> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/vocabularyWords/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(databaseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary words for deletion: ${response.status}`);
    }
    let data = await response.json();
    let words: VocabularyWord[] = data && Array.isArray(data) ? data : [];

    const initialLength = words.length;
    words = words.filter(word => word.id !== wordId);

    if (words.length === initialLength) {
      console.warn(`Vocabulary word with ID ${wordId} not found for deletion.`);
    }

    await fetch(databaseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(words)
    });
  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    throw error;
  }
}

export async function updateVocabularyWord(
  env: Env,
  userId: string = 'anonymous',
  wordId: string,
  updatedFields: Partial<VocabularyWord>
): Promise<VocabularyWord> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/vocabularyWords/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(databaseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary words for update: ${response.status}`);
    }

    let data = await response.json();
    let words: VocabularyWord[] = data && Array.isArray(data) ? data : [];
    const wordIndex = words.findIndex(w => w.id === wordId);

    if (wordIndex === -1) {
      throw new Error(`Vocabulary word with ID ${wordId} not found for update.`);
    }

    // Update the word
    words[wordIndex] = {
      ...words[wordIndex],
      ...updatedFields
    };

    await fetch(databaseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(words)
    });

    return words[wordIndex];
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw error;
  }
}