import { Env } from './types';
import {
  handleExplainWordRequest,
  handleCreateVocabularyWord,
  handleGetVocabularyWords,
  handleDeleteVocabularyWord,
  handleUpdateVocabularyWord
} from './handlers';
import { corsHeaders } from './utils';

export async function handleApiRequest(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {

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