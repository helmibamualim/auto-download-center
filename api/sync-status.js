import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Get sync progress
    const { data: progress, error: progressError } = await supabase
      .from('sync_progress')
      .select('*')
      .eq('id', 1)
      .single();

    if (progressError) {
      return res.status(404).json({
        success: false,
        error: 'Sync progress not found. Run /api/sync-batch to start.',
        progress: null
      });
    }

    // Get current app count
    const { count: totalApps } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get apps by source
    const { data: apps } = await supabase
      .from('apps')
      .select('source_name, category, platform')
      .eq('is_active', true);

    const bySource = {};
    const byCategory = {};
    const byPlatform = {};

    apps?.forEach(app => {
      bySource[app.source_name] = (bySource[app.source_name] || 0) + 1;
      byCategory[app.category] = (byCategory[app.category] || 0) + 1;
      byPlatform[app.platform] = (byPlatform[app.platform] || 0) + 1;
    });

    // Calculate progress percentage
    const totalQueries = 139;
    const totalFDroidApps = 500;
    const totalExpected = (totalQueries * 30) + totalFDroidApps;
    const progressPercentage = Math.min(
      Math.round((progress.total_processed / totalExpected) * 100),
      100
    );

    // Estimate remaining time
    let estimatedTimeRemaining = 'Unknown';
    if (progress.status === 'running' && progress.current_batch > 0) {
      const elapsed = new Date().getTime() - new Date(progress.started_at).getTime();
      const avgTimePerBatch = elapsed / progress.current_batch;
      const remainingBatches = Math.ceil((totalExpected - progress.total_processed) / 30);
      const remainingMs = avgTimePerBatch * remainingBatches;
      const remainingMinutes = Math.round(remainingMs / 1000 / 60);
      estimatedTimeRemaining = `~${remainingMinutes} minutes`;
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      sync: {
        status: progress.status,
        currentBatch: progress.current_batch,
        currentSource: progress.current_source,
        lastQueryIndex: progress.last_query_index,
        progressPercentage,
        estimatedTimeRemaining,
        startedAt: progress.started_at,
        completedAt: progress.completed_at,
        updatedAt: progress.updated_at,
        errorMessage: progress.error_message
      },
      stats: {
        totalApps: totalApps || 0,
        totalProcessed: progress.total_processed,
        totalInserted: progress.total_inserted,
        totalUpdated: progress.total_updated,
        totalSkipped: progress.total_skipped,
        totalFailed: progress.total_failed,
        sources: Object.keys(bySource).length,
        categories: Object.keys(byCategory).length,
        platforms: Object.keys(byPlatform).length
      },
      breakdown: {
        bySource,
        byCategory,
        byPlatform
      }
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}
