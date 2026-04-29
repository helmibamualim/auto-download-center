import { supabase } from '../supabase.js';
import { createSlug, isValidDownloadUrl, isLegalSoftware, extractFileType, getPlatformFromFileType } from '../utils.js';
import { createSafelinkUShortlinkWithRateLimit } from './safelinku.js';

interface SourceForgeProject {
  name: string;
  summary: string;
  description: string;
  homepage: string;
  download_url: string;
  categories: {
    topic: Array<{
      fullname: string;
    }>;
  };
  os: Array<{
    fullname: string;
  }>;
  developers: Array<{
    name: string;
  }>;
}

// Popular SourceForge projects (since they don't have a good search API)
const POPULAR_SOURCEFORGE_PROJECTS = [
  'audacity',
  'filezilla',
  'vlc',
  'gimp',
  'notepadplusplus',
  'putty',
  'wireshark',
  'blender',
  'inkscape',
  'handbrake',
  'obs-studio',
  'krita',
  'libreoffice',
  'thunderbird',
  'firefox',
  'sevenzip',
  'winrar',
  'ccleaner',
  'malwarebytes',
  'avast'
];

export async function syncSourceForgeApps(): Promise<void> {
  console.log('Syncing SourceForge apps...');

  for (const projectName of POPULAR_SOURCEFORGE_PROJECTS) {
    try {
      // Get project info
      const projectResponse = await fetch(
        `https://sourceforge.net/rest/p/${projectName}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!projectResponse.ok) {
        console.log(`Project ${projectName} not found or error:`, projectResponse.status);
        continue;
      }

      const projectData = await projectResponse.json();
      const project: SourceForgeProject = projectData;

      if (!project.name || !isLegalSoftware(project.name, project.description || '')) {
        continue;
      }

      try {
        // Get latest files
        const filesResponse = await fetch(
          `https://sourceforge.net/rest/p/${projectName}/files`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!filesResponse.ok) {
          continue;
        }

        const filesData = await filesResponse.json();
        
        // Find downloadable files
        const files = filesData.ticket?.files || [];
        const downloadableFiles = files.filter((file: any) => 
          file.name && isValidDownloadUrl(file.name)
        );

        if (downloadableFiles.length === 0) {
          continue;
        }

        // Process the most recent file
        const latestFile = downloadableFiles[0];
        const fileType = extractFileType(latestFile.name);
        const platform = getPlatformFromFileType(fileType);
        const slug = createSlug(`${project.name}-${platform}`);

        // Check if app already exists
        const { data: existingApp } = await supabase
          .from('apps')
          .select('id, last_synced_at')
          .eq('slug', slug)
          .single();

        // Skip if recently synced (within 24 hours)
        if (existingApp) {
          const lastSynced = new Date(existingApp.last_synced_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            continue;
          }
        }

        const downloadUrl = `https://sourceforge.net/projects/${projectName}/files/${latestFile.name}/download`;
        
        // Create SafelinkU shortlink
        const safelinkUrl = await createSafelinkUShortlinkWithRateLimit(downloadUrl, slug);

        const category = getCategoryFromSourceForge(project.categories?.topic || []);
        const developer = project.developers?.[0]?.name || 'SourceForge Community';

        const appData = {
          title: project.name,
          slug,
          description: project.description || project.summary || '',
          short_description: (project.summary || project.description || '').substring(0, 150),
          category,
          platform,
          version: 'Latest',
          license: 'Various',
          developer,
          source_name: 'SourceForge',
          source_url: project.homepage || `https://sourceforge.net/projects/${projectName}/`,
          original_download_url: downloadUrl,
          safelinku_url: safelinkUrl,
          file_type: fileType,
          file_size: latestFile.size ? (latestFile.size / 1024 / 1024).toFixed(2) + ' MB' : null,
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
          
          console.log(`Updated: ${project.name} (${platform})`);
        } else {
          // Insert new app
          await supabase
            .from('apps')
            .insert(appData);
          
          console.log(`Added: ${project.name} (${platform})`);
        }
      } catch (error) {
        console.error(`Error processing files for ${projectName}:`, error);
      }
    } catch (error) {
      console.error(`Error processing SourceForge project ${projectName}:`, error);
    }
  }
}

function getCategoryFromSourceForge(topics: Array<{ fullname: string }>): string {
  const categoryMap: Record<string, string> = {
    'multimedia': 'Multimedia',
    'development': 'Developer Tools',
    'internet': 'Internet',
    'games': 'Games',
    'office': 'Productivity',
    'security': 'Security',
    'system': 'Utilities',
    'education': 'Education',
    'graphics': 'Design Tools'
  };

  for (const topic of topics) {
    const topicName = topic.fullname.toLowerCase();
    for (const [key, category] of Object.entries(categoryMap)) {
      if (topicName.includes(key)) {
        return category;
      }
    }
  }

  return 'Utilities';
}