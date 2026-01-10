import {Env} from './types';
import {
  handleCreateCategory,
  handleCreateTopic,
  handleCreateTopicWords,
  handleCreateVocabularyWord,
  handleDeleteCategory,
  handleDeleteTopic,
  handleDeleteVocabularyWord,
  handleExplainWordRequest,
  handleGeneratePracticePhrase,
  handleGetTopics,
  handleGetVocabularyWords,
  handleGrammarCheck,
  handleUpdateCategory,
  handleUpdateTopic,
  handleUpdateVocabularyWord
} from './handlers';
import {corsHeaders, setGlobalEnv} from './utils';

export async function handleApiRequest(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {

  setGlobalEnv(env);

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

  // Topics API endpoints
  if (url.pathname === '/api/topics' && request.method === 'POST') {
    return handleCreateTopic(request, env, corsHeaders);
  }
  if (url.pathname === '/api/topics' && request.method === 'GET') {
    return handleGetTopics(request, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/topics/') && request.method === 'PUT') {
    return handleUpdateTopic(request, url, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/topics/') && request.method === 'DELETE') {
    return handleDeleteTopic(request, url, env, corsHeaders);
  }

  // Categories API endpoints
  if (url.pathname === '/api/categories' && request.method === 'POST') {
    return handleCreateCategory(request, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/categories/') && request.method === 'PUT') {
    return handleUpdateCategory(request, url, env, corsHeaders);
  }
  if (url.pathname.startsWith('/api/categories/') && request.method === 'DELETE') {
    return handleDeleteCategory(request, url, env, corsHeaders);
  }

  // Grammar check endpoint
  if (url.pathname === '/api/grammar-check' && request.method === 'POST') {
    return handleGrammarCheck(request, env, corsHeaders);
  }

  // Generate practice phrase endpoint
  if (url.pathname === '/api/practice-phrase' && request.method === 'POST') {
    return handleGeneratePracticePhrase(request, env, corsHeaders);
  }

  // Create topic words endpoint
  if (url.pathname === '/api/create-topic-words' && request.method === 'POST') {
    return handleCreateTopicWords(request, env, corsHeaders);
  }

  // 404 for unknown API routes
  return new Response(
    JSON.stringify({error: 'API endpoint not found'}),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        'content-type': 'application/json',
      },
    }
  );
}