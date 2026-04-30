import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
  
  const robotsTxt = `# Auto Download Center - Robots.txt
# We welcome search engine crawlers

User-agent: *
Allow: /

# Disallow admin or API endpoints if any
Disallow: /api/

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay (optional, helps prevent server overload)
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    }
  });
};
