#!/usr/bin/env node

import { syncGitHubApps } from '../src/lib/sync/github.js';
import { syncFDroidApps } from '../src/lib/sync/fdroid.js';
import { syncSourceForgeApps } from '../src/lib/sync/sourceforge.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 Starting sync process...\n');

  try {
    switch (command) {
      case 'github':
        console.log('📦 Syncing GitHub repositories...');
        await syncGitHubApps();
        console.log('✅ GitHub sync completed!\n');
        break;

      case 'fdroid':
        console.log('🤖 Syncing F-Droid apps...');
        await syncFDroidApps();
        console.log('✅ F-Droid sync completed!\n');
        break;

      case 'sourceforge':
        console.log('🔧 Syncing SourceForge projects...');
        await syncSourceForgeApps();
        console.log('✅ SourceForge sync completed!\n');
        break;

      case 'all':
      default:
        console.log('🔄 Running full sync (all sources)...\n');
        
        console.log('1/3 📦 Syncing GitHub repositories...');
        await syncGitHubApps();
        console.log('✅ GitHub sync completed!\n');

        console.log('2/3 🤖 Syncing F-Droid apps...');
        await syncFDroidApps();
        console.log('✅ F-Droid sync completed!\n');

        console.log('3/3 🔧 Syncing SourceForge projects...');
        await syncSourceForgeApps();
        console.log('✅ SourceForge sync completed!\n');

        console.log('🎉 Full sync completed successfully!');
        break;
    }
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Show usage if no valid command
if (process.argv.length < 3 || !['github', 'fdroid', 'sourceforge', 'all'].includes(process.argv[2])) {
  console.log(`
Usage: npm run sync [command]

Commands:
  all         Sync all sources (default)
  github      Sync GitHub repositories only
  fdroid      Sync F-Droid apps only
  sourceforge Sync SourceForge projects only

Examples:
  npm run sync
  npm run sync github
  npm run sync fdroid
  npm run sync sourceforge
`);
  process.exit(0);
}

main();