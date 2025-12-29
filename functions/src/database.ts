import { Env, VocabularyWord, Category, VocabularyCollection, CategoryCollection } from './types';

export async function storeVocabularyWord(
  env: Env,
  userId: string = 'anonymous',
  word: VocabularyWord
): Promise<void> {
  try {
    // Store vocabulary word in separate Firebase path
    const vocabularyUrl = `${env.FIREBASE_DATABASE_URL}/vocabulary/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(vocabularyUrl);

    let vocabularyCollection: VocabularyCollection = {};

    if (response.ok) {
      const existingData = await response.json();
      if (existingData && typeof existingData === 'object') {
        vocabularyCollection = existingData as VocabularyCollection;
      }
    }

    // Generate unique ID for the word
    const wordUid = `word_uid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the vocabulary word
    vocabularyCollection[wordUid] = word;

    console.log('Storing vocabulary word:', vocabularyCollection);

    await fetch(vocabularyUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vocabularyCollection)
    });
  } catch (error) {
    console.error('Error storing vocabulary word:', error);
    throw error;
  }
}

export async function getVocabularyWords(
  env: Env,
  userId: string = 'anonymous'
): Promise<VocabularyCollection> {
  try {
    const vocabularyUrl = `${env.FIREBASE_DATABASE_URL}/vocabulary/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(vocabularyUrl);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        return data as VocabularyCollection;
      }
    }
    
    return {};
  } catch (error) {
    console.error('Error retrieving vocabulary words:', error);
    return {};
  }
}

export async function getCategories(
  env: Env,
  userId: string = 'anonymous'
): Promise<CategoryCollection> {
  try {
    const categoriesUrl = `${env.FIREBASE_DATABASE_URL}/categories/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(categoriesUrl);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        return data as CategoryCollection;
      }
    }
    
    return {};
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return {};
  }
}

export async function findOrCreateCategory(
  env: Env,
  userId: string = 'anonymous',
  categoryName: string
): Promise<{ categoryId: string; category: Category }> {
  try {
    // First, get all existing categories
    const categories = await getCategories(env, userId);
    
    // Check if category with the same name already exists
    for (const [existingId, existingCategory] of Object.entries(categories)) {
      if (existingCategory.name.toLowerCase() === categoryName.toLowerCase()) {
        return {
          categoryId: existingId,
          category: existingCategory
        };
      }
    }
    
    // If category doesn't exist, create a new one
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCategory: Category = {
      name: categoryName
    };
    
    await storeCategory(env, userId, categoryId, newCategory);
    
    return {
      categoryId,
      category: newCategory
    };
  } catch (error) {
    console.error('Error finding or creating category:', error);
    throw error;
  }
}

export async function deleteVocabularyWord(
  env: Env,
  userId: string = 'anonymous',
  wordUid: string
): Promise<void> {
  try {
    const vocabularyUrl = `${env.FIREBASE_DATABASE_URL}/vocabulary/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(vocabularyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary for deletion: ${response.status}`);
    }

    let vocabularyCollection: VocabularyCollection = {};
    const data = await response.json();
    if (data && typeof data === 'object') {
      vocabularyCollection = data as VocabularyCollection;
    }

    if (vocabularyCollection[wordUid]) {
      delete vocabularyCollection[wordUid];
    } else {
      console.warn(`Vocabulary word with UID ${wordUid} not found for deletion.`);
    }

    await fetch(vocabularyUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vocabularyCollection)
    });
  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    throw error;
  }
}

export async function updateVocabularyWord(
  env: Env,
  userId: string = 'anonymous',
  wordUid: string,
  updatedFields: Partial<VocabularyWord>
): Promise<VocabularyWord> {
  try {
    const vocabularyUrl = `${env.FIREBASE_DATABASE_URL}/vocabulary/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(vocabularyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary for update: ${response.status}`);
    }

    let vocabularyCollection: VocabularyCollection = {};
    const data = await response.json();
    if (data && typeof data === 'object') {
      vocabularyCollection = data as VocabularyCollection;
    }

    if (!vocabularyCollection[wordUid]) {
      throw new Error(`Vocabulary word with UID ${wordUid} not found for update.`);
    }

    // Update the word
    vocabularyCollection[wordUid] = {
      ...vocabularyCollection[wordUid],
      ...updatedFields
    };

    await fetch(vocabularyUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vocabularyCollection)
    });

    return vocabularyCollection[wordUid];
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw error;
  }
}

export async function storeCategory(
  env: Env,
  userId: string = 'anonymous',
  categoryId: string,
  category: Category
): Promise<void> {
  try {
    const categoriesUrl = `${env.FIREBASE_DATABASE_URL}/categories/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(categoriesUrl);

    let categoryCollection: CategoryCollection = {};

    if (response.ok) {
      const existingData = await response.json();
      if (existingData && typeof existingData === 'object') {
        categoryCollection = existingData as CategoryCollection;
      }
    }

    // Store the category
    categoryCollection[categoryId] = category;

    await fetch(categoriesUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryCollection)
    });
  } catch (error) {
    console.error('Error storing category:', error);
    throw error;
  }
}

export async function deleteCategory(
  env: Env,
  userId: string = 'anonymous',
  categoryId: string
): Promise<void> {
  try {
    const categoriesUrl = `${env.FIREBASE_DATABASE_URL}/categories/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(categoriesUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories for deletion: ${response.status}`);
    }

    let categoryCollection: CategoryCollection = {};
    const data = await response.json();
    if (data && typeof data === 'object') {
      categoryCollection = data as CategoryCollection;
    }

    if (categoryCollection[categoryId]) {
      delete categoryCollection[categoryId];
    } else {
      console.warn(`Category with ID ${categoryId} not found for deletion.`);
    }

    await fetch(categoriesUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryCollection)
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function updateCategory(
  env: Env,
  userId: string = 'anonymous',
  categoryId: string,
  updatedFields: Partial<Category>
): Promise<Category> {
  try {
    const categoriesUrl = `${env.FIREBASE_DATABASE_URL}/categories/${userId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(categoriesUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories for update: ${response.status}`);
    }

    let categoryCollection: CategoryCollection = {};
    const data = await response.json();
    if (data && typeof data === 'object') {
      categoryCollection = data as CategoryCollection;
    }

    if (!categoryCollection[categoryId]) {
      throw new Error(`Category with ID ${categoryId} not found for update.`);
    }

    // Update the category
    categoryCollection[categoryId] = {
      ...categoryCollection[categoryId],
      ...updatedFields
    };

    await fetch(categoriesUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryCollection)
    });

    return categoryCollection[categoryId];
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}