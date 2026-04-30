import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
  
  try {
    // Get all active apps with more details for better SEO
    const { data: apps } = await supabase
      .from('apps')
      .select('slug, updated_at, created_at, category, platform')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Get all categories with counts
    const { data: categories } = await supabase
      .from('apps')
      .select('category')
      .eq('is_active', true);

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];

    // Get all platforms for platform-specific pages
    const uniquePlatforms = [...new Set(apps?.map(app => app.platform) || [])];

    // Build enhanced sitemap XML with more pages
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Apps listing page -->
  <url>
    <loc>${siteUrl}/apps</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Search page -->
  <url>
    <loc>${siteUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Category pages -->
  ${uniqueCategories.map(category => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    return `  <url>
    <loc>${siteUrl}/category/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n')}
  
  <!-- Platform-specific category pages -->
  ${uniquePlatforms.map(platform => {
    const slug = platform.toLowerCase().replace(/\s+/g, '-');
    return `  <url>
    <loc>${siteUrl}/platform/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n')}
  
  <!-- Legal pages -->
  <url>
    <loc>${siteUrl}/privacy-policy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/dmca</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <!-- Individual app pages -->
  ${apps?.map(app => {
    const isRecent = new Date(app.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return `  <url>
    <loc>${siteUrl}/apps/${app.slug}</loc>
    <lastmod>${new Date(app.updated_at).toISOString()}</lastmod>
    <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
    <priority>${isRecent ? '0.8' : '0.7'}</priority>
  </url>`;
  }).join('\n') || ''}
</urlset>`;

    // Auto-ping Google after generating sitemap (only in production)
    if (siteUrl.includes('vercel.app') || siteUrl.includes('.com')) {
      try {
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(siteUrl + '/sitemap.xml')}`;
        fetch(pingUrl).catch(() => {}); // Silent fail if ping doesn't work
      } catch (e) {
        // Silent fail - don't break sitemap generation
      }
    }

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes (more frequent updates)
        'X-Robots-Tag': 'noindex', // Don't index the sitemap itself
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      }
    });
  }
};
