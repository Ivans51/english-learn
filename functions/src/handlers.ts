import { Env, CreateVocabularyWordRequest, ExplainRequest, GrammarCheckRequest, PracticePhraseRequest, VocabularyWord, VocabularyCollection, CategoryCollection, Topic, TopicCollection, CreateTopicRequest, UpdateTopicRequest } from './types';
import { callGeminiAPI, generateExplanationPrompt, generateGrammarCheckPrompt, generatePracticePhrasePrompt, addHTMLMarkup } from './utils';
import { storeVocabularyWord, getVocabularyWords, deleteVocabularyWord, updateVocabularyWord, getCategories, findOrCreateCategory, storeTopic, getTopics, deleteTopic, updateTopic } from './database';
import { ErrorResponses, SuccessResponses, logError, validateRequiredFields } from './errors';

export async function handleExplainWordRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: ExplainRequest = await request.json();
    const { word } = body;

    const validationError = validateRequiredFields(body, ['word'], corsHeaders);
    if (validationError) {
      return validationError;
    }

    const explanationPrompt = generateExplanationPrompt(word);
    const geminiResponse = await callGeminiAPI(explanationPrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError('Failed to generate explanation', corsHeaders);
    }

    return SuccessResponses.ok({ definition: geminiResponse }, corsHeaders);

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
    const { term, meanings, examples, categoryName, userId = 'anonymous' } = body;

    const validationError = validateRequiredFields(
      body,
      ['term', 'meanings', 'examples', 'categoryName'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    // Find or create category
    const { categoryId } = await findOrCreateCategory(env, userId, categoryName);

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
      { success: true, message: `Vocabulary word ${wordUid} deleted.` },
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
    const { title, userId = 'anonymous' } = body;

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

    const { topicId, topic } = await storeTopic(env, userId, newTopic);

    return SuccessResponses.created({ ...topic, id: topicId }, corsHeaders);
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
      { success: true, message: `Topic ${topicId} deleted.` },
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

    return SuccessResponses.ok({ ...updatedTopic, id: topicId }, corsHeaders);
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
    const { input, topic, userId = 'anonymous' } = body;

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
    const { topic, difficulty = 'medium', userId = 'anonymous' } = body;

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