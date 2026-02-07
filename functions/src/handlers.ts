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
  TranslateRequest,
  UpdateTopicRequest,
  VocabularyWord,
  VoicePracticeRequest,
  VoicePracticePhraseRequest,
  VoicePracticePhraseResponse,
  TextToSpeechRequest,
  GenerateTranslatePhraseRequest,
  GenerateTranslatePhraseResponse,
  CheckTranslationRequest,
  WhisperInput,
} from './types';
import {
  addHTMLMarkup,
  callMistralAPI,
  generateCategorySuggestionPrompt,
  generateExplanationPrompt,
  generateGrammarCheckPrompt,
  generatePracticePhrasePrompt,
  generateVoicePracticePhrasePrompt,
  generateTranslatePracticePhrasePrompt,
} from './utils';
import {
  deleteCategory,
  deleteTopic,
  deleteVocabularyWord,
  findOrCreateCategory,
  findOrCreateVocabularyWord,
  getCategories,
  getTopics,
  getVocabularyWords,
  storeCategory,
  storeTopic,
  updateCategory,
  updateTopic,
  updateVocabularyWord,
} from './database';
import {
  ErrorResponses,
  logError,
  SuccessResponses,
  validateRequiredFields,
} from './errors';

export async function handleExplainWordRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: ExplainRequest = await request.json();
    const { word, skipCategorySuggestion } = body;

    const validationError = validateRequiredFields(body, ['word'], corsHeaders);
    if (validationError) {
      return validationError;
    }

    const explanationPrompt = generateExplanationPrompt(word);
    const mistralResponse = await callMistralAPI(explanationPrompt);

    if (!mistralResponse) {
      return ErrorResponses.internalServerError(
        'Failed to generate explanation',
        corsHeaders
      );
    }

    let suggestedCategory: string | undefined;
    if (!skipCategorySuggestion) {
      try {
        const categoryPrompt = generateCategorySuggestionPrompt(word);
        const categoryResponse = await callMistralAPI(categoryPrompt);

        if (categoryResponse) {
          suggestedCategory = categoryResponse.trim().split('\n')[0].trim();
          suggestedCategory = suggestedCategory
            .replace(/^["']|["']$/g, '')
            .toLowerCase();

          if (
            suggestedCategory === 'default' ||
            suggestedCategory === 'learning'
          ) {
            suggestedCategory = undefined;
          }
        }
      } catch (categoryError) {
        console.warn('Failed to generate category suggestion:', categoryError);
      }
    }

    return SuccessResponses.ok(
      {
        description: mistralResponse,
        suggestedCategory,
      },
      corsHeaders
    );
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
    const { term, description, categoryName, userId = 'anonymous' } = body;

    const validationError = validateRequiredFields(
      body,
      ['term', 'description', 'categoryName'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    // Find or create category
    const { categoryId } = await findOrCreateCategory(
      env,
      userId,
      categoryName
    );

    // Find or create vocabulary word
    const { word: vocabularyWord, isNewWord } =
      await findOrCreateVocabularyWord(
        env,
        userId,
        term,
        categoryId,
        categoryName,
        description
      );

    // Return appropriate response based on whether word was new
    if (isNewWord) {
      return SuccessResponses.created(vocabularyWord, corsHeaders);
    } else {
      return SuccessResponses.ok(
        {
          ...vocabularyWord,
          message: 'Vocabulary word already exists',
          isNewWord: false,
        },
        corsHeaders
      );
    }
  } catch (error) {
    logError('handleCreateVocabularyWord', error);
    return ErrorResponses.internalServerError(
      'Failed to create vocabulary word',
      corsHeaders
    );
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
      getCategories(env, userId),
    ]);

    const responseData = {
      vocabulary,
      categories,
    };

    return SuccessResponses.ok(responseData, corsHeaders);
  } catch (error) {
    logError('handleGetVocabularyWords', error);
    return ErrorResponses.internalServerError(
      'Failed to retrieve vocabulary words',
      corsHeaders
    );
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
      return ErrorResponses.missingRequiredField(
        'word UID in URL',
        corsHeaders
      );
    }

    await deleteVocabularyWord(env, userId, wordUid);

    return SuccessResponses.ok(
      { success: true, message: `Vocabulary word ${wordUid} deleted.` },
      corsHeaders
    );
  } catch (error) {
    logError('handleDeleteVocabularyWord', error);
    return ErrorResponses.internalServerError(
      'Failed to delete vocabulary word',
      corsHeaders
    );
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
      return ErrorResponses.missingRequiredField(
        'word UID in URL',
        corsHeaders
      );
    }

    const body: Partial<VocabularyWord> = await request.json();

    if (Object.keys(body).length === 0) {
      return ErrorResponses.badRequest('No update data provided', corsHeaders);
    }

    const updatedWord = await updateVocabularyWord(env, userId, wordUid, body);

    return SuccessResponses.ok(updatedWord, corsHeaders);
  } catch (error) {
    logError('handleUpdateVocabularyWord', error);
    return ErrorResponses.internalServerError(
      'Failed to update vocabulary word',
      corsHeaders
    );
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
      createdAt: new Date().toISOString(),
    };

    const { topicId, topic } = await storeTopic(env, userId, newTopic);

    return SuccessResponses.created({ ...topic, id: topicId }, corsHeaders);
  } catch (error) {
    logError('handleCreateTopic', error);
    return ErrorResponses.internalServerError(
      'Failed to create topic',
      corsHeaders
    );
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
      ...topic,
    }));

    return SuccessResponses.ok(topicsWithIds, corsHeaders);
  } catch (error) {
    logError('handleGetTopics', error);
    return ErrorResponses.internalServerError(
      'Failed to retrieve topics',
      corsHeaders
    );
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
      return ErrorResponses.missingRequiredField(
        'topic ID in URL',
        corsHeaders
      );
    }

    await deleteTopic(env, userId, topicId);

    return SuccessResponses.ok(
      { success: true, message: `Topic ${topicId} deleted.` },
      corsHeaders
    );
  } catch (error) {
    logError('handleDeleteTopic', error);
    return ErrorResponses.internalServerError(
      'Failed to delete topic',
      corsHeaders
    );
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
      return ErrorResponses.missingRequiredField(
        'topic ID in URL',
        corsHeaders
      );
    }

    const body: UpdateTopicRequest = await request.json();

    if (Object.keys(body).length === 0) {
      return ErrorResponses.badRequest('No update data provided', corsHeaders);
    }

    const updatedTopic = await updateTopic(env, userId, topicId, body);

    return SuccessResponses.ok({ ...updatedTopic, id: topicId }, corsHeaders);
  } catch (error) {
    logError('handleUpdateTopic', error);
    return ErrorResponses.internalServerError(
      'Failed to update topic',
      corsHeaders
    );
  }
}

