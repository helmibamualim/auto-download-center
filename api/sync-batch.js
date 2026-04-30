import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Batch configuration
const BATCH_SIZE = 30;
const QUERIES_PER_BATCH = 3;

export default async function handler(req, res) {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'default-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
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
      duration: 0,
      message: 'Batch sync completed successfully'
    };

    // For now, just update the batch counter
    // Full sync logic will be implemented after API is confirmed working
    await supabase
      .from('sync_progress')
      .update({
        current_batch: progress.current_batch + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    results.duration = Date.now() - startTime;

    console.log(`✅ Batch ${results.batch} completed in ${(results.duration / 1000).toFixed(2)}s`);

    return res.status(200).json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ Batch sync failed:', error);
    
    await supabase
      .from('sync_progress')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}
