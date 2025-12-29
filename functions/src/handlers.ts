import { Env, CreateVocabularyWordRequest, ExplainRequest, VocabularyWord } from './types';
import { callGeminiAPI, generateExplanationPrompt } from './utils';
import { storeVocabularyWord, getVocabularyWords, deleteVocabularyWord, updateVocabularyWord } from './database';
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
    const { word, definition, example, level, status, category, userId = 'anonymous' } = body;

    const validationError = validateRequiredFields(
      body,
      ['word', 'definition', 'example', 'level', 'status', 'category'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const newVocabularyWord: VocabularyWord = {
      id: crypto.randomUUID(),
      word,
      definition,
      example,
      level,
      status,
      category,
      createdAt: new Date().toISOString()
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

    const words = await getVocabularyWords(env, userId);

    return SuccessResponses.ok(words, corsHeaders);
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
    const wordId = url.pathname.split('/').pop();

    if (!wordId) {
      return ErrorResponses.missingRequiredField('word ID in URL', corsHeaders);
    }

    await deleteVocabularyWord(env, userId, wordId);

    return SuccessResponses.ok(
      { success: true, message: `Vocabulary word ${wordId} deleted.` },
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
    const wordId = url.pathname.split('/').pop();

    if (!wordId) {
      return ErrorResponses.missingRequiredField('word ID in URL', corsHeaders);
    }

    const body: Partial<VocabularyWord> = await request.json();

    if (Object.keys(body).length === 0) {
      return ErrorResponses.badRequest('No update data provided', corsHeaders);
    }

    const updatedWord = await updateVocabularyWord(env, userId, wordId, body);

    return SuccessResponses.ok(updatedWord, corsHeaders);
  } catch (error) {
    logError('handleUpdateVocabularyWord', error);
    return ErrorResponses.internalServerError('Failed to update vocabulary word', corsHeaders);
  }
}