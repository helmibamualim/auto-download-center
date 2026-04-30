import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const executionStartTime = Date.now();
  const triggeredBy = request.headers.get('x-vercel-cron') ? 'cron' : 'manual';
  
  console.log(`🔔 Simple sync execution triggered by: ${triggeredBy}`);
  console.log(`🕐 Execution time: ${new Date().toISOString()}`);
  
  // Skip authorization for testing
  const skipAuth = request.url.includes('skip-auth=true');
  
  if (!skipAuth) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = import.meta.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      // Log unauthorized attempt
      await supabase.from('cron_logs').insert({
        endpoint: '/api/sync-batch-simple',
        status: 'unauthorized',
        triggered_by: triggeredBy,
        error_message: 'Invalid or missing authorization header',
        duration_ms: Date.now() - executionStartTime
      });
      
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        expectedFormat: 'Authorization: Bearer <CRON_SECRET>',
        receivedHeader: authHeader || 'null'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    console.log('🚀 Starting simple batch sync...');

    // Get or create sync progress
    let { data: progress, error: progressError } = await supabase
      .from('sync_progress')
      .select('*')
      .eq('id', 1)
      .single();

    if (progressError || !progress) {
      console.log('📝 Creating initial progress record...');
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
      console.log('✅ Progress record created');
    }

    // Simple batch increment (no actual sync for testing)
    const newBatch = progress.current_batch + 1;
    const testProcessed = 5;
    const testInserted = 3;
    
    console.log(`📊 Updating progress: batch ${newBatch}`);
    
    const { error: updateError } = await supabase
      .from('sync_progress')
      .update({
        current_batch: newBatch,
        total_processed: progress.total_processed + testProcessed,
        total_inserted: progress.total_inserted + testInserted,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) {
      throw new Error(`Failed to update progress: ${updateError.message}`);
    }

    const duration = Date.now() - executionStartTime;
    
    console.log(`✅ Simple batch ${newBatch} completed in ${duration}ms`);

    // Log successful execution
    const { error: logError } = await supabase.from('cron_logs').insert({
      endpoint: '/api/sync-batch-simple',
      status: 'success',
      batch_number: newBatch,
      duration_ms: duration,
      processed: testProcessed,
      inserted: testInserted,
      updated: 0,
      skipped: 2,
      failed: 0,
      triggered_by: triggeredBy
    });

    if (logError) {
      console.error('⚠️ Failed to log execution:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Simple batch sync completed successfully',
      results: {
        batch: newBatch,
        processed: testProcessed,
        inserted: testInserted,
        duration_ms: duration
      },
      triggeredBy,
      executionTime: new Date().toISOString(),
      note: 'This is a simplified test version. No actual apps were synced.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Simple batch sync failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const duration = Date.now() - executionStartTime;
    
    // Log failed execution
    await supabase.from('cron_logs').insert({
      endpoint: '/api/sync-batch-simple',
      status: 'failed',
      duration_ms: duration,
      error_message: errorMessage,
      triggered_by: triggeredBy
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      triggeredBy,
      executionTime: new Date().toISOString(),
      duration_ms: duration
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Also support POST
export const POST: APIRoute = GET;