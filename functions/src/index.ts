import { Env } from './types';
import { handleApiRequest } from './router';
import { corsHeaders } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

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
