import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
  
  try {
    // Get all active apps with optimized query (only needed fields)
    const { data: apps } = await supabase
      .from('apps')
      .select('slug, updated_at, created_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Get all categories with count for priority calculation
    const { data: categories } = await supabase
      .from('apps')
      .select('category')
      .eq('is_active', true);

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];
    
    // Calculate app count for sitemap index decision
    const totalApps = apps?.length || 0;
    
    // If too many apps (>45,000), we should use sitemap index
    if (totalApps > 45000) {
      return generateSitemapIndex(siteUrl, totalApps);
    }

    // Enhanced sitemap with better SEO optimization
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Homepage - Highest Priority -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Apps listing page - High Priority -->
  <url>
    <loc>${siteUrl}/apps</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Search page - Important for SEO -->
  <url>
    <loc>${siteUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Category pages - High SEO Value -->
  ${uniqueCategories.map(category => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    return `  <url>
    <loc>${siteUrl}/category/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n')}
  
  <!-- Individual app pages - Core Content -->
  ${apps?.map(app => {
    // Calculate priority based on recency (newer apps get higher priority)
    const daysSinceUpdate = Math.floor((Date.now() - new Date(app.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    const priority = daysSinceUpdate <= 7 ? '0.8' : daysSinceUpdate <= 30 ? '0.7' : '0.6';
    
    return `  <url>
    <loc>${siteUrl}/apps/${app.slug}</loc>
    <lastmod>${new Date(app.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n') || ''}
  
  <!-- Legal pages - Required for completeness -->
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
</urlset>`;

    // Auto-ping Google for faster indexing (silent fail if error)
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(siteUrl + '/sitemap.xml')}`;
    fetch(pingUrl).catch(() => {}); // Silent fail - don't break sitemap if ping fails

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'X-Sitemap-Count': totalApps.toString(),
        'X-Generated-At': new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Enhanced fallback sitemap with essential pages
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/apps</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Sitemap-Error': 'fallback-mode',
      }
    });
  }
};

// Function to generate sitemap index for large sites (>45k URLs)
function generateSitemapIndex(siteUrl: string, totalApps: number) {
  const sitemapsPerFile = 45000;
  const numberOfSitemaps = Math.ceil(totalApps / sitemapsPerFile);
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main sitemap with homepage, categories, etc -->
  <sitemap>
    <loc>${siteUrl}/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  
  <!-- App sitemaps (chunked) -->
  ${Array.from({ length: numberOfSitemaps }, (_, i) => `  <sitemap>
    <loc>${siteUrl}/sitemap-apps-${i + 1}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Sitemap-Type': 'index',
      'X-Total-Apps': totalApps.toString(),
    }
  });
}
