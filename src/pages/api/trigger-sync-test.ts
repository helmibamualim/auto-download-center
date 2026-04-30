import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const cronSecret = import.meta.env.CRON_SECRET;
    
    if (!cronSecret) {
      throw new Error('CRON_SECRET not found');
    }

    console.log('🧪 Testing manual sync-batch trigger...');
    
    // Make internal call to sync-batch endpoint
    const response = await fetch('https://auto-download-center.vercel.app/api/sync-batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    console.log(`📊 Sync-batch response status: ${response.status}`);
    console.log('📊 Sync-batch response:', responseData);

    return new Response(JSON.stringify({
      success: response.ok,
      timestamp: new Date().toISOString(),
      testType: 'manual-sync-batch-trigger',
      request: {
        url: 'https://auto-download-center.vercel.app/api/sync-batch',
        method: 'POST',
        hasAuthorization: true
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: responseData
      },
      nextSteps: response.ok ? [
        'Check /api/cron-logs for new execution log',
        'Check /api/sync-status for updated batch and totalApps',
        'Verify logging system captured the execution'
      ] : [
        'Check error message in response',
        'Verify CRON_SECRET is correct',
        'Check Vercel function logs for errors'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Manual trigger test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};