import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
    
    // Verify request is from internal source (basic security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = import.meta.env.CRON_SECRET;
    
    if (!authHeader || !cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ping Google with sitemap URL
    const sitemapUrl = `${siteUrl}/sitemap.xml`;
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    console.log('[Google Ping] Pinging Google with sitemap:', sitemapUrl);
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Auto Download Center Sitemap Ping Bot'
      }
    });

    if (response.ok) {
      console.log('[Google Ping] Successfully pinged Google');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Successfully pinged Google with sitemap',
        sitemapUrl,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error('[Google Ping] Failed to ping Google:', response.status, response.statusText);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Google ping failed: ${response.status} ${response.statusText}`,
        sitemapUrl,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('[Google Ping] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Also support GET for manual testing
export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
  
  return new Response(JSON.stringify({
    message: 'Google Ping API Endpoint',
    usage: 'POST with Bearer token to ping Google with sitemap',
    sitemapUrl: `${siteUrl}/sitemap.xml`,
    pingUrl: `https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};