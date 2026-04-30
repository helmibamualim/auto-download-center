import type { APIRoute } from 'astro';
import { syncGitHubBatch, syncFDroidBatch } from '../../lib/sync/batch-sync';
import { supabase } from '../../lib/supabase';

// Batch configuration
const BATCH_SIZE = 30; // Process 30 apps per batch (safe for Vercel timeout)
const QUERIES_PER_BATCH = 3; // Process 3 queries per batch

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

  try {
    console.log('🚀 Starting batch sync...');

    // Get or create sync progress
    let { data: progress, error: progressError } = await supabase
      .from('sync_progress')
      .select('*')
      .eq('id', 1)
      .single();

    if (progressError || !progress) {
      // Create initial progress record
      const { data: newProgress, error: createError } = await supabase
        .from('sync_progress')
        .insert({
          id: 1,
          status: 'running',
          current_batch: 0,
          total_processed: 0,
          total_inserted: 0,
          total_updated: 0,
          total_skipped: 0,
          total_failed: 0,
          current_source: 'github',
          last_query_index: 0,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create progress: ${createError.message}`);
      }
      progress = newProgress;
    }

    // Check if sync is already completed
    if (progress.status === 'completed') {
      console.log('✅ Sync already completed. Resetting for new sync...');
      
      // Reset progress for new sync cycle
      const { data: resetProgress } = await supabase
        .from('sync_progress')
        .update({
          status: 'running',
          current_batch: 0,
          last_query_index: 0,
          current_source: 'github',
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();
      
      progress = resetProgress || progress;
    }

    const results = {
      batch: progress.current_batch + 1,
      source: progress.current_source,
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      duration: 0
    };

    // Process based on current source
    if (progress.current_source === 'github') {
      console.log(`📦 Processing GitHub batch ${results.batch}...`);
      console.log(`   Starting from query index: ${progress.last_query_index}`);
      
      const batchResult = await syncGitHubBatch(
        progress.last_query_index,
        QUERIES_PER_BATCH,
        BATCH_SIZE
      );

      results.processed = batchResult.processed;
      results.inserted = batchResult.inserted;
      results.updated = batchResult.updated;
      results.skipped = batchResult.skipped;
      results.failed = batchResult.failed;

      // Update progress
      const newQueryIndex = progress.last_query_index + QUERIES_PER_BATCH;
      const totalQueries = 139; // Total GitHub queries

      if (newQueryIndex >= totalQueries) {
        // GitHub sync completed, move to F-Droid
        console.log('✅ GitHub sync completed, moving to F-Droid...');
        
        await supabase
          .from('sync_progress')
          .update({
            current_batch: progress.current_batch + 1,
            total_processed: progress.total_processed + results.processed,
            total_inserted: progress.total_inserted + results.inserted,
            total_updated: progress.total_updated + results.updated,
            total_skipped: progress.total_skipped + results.skipped,
            total_failed: progress.total_failed + results.failed,
            current_source: 'fdroid',
            last_query_index: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      } else {
        // Continue GitHub sync
        await supabase
          .from('sync_progress')
          .update({
            current_batch: progress.current_batch + 1,
            total_processed: progress.total_processed + results.processed,
            total_inserted: progress.total_inserted + results.inserted,
            total_updated: progress.total_updated + results.updated,
            total_skipped: progress.total_skipped + results.skipped,
            total_failed: progress.total_failed + results.failed,
            last_query_index: newQueryIndex,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      }

    } else if (progress.current_source === 'fdroid') {
      console.log(`📱 Processing F-Droid batch ${results.batch}...`);
      
      const batchResult = await syncFDroidBatch(
        progress.last_query_index,
        50 // 50 apps per F-Droid batch
      );

      results.processed = batchResult.processed;
      results.inserted = batchResult.inserted;
      results.updated = batchResult.updated;
      results.skipped = batchResult.skipped;
      results.failed = batchResult.failed;

      const newIndex = progress.last_query_index + 50;
      const maxFDroidApps = 500; // Total F-Droid apps to sync

      if (newIndex >= maxFDroidApps) {
        // F-Droid sync completed, mark as completed
        console.log('✅ F-Droid sync completed!');
        
        await supabase
          .from('sync_progress')
          .update({
            status: 'completed',
            current_batch: progress.current_batch + 1,
            total_processed: progress.total_processed + results.processed,
            total_inserted: progress.total_inserted + results.inserted,
            total_updated: progress.total_updated + results.updated,
            total_skipped: progress.total_skipped + results.skipped,
            total_failed: progress.total_failed + results.failed,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      } else {
        // Continue F-Droid sync
        await supabase
          .from('sync_progress')
          .update({
            current_batch: progress.current_batch + 1,
            total_processed: progress.total_processed + results.processed,
            total_inserted: progress.total_inserted + results.inserted,
            total_updated: progress.total_updated + results.updated,
            total_skipped: progress.total_skipped + results.skipped,
            total_failed: progress.total_failed + results.failed,
            last_query_index: newIndex,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      }
    }

    results.duration = Date.now() - startTime;

    console.log(`✅ Batch ${results.batch} completed in ${(results.duration / 1000).toFixed(2)}s`);
    console.log(`   Processed: ${results.processed}, Inserted: ${results.inserted}, Updated: ${results.updated}, Skipped: ${results.skipped}, Failed: ${results.failed}`);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Batch sync failed:', error);
    
    // Mark as failed
    await supabase
      .from('sync_progress')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Also support POST for manual triggers
export const POST: APIRoute = GET;
