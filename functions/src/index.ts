export interface Env {
  // Define your environment bindings here
  // Example: MY_KV_NAMESPACE: KVNamespace;
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
