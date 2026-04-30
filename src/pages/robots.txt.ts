import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
  
  const robotsTxt = `# Auto Download Center - Robots.txt
# Optimized for maximum crawlability and SEO

User-agent: *
Allow: /

# Allow all major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 3

User-agent: YandexBot
Allow: /
Crawl-delay: 2

# Disallow admin, API, and internal endpoints
Disallow: /api/
Disallow: /admin/
Disallow: /_astro/
Disallow: /.well-known/
Disallow: /favicon.ico
Disallow: /robots.txt

# Allow important SEO files
Allow: /sitemap.xml
Allow: /sitemap*.xml

# Sitemap locations
Sitemap: ${siteUrl}/sitemap.xml

# Additional crawl directives for better SEO
# Request-rate: 1/10s (1 request per 10 seconds)
# Visit-time: 0600-2200 (Allow crawling during peak hours)

# Clean-param: utm_source&utm_medium&utm_campaign (Remove tracking parameters)
# Host: ${siteUrl.replace('https://', '').replace('http://', '')}
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'X-Robots-Tag': 'noindex', // Don't index robots.txt itself
    }
  });
};
