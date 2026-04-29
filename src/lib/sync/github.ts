import { supabase } from '../supabase.js';
import { createSlug, isValidDownloadUrl, isLegalSoftware, extractFileType, getPlatformFromFileType } from '../utils.js';
import { createSafelinkUShortlinkWithRateLimit } from './safelinku.js';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  license?: {
    name: string;
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

const GITHUB_TOPICS = [
  'android',
  'windows',
  'macos',
  'linux',
  'developer-tools',
  'productivity',
  'security',
  'ai-tools'
];

export async function syncGitHubApps(): Promise<void> {
  const githubToken = import.meta.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('GITHUB_TOKEN not found');
    return;
  }

  const headers = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  for (const topic of GITHUB_TOPICS) {
    try {
      console.log(`Syncing GitHub repositories for topic: ${topic}`);
      
      const reposResponse = await fetch(
        `https://api.github.com/search/repositories?q=topic:${topic}+stars:>100&sort=stars&order=desc&per_page=20`,
        { headers }
      );

      if (!reposResponse.ok) {
        console.error(`GitHub API error for topic ${topic}:`, reposResponse.status);
        continue;
      }

      const reposData = await reposResponse.json();
      const repos: GitHubRepo[] = reposData.items || [];

      for (const repo of repos) {
        if (!isLegalSoftware(repo.name, repo.description || '')) {
          continue;
        }

        try {
          // Get latest release
          const releaseResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/releases/latest`,
            { headers }
          );

          if (!releaseResponse.ok) {
            continue;
          }

          const release: GitHubRelease = await releaseResponse.json();
          
          // Process each asset
          for (const asset of release.assets) {
            if (!isValidDownloadUrl(asset.browser_download_url)) {
              continue;
            }

            const fileType = extractFileType(asset.name);
            const platform = getPlatformFromFileType(fileType);
            const slug = createSlug(`${repo.name}-${platform}`);

            // Check if app already exists
            const { data: existingApp } = await supabase
              .from('apps')
              .select('id, version, safelinku_url')
              .eq('slug', slug)
              .single();

            // Skip if same version already exists
            if (existingApp && existingApp.version === release.tag_name) {
              continue;
            }

            // Create SafelinkU shortlink
            const safelinkUrl = await createSafelinkUShortlinkWithRateLimit(
              asset.browser_download_url,
              slug
            );

            const appData = {
              title: repo.name,
              slug,
              description: repo.description || '',
              short_description: repo.description?.substring(0, 150) || '',
              category: getCategoryFromTopic(repo.topics),
              platform,
              version: release.tag_name,
              license: repo.license?.name || 'Unknown',
              developer: repo.owner.login,
              source_name: 'GitHub',
              source_url: repo.html_url,
              original_download_url: asset.browser_download_url,
              safelinku_url: safelinkUrl,
              file_type: fileType,
              file_size: (asset.size / 1024 / 1024).toFixed(2) + ' MB',
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
              
              console.log(`Updated: ${repo.name} (${platform})`);
            } else {
              // Insert new app
              await supabase
                .from('apps')
                .insert(appData);
              
              console.log(`Added: ${repo.name} (${platform})`);
            }
          }
        } catch (error) {
          console.error(`Error processing repo ${repo.full_name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error syncing GitHub topic ${topic}:`, error);
    }
  }
}

function getCategoryFromTopic(topics: string[]): string {
  const categoryMap: Record<string, string> = {
    'android': 'Android Apps',
    'windows': 'Windows Software',
    'macos': 'Mac Software',
    'linux': 'Linux Apps',
    'developer-tools': 'Developer Tools',
    'productivity': 'Productivity',
    'security': 'Security',
    'ai-tools': 'AI Tools',
    'design': 'Design Tools',
    'utility': 'Utilities',
    'education': 'Education',
    'internet': 'Internet',
    'multimedia': 'Multimedia'
  };

  for (const topic of topics) {
    if (categoryMap[topic]) {
      return categoryMap[topic];
    }
  }

  return 'Utilities';
}