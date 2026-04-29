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
  let validCount = 0;
  let invalidCount = 0;
  const invalidApps: string[] = [];

  try {
    console.log('🔍 Starting link validation...');

    // Get all active apps
    const { data: apps } = await supabase
      .from('apps')
      .select('id, slug, title, original_download_url')
      .eq('is_active', true)
      .limit(100); // Validate 100 apps per run

    if (!apps || apps.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No apps to validate',
        validCount: 0,
        invalidCount: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Validating ${apps.length} apps...`);

    for (const app of apps) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(app.original_download_url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          validCount++;
        } else {
          invalidCount++;
          invalidApps.push(app.title);
          
          // Mark as inactive
          await supabase
            .from('apps')
            .update({ is_active: false })
            .eq('id', app.id);
          
          console.log(`❌ Invalid: ${app.title} (${response.status})`);
        }
      } catch (error) {
        invalidCount++;
        invalidApps.push(app.title);
        console.log(`❌ Error: ${app.title}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Validation completed: ${validCount} valid, ${invalidCount} invalid`);

    return new Response(JSON.stringify({
      success: true,
      validCount,
      invalidCount,
      invalidApps,
      duration,
      completed: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Validation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      validCount,
      invalidCount
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = GET;
