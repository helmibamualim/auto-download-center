import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.CRON_SECRET || 'default-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();
  let duplicatesRemoved = 0;

  try {
    console.log('🧹 Starting cleanup...');

    // Get all apps ordered by creation date
    const { data: apps } = await supabase
      .from('apps')
      .select('id, slug, source_url, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (!apps || apps.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No apps to cleanup',
        duplicatesRemoved: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const app of apps) {
      const key = `${app.slug}-${app.source_url}`;
      
      if (seen.has(key)) {
        toDelete.push(app.id);
        console.log(`🗑️  Marking duplicate: ${app.slug}`);
      } else {
        seen.add(key);
      }
    }

    // Delete duplicates in batches
    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('apps')
        .delete()
        .in('id', toDelete);

      if (error) {
        throw error;
      }

      duplicatesRemoved = toDelete.length;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Cleanup completed: ${duplicatesRemoved} duplicates removed`);

    return new Response(JSON.stringify({
      success: true,
      duplicatesRemoved,
      duration,
      completed: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duplicatesRemoved
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = GET;
