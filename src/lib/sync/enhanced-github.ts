import { supabase } from '../supabase.js';
import { createSlug, isValidDownloadUrl, isLegalSoftware, extractFileType, getPlatformFromFileType } from '../utils.js';

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

// Expanded topics for better coverage - OPTIMIZED FOR BULK SYNC
const GITHUB_SEARCH_QUERIES = [
  // Mobile - Lower threshold for more apps
  'topic:android stars:>50 language:kotlin',
  'topic:android stars:>50 language:java',
  'topic:android stars:>30 archived:false',
  'topic:android-app stars:>50',
  'topic:ios stars:>50',
  'topic:flutter stars:>50',
  'topic:react-native stars:>50',
  'topic:mobile stars:>50',
  'topic:mobile-app stars:>50',
  
  // Desktop - More variations
  'topic:windows stars:>50',
  'topic:windows-app stars:>50',
  'topic:macos stars:>50',
  'topic:macos-app stars:>50',
  'topic:linux stars:>50',
  'topic:linux-app stars:>50',
  'topic:electron stars:>50',
  'topic:desktop-app stars:>50',
  'topic:desktop stars:>50',
  'topic:cross-platform stars:>50',
  'topic:tauri stars:>30',
  
  // Developer Tools - Expanded
  'topic:developer-tools stars:>50',
  'topic:cli stars:>50',
  'topic:cli-app stars:>50',
  'topic:ide stars:>50',
  'topic:code-editor stars:>50',
  'topic:terminal stars:>50',
  'topic:devops stars:>50',
  'topic:docker stars:>50',
  'topic:kubernetes stars:>50',
  'topic:git stars:>50',
  'topic:git-tool stars:>50',
  'topic:vscode-extension stars:>50',
  'topic:development stars:>50',
  'topic:build-tool stars:>50',
  'topic:package-manager stars:>50',
  
  // AI & ML - More queries
  'topic:artificial-intelligence stars:>50',
  'topic:machine-learning stars:>50',
  'topic:deep-learning stars:>50',
  'topic:chatbot stars:>50',
  'topic:llm stars:>30',
  'topic:ai-assistant stars:>30',
  'topic:ai stars:>50',
  'topic:ai-tool stars:>30',
  'topic:neural-network stars:>50',
  'topic:gpt stars:>30',
  'topic:openai stars:>30',
  
  // Productivity - Expanded
  'topic:productivity stars:>50',
  'topic:productivity-app stars:>50',
  'topic:note-taking stars:>50',
  'topic:task-management stars:>50',
  'topic:calendar stars:>50',
  'topic:time-tracking stars:>50',
  'topic:todo stars:>50',
  'topic:todo-app stars:>50',
  'topic:notes stars:>50',
  'topic:note-app stars:>50',
  'topic:markdown-editor stars:>50',
  
  // Security & Privacy - More
  'topic:security stars:>50',
  'topic:security-tools stars:>50',
  'topic:privacy stars:>50',
  'topic:encryption stars:>50',
  'topic:vpn stars:>50',
  'topic:password-manager stars:>50',
  'topic:cybersecurity stars:>50',
  'topic:authentication stars:>50',
  'topic:2fa stars:>30',
  
  // Design & Multimedia - Expanded
  'topic:design-tools stars:>50',
  'topic:design stars:>50',
  'topic:image-processing stars:>50',
  'topic:image-editor stars:>50',
  'topic:video-editor stars:>50',
  'topic:audio stars:>50',
  'topic:audio-editor stars:>50',
  'topic:graphics stars:>50',
  'topic:photo stars:>50',
  'topic:photo-editor stars:>50',
  'topic:video stars:>50',
  'topic:music stars:>50',
  'topic:music-player stars:>50',
  
  // Internet & Communication
  'topic:browser stars:>50',
  'topic:web-browser stars:>50',
  'topic:email stars:>50',
  'topic:email-client stars:>50',
  'topic:messaging stars:>50',
  'topic:social-media stars:>50',
  'topic:rss stars:>50',
  'topic:rss-reader stars:>50',
  'topic:chat stars:>50',
  'topic:chat-app stars:>50',
  'topic:communication stars:>50',
  'topic:download-manager stars:>50',
  
  // Utilities - More
  'topic:file-manager stars:>50',
  'topic:backup stars:>50',
  'topic:system-monitor stars:>50',
  'topic:automation stars:>50',
  'topic:utility stars:>50',
  'topic:utilities stars:>50',
  'topic:tools stars:>50',
  'topic:system-tools stars:>50',
  'topic:file-sharing stars:>50',
  
  // Education
  'topic:education stars:>50',
  'topic:learning stars:>50',
  'topic:tutorial stars:>50',
  'topic:course stars:>50',
  'topic:e-learning stars:>50',
  
  // Games - More
  'topic:game stars:>50',
  'topic:game-engine stars:>50',
  'topic:gaming stars:>50',
  'topic:games stars:>50',
  'topic:gamedev stars:>50',
  
  // Office & Documents
  'topic:office stars:>50',
  'topic:pdf stars:>50',
  'topic:pdf-reader stars:>50',
  'topic:markdown stars:>50',
  'topic:spreadsheet stars:>50',
  'topic:document stars:>50',
  'topic:text-editor stars:>50',
  'topic:editor stars:>50',
  
  // Additional categories
  'topic:blockchain stars:>50',
  'topic:cryptocurrency stars:>50',
  'topic:bitcoin stars:>50',
  'topic:database stars:>50',
  'topic:database-tool stars:>50',
  'topic:api stars:>50',
  'topic:web stars:>50',
  'topic:server stars:>50',
  'topic:monitoring stars:>50',
  'topic:testing stars:>50',
  'topic:test stars:>50',
  'topic:framework stars:>50',
  'topic:library stars:>50',
  'topic:data-science stars:>50',
  'topic:analytics stars:>50',
  'topic:visualization stars:>50',
  'topic:network stars:>50',
  'topic:proxy stars:>50',
  'topic:reverse-proxy stars:>50',
  'topic:container stars:>50',
  'topic:virtualization stars:>50',
];

export async function syncEnhancedGitHubApps(maxAppsPerQuery = 30): Promise<void> {
  const githubToken = import.meta.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN not found');
    return;
  }

  const headers = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Auto-Download-Center'
  };

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  console.log(`🚀 Starting enhanced GitHub sync with ${GITHUB_SEARCH_QUERIES.length} queries...`);

  for (const query of GITHUB_SEARCH_QUERIES) {
    try {
      console.log(`\n🔍 Searching: ${query}`);
      
      // Add delay to respect rate limits
      await delay(2000);
      
      const reposResponse = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${maxAppsPerQuery}`,
        { headers }
      );

      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          console.error('⚠️  Rate limit exceeded. Waiting 60 seconds...');
          await delay(60000);
          continue;
        }
        console.error(`❌ GitHub API error: ${reposResponse.status}`);
        continue;
      }

      const reposData = await reposResponse.json();
      const repos: GitHubRepo[] = reposData.items || [];

      console.log(`   Found ${repos.length} repositories`);

      for (const repo of repos) {
        // Skip if not legal software
        if (!isLegalSoftware(repo.name, repo.description || '')) {
          totalSkipped++;
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
            totalSkipped++;
            continue;
          }

          const release: GitHubRelease = await releaseResponse.json();
          
          // Skip if no assets
          if (!release.assets || release.assets.length === 0) {
            totalSkipped++;
            continue;
          }

          // Process each asset
          for (const asset of release.assets) {
            // Validate download URL
            if (!isValidDownloadUrl(asset.browser_download_url)) {
              continue;
            }

            // Skip source code archives
            if (asset.name.includes('source') || asset.name.endsWith('.tar.gz') && asset.size < 1000000) {
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
              totalSkipped++;
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
              
              totalUpdated++;
              console.log(`   ✅ Updated: ${repo.name} (${platform}) v${release.tag_name}`);
            } else {
              // Insert new app
              const { error } = await supabase
                .from('apps')
                .insert(appData);
              
              if (error) {
                console.error(`   ❌ Error inserting ${repo.name}:`, error.message);
                totalSkipped++;
              } else {
                totalAdded++;
                console.log(`   ✨ Added: ${repo.name} (${platform}) v${release.tag_name}`);
              }
            }
          }
        } catch (error) {
          console.error(`   ❌ Error processing ${repo.full_name}:`, error);
          totalSkipped++;
        }
      }
    } catch (error) {
      console.error(`❌ Error with query "${query}":`, error);
    }
  }

  console.log(`\n📊 Sync Summary:`);
  console.log(`   ✨ Added: ${totalAdded}`);
  console.log(`   ✅ Updated: ${totalUpdated}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log(`   📦 Total processed: ${totalAdded + totalUpdated + totalSkipped}`);
}

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
