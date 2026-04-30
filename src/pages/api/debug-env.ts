import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Only show partial info for security
    const cronSecret = import.meta.env.CRON_SECRET;
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const githubToken = import.meta.env.GITHUB_TOKEN;
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        cronSecretExists: !!cronSecret,
        cronSecretLength: cronSecret?.length || 0,
        cronSecretPreview: cronSecret ? `${cronSecret.substring(0, 4)}...${cronSecret.substring(cronSecret.length - 4)}` : 'Not set',
        supabaseUrlExists: !!supabaseUrl,
        githubTokenExists: !!githubToken,
        nodeEnv: process.env.NODE_ENV || 'unknown'
      },
      manualTriggerCommand: cronSecret ? 
        `curl -X POST https://auto-download-center.vercel.app/api/sync-batch -H "Authorization: Bearer ${cronSecret}"` :
        'CRON_SECRET not available',
      note: 'This endpoint is for debugging only. Remove after testing.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};