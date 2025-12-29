import { Env, CreateVocabularyWordRequest, ExplainRequest, VocabularyWord, VocabularyCollection, CategoryCollection } from './types';
import { callGeminiAPI, generateExplanationPrompt } from './utils';
import { storeVocabularyWord, getVocabularyWords, deleteVocabularyWord, updateVocabularyWord, getCategories, findOrCreateCategory } from './database';
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