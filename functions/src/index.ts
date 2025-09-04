import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Env {
  // Define your environment bindings here
  GEMINI_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ChatRequest {
  message: string;
  topicId: string;
  userId?: string;
  topicTitle?: string;
}

interface ChatResponse {
  message: string;
  messageId: string;
  timestamp: string;
}

interface ChatHistoryRequest {
  topicId: string;
  userId?: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  tags: string[];
  level: string;
}

interface CreateTopicRequest {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  tags: string[];
  level: string;
}

interface UpdateTopicRequest {
  id: string;
  title?: string;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: number;
  tags?: string[];
  level?: string;
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

async function handleChatRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();
    const { message, topicId, userId, topicTitle } = body;

    if (!message || !topicId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, topicId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    // Generate contextual prompt based on topic
    const contextualPrompt = generateContextualPrompt(topicId, message, topicTitle);

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(contextualPrompt, env.GEMINI_API_KEY);

    if (!geminiResponse) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    const responseMessage: ChatResponse = {
      message: geminiResponse,
      messageId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    // Store chat history
    await storeChatMessage(env, body.topicId, body.userId, {
      id: Date.now().toString(),
      content: body.message,
      sender: 'user',
      timestamp: new Date().toISOString()
    });

    await storeChatMessage(env, body.topicId, body.userId, {
      id: responseMessage.messageId,
      content: responseMessage.message,
      sender: 'ai',
      timestamp: responseMessage.timestamp
    });

    return new Response(
      JSON.stringify(responseMessage),
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

async function handleChatHistory(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const topicId = url.searchParams.get('topicId');
    const userId = url.searchParams.get('userId') || 'anonymous';

    if (!topicId) {
      return new Response(
        JSON.stringify({ error: 'Missing topicId parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    const chatHistory = await getChatHistory(env, topicId, userId);

    return new Response(
      JSON.stringify({ messages: chatHistory }),
      {
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve chat history' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      }
    );
  }
}

async function handleClearChatHistory(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: any = await request.json();
    const { topicId, userId = 'anonymous' } = body;

    if (!topicId) {
      return new Response(
        JSON.stringify({ error: 'Missing topicId in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    await clearChatHistory(env, topicId, userId);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to clear chat history' }),
      {
        status: 500,
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

function generateContextualPrompt(topicId: string, userMessage: string, topicTitle?: string): string {
  const context = topicTitle ? `"${topicTitle}"` : 'general English conversation';

  return `You are an English learning assistant helping a student practice ${context}.
    The student just said: "${userMessage}"

    Please respond in a natural, encouraging way that:
    1. Acknowledges their message appropriately
    2. Continues the conversation naturally
    3. Provides gentle corrections if needed (in a supportive way)
    4. Asks follow-up questions to keep the conversation going
    5. Uses vocabulary and grammar appropriate for English learners
    6. Keeps responses conversational and not too long (2-3 sentences max)

    Respond as if you're having a friendly conversation with the student.`;
}

async function storeChatMessage(
  env: Env,
  topicId: string,
  userId: string = 'anonymous',
  message: ChatMessage
): Promise<void> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/chatHistory/${userId}/${topicId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    // Get existing history
    const response = await fetch(databaseUrl);

    let messages: ChatMessage[] = [];
    if (response.ok) {
      const existingData = await response.json();
      if (existingData && Array.isArray(existingData)) {
        messages = existingData;
      }
    }

    // Add new message
    messages.push(message);

    // Keep only last 50 messages to prevent storage issues
    if (messages.length > 50) {
      messages = messages.slice(-50);
    }

    // Store updated history
    await fetch(databaseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messages)
    });
  } catch (error) {
    console.error('Error storing chat message:', error);
  }
}

async function handleCreateTopic(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: CreateTopicRequest = await request.json();

    if (!body.title || !body.description || !body.difficulty || !body.duration || !body.tags || !body.level) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields for topic creation' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const newTopic: Topic = {
      id: crypto.randomUUID(), // Generate a unique ID
      ...body,
    };

    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/topics/${newTopic.id}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(databaseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTopic),
    });

    if (!response.ok) {
      throw new Error(`Failed to create topic: ${response.status} ${response.statusText}`);
    }

    return new Response(
      JSON.stringify(newTopic),
      { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating topic:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create topic' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleGetTopics(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/topics.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(databaseUrl);

    if (!response.ok) {
      throw new Error(`Failed to retrieve topics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const topics: Topic[] = data ? Object.values(data) : []; // Firebase returns an object, convert to array

    return new Response(
      JSON.stringify(topics),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting topics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve topics' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleGetTopicById(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const topicId = url.pathname.split('/').pop(); // Extract ID from URL

    if (!topicId) {
      return new Response(
        JSON.stringify({ error: 'Topic ID missing from URL' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/topics/${topicId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(databaseUrl);

    if (!response.ok) {
      throw new Error(`Failed to retrieve topic: ${response.status} ${response.statusText}`);
    }

    const data: Topic = await response.json();

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Topic not found' }),
        { status: 404, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting topic by ID:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve topic' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleUpdateTopic(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const topicId = url.pathname.split('/').pop();

    if (!topicId) {
      return new Response(
        JSON.stringify({ error: 'Topic ID missing from URL' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const body: UpdateTopicRequest = await request.json();

    if (Object.keys(body).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No update data provided' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/topics/${topicId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(databaseUrl, {
      method: 'PATCH', // PATCH for partial updates
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update topic: ${response.status} ${response.statusText}`);
    }

    const updatedTopic = await response.json(); // Firebase returns the updated data

    return new Response(
      JSON.stringify(updatedTopic),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating topic:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update topic' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function handleDeleteTopic(
  request: Request,
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const topicId = url.pathname.split('/').pop();

    if (!topicId) {
      return new Response(
        JSON.stringify({ error: 'Topic ID missing from URL' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/topics/${topicId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;
    const response = await fetch(databaseUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete topic: ${response.status} ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Topic ${topicId} deleted.` }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting topic:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete topic' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
}

async function getChatHistory(
  env: Env,
  topicId: string,
  userId: string = 'anonymous'
): Promise<ChatMessage[]> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/chatHistory/${userId}/${topicId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(databaseUrl);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        return data;
      }
    }

    return [];
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
}

async function clearChatHistory(
  env: Env,
  topicId: string,
  userId: string = 'anonymous'
): Promise<void> {
  try {
    const databaseUrl = `${env.FIREBASE_DATABASE_URL}/chatHistory/${userId}/${topicId}.json?auth=${env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

    const response = await fetch(databaseUrl, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to clear chat history: ${response.status}`);
    }
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
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

  // Chat endpoint
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    return handleChatRequest(request, env, corsHeaders);
  }

  // Chat history endpoint
  if (url.pathname === '/api/chat/history' && request.method === 'GET') {
    return handleChatHistory(request, env, corsHeaders);
  }

  // Clear chat history endpoint
  if (url.pathname === '/api/chat/clear' && request.method === 'DELETE') {
    return handleClearChatHistory(request, env, corsHeaders);
  }

  // Topics API endpoints
  if (url.pathname === '/api/topics' && request.method === 'POST') {
    return handleCreateTopic(request, env, corsHeaders);
  }
  if (url.pathname === '/api/topics' && request.method === 'GET') {
    return handleGetTopics(request, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/topics/') && request.method === 'GET') {
    return handleGetTopicById(request, url, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/topics/') && request.method === 'PUT') {
    return handleUpdateTopic(request, url, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/topics/') && request.method === 'DELETE') {
    return handleDeleteTopic(request, url, env, corsHeaders);
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
