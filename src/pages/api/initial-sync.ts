import type { APIRoute } from 'astro';
import { syncEnhancedGitHubApps } from '../../lib/sync/enhanced-github';
import { syncFDroidApps } from '../../lib/sync/fdroid';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.CRON_SECRET || 'default-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();
  const results = {
    started: new Date().toISOString(),
    github: { status: 'pending', apps: 0, error: null },
    fdroid: { status: 'pending', apps: 0, error: null },
    duration: 0,
    completed: null,
    stats: {
      totalApps: 0,
      byCategory: {},
      byPlatform: {},
      bySource: {}
    }
  };

  try {
    console.log('🚀 Starting INITIAL BULK SYNC...');
    console.log('⚠️  This will take 15-30 minutes to complete');

    // Get initial count
    const { count: initialCount } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`📊 Current database: ${initialCount || 0} apps`);

    // Sync GitHub with BULK settings (50 apps per query)
    try {
      console.log('\n📦 Starting GitHub BULK sync...');
      console.log('   Settings: 50 apps per query × 140+ queries');
      console.log('   Expected: 1000-2000+ apps');
      
      await syncEnhancedGitHubApps(50); // BULK MODE: 50 apps per query
      
      results.github.status = 'completed';
      console.log('✅ GitHub bulk sync completed');
    } catch (error) {
      console.error('❌ GitHub sync failed:', error);
      results.github.status = 'failed';
      results.github.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Sync F-Droid with BULK settings
    try {
      console.log('\n📱 Starting F-Droid BULK sync...');
      console.log('   Settings: 500 apps per sync');
      console.log('   Expected: 300-500 apps');
      
      await syncFDroidAppsBulk(500); // BULK MODE: 500 apps
      
      results.fdroid.status = 'completed';
      console.log('✅ F-Droid bulk sync completed');
    } catch (error) {
      console.error('❌ F-Droid sync failed:', error);
      results.fdroid.status = 'failed';
      results.fdroid.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Get final statistics
    const { count: finalCount } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get detailed stats
    const { data: apps } = await supabase
      .from('apps')
      .select('category, platform, source_name')
      .eq('is_active', true);

    if (apps) {
      // Count by category
      const byCategory: Record<string, number> = {};
      const byPlatform: Record<string, number> = {};
      const bySource: Record<string, number> = {};

      apps.forEach(app => {
        byCategory[app.category] = (byCategory[app.category] || 0) + 1;
        byPlatform[app.platform] = (byPlatform[app.platform] || 0) + 1;
        bySource[app.source_name] = (bySource[app.source_name] || 0) + 1;
      });

      results.stats = {
        totalApps: finalCount || 0,
        byCategory,
        byPlatform,
        bySource
      };
    }

    results.duration = Date.now() - startTime;
    results.completed = new Date().toISOString();

    const appsAdded = (finalCount || 0) - (initialCount || 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 INITIAL SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${(results.duration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`📦 Apps before: ${initialCount || 0}`);
    console.log(`📦 Apps after: ${finalCount || 0}`);
    console.log(`✨ Apps added: ${appsAdded}`);
    console.log('\n📂 By Source:');
    Object.entries(results.stats.bySource).forEach(([source, count]) => {
      console.log(`   ${source}: ${count}`);
    });
    console.log('\n💻 By Platform:');
    Object.entries(results.stats.byPlatform).forEach(([platform, count]) => {
      console.log(`   ${platform}: ${count}`);
    });
    console.log('='.repeat(60));

    return new Response(JSON.stringify({
      success: true,
      message: `Initial sync completed! Added ${appsAdded} apps in ${(results.duration / 1000 / 60).toFixed(2)} minutes`,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Initial sync failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Bulk F-Droid sync function
async function syncFDroidAppsBulk(maxApps: number): Promise<void> {
  try {
    console.log(`Syncing F-Droid apps (max: ${maxApps})...`);
    
    const response = await fetch('https://f-droid.org/repo/index-v2.json');
    
    if (!response.ok) {
      console.error('F-Droid API error:', response.status);
      return;
    }

    const data: any = await response.json();
    const apps = Object.values(data.apps || {});

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const app of apps.slice(0, maxApps)) {
      try {
        const appData: any = app;
        const name = appData.name?.['en-US'] || appData.packageName;
        const description = appData.description?.['en-US'] || '';
        const summary = appData.summary?.['en-US'] || '';

        if (!appData.packages || appData.packages.length === 0) {
          skipped++;
          continue;
        }

        // Get latest version
        const latestPackage = appData.packages.sort((a: any, b: any) => b.versionCode - a.versionCode)[0];
        
        const downloadUrl = `https://f-droid.org/repo/${latestPackage.apkName}`;
        const slug = createSlug(name);

        // Check if app already exists
        const { data: existingApp } = await supabase
          .from('apps')
          .select('id, version')
          .eq('slug', slug)
          .single();

        // Skip if same version already exists
        if (existingApp && existingApp.version === latestPackage.versionName) {
          skipped++;
          continue;
        }

        const appRecord = {
          title: name,
          slug,
          description: description || `${name} - Open source Android app from F-Droid`,
          short_description: summary.substring(0, 150) || `${name} application`,
          category: 'Android Apps',
          platform: 'Android',
          version: latestPackage.versionName,
          license: appData.license || 'Open Source',
          developer: 'F-Droid Community',
          source_name: 'F-Droid',
          source_url: appData.sourceCode || `https://f-droid.org/packages/${appData.packageName}`,
          original_download_url: downloadUrl,
          icon_url: appData.icon?.['en-US']?.name ? 
            `https://f-droid.org/repo/icons-640/${appData.icon['en-US'].name}` : null,
          file_type: 'apk',
          file_size: (latestPackage.size / 1024 / 1024).toFixed(2) + ' MB',
          is_active: true,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingApp) {
          await supabase
            .from('apps')
            .update(appRecord)
            .eq('id', existingApp.id);
          
          updated++;
          console.log(`   ✅ Updated: ${name}`);
        } else {
          const { error } = await supabase
            .from('apps')
            .insert(appRecord);
          
          if (error) {
            console.error(`   ❌ Error: ${name}`, error.message);
            skipped++;
          } else {
            added++;
            console.log(`   ✨ Added: ${name}`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error processing app:`, error);
        skipped++;
      }
    }

    console.log(`\n📊 F-Droid Summary: ✨ ${added} added, ✅ ${updated} updated, ⏭️  ${skipped} skipped`);
  } catch (error) {
    console.error('Error syncing F-Droid apps:', error);
    throw error;
  }
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Also support POST for manual triggers
export const POST: APIRoute = GET;
