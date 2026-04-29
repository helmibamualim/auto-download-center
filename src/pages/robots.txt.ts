import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || 'https://auto-download-center.vercel.app';
  
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /go/

# Allow important pages
Allow: /apps/
Allow: /category/
Allow: /search

# Sitemap
Sitemap: ${siteUrl}sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};