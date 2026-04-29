import { supabase } from '../supabase.js';
import { createSlug, isLegalSoftware } from '../utils.js';
import { createSafelinkUShortlinkWithRateLimit } from './safelinku.js';

interface FDroidApp {
  packageName: string;
  name: {
    'en-US': string;
  };
  summary: {
    'en-US': string;
  };
  description: {
    'en-US': string;
  };
  icon: {
    'en-US': {
      name: string;
    };
  };
  license: string;
  sourceCode: string;
  categories: string[];
  packages: Array<{
    versionName: string;
    versionCode: number;
    size: number;
    apkName: string;
  }>;
}

interface FDroidIndex {
  apps: Record<string, FDroidApp>;
}

export async function syncFDroidApps(maxApps: number = 100): Promise<void> {
  try {
    console.log(`Syncing F-Droid apps (max: ${maxApps})...`);
    
    const response = await fetch('https://f-droid.org/repo/index-v2.json');
    
    if (!response.ok) {
      console.error('F-Droid API error:', response.status);
      return;
    }

    const data: FDroidIndex = await response.json();
    const apps = Object.values(data.apps);

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const app of apps.slice(0, maxApps)) {
      try {
        const name = app.name?.['en-US'] || app.packageName;
        const description = app.description?.['en-US'] || '';
        const summary = app.summary?.['en-US'] || '';

        if (!isLegalSoftware(name, description)) {
          skipped++;
          continue;
        }

        if (!app.packages || app.packages.length === 0) {
          skipped++;
          continue;
        }

        // Get latest version
        const latestPackage = app.packages.sort((a, b) => b.versionCode - a.versionCode)[0];
        
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

        // Create SafelinkU shortlink (skip for now to speed up bulk sync)
        // const safelinkUrl = await createSafelinkUShortlinkWithRateLimit(downloadUrl, slug);

        const appData = {
          title: name,
          slug,
          description: description,
          short_description: summary.substring(0, 150),
          category: 'Android Apps',
          platform: 'Android',
          version: latestPackage.versionName,
          license: app.license || 'Unknown',
          developer: 'F-Droid Community',
          source_name: 'F-Droid',
          source_url: app.sourceCode || `https://f-droid.org/packages/${app.packageName}`,
          original_download_url: downloadUrl,
          // safelinku_url: safelinkUrl, // Disabled for bulk sync
          icon_url: app.icon?.['en-US']?.name ? 
            `https://f-droid.org/repo/icons-640/${app.icon['en-US'].name}` : null,
          file_type: 'apk',
          file_size: (latestPackage.size / 1024 / 1024).toFixed(2) + ' MB',
          is_active: true,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingApp) {
          // Update existing app
          await supabase
            .from('apps')
            .update(appData)
            .eq('id', existingApp.id);
          
          updated++;
          console.log(`Updated: ${name}`);
        } else {
          // Insert new app
          const { error } = await supabase
            .from('apps')
            .insert(appData);
          
          if (error) {
            console.error(`Error inserting ${name}:`, error.message);
            skipped++;
          } else {
            added++;
            console.log(`Added: ${name}`);
          }
        }
      } catch (error) {
        console.error(`Error processing F-Droid app ${app.packageName}:`, error);
        skipped++;
      }
    }

    console.log(`\n📊 F-Droid Summary: ✨ ${added} added, ✅ ${updated} updated, ⏭️  ${skipped} skipped`);
  } catch (error) {
    console.error('Error syncing F-Droid apps:', error);
  }
}