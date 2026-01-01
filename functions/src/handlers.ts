import {
  Category,
  CreateCategoryRequest,
  CreateTopicRequest,
  CreateTopicWordsRequest,
  CreateVocabularyWordRequest,
  Env,
  ExplainRequest,
  GrammarCheckRequest,
  PracticePhraseRequest,
  Topic,
  TopicWord,
  UpdateTopicRequest,
  VocabularyWord
} from './types';
import {
  addHTMLMarkup,
  callGeminiAPI,
  generateExplanationPrompt,
  generateGrammarCheckPrompt,
  generatePracticePhrasePrompt,
  generateTopicWordsPrompt
} from './utils';
import {
  deleteCategory,
  deleteTopic,
  deleteVocabularyWord,
  findOrCreateCategory,
  getCategories,
  getTopics,
  getVocabularyWords,
  storeCategory,
  storeTopic,
  storeVocabularyWord,
  updateCategory,
  updateTopic,
  updateVocabularyWord
} from './database';
import {ErrorResponses, logError, SuccessResponses, validateRequiredFields} from './errors';

export async function handleExplainWordRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: ExplainRequest = await request.json();
    const {word} = body;

    const validationError = validateRequiredFields(body, ['word'], corsHeaders);
    if (validationError) {
      return validationError;
    }

    const explanationPrompt = generateExplanationPrompt(word);
    const geminiResponse = await callGeminiAPI(explanationPrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError('Failed to generate explanation', corsHeaders);
    }

    return SuccessResponses.ok({definition: geminiResponse}, corsHeaders);

  } catch (error) {
    logError('handleExplainWordRequest', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleCreateVocabularyWord(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CreateVocabularyWordRequest = await request.json();
    const {term, meanings, examples, categoryName, userId = 'anonymous'} = body;

    const validationError = validateRequiredFields(
      body,
      ['term', 'meanings', 'examples', 'categoryName'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    // Find or create category
    const {categoryId} = await findOrCreateCategory(env, userId, categoryName);

    const newVocabularyWord: VocabularyWord = {
      term,
      categoryId,
      categoryName,
      meanings,
      examples,
      status: 'pending'
    };

    await storeVocabularyWord(env, userId, newVocabularyWord);

    return SuccessResponses.created(newVocabularyWord, corsHeaders);
  } catch (error) {
    logError('handleCreateVocabularyWord', error);
    return ErrorResponses.internalServerError('Failed to create vocabulary word', corsHeaders);
  }
}

export async function handleGetVocabularyWords(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';

    const [vocabulary, categories] = await Promise.all([
      getVocabularyWords(env, userId),
      getCategories(env, userId)
    ]);

    const responseData = {
      vocabulary,
      categories
    };

    return SuccessResponses.ok(responseData, corsHeaders);
  } catch (error) {
    logError('handleGetVocabularyWords', error);
    return ErrorResponses.internalServerError('Failed to retrieve vocabulary words', corsHeaders);
  }
}

export async function handleDeleteVocabularyWord(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const wordUid = url.pathname.split('/').pop();

    if (!wordUid) {
      return ErrorResponses.missingRequiredField('word UID in URL', corsHeaders);
    }

    await deleteVocabularyWord(env, userId, wordUid);

    return SuccessResponses.ok(
      {success: true, message: `Vocabulary word ${wordUid} deleted.`},
      corsHeaders
    );
  } catch (error) {
    logError('handleDeleteVocabularyWord', error);
    return ErrorResponses.internalServerError('Failed to delete vocabulary word', corsHeaders);
  }
}

export async function handleUpdateVocabularyWord(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const wordUid = url.pathname.split('/').pop();

    if (!wordUid) {
      return ErrorResponses.missingRequiredField('word UID in URL', corsHeaders);
    }

    const body: Partial<VocabularyWord> = await request.json();

    if (Object.keys(body).length === 0) {
      return ErrorResponses.badRequest('No update data provided', corsHeaders);
    }

    const updatedWord = await updateVocabularyWord(env, userId, wordUid, body);

    return SuccessResponses.ok(updatedWord, corsHeaders);
  } catch (error) {
    logError('handleUpdateVocabularyWord', error);
    return ErrorResponses.internalServerError('Failed to update vocabulary word', corsHeaders);
  }
}

// Topic handlers
export async function handleCreateTopic(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CreateTopicRequest = await request.json();
    const {title, userId = 'anonymous'} = body;

    const validationError = validateRequiredFields(
      body,
      ['title'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const newTopic: Topic = {
      title,
      createdAt: new Date().toISOString()
    };

    const {topicId, topic} = await storeTopic(env, userId, newTopic);

    return SuccessResponses.created({...topic, id: topicId}, corsHeaders);
  } catch (error) {
    logError('handleCreateTopic', error);
    return ErrorResponses.internalServerError('Failed to create topic', corsHeaders);
  }
}

export async function handleGetTopics(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';

    const topics = await getTopics(env, userId);

    // Transform topics to include ID in the response
    const topicsWithIds = Object.entries(topics).map(([id, topic]) => ({
      id,
      ...topic
    }));

    return SuccessResponses.ok(topicsWithIds, corsHeaders);
  } catch (error) {
    logError('handleGetTopics', error);
    return ErrorResponses.internalServerError('Failed to retrieve topics', corsHeaders);
  }
}

export async function handleDeleteTopic(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const topicId = url.pathname.split('/').pop();

    if (!topicId) {
      return ErrorResponses.missingRequiredField('topic ID in URL', corsHeaders);
    }

    await deleteTopic(env, userId, topicId);

    return SuccessResponses.ok(
      {success: true, message: `Topic ${topicId} deleted.`},
      corsHeaders
    );
  } catch (error) {
    logError('handleDeleteTopic', error);
    return ErrorResponses.internalServerError('Failed to delete topic', corsHeaders);
  }
}

export async function handleUpdateTopic(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const topicId = url.pathname.split('/').pop();

    if (!topicId) {
      return ErrorResponses.missingRequiredField('topic ID in URL', corsHeaders);
    }

    const body: UpdateTopicRequest = await request.json();

    if (Object.keys(body).length === 0) {
      return ErrorResponses.badRequest('No update data provided', corsHeaders);
    }

    const updatedTopic = await updateTopic(env, userId, topicId, body);

    return SuccessResponses.ok({...updatedTopic, id: topicId}, corsHeaders);
  } catch (error) {
    logError('handleUpdateTopic', error);
    return ErrorResponses.internalServerError('Failed to update topic', corsHeaders);
  }
}