export async function handleGrammarCheck(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: GrammarCheckRequest = await request.json();
    const { input, topic } = body;

    const validationError = validateRequiredFields(
      body,
      ['input', 'topic'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const grammarPrompt = generateGrammarCheckPrompt(input, topic);
    const geminiResponse = await callMistralAPI(grammarPrompt);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError(
        'Failed to generate grammar feedback',
        corsHeaders
      );
    }

    let parsedResponse;
    try {
      const jsonMatch = geminiResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText;

      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const directJsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      parsedResponse = JSON.parse(jsonText);

      if (
        typeof parsedResponse !== 'object' ||
        parsedResponse === null ||
        !('isCorrect' in parsedResponse)
      ) {
        throw new Error('Invalid response structure');
      }

      if (
        typeof parsedResponse.feedback === 'string' &&
        parsedResponse.feedback.includes('"isCorrect"')
      ) {
        try {
          const nestedFeedback = JSON.parse(parsedResponse.feedback);
          if (nestedFeedback && typeof nestedFeedback === 'object') {
            if (
              'feedback' in nestedFeedback &&
              typeof nestedFeedback.feedback === 'string' &&
              nestedFeedback.feedback.trim()
            ) {
              parsedResponse.feedback = nestedFeedback.feedback;
            }
            if (
              'suggestions' in nestedFeedback &&
              Array.isArray(nestedFeedback.suggestions)
            ) {
              parsedResponse.suggestions = nestedFeedback.suggestions;
            }
          }
        } catch {
          // Ignore nested feedback parsing errors
        }
      }

      if (
        typeof parsedResponse.feedback === 'string' &&
        parsedResponse.feedback.trim()
      ) {
        const headingPattern =
          /^##\s+(?:Grammar Analysis|Grammar Feedback|Feedback)[\s\S]*?(?=##\s+[\w]|$)/;
        parsedResponse.feedback = parsedResponse.feedback
          .replace(headingPattern, '')
          .trim();
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.warn('Raw response:', geminiResponse);

      const fallbackFeedback = addHTMLMarkup(geminiResponse, input);
      parsedResponse = {
        isCorrect: false,
        feedback: fallbackFeedback,
        suggestions: [],
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
    const { topic, difficulty = 'medium' } = body;

    const validationError = validateRequiredFields(
      body,
      ['topic'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const practicePrompt = generatePracticePhrasePrompt(topic, difficulty);
    const geminiResponse = await callMistralAPI(practicePrompt);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError(
        'Failed to generate practice phrase',
        corsHeaders
      );
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
      if (
        typeof parsedResponse !== 'object' ||
        parsedResponse === null ||
        !('phrase' in parsedResponse)
      ) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.warn('Raw response:', geminiResponse);

      // Create a fallback response with the raw text
      const cleanedResponse = geminiResponse
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/gi, '')
        .trim();

      // Try to extract just the practice phrase part
      const phraseMatch = cleanedResponse.match(
        /["']?phrase["']?\s*:\s*["']([^"']+)["']/i
      );
      const extractedPhrase = phraseMatch ? phraseMatch[1] : cleanedResponse;

      parsedResponse = {
        phrase: `Practice phrase for ${topic}: ${extractedPhrase}`,
        translation: '',
        grammarFocus: 'General practice',
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
    const { name, userId = 'anonymous' } = body;

    const validationError = validateRequiredFields(body, ['name'], corsHeaders);
    if (validationError) {
      return validationError;
    }

    // Generate a unique ID for the new category
    const categoryId = `cat_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;

    const newCategory: Category = {
      name: name.trim(),
    };

    await storeCategory(env, userId, categoryId, newCategory);

    return SuccessResponses.created(
      { ...newCategory, id: categoryId },
      corsHeaders
    );
  } catch (error) {
    logError('handleCreateCategory', error);
    return ErrorResponses.internalServerError(
      'Failed to create category',
      corsHeaders
    );
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
      return ErrorResponses.missingRequiredField(
        'category ID in URL',
        corsHeaders
      );
    }

    const body: { name: string } = await request.json();

    if (!body.name || body.name.trim() === '') {
      return ErrorResponses.badRequest(
        'Category name is required',
        corsHeaders
      );
    }

    const updatedCategory = await updateCategory(env, userId, categoryId, {
      name: body.name.trim(),
    });

    return SuccessResponses.ok(
      { ...updatedCategory, id: categoryId },
      corsHeaders
    );
  } catch (error) {
    logError('handleUpdateCategory', error);
    return ErrorResponses.internalServerError(
      'Failed to update category',
      corsHeaders
    );
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
      return ErrorResponses.missingRequiredField(
        'category ID in URL',
        corsHeaders
      );
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
        message: `Category ${categoryId} deleted along with ${wordsToDelete.length} related words.`,
      },
      corsHeaders
    );
  } catch (error) {
    logError('handleDeleteCategory', error);
    return ErrorResponses.internalServerError(
      'Failed to delete category',
      corsHeaders
    );
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
    const { words, userId = 'anonymous' } = body;

    const validationError = validateRequiredFields(
      body,
      ['words'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    // Parse comma-separated words
    const wordList = words
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (wordList.length === 0) {
      return ErrorResponses.badRequest(
        'No valid words found in input',
        corsHeaders
      );
    }

    const createdWords: VocabularyWord[] = [];
    const existingWords: VocabularyWord[] = [];

    // Process each word individually
    for (const word of wordList) {
      try {
        // Generate description for word
        const explanationPrompt = generateExplanationPrompt(word);
        const description = await callMistralAPI(explanationPrompt);

        if (!description) {
          console.warn(
            `Failed to generate description for word "${word}", using fallback`
          );
          // Continue with fallback description
        }

        // Generate category suggestion
        let suggestedCategory: string;
        try {
          const categoryPrompt = generateCategorySuggestionPrompt(word);
          const categoryResponse = await callMistralAPI(categoryPrompt);

          if (categoryResponse) {
            suggestedCategory = categoryResponse.trim().split('\n')[0].trim();
            suggestedCategory = suggestedCategory
              .replace(/^["']|["']$/g, '')
              .toLowerCase();

            if (
              suggestedCategory === 'default' ||
              suggestedCategory === 'learning' ||
              !suggestedCategory
            ) {
              suggestedCategory = 'general';
            }
          } else {
            suggestedCategory = 'general';
          }
        } catch (categoryError) {
          console.warn(
            `Failed to generate category suggestion for word "${word}":`,
            categoryError
          );
          suggestedCategory = 'general';
        }

        // Find or create category
        const { categoryId } = await findOrCreateCategory(
          env,
          userId,
          suggestedCategory
        );

        // Find or create vocabulary word
        const { word: vocabularyWord, isNewWord } =
          await findOrCreateVocabularyWord(
            env,
            userId,
            word,
            categoryId,
            suggestedCategory,
            description || `Definition for ${word}`
          );

        if (isNewWord) {
          createdWords.push(vocabularyWord);
        } else {
          existingWords.push(vocabularyWord);
        }
      } catch (wordError) {
        console.warn(`Failed to create word "${word}":`, wordError);
        // Continue with other words even if one fails
      }
    }

    return SuccessResponses.ok(
      {
        createdWords,
        existingWords,
        totalWords: wordList.length,
        successfullyCreated: createdWords.length,
        alreadyExisted: existingWords.length,
      },
      corsHeaders
    );
  } catch (error) {
    logError('handleCreateTopicWords', error);
    return ErrorResponses.internalServerError(
      'Failed to create topic words',
      corsHeaders
    );
  }
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

function calculateWordSimilarity(transcribed: string, target: string): number {
  const transWords = transcribed.toLowerCase().trim().split(/\s+/);
  const targetWords = target.toLowerCase().trim().split(/\s+/);

  if (transWords.length === 0 && targetWords.length === 0) return 100;
  if (transWords.length === 0 || targetWords.length === 0) return 0;

  let totalSimilarity = 0;
  let matchedTargetWords = 0;

  for (const tWord of targetWords) {
    let bestSimilarity = 0;
    for (const sWord of transWords) {
      const maxLen = Math.max(tWord.length, sWord.length);
      if (maxLen === 0) {
        bestSimilarity = Math.max(bestSimilarity, 100);
        continue;
      }
      const distance = levenshteinDistance(tWord, sWord);
      const similarity = ((maxLen - distance) / maxLen) * 100;
      bestSimilarity = Math.max(bestSimilarity, similarity);
    }
    totalSimilarity += bestSimilarity;
    matchedTargetWords++;
  }

  return totalSimilarity / matchedTargetWords;
}

function base64ToNumberArray(base64: string): number[] {
  const binaryString = atob(base64);
  const numbers: number[] = [];
  for (let i = 0; i < binaryString.length; i++) {
    numbers.push(binaryString.charCodeAt(i));
  }
  return numbers;
}

export async function handleVoicePractice(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: VoicePracticeRequest = await request.json();
    const { audio, targetPhrase } = body;

    if (!audio || audio.length === 0) {
      return ErrorResponses.badRequest('Audio data is empty', corsHeaders);
    }

    const validationError = validateRequiredFields(
      body,
      ['audio', 'targetPhrase'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    let transcription: string;
    try {
      const audioArray = base64ToNumberArray(audio);
      const whisperResult = (await env.AI.run('@cf/openai/whisper', {
        audio: audioArray,
      } as WhisperInput)) as { text?: string };
      transcription = whisperResult?.text || '';
    } catch (whisperError) {
      console.error('Whisper transcription error:', whisperError);
      return ErrorResponses.internalServerError(
        'Failed to transcribe audio',
        corsHeaders
      );
    }

    const normalizedTranscription = transcription.toLowerCase().trim();
    const normalizedTarget = targetPhrase.toLowerCase().trim();
    const score = calculateWordSimilarity(
      normalizedTranscription,
      normalizedTarget
    );
    const isCorrect = score >= 80;

    let feedback: string;
    if (isCorrect) {
      feedback = 'Great pronunciation! Keep up the excellent work.';
    } else {
      const feedbackPrompt = `You are an English pronunciation coach. The user was asked to say: "${targetPhrase}" but they said: "${transcription}". The similarity score is ${score.toFixed(1)}%.

Provide specific, actionable feedback to help them improve. Focus on:
1. What sounds or words were mispronounced
2. Specific tips to improve (e.g., "emphasize the 'l' sound", "say this syllable more slowly")
3. Keep feedback concise and encouraging

Respond with a JSON object:
{
  "feedback": "Your specific feedback here"
}`;

      const geminiFeedback = await callMistralAPI(feedbackPrompt);
      if (geminiFeedback) {
        try {
          const jsonMatch = geminiFeedback.match(/```json\s*([\s\S]*?)\s*```/i);
          let jsonText = '';
          if (jsonMatch) {
            jsonText = jsonMatch[1].trim();
          } else {
            const directJsonMatch = geminiFeedback.match(/\{[\s\S]*\}/);
            jsonText = directJsonMatch ? directJsonMatch[0] : '';
          }
          const parsed = JSON.parse(jsonText);
          feedback =
            parsed.feedback ||
            'Try again with more emphasis on the target words.';
        } catch {
          feedback = 'Try again with more emphasis on the target words.';
        }
      } else {
        feedback = 'Try again with more emphasis on the target words.';
      }
    }

    return SuccessResponses.ok(
      {
        transcription,
        score: Math.round(score),
        feedback,
        isCorrect,
      },
      corsHeaders
    );
  } catch (error) {
    logError('handleVoicePractice', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleGenerateVoicePracticePhrase(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: VoicePracticePhraseRequest = await request.json();
    const { word, difficulty = 'medium' } = body;

    const validationError = validateRequiredFields(body, ['word'], corsHeaders);
    if (validationError) {
      return validationError;
    }

    const prompt = generateVoicePracticePhrasePrompt(word, difficulty);
    const geminiResponse = await callMistralAPI(prompt);

    if (!geminiResponse) {
      return ErrorResponses.internalServerError(
        'Failed to generate practice phrase',
        corsHeaders
      );
    }

    let parsedResponse: VoicePracticePhraseResponse;
    try {
      const jsonMatch = geminiResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText: string;

      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const directJsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      parsedResponse = JSON.parse(jsonText);

      if (typeof parsedResponse !== 'object' || parsedResponse === null) {
        throw new Error('Invalid response structure');
      }

      if ('senses' in parsedResponse && Array.isArray(parsedResponse.senses)) {
        if (parsedResponse.senses.length === 0) {
          throw new Error('No senses provided');
        }
        parsedResponse.senses = parsedResponse.senses.slice(0, 5);
      } else if ('phrase' in parsedResponse) {
        const oldResponse = parsedResponse as {
          phrase?: string;
          translation?: string;
          grammarFocus?: string;
        };
        parsedResponse = {
          word: word,
          senses: [
            {
              phrase: oldResponse.phrase || '',
              translation: oldResponse.translation || '',
              grammarFocus: oldResponse.grammarFocus || 'General practice',
              senseType: 'literal',
            },
          ],
        };
      } else {
        throw new Error('Invalid response structure: missing senses or phrase');
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);

      const cleanedResponse = geminiResponse
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/gi, '')
        .trim();

      const phraseMatch = cleanedResponse.match(
        /["']?phrase["']?\s*:\s*["']([^"']+)["']/i
      );
      const extractedPhrase = phraseMatch ? phraseMatch[1] : cleanedResponse;

      parsedResponse = {
        word: word,
        senses: [
          {
            phrase: extractedPhrase,
            translation: '',
            grammarFocus: 'General practice',
            senseType: 'literal',
          },
        ],
      };
    }

    return SuccessResponses.ok(parsedResponse, corsHeaders);
  } catch (error) {
    logError('handleGenerateVoicePracticePhrase', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleGenerateTranslatePhrase(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: GenerateTranslatePhraseRequest = await request.json();
    const { word, direction = 'es-en' } = body;

    const validationError = validateRequiredFields(
      body,
      ['word', 'direction'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const prompt = generateTranslatePracticePhrasePrompt(
      word,
      direction,
      'medium'
    );
    const mistralResponse = await callMistralAPI(prompt);

    if (!mistralResponse) {
      return ErrorResponses.internalServerError(
        'Failed to generate translate phrase',
        corsHeaders
      );
    }

    let parsedResponse: GenerateTranslatePhraseResponse;
    try {
      const jsonMatch = mistralResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText: string;

      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const directJsonMatch = mistralResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      const parsed = JSON.parse(jsonText);

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid response structure');
      }

      if (!parsed.phrase || !parsed.translation) {
        throw new Error('Missing phrase or translation');
      }

      parsedResponse = {
        phrase: parsed.phrase,
        translation: parsed.translation,
        grammarFocus: parsed.grammarFocus,
        style: parsed.style,
      };
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError);

      parsedResponse = {
        phrase: `Practice phrase with "${word}"`,
        translation: 'Translation not available',
      };
    }

    return SuccessResponses.ok(parsedResponse, corsHeaders);
  } catch (error) {
    logError('handleGenerateTranslatePhrase', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleCheckTranslation(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CheckTranslationRequest = await request.json();
    const { phrase, userTranslation, direction } = body;

    const validationError = validateRequiredFields(
      body,
      ['phrase', 'userTranslation', 'direction'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const sourceLang = direction === 'es-en' ? 'Spanish' : 'English';
    const targetLang = direction === 'es-en' ? 'English' : 'Spanish';

    const checkPrompt = `Check if the user's translation is CORRECT and EXACT for the given phrase.
Be STRICT - the translation must convey the exact same meaning.

Original phrase (${sourceLang}): "${phrase}"
User's translation (${targetLang}): "${userTranslation}"

Evaluate if the user's translation accurately conveys the exact same meaning.
Consider:
- Exact semantic equivalence (not just similar meaning)
- Proper grammar in ${targetLang}
- Correct vocabulary usage

Return a JSON object:
{
  "isCorrect": true/false,
  "correctTranslation": "the exact correct translation",
  "feedback": "explanation of what was wrong (only if isCorrect is false)"
}

If isCorrect is true, feedback should be empty or null.
If isCorrect is false, provide specific feedback about what was wrong.`;

    const mistralResponse = await callMistralAPI(checkPrompt);

    if (!mistralResponse) {
      return ErrorResponses.internalServerError(
        'Failed to check translation',
        corsHeaders
      );
    }

    let parsedResponse;
    try {
      const jsonMatch = mistralResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText: string;

      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const directJsonMatch = mistralResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      parsedResponse = JSON.parse(jsonText);

      if (typeof parsedResponse !== 'object' || parsedResponse === null) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError);

      // Fallback: do simple string comparison
      parsedResponse = {
        isCorrect: false,
        correctTranslation: phrase,
        feedback: 'Unable to verify translation accuracy',
      };
    }

    return SuccessResponses.ok(parsedResponse, corsHeaders);
  } catch (error) {
    logError('handleCheckTranslation', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleTranslateRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: TranslateRequest = await request.json();
    const { text, targetLanguage } = body;

    const validationError = validateRequiredFields(
      body,
      ['text', 'targetLanguage'],
      corsHeaders
    );
    if (validationError) {
      return validationError;
    }

    const languageNames: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
    };

    const languageName =
      languageNames[targetLanguage.toLowerCase()] || targetLanguage;
    const translationPrompt = `Translate the following text to ${languageName}:\n\n"${text}"\n\nRespond with a JSON object:\n{\n  "translation": "translated text here"\n}`;

    const mistralResponse = await callMistralAPI(translationPrompt);

    if (!mistralResponse) {
      return ErrorResponses.internalServerError(
        'Failed to translate text',
        corsHeaders
      );
    }

    let translation: string;
    try {
      const jsonMatch = mistralResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonText: string;

      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const directJsonMatch = mistralResponse.match(/\{[\s\S]*\}/);
        if (directJsonMatch) {
          jsonText = directJsonMatch[0];
        } else {
          throw new Error('No JSON found in response');
        }
      }

      const parsed = JSON.parse(jsonText);
      translation = parsed.translation || text;
    } catch (parseError) {
      console.warn('Failed to parse translation response as JSON:', parseError);
      const match = mistralResponse.match(
        /["']?translation["']?\s*:\s*["']([^"']+)["']/i
      );
      translation = match ? match[1] : text;
    }

    return SuccessResponses.ok({ translation }, corsHeaders);
  } catch (error) {
    logError('handleTranslateRequest', error);
    return ErrorResponses.invalidRequestBody(corsHeaders);
  }
}

export async function handleTextToSpeech(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: TextToSpeechRequest = await request.json();
    const { text, lang = 'en' } = body;

    const validationError = validateRequiredFields(body, ['text'], corsHeaders);
    if (validationError) {
      return validationError;
    }

    const result = (await env.AI.run('@cf/myshell-ai/melotts', {
      prompt: text,
      lang,
    })) as { audio: string };

    const binaryString = atob(result.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    logError('handleTextToSpeech', error);
    return ErrorResponses.internalServerError(
      'Failed to generate speech',
      corsHeaders
    );
  }
}
