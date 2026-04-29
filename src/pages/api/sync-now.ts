import type { APIRoute } from 'astro';
import { syncGitHubApps } from '../../lib/sync/github.js';
import { syncFDroidApps } from '../../lib/sync/fdroid.js';
import { syncSourceForgeApps } from '../../lib/sync/sourceforge.js';

export const GET: APIRoute = async () => {
  try {
    console.log('🚀 Starting manual sync process...');
    
    const results = {
      github: { status: 'pending', error: null },
      fdroid: { status: 'pending', error: null },
      sourceforge: { status: 'pending', error: null }
    };

    // Sync GitHub
    try {
      console.log('📦 Syncing GitHub...');
      await syncGitHubApps();
      results.github.status = 'success';
      console.log('✅ GitHub sync completed');
    } catch (error) {
      results.github.status = 'failed';
      results.github.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ GitHub sync failed:', error);
    }

    // Sync F-Droid
    try {
      console.log('🤖 Syncing F-Droid...');
      await syncFDroidApps();
      results.fdroid.status = 'success';
      console.log('✅ F-Droid sync completed');
    } catch (error) {
      results.fdroid.status = 'failed';
      results.fdroid.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ F-Droid sync failed:', error);
    }

    // Sync SourceForge
    try {
      console.log('🔧 Syncing SourceForge...');
      await syncSourceForgeApps();
      results.sourceforge.status = 'success';
      console.log('✅ SourceForge sync completed');
    } catch (error) {
      results.sourceforge.status = 'failed';
      results.sourceforge.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ SourceForge sync failed:', error);
    }

    const allSuccess = Object.values(results).every(r => r.status === 'success');

    return new Response(JSON.stringify({
      success: allSuccess,
      message: allSuccess ? 'All syncs completed successfully' : 'Some syncs failed',
      results,
      timestamp: new Date().toISOString()
    }), {
      status: allSuccess ? 200 : 207,
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

export const POST: APIRoute = GET;