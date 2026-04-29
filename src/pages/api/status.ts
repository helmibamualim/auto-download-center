import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Get total apps
    const { count: totalApps } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get apps by category
    const { data: categories } = await supabase
      .from('apps')
      .select('category')
      .eq('is_active', true);

    const categoryStats = categories?.reduce((acc: Record<string, number>, app) => {
      acc[app.category] = (acc[app.category] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get apps by platform
    const { data: platforms } = await supabase
      .from('apps')
      .select('platform')
      .eq('is_active', true);

    const platformStats = platforms?.reduce((acc: Record<string, number>, app) => {
      acc[app.platform] = (acc[app.platform] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get apps by source
    const { data: sources } = await supabase
      .from('apps')
      .select('source_name')
      .eq('is_active', true);

    const sourceStats = sources?.reduce((acc: Record<string, number>, app) => {
      acc[app.source_name] = (acc[app.source_name] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get recently synced apps
    const { data: recentApps } = await supabase
      .from('apps')
      .select('title, version, last_synced_at')
      .eq('is_active', true)
      .order('last_synced_at', { ascending: false })
      .limit(10);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalApps: totalApps || 0,
        categories: Object.keys(categoryStats).length,
        platforms: Object.keys(platformStats).length,
        sources: Object.keys(sourceStats).length
      },
      breakdown: {
        byCategory: categoryStats,
        byPlatform: platformStats,
        bySource: sourceStats
      },
      recentlyUpdated: recentApps
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
