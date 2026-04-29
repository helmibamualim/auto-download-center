import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const apiToken = import.meta.env.SAFELINKU_API_TOKEN;
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      token_exists: !!apiToken,
      token_length: apiToken?.length || 0,
      token_prefix: apiToken ? apiToken.substring(0, 10) + '...' : 'NOT SET',
      token_type: typeof apiToken
    },
    test_request: {
      endpoint: 'https://safelinku.com/api/v1/links',
      method: 'POST',
      headers: {
        'Authorization': apiToken ? 'Bearer ' + apiToken.substring(0, 10) + '...' : 'NOT SET',
        'Content-Type': 'application/json'
      },
      body: {
        url: 'https://github.com/example/repo/releases/download/v1.0.0/test.apk',
        alias: 'test-app',
        passcode: ''
      }
    },
    instructions: [
      '1. Check if token_exists is true',
      '2. If false, set SAFELINKU_API_TOKEN in Vercel environment variables',
      '3. If true, test the API manually with curl',
      '4. Check Vercel logs for detailed SafelinkU DEBUG output'
    ]
  };

  // Try to make actual API call if token exists
  if (apiToken) {
    try {
      console.log('[Test SafelinkU] Making test API call...');
      
      const response = await fetch('https://safelinku.com/api/v1/links', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://github.com/example/repo/releases/download/v1.0.0/test.apk',
          alias: 'test-' + Date.now(),
          passcode: ''
        })
      });

      const responseText = await response.text();
      
      diagnostics['api_test_result'] = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        parsed: (() => {
          try {
            return JSON.parse(responseText);
          } catch {
            return 'Failed to parse JSON';
          }
        })()
      };

      console.log('[Test SafelinkU] Response status:', response.status);
      console.log('[Test SafelinkU] Response body:', responseText);

    } catch (error) {
      diagnostics['api_test_result'] = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  } else {
    diagnostics['api_test_result'] = {
      error: 'SAFELINKU_API_TOKEN not set',
      solution: 'Set SAFELINKU_API_TOKEN in Vercel environment variables'
    };
  }

  return new Response(JSON.stringify(diagnostics, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
