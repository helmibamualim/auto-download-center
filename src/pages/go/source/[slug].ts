import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { createSafelinkUShortlinkWithRateLimit } from '../../../lib/sync/safelinku';

export const GET: APIRoute = async ({ params, redirect }) => {
  const { slug } = params;

  console.log(`[/go/source/${slug}] Source link request received`);

  if (!slug) {
    console.error('[/go/source] No slug provided');
    return new Response('App not found', { status: 404 });
  }

  try {
    // Get app from database
    console.log(`[/go/source/${slug}] Fetching app from database...`);
    const { data: app, error } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !app) {
      console.error(`[/go/source/${slug}] App not found in database:`, error);
      return new Response('App not found', { status: 404 });
    }

    console.log(`[/go/source/${slug}] App found: ${app.title}`);
    console.log(`[/go/source/${slug}] Source URL: ${app.source_url}`);

    // Check if source URL exists
    if (!app.source_url) {
      console.error(`[/go/source/${slug}] ❌ No source_url found for this app`);
      return redirect(`/apps/${slug}`, 302);
    }

    // For source links, create SafelinkU shortlink
    const sourceAlias = `${slug}-source`;
    
    console.log(`[/go/source/${slug}] 🔄 Creating SafelinkU shortlink for source...`);
    const safelinkUrl = await createSafelinkUShortlinkWithRateLimit(
      app.source_url,
      sourceAlias
    );

    if (safelinkUrl) {
      console.log(`[/go/source/${slug}] ✅ SafelinkU shortlink created: ${safelinkUrl}`);
      console.log(`[/go/source/${slug}] ✅ Redirecting to SafelinkU`);
      return redirect(safelinkUrl, 302);
    }

    // If SafelinkU fails, show error (DO NOT fallback to direct source)
    console.error(`[/go/source/${slug}] ❌ SafelinkU failed, cannot proceed`);
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Source Link Unavailable</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 dark:bg-gray-900">
          <div class="min-h-screen flex items-center justify-center px-4">
            <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Source Link Temporarily Unavailable
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                We're having trouble generating a secure link. Please try again in a moment.
              </p>
              <div class="space-y-3">
                <button 
                  onclick="window.location.reload()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Try Again
                </button>
                <a 
                  href="/apps/${app.slug}"
                  class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors inline-block"
                >
                  Back to App Details
                </a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      headers: {
        'Content-Type': 'text/html'
      }
    });

  } catch (error) {
    console.error(`[/go/source/${slug}] 💥 Unexpected error:`, error);
    
    // On error, show error page (DO NOT fallback to direct source)
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 dark:bg-gray-900">
          <div class="min-h-screen flex items-center justify-center px-4">
            <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Error
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                An unexpected error occurred. Please try again later.
              </p>
              <a 
                href="/apps/${slug}"
                class="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Back to App Details
              </a>
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 500,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
};
