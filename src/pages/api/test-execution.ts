import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing sync execution without authorization...');
    
    // Test 1: Read sync_progress
    console.log('📖 Reading sync_progress...');
    const { data: progress, error: readError } = await supabase
      .from('sync_progress')
      .select('*')
      .eq('id', 1)
      .single();

    if (readError) {
      throw new Error(`Failed to read progress: ${readError.message}`);
    }

    console.log('📊 Current progress:', progress);

    // Test 2: Update sync_progress (simulate batch increment)
    const newBatch = (progress?.current_batch || 0) + 1;
    const testProcessed = 10;
    const testInserted = 8;

    console.log(`📝 Updating progress to batch ${newBatch}...`);
    
    const { error: updateError } = await supabase
      .from('sync_progress')
      .update({
        current_batch: newBatch,
        total_processed: (progress?.total_processed || 0) + testProcessed,
        total_inserted: (progress?.total_inserted || 0) + testInserted,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) {
      throw new Error(`Failed to update progress: ${updateError.message}`);
    }

    console.log('✅ Progress updated successfully');

    // Test 3: Log to cron_logs
    console.log('📝 Logging execution...');
    
    const duration = Date.now() - startTime;
    
    const { error: logError } = await supabase.from('cron_logs').insert({
      endpoint: '/api/test-execution',
      status: 'success',
      batch_number: newBatch,
      duration_ms: duration,
      processed: testProcessed,
      inserted: testInserted,
      updated: 0,
      skipped: 2,
      failed: 0,
      triggered_by: 'test'
    });

    if (logError) {
      throw new Error(`Failed to log execution: ${logError.message}`);
    }

    console.log('✅ Execution logged successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Execution test completed successfully',
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      results: {
        previousBatch: progress?.current_batch || 0,
        newBatch: newBatch,
        processed: testProcessed,
        inserted: testInserted,
        totalAppsAfter: (progress?.total_processed || 0) + testProcessed
      },
      tests: {
        readProgress: 'SUCCESS',
        updateProgress: 'SUCCESS',
        logExecution: 'SUCCESS'
      },
      nextSteps: [
        'Check /api/sync-status for updated batch and totalProcessed',
        'Check /api/cron-logs for new execution log',
        'Verify that execution can complete without timeout'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Execution test failed:', error);
    
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to log the failure
    try {
      await supabase.from('cron_logs').insert({
        endpoint: '/api/test-execution',
        status: 'failed',
        duration_ms: duration,
        error_message: errorMessage,
        triggered_by: 'test'
      });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      troubleshooting: [
        'Check database connection',
        'Check table permissions',
        'Check environment variables'
      ]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};