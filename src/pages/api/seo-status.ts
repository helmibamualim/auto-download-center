import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://auto-download-center.vercel.app';
    
    // Get total apps count
    const { count: totalApps } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get recently updated apps (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentlyUpdated } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('updated_at', sevenDaysAgo.toISOString());

    // Get categories count
    const { data: categories } = await supabase
      .from('apps')
      .select('category')
      .eq('is_active', true);

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];

    // Get platforms count
    const { data: platforms } = await supabase
      .from('apps')
      .select('platform')
      .eq('is_active', true);

    const uniquePlatforms = [...new Set(platforms?.map(p => p.platform) || [])];

    // Calculate SEO metrics
    const seoMetrics = {
      totalPages: (totalApps || 0) + uniqueCategories.length + uniquePlatforms.length + 10, // apps + categories + platforms + static pages
      indexablePages: totalApps || 0,
      recentlyUpdatedPages: recentlyUpdated || 0,
      categoryPages: uniqueCategories.length,
      platformPages: uniquePlatforms.length,
      staticPages: 10 // homepage, apps, search, legal pages, etc.
    };

    // SEO Health Score (0-100)
    let seoScore = 0;
    
    // Base score for having content
    if (totalApps && totalApps > 0) seoScore += 20;
    
    // Score for recent updates
    if (recentlyUpdated && recentlyUpdated > 0) seoScore += 15;
    
    // Score for category diversity
    if (uniqueCategories.length >= 5) seoScore += 15;
    
    // Score for platform diversity
    if (uniquePlatforms.length >= 2) seoScore += 10;
    
    // Score for content volume
    if (totalApps && totalApps >= 100) seoScore += 10;
    if (totalApps && totalApps >= 500) seoScore += 10;
    if (totalApps && totalApps >= 1000) seoScore += 10;
    
    // Score for freshness (recent updates)
    const updateRatio = recentlyUpdated && totalApps ? (recentlyUpdated / totalApps) : 0;
    if (updateRatio > 0.1) seoScore += 10; // 10% updated recently

    // Check sitemap accessibility
    let sitemapStatus = 'unknown';
    try {
      const sitemapResponse = await fetch(`${siteUrl}/sitemap.xml`);
      sitemapStatus = sitemapResponse.ok ? 'accessible' : 'error';
      if (sitemapStatus === 'accessible') seoScore += 10;
    } catch {
      sitemapStatus = 'error';
    }

    // Check robots.txt accessibility
    let robotsStatus = 'unknown';
    try {
      const robotsResponse = await fetch(`${siteUrl}/robots.txt`);
      robotsStatus = robotsResponse.ok ? 'accessible' : 'error';
      if (robotsStatus === 'accessible') seoScore += 5;
    } catch {
      robotsStatus = 'error';
    }

    const seoStatus = {
      // Basic Stats
      totalApps: totalApps || 0,
      totalCategories: uniqueCategories.length,
      totalPlatforms: uniquePlatforms.length,
      recentlyUpdated: recentlyUpdated || 0,
      
      // SEO Metrics
      seoScore: Math.min(100, seoScore),
      seoMetrics,
      
      // Technical SEO
      sitemapUrl: `${siteUrl}/sitemap.xml`,
      sitemapStatus,
      robotsUrl: `${siteUrl}/robots.txt`,
      robotsStatus,
      
      // Content Freshness
      updateRatio: updateRatio.toFixed(3),
      lastSyncCheck: new Date().toISOString(),
      
      // SEO Recommendations
      recommendations: generateSEORecommendations(totalApps || 0, recentlyUpdated || 0, uniqueCategories.length, sitemapStatus, robotsStatus),
      
      // URLs for Testing
      testUrls: {
        homepage: siteUrl,
        sitemap: `${siteUrl}/sitemap.xml`,
        robots: `${siteUrl}/robots.txt`,
        sampleApp: totalApps && totalApps > 0 ? `${siteUrl}/apps/sample-app` : null,
        sampleCategory: uniqueCategories.length > 0 ? `${siteUrl}/category/${uniqueCategories[0].toLowerCase().replace(/\s+/g, '-')}` : null
      },
      
      // Indexing Status
      indexingStatus: {
        totalIndexablePages: seoMetrics.totalPages,
        estimatedIndexTime: '1-4 weeks',
        priorityPages: [
          `${siteUrl}/`,
          `${siteUrl}/apps`,
          ...uniqueCategories.slice(0, 5).map(cat => `${siteUrl}/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)
        ]
      }
    };

    return new Response(JSON.stringify(seoStatus, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('[SEO Status] Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to get SEO status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function generateSEORecommendations(totalApps: number, recentlyUpdated: number, categories: number, sitemapStatus: string, robotsStatus: string): string[] {
  const recommendations: string[] = [];
  
  if (totalApps < 100) {
    recommendations.push('Increase content volume - aim for 100+ apps for better SEO authority');
  }
  
  if (recentlyUpdated === 0) {
    recommendations.push('Add fresh content regularly - update apps or add new ones weekly');
  }
  
  if (categories < 5) {
    recommendations.push('Diversify content categories - aim for 5+ different app categories');
  }
  
  if (sitemapStatus !== 'accessible') {
    recommendations.push('Fix sitemap accessibility - ensure /sitemap.xml returns HTTP 200');
  }
  
  if (robotsStatus !== 'accessible') {
    recommendations.push('Fix robots.txt accessibility - ensure /robots.txt returns HTTP 200');
  }
  
  const updateRatio = totalApps > 0 ? (recentlyUpdated / totalApps) : 0;
  if (updateRatio < 0.05) {
    recommendations.push('Improve content freshness - update at least 5% of apps weekly');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('SEO setup looks good! Monitor Google Search Console for indexing progress');
  }
  
  return recommendations;
}