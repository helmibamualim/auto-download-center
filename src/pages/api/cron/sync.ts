import type { APIRoute } from 'astro';
import { syncGitHubApps } from '../../../lib/sync/github.js';
import { syncFDroidApps } from '../../../lib/sync/fdroid.js';
import { syncSourceForgeApps } from '../../../lib/sync/sourceforge.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Optional: Verify Vercel Cron secret if set
    const cronSecret = import.meta.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    console.log('🚀 Starting scheduled sync process...');
    
    // Run all sync operations in parallel
    const results = await Promise.allSettled([
      syncGitHubApps(),
      syncFDroidApps(),
      syncSourceForgeApps()
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Sync completed: ${successCount} succeeded, ${failedCount} failed`);

    return new Response(JSON.stringify({ 
      success: failedCount === 0, 
      message: `Sync completed: ${successCount} succeeded, ${failedCount} failed`,
      results: results.map((r, i) => ({
        source: ['GitHub', 'F-Droid', 'SourceForge'][i],
        status: r.status,
        error: r.status === 'rejected' ? r.reason?.message : null
      })),
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('💥 Sync process failed:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Also support GET for manual testing (no auth required)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    message: 'Sync endpoint is active. Use POST to trigger sync or visit /api/sync-now',
    cronSchedule: '0 0 * * * (daily at midnight UTC)',
    manualTrigger: '/api/sync-now',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};