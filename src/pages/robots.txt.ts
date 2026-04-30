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

# Optimized crawl delays for different bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

User-agent: DuckDuckBot
Crawl-delay: 1

# Clean parameters (ignore tracking parameters)
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Host directive (helps with domain canonicalization)
Host: ${siteUrl.replace('https://', '').replace('http://', '')}
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    }
  });
};
