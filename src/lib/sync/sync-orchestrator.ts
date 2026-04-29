import { syncEnhancedGitHubApps } from './enhanced-github.js';
import { syncFDroidApps } from './fdroid.js';
import { supabase } from '../supabase.js';

interface SyncStats {
  source: string;
  started: string;
  completed?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

export async function runFullSync(): Promise<void> {
  console.log('🚀 Starting full sync process...\n');
  console.log('=' .repeat(60));
  
  const syncStats: SyncStats[] = [];
  const startTime = Date.now();

  // 1. Sync GitHub (Enhanced)
  try {
    const githubStart = Date.now();
    console.log('\n📦 [1/2] Syncing GitHub repositories...');
    console.log('-'.repeat(60));
    
    syncStats.push({
      source: 'GitHub Enhanced',
      started: new Date().toISOString(),
      status: 'running'
    });

    await syncEnhancedGitHubApps(50); // 50 apps per query for full sync
    
    const githubDuration = Date.now() - githubStart;
    syncStats[syncStats.length - 1].completed = new Date().toISOString();
    syncStats[syncStats.length - 1].duration = githubDuration;
    syncStats[syncStats.length - 1].status = 'completed';
    
    console.log(`\n✅ GitHub sync completed in ${(githubDuration / 1000).toFixed(2)}s`);
  } catch (error) {
    console.error('\n❌ GitHub sync failed:', error);
    syncStats[syncStats.length - 1].status = 'failed';
    syncStats[syncStats.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
  }

  // 2. Sync F-Droid
  try {
    const fdroidStart = Date.now();
    console.log('\n📱 [2/2] Syncing F-Droid apps...');
    console.log('-'.repeat(60));
    
    syncStats.push({
      source: 'F-Droid',
      started: new Date().toISOString(),
      status: 'running'
    });

    await syncFDroidApps(500); // 500 apps for full sync
    
    const fdroidDuration = Date.now() - fdroidStart;
    syncStats[syncStats.length - 1].completed = new Date().toISOString();
    syncStats[syncStats.length - 1].duration = fdroidDuration;
    syncStats[syncStats.length - 1].status = 'completed';
    
    console.log(`\n✅ F-Droid sync completed in ${(fdroidDuration / 1000).toFixed(2)}s`);
  } catch (error) {
    console.error('\n❌ F-Droid sync failed:', error);
    syncStats[syncStats.length - 1].status = 'failed';
    syncStats[syncStats.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Print final summary
  const totalDuration = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(60));
  
  for (const stat of syncStats) {
    const statusIcon = stat.status === 'completed' ? '✅' : stat.status === 'failed' ? '❌' : '⏳';
    const duration = stat.duration ? `(${(stat.duration / 1000).toFixed(2)}s)` : '';
    console.log(`${statusIcon} ${stat.source}: ${stat.status} ${duration}`);
    if (stat.error) {
      console.log(`   Error: ${stat.error}`);
    }
  }
  
  console.log('\n⏱️  Total sync time: ' + (totalDuration / 1000).toFixed(2) + 's');
  
  // Get database stats
  await printDatabaseStats();
  
  console.log('='.repeat(60));
  console.log('✨ Sync process completed!\n');
}

async function printDatabaseStats(): Promise<void> {
  try {
    // Total apps
    const { count: totalApps } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Apps by category
    const { data: categories } = await supabase
      .from('apps')
      .select('category')
      .eq('is_active', true);

    const categoryStats = categories?.reduce((acc: Record<string, number>, app) => {
      acc[app.category] = (acc[app.category] || 0) + 1;
      return acc;
    }, {}) || {};

    // Apps by platform
    const { data: platforms } = await supabase
      .from('apps')
      .select('platform')
      .eq('is_active', true);

    const platformStats = platforms?.reduce((acc: Record<string, number>, app) => {
      acc[app.platform] = (acc[app.platform] || 0) + 1;
      return acc;
    }, {}) || {};

    // Apps by source
    const { data: sources } = await supabase
      .from('apps')
      .select('source_name')
      .eq('is_active', true);

    const sourceStats = sources?.reduce((acc: Record<string, number>, app) => {
      acc[app.source_name] = (acc[app.source_name] || 0) + 1;
      return acc;
    }, {}) || {};

    console.log('\n📈 DATABASE STATISTICS');
    console.log('-'.repeat(60));
    console.log(`📦 Total Apps: ${totalApps || 0}`);
    
    console.log('\n📂 By Category:');
    Object.entries(categoryStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });
    
    console.log('\n💻 By Platform:');
    Object.entries(platformStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([platform, count]) => {
        console.log(`   ${platform}: ${count}`);
      });
    
    console.log('\n🔗 By Source:');
    Object.entries(sourceStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`   ${source}: ${count}`);
      });
  } catch (error) {
    console.error('Error getting database stats:', error);
  }
}

// Quick sync - only new releases
export async function runQuickSync(): Promise<void> {
  console.log('⚡ Starting quick sync (updates only)...\n');
  
  // Only sync apps that haven't been updated in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: outdatedApps } = await supabase
    .from('apps')
    .select('source_name, slug')
    .eq('is_active', true)
    .lt('last_synced_at', oneDayAgo)
    .limit(100);

  console.log(`Found ${outdatedApps?.length || 0} apps to update`);
  
  // Run quick GitHub sync with fewer apps
  await syncEnhancedGitHubApps(10);
  await syncFDroidApps(50);
  
  console.log('✅ Quick sync completed!');
}

// Validate all download links
export async function validateDownloadLinks(): Promise<void> {
  console.log('🔍 Validating download links...\n');
  
  const { data: apps } = await supabase
    .from('apps')
    .select('id, slug, title, original_download_url')
    .eq('is_active', true);

  if (!apps) {
    console.log('No apps found');
    return;
  }

  let validCount = 0;
  let invalidCount = 0;
  const invalidApps: string[] = [];

  for (const app of apps) {
    try {
      const response = await fetch(app.original_download_url, {
        method: 'HEAD',
        redirect: 'follow'
      });

      if (response.ok) {
        validCount++;
        console.log(`✅ ${app.title}: Valid`);
      } else {
        invalidCount++;
        invalidApps.push(app.title);
        console.log(`❌ ${app.title}: Invalid (${response.status})`);
        
        // Mark as inactive
        await supabase
          .from('apps')
          .update({ is_active: false })
          .eq('id', app.id);
      }
    } catch (error) {
      invalidCount++;
      invalidApps.push(app.title);
      console.log(`❌ ${app.title}: Error - ${error}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Validation Summary:');
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  
  if (invalidApps.length > 0) {
    console.log('\n❌ Invalid apps:');
    invalidApps.forEach(app => console.log(`   - ${app}`));
  }
}

// Clean up duplicates
export async function cleanupDuplicates(): Promise<void> {
  console.log('🧹 Cleaning up duplicates...\n');
  
  const { data: apps } = await supabase
    .from('apps')
    .select('id, slug, source_url, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (!apps) {
    console.log('No apps found');
    return;
  }

  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const app of apps) {
    const key = `${app.slug}-${app.source_url}`;
    
    if (seen.has(key)) {
      duplicates.push(app.id);
      console.log(`🗑️  Removing duplicate: ${app.slug}`);
      
      await supabase
        .from('apps')
        .delete()
        .eq('id', app.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`\n✅ Removed ${duplicates.length} duplicates`);
}
