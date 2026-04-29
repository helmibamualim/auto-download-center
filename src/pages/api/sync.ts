import type { APIRoute } from 'astro';
import { syncEnhancedGitHubApps } from '../../lib/sync/enhanced-github';
import { syncFDroidApps } from '../../lib/sync/fdroid';

export const GET: APIRoute = async ({ request }) => {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.CRON_SECRET || 'default-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();
  const results = {
    started: new Date().toISOString(),
    github: { status: 'pending', apps: 0, error: null },
    fdroid: { status: 'pending', apps: 0, error: null },
    duration: 0,
    completed: null
  };

  try {
    console.log('🚀 Starting auto-sync...');

    // Sync GitHub (limited to 15 apps per query for daily updates)
    try {
      console.log('📦 Syncing GitHub...');
      await syncEnhancedGitHubApps(15);
      results.github.status = 'completed';
      console.log('✅ GitHub sync completed');
    } catch (error) {
      console.error('❌ GitHub sync failed:', error);
      results.github.status = 'failed';
      results.github.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Sync F-Droid (limited to 100 apps for daily updates)
    try {
      console.log('📱 Syncing F-Droid...');
      await syncFDroidApps(100);
      results.fdroid.status = 'completed';
      console.log('✅ F-Droid sync completed');
    } catch (error) {
      console.error('❌ F-Droid sync failed:', error);
      results.fdroid.status = 'failed';
      results.fdroid.error = error instanceof Error ? error.message : 'Unknown error';
    }

    results.duration = Date.now() - startTime;
    results.completed = new Date().toISOString();

    console.log(`✨ Auto-sync completed in ${(results.duration / 1000).toFixed(2)}s`);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Auto-sync failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Also support POST for manual triggers
export const POST: APIRoute = GET;
