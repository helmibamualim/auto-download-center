import { supabase } from '../supabase.js';
import { createSlug, isValidDownloadUrl, isLegalSoftware, extractFileType, getPlatformFromFileType } from '../utils.js';
import { GITHUB_SEARCH_QUERIES } from './enhanced-github.js';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  license?: {
    name: string;
    spdx_id: string;
  };
  owner: {
    login: string;
  };
  topics: string[];
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
    content_type: string;
  }>;
}

interface BatchResult {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
}

// Sync specific GitHub queries (batch processing)
export async function syncGitHubBatch(
  startQueryIndex: number,
  numQueries: number,
  appsPerQuery: number
): Promise<BatchResult> {
  const githubToken = import.meta.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN not found');
    throw new Error('GITHUB_TOKEN not configured');
  }

  const headers = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Auto-Download-Center'
  };

  const result: BatchResult = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };

  const endQueryIndex = Math.min(startQueryIndex + numQueries, GITHUB_SEARCH_QUERIES.length);
  const queriesToProcess = GITHUB_SEARCH_QUERIES.slice(startQueryIndex, endQueryIndex);

  console.log(`📦 Processing ${queriesToProcess.length} GitHub queries (index ${startQueryIndex} to ${endQueryIndex - 1})`);

  for (const query of queriesToProcess) {
    try {
      console.log(`🔍 Searching: ${query}`);
      
      // Add delay to respect rate limits
      await delay(2000);
      
      const reposResponse = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${appsPerQuery}`,
        { headers }
      );

      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          console.error('⚠️  Rate limit exceeded. Skipping this batch...');
          result.failed++;
          continue;
        }
        console.error(`❌ GitHub API error: ${reposResponse.status}`);
        result.failed++;
        continue;
      }

      const reposData = await reposResponse.json();
      const repos: GitHubRepo[] = reposData.items || [];

      console.log(`   Found ${repos.length} repositories`);

      for (const repo of repos) {
        result.processed++;

        // Skip if not legal software
        if (!isLegalSoftware(repo.name, repo.description || '')) {
          result.skipped++;
          continue;
        }

        try {
          // Add delay between requests
          await delay(1000);
          
          // Get latest release
          const releaseResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/releases/latest`,
            { headers }
          );

          if (!releaseResponse.ok) {
            result.skipped++;
            continue;
          }

          const release: GitHubRelease = await releaseResponse.json();
          
          // Skip if no assets
          if (!release.assets || release.assets.length === 0) {
            result.skipped++;
            continue;
          }

          // Process each asset
          for (const asset of release.assets) {
            // Validate download URL
            if (!isValidDownloadUrl(asset.browser_download_url)) {
              continue;
            }

            // Skip source code archives
            if (asset.name.includes('source') || (asset.name.endsWith('.tar.gz') && asset.size < 1000000)) {
              continue;
            }

            const fileType = extractFileType(asset.name);
            
            // Skip if not a valid installable file
            if (!isInstallableFile(fileType)) {
              continue;
            }

            const platform = getPlatformFromFileType(fileType);
            const slug = createSlug(`${repo.name}-${platform}`);

            // Check if app already exists
            const { data: existingApp } = await supabase
              .from('apps')
              .select('id, version')
              .eq('slug', slug)
              .single();

            // Skip if same version already exists
            if (existingApp && existingApp.version === release.tag_name) {
              result.skipped++;
              continue;
            }

            // Determine category
            const category = getCategoryFromRepo(repo);

            const appData = {
              title: repo.name,
              slug,
              description: repo.description || `${repo.name} - Open source software from GitHub`,
              short_description: (repo.description || '').substring(0, 150) || `${repo.name} application`,
              category,
              platform,
              version: release.tag_name,
              license: repo.license?.name || repo.license?.spdx_id || 'Unknown',
              developer: repo.owner.login,
              source_name: 'GitHub',
              source_url: repo.html_url,
              original_download_url: asset.browser_download_url,
              file_type: fileType,
              file_size: formatFileSize(asset.size),
              stars: repo.stargazers_count,
              changelog: release.body || '',
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
              
              result.updated++;
              console.log(`   ✅ Updated: ${repo.name} (${platform}) v${release.tag_name}`);
            } else {
              // Insert new app
              const { error } = await supabase
                .from('apps')
                .insert(appData);
              
              if (error) {
                console.error(`   ❌ Error inserting ${repo.name}:`, error.message);
                result.failed++;
              } else {
                result.inserted++;
                console.log(`   ✨ Added: ${repo.name} (${platform}) v${release.tag_name}`);
              }
            }
          }
        } catch (error) {
          console.error(`   ❌ Error processing ${repo.full_name}:`, error);
          result.failed++;
        }
      }
    } catch (error) {
      console.error(`❌ Error with query "${query}":`, error);
      result.failed++;
    }
  }

  console.log(`\n📊 Batch Summary: ✨ ${result.inserted} added, ✅ ${result.updated} updated, ⏭️  ${result.skipped} skipped, ❌ ${result.failed} failed`);

  return result;
}

// Sync F-Droid batch
export async function syncFDroidBatch(
  startIndex: number,
  batchSize: number
): Promise<BatchResult> {
  const result: BatchResult = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    console.log(`📱 Syncing F-Droid apps (index ${startIndex} to ${startIndex + batchSize - 1})...`);
    
    const response = await fetch('https://f-droid.org/repo/index-v2.json');
    
    if (!response.ok) {
      console.error('F-Droid API error:', response.status);
      throw new Error(`F-Droid API error: ${response.status}`);
    }

    const data: any = await response.json();
    const allApps = Object.values(data.apps || {});
    const apps = allApps.slice(startIndex, startIndex + batchSize);

    console.log(`   Processing ${apps.length} apps from F-Droid`);

    for (const app of apps) {
      result.processed++;

      try {
        const appData: any = app;
        const name = appData.name?.['en-US'] || appData.packageName;
        const description = appData.description?.['en-US'] || '';
        const summary = appData.summary?.['en-US'] || '';

        if (!appData.packages || appData.packages.length === 0) {
          result.skipped++;
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
          result.skipped++;
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
          
          result.updated++;
          console.log(`   ✅ Updated: ${name}`);
        } else {
          const { error } = await supabase
            .from('apps')
            .insert(appRecord);
          
          if (error) {
            console.error(`   ❌ Error: ${name}`, error.message);
            result.failed++;
          } else {
            result.inserted++;
            console.log(`   ✨ Added: ${name}`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error processing app:`, error);
        result.failed++;
      }
    }

    console.log(`\n📊 F-Droid Batch Summary: ✨ ${result.inserted} added, ✅ ${result.updated} updated, ⏭️  ${result.skipped} skipped, ❌ ${result.failed} failed`);
  } catch (error) {
    console.error('Error syncing F-Droid batch:', error);
    throw error;
  }

  return result;
}

// Helper functions
function getCategoryFromRepo(repo: GitHubRepo): string {
  const topics = repo.topics || [];
  const description = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();
  
  // Category mapping with priority
  const categoryRules = [
    // Mobile
    { keywords: ['android', 'apk'], category: 'Android Apps' },
    { keywords: ['ios', 'iphone', 'ipad'], category: 'iOS Apps' },
    
    // Desktop OS
    { keywords: ['windows', 'win32', 'win64'], category: 'Windows Software' },
    { keywords: ['macos', 'osx', 'mac'], category: 'Mac Software' },
    { keywords: ['linux', 'ubuntu', 'debian'], category: 'Linux Apps' },
    
    // Development
    { keywords: ['developer', 'dev-tools', 'ide', 'code-editor', 'cli', 'terminal', 'devops'], category: 'Developer Tools' },
    
    // AI & ML
    { keywords: ['ai', 'artificial-intelligence', 'machine-learning', 'deep-learning', 'llm', 'chatbot', 'gpt'], category: 'AI Tools' },
    
    // Productivity
    { keywords: ['productivity', 'note', 'task', 'todo', 'calendar', 'time-tracking'], category: 'Productivity' },
    
    // Security
    { keywords: ['security', 'privacy', 'encryption', 'vpn', 'password'], category: 'Security' },
    
    // Design & Multimedia
    { keywords: ['design', 'graphics', 'image', 'photo', 'video', 'audio', 'music'], category: 'Design Tools' },
    { keywords: ['multimedia', 'media-player'], category: 'Multimedia' },
    
    // Internet
    { keywords: ['browser', 'web', 'internet', 'download-manager'], category: 'Internet' },
    { keywords: ['email', 'mail', 'messaging', 'chat'], category: 'Communication' },
    
    // Utilities
    { keywords: ['file-manager', 'backup', 'system', 'utility', 'automation'], category: 'Utilities' },
    
    // Office
    { keywords: ['office', 'document', 'pdf', 'spreadsheet', 'presentation'], category: 'Office Tools' },
    
    // Education
    { keywords: ['education', 'learning', 'tutorial', 'course'], category: 'Education' },
    
    // Games
    { keywords: ['game', 'gaming'], category: 'Games' },
    
    // Browser Extensions
    { keywords: ['extension', 'addon', 'plugin', 'chrome', 'firefox'], category: 'Browser Extensions' },
  ];

  // Check topics first
  for (const rule of categoryRules) {
    for (const keyword of rule.keywords) {
      if (topics.includes(keyword)) {
        return rule.category;
      }
    }
  }

  // Check description and name
  for (const rule of categoryRules) {
    for (const keyword of rule.keywords) {
      if (description.includes(keyword) || name.includes(keyword)) {
        return rule.category;
      }
    }
  }

  return 'Utilities';
}

function isInstallableFile(fileType: string): boolean {
  const installableTypes = [
    'apk', 'exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 
    'appimage', 'snap', 'flatpak', 'zip', 'tar.gz', 
    'tar.xz', 'tar.bz2', '7z', 'rar', 'app', 'ipa'
  ];
  
  return installableTypes.includes(fileType.toLowerCase());
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
