import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing logging system...');
    
    // Test insert to cron_logs table
    const testLog = {
      endpoint: '/api/test-logging',
      status: 'success',
      batch_number: 999, // Test batch number
      duration_ms: 1234,
      processed: 5,
      inserted: 3,
      updated: 1,
      skipped: 1,
      failed: 0,
      triggered_by: 'test',
      error_message: null
    };

    console.log('📝 Inserting test log to cron_logs table...');
    
    const { data, error } = await supabase
      .from('cron_logs')
      .insert(testLog)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert test log: ${error.message}`);
    }

    console.log('✅ Test log inserted successfully:', data);

    // Test read from cron_logs table
    const { data: logs, error: readError } = await supabase
      .from('cron_logs')
      .select('*')
      .eq('triggered_by', 'test')
      .order('execution_time', { ascending: false })
      .limit(5);

    if (readError) {
      throw new Error(`Failed to read test logs: ${readError.message}`);
    }

    const duration = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      message: 'Logging system test completed successfully',
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      testResults: {
        insertSuccess: true,
        insertedLog: data,
        readSuccess: true,
        testLogsCount: logs?.length || 0,
        recentTestLogs: logs
      },
      nextSteps: [
        'Logging system is working correctly',
        'Ready for manual sync-batch trigger test',
        'Need CRON_SECRET for /api/sync-batch authorization'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Logging test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      troubleshooting: [
        'Check if cron_logs table exists in Supabase',
        'Check SUPABASE_SERVICE_ROLE_KEY environment variable',
        'Check table permissions in Supabase'
      ]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};