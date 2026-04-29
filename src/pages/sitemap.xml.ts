import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || 'https://auto-download-center.vercel.app';
  
  // Get all active apps
  const { data: apps } = await supabase
    .from('apps')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  // Get all categories
  const { data: categoriesData } = await supabase
    .from('apps')
    .select('category')
    .eq('is_active', true);

  const categories = [...new Set(categoriesData?.map(app => app.category) || [])];

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: 'apps', priority: '0.9', changefreq: 'daily' },
    { url: 'search', priority: '0.8', changefreq: 'weekly' },
    { url: 'privacy-policy', priority: '0.3', changefreq: 'monthly' },
    { url: 'terms', priority: '0.3', changefreq: 'monthly' },
    { url: 'dmca', priority: '0.3', changefreq: 'monthly' },
    { url: 'contact', priority: '0.5', changefreq: 'monthly' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${categories.map(category => `
  <url>
    <loc>${siteUrl}category/${category.toLowerCase().replace(/\s+/g, '-')}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${apps?.map(app => `
  <url>
    <loc>${siteUrl}apps/${app.slug}</loc>
    <lastmod>${new Date(app.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};