import type { APIRoute } from 'astro';

// This endpoint provides the SafelinkU configuration for client-side script
export const GET: APIRoute = async () => {
  const apiToken = import.meta.env.SAFELINKU_API_TOKEN;
  
  if (!apiToken) {
    return new Response(JSON.stringify({
      error: 'SAFELINKU_API_TOKEN not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    token: apiToken,
    message: 'Use this token for client-side SafelinkU integration'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