export async function handleGrammarCheck(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: GrammarCheckRequest = await request.json();
    const {input, topic, userId = 'anonymous'} = body;

    const validationError = validateRequiredFields(
      body,
      ['input', 'topic'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const grammarPrompt = generateGrammarCheckPrompt(input, topic);
    const geminiResponse = await callGeminiAPI(grammarPrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError('Failed to generate grammar feedback', corsHeaders);
    }

    // Try to parse JSON response from Gemini
    let parsedResponse;
    try {
      // First, try to extract JSON from markdown code blocks
      const jsonMatch = geminiResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText;

      if (jsonMatch) {
        // Extract JSON from code block
        jsonText = jsonMatch[1].trim();
      } else {
        // If no code block, try to find JSON directly in the text
        const directJsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      parsedResponse = JSON.parse(jsonText);

      // Validate the parsed response has the expected structure
      if (typeof parsedResponse !== 'object' || parsedResponse === null || !('isCorrect' in parsedResponse)) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.warn('Raw response:', geminiResponse);

      // Create a fallback response with HTML markup for important parts
      const fallbackFeedback = addHTMLMarkup(geminiResponse, input);
      parsedResponse = {
        isCorrect: false,
        feedback: fallbackFeedback,
        suggestions: []
      };
    }

    return SuccessResponses.ok(parsedResponse, corsHeaders);
  } catch (error) {
    logError('handleGrammarCheck', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleGeneratePracticePhrase(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: PracticePhraseRequest = await request.json();
    const {topic, difficulty = 'medium', userId = 'anonymous'} = body;

    const validationError = validateRequiredFields(
      body,
      ['topic'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const practicePrompt = generatePracticePhrasePrompt(topic, difficulty);
    const geminiResponse = await callGeminiAPI(practicePrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError('Failed to generate practice phrase', corsHeaders);
    }

    // Try to parse JSON response from Gemini
    let parsedResponse;
    try {
      // First, try to extract JSON from markdown code blocks
      const jsonMatch = geminiResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText;

      if (jsonMatch) {
        // Extract JSON from code block
        jsonText = jsonMatch[1].trim();
      } else {
        // If no code block, try to find JSON directly in the text
        const directJsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      parsedResponse = JSON.parse(jsonText);

      // Validate the parsed response has the expected structure
      if (typeof parsedResponse !== 'object' || parsedResponse === null || !('phrase' in parsedResponse)) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.warn('Raw response:', geminiResponse);

      // Create a fallback response with the raw text
      parsedResponse = {
        phrase: `Practice phrase for ${topic}: ${geminiResponse}`,
        translation: '',
        grammarFocus: 'General practice'
      };
    }

    return SuccessResponses.ok(parsedResponse, corsHeaders);
  } catch (error) {
    logError('handleGeneratePracticePhrase', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

// Category handlers
export async function handleCreateCategory(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CreateCategoryRequest = await request.json();
    const {name, userId = 'anonymous'} = body;

    const validationError = validateRequiredFields(
      body,
      ['name'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    // Generate a unique ID for the new category
    const categoryId = `cat_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;

    const newCategory: Category = {
      name: name.trim()
    };

    await storeCategory(env, userId, categoryId, newCategory);

    return SuccessResponses.created({...newCategory, id: categoryId}, corsHeaders);
  } catch (error) {
    logError('handleCreateCategory', error);
    return ErrorResponses.internalServerError('Failed to create category', corsHeaders);
  }
}

export async function handleUpdateCategory(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const categoryId = url.pathname.split('/').pop();

    if (!categoryId) {
      return ErrorResponses.missingRequiredField('category ID in URL', corsHeaders);
    }

    const body: { name: string } = await request.json();

    if (!body.name || body.name.trim() === '') {
      return ErrorResponses.badRequest('Category name is required', corsHeaders);
    }

    const updatedCategory = await updateCategory(env, userId, categoryId, {name: body.name.trim()});

    return SuccessResponses.ok({...updatedCategory, id: categoryId}, corsHeaders);
  } catch (error) {
    logError('handleUpdateCategory', error);
    return ErrorResponses.internalServerError('Failed to update category', corsHeaders);
  }
}

export async function handleDeleteCategory(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const categoryId = url.pathname.split('/').pop();

    if (!categoryId) {
      return ErrorResponses.missingRequiredField('category ID in URL', corsHeaders);
    }

    // First, get all vocabulary words to find and delete words with this category
    const vocabulary = await getVocabularyWords(env, userId);
    const wordsToDelete: string[] = [];

    // Find all words that belong to this category
    for (const [wordUid, word] of Object.entries(vocabulary)) {
      if (word.categoryId === categoryId) {
        wordsToDelete.push(wordUid);
      }
    }

    // Delete all vocabulary words that belong to this category
    for (const wordUid of wordsToDelete) {
      await deleteVocabularyWord(env, userId, wordUid);
    }

    // Finally, delete the category itself
    await deleteCategory(env, userId, categoryId);

    return SuccessResponses.ok(
      {
        success: true,
        message: `Category ${categoryId} deleted along with ${wordsToDelete.length} related words.`
      },
      corsHeaders
    );
  } catch (error) {
    logError('handleDeleteCategory', error);
    return ErrorResponses.internalServerError('Failed to delete category', corsHeaders);
  }
}

// Topic Words handler
export async function handleCreateTopicWords(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CreateTopicWordsRequest = await request.json();
    const {topic, categoryName, userId = 'anonymous'} = body;

    const validationError = validateRequiredFields(
      body,
      ['topic', 'categoryName'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    // First, generate the topic words
    const topicWordsPrompt = generateTopicWordsPrompt(topic);

    const geminiResponse = await callGeminiAPI(topicWordsPrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError('Failed to generate topic words', corsHeaders);
    }

    // Parse the JSON response
    let topicWords: TopicWord[] = [];
    try {
      const jsonMatch = geminiResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText;

      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const directJsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON array found in response');
        }
      }

      topicWords = JSON.parse(jsonText);

      // Validate the response structure
      if (!Array.isArray(topicWords)) {
        throw new Error('Response is not an array');
      }

      // Validate each word object
      for (const word of topicWords) {
        if (!word.term || !word.meanings || !word.examples) {
          throw new Error('Invalid word object structure');
        }
      }

    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      return ErrorResponses.internalServerError('Failed to parse generated topic words as JSON', corsHeaders);
    }

    // Find or create the category
    const {categoryId} = await findOrCreateCategory(env, userId, categoryName);

    // Create all the vocabulary words
    const createdWords: VocabularyWord[] = [];

    for (const wordData of topicWords) {
      try {
        const newVocabularyWord: VocabularyWord = {
          term: wordData.term.toLowerCase(),
          categoryId,
          categoryName,
          meanings: wordData.meanings,
          examples: wordData.examples,
          status: 'pending'
        };

        await storeVocabularyWord(env, userId, newVocabularyWord);
        createdWords.push(newVocabularyWord);
      } catch (wordError) {
        console.warn(`Failed to create word "${wordData.term}":`, wordError);
        // Continue with other words even if one fails
      }
    }

    return SuccessResponses.ok(
      {
        createdWords,
        categoryId
      },
      corsHeaders
    );
  } catch (error) {
    logError('handleCreateTopicWords', error);
    return ErrorResponses.internalServerError('Failed to create topic words', corsHeaders);
  }
}