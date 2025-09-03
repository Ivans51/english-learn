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

async function handleChatRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || !body.topicId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, topicId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        }
      );
    }

    // Generate contextual prompt based on topic
    const contextualPrompt = generateContextualPrompt(body.topicId, body.message);

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

function generateContextualPrompt(topicId: string, userMessage: string): string {
  const topicContexts: Record<string, string> = {
    '1': 'greetings and introductions',
    '2': 'daily routines and activities',
    '3': 'food and dining',
    '4': 'shopping and money',
    '5': 'travel and transportation',
    'default': 'general English conversation'
  };

  const context = topicContexts[topicId] || topicContexts['default'];

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

  // Example API endpoint
  if (url.pathname === '/api/hello') {
    return new Response(
      JSON.stringify({
        message: 'Hello from English Learn API!',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'content-type': 'application/json',
        },
      }
    );
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
