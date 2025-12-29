import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Env {
  // Define your environment bindings here
  GEMINI_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
}

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  status: 'learning' | 'mastered';
  category: string;
  createdAt: string;
}

interface CreateVocabularyWordRequest {
  word: string;
  definition: string;
  example: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  status: 'learning' | 'mastered';
  category: string;
  userId?: string;
}

interface ExplainRequest {
  word: string;
}

async function handleExplainWordRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: ExplainRequest = await request.json();
    const { word } = body;

    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: word' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    const explanationPrompt = generateExplanationPrompt(word);
    const geminiResponse = await callGeminiAPI(explanationPrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate explanation' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ definition: geminiResponse }),
      {
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      }
    );
  }
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Calling Gemini API with prompt.');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

function generateExplanationPrompt(word: string): string {
  return `Please provide a simple definition for the English word "${word}" and one example sentence. The definition should be easy for an English learner to understand. Respond in JSON format with two keys: "definition" and "example". For example: { "definition": "...", "example": "..." }.`;
}

async function storeVocabularyWord(
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

async function getVocabularyWords(
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

async function deleteVocabularyWord(
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

async function updateVocabularyWord(
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

async function handleCreateVocabularyWord(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CreateVocabularyWordRequest = await request.json();
    const { word, definition, example, level, status, category, userId = 'anonymous' } = body;

    if (!word || !definition || !example || !level || !status || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: word, definition, example, level, status, category' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
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

    return new Response(
      JSON.stringify(newVocabularyWord),
      { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling create vocabulary word request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create vocabulary word' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleGetVocabularyWords(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';

    const words = await getVocabularyWords(env, userId);

    return new Response(
      JSON.stringify(words),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling get vocabulary words request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve vocabulary words' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleDeleteVocabularyWord(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const wordId = url.pathname.split('/').pop();

    if (!wordId) {
      return new Response(
        JSON.stringify({ error: 'Missing word ID in URL' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    await deleteVocabularyWord(env, userId, wordId);

    return new Response(
      JSON.stringify({ success: true, message: `Vocabulary word ${wordId} deleted.` }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling delete vocabulary word request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete vocabulary word' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleUpdateVocabularyWord(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const userId = url.searchParams.get('userId') || 'anonymous';
    const wordId = url.pathname.split('/').pop();

    if (!wordId) {
      return new Response(
        JSON.stringify({ error: 'Missing word ID in URL' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const body: Partial<VocabularyWord> = await request.json();

    if (Object.keys(body).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No update data provided' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const updatedWord = await updateVocabularyWord(env, userId, wordId, body);

    return new Response(
      JSON.stringify(updatedWord),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling update vocabulary word request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update vocabulary word' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, url, env, ctx);
    }

    // Default response
    return new Response('English Learn API', {
      headers: {
        ...corsHeaders,
        'content-type': 'text/plain',
      },
    });
  },
};

async function handleApiRequest(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Explain word endpoint
  if (url.pathname === '/api/explain' && request.method === 'POST') {
    return handleExplainWordRequest(request, env, corsHeaders);
  }

  // Vocabulary Words API endpoints
  if (url.pathname === '/api/vocabulary-words' && request.method === 'POST') {
    return handleCreateVocabularyWord(request, env, corsHeaders);
  }
  if (url.pathname === '/api/vocabulary-words' && request.method === 'GET') {
    return handleGetVocabularyWords(request, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/vocabulary-words/') && request.method === 'PUT') {
    return handleUpdateVocabularyWord(request, url, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/vocabulary-words/') && request.method === 'DELETE') {
    return handleDeleteVocabularyWord(request, url, env, corsHeaders);
  }

  // 404 for unknown API routes
  return new Response(
    JSON.stringify({ error: 'API endpoint not found' }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        'content-type': 'application/json',
      },
    }
  );
}
