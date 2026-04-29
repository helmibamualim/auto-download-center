import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Get a sample app
    const { data: app } = await supabase
      .from('apps')
      .select('slug, title, original_download_url, safelinku_url')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!app) {
      return new Response(JSON.stringify({
        error: 'No apps found in database'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      message: 'Routing test endpoint',
      sample_app: {
        slug: app.slug,
        title: app.title,
        has_original_url: !!app.original_download_url,
        has_safelinku_url: !!app.safelinku_url
      },
      expected_flow: {
        step1: 'User clicks Download Now button',
        step2: `Browser navigates to: /go/${app.slug}`,
        step3: 'Server checks for cached SafelinkU URL',
        step4: 'If not cached: Create SafelinkU shortlink',
        step5: 'Redirect to SafelinkU or fallback to original URL'
      },
      test_urls: {
        app_detail_page: `/apps/${app.slug}`,
        download_endpoint: `/go/${app.slug}`,
        source_endpoint: `/go/source/${app.slug}`
      },
      instructions: [
        '1. Visit the app detail page',
        '2. Open browser DevTools (F12)',
        '3. Go to Network tab',
        '4. Click "Download Now" button',
        '5. Check the network requests',
        '6. Verify it goes to /go/[slug] first',
        '7. Then redirects to SafelinkU or original URL'
      ]
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
