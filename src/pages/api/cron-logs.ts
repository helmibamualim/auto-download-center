import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status'); // 'success', 'failed', 'unauthorized'
    const triggeredBy = url.searchParams.get('triggered_by'); // 'cron', 'manual'

    // Build query
    let query = supabase
      .from('cron_logs')
      .select('*')
      .order('execution_time', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (triggeredBy) {
      query = query.eq('triggered_by', triggeredBy);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cron logs: ${error.message}`);
    }

    // Get summary statistics
    const { data: stats } = await supabase
      .from('cron_logs')
      .select('status, triggered_by')
      .limit(1000);

    const summary = {
      total: stats?.length || 0,
      byStatus: {
        success: stats?.filter(s => s.status === 'success').length || 0,
        failed: stats?.filter(s => s.status === 'failed').length || 0,
        unauthorized: stats?.filter(s => s.status === 'unauthorized').length || 0
      },
      byTrigger: {
        cron: stats?.filter(s => s.triggered_by === 'cron').length || 0,
        manual: stats?.filter(s => s.triggered_by === 'manual').length || 0
      }
    };

    // Get last successful execution
    const { data: lastSuccess } = await supabase
      .from('cron_logs')
      .select('*')
      .eq('status', 'success')
      .order('execution_time', { ascending: false })
      .limit(1)
      .single();

    // Get last cron execution (automatic)
    const { data: lastCron } = await supabase
      .from('cron_logs')
      .select('*')
      .eq('triggered_by', 'cron')
      .order('execution_time', { ascending: false })
      .limit(1)
      .single();

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      lastSuccessfulExecution: lastSuccess,
      lastCronExecution: lastCron,
      recentLogs: logs,
      note: 'Use ?limit=N to change number of logs, ?status=success/failed/unauthorized to filter by status, ?triggered_by=cron/manual to filter by trigger'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching cron logs:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      note: 'Make sure cron_logs table exists. Run database-cron-logs.sql first.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
