#!/usr/bin/env node

import { runFullSync, runQuickSync, validateDownloadLinks, cleanupDuplicates } from '../src/lib/sync/sync-orchestrator.js';

const command = process.argv[2] || 'full';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Auto Download Center - Sync Manager                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

async function main() {
  try {
    switch (command) {
      case 'full':
        console.log('Running FULL sync (all sources)...\n');
        await runFullSync();
        break;
        
      case 'quick':
        console.log('Running QUICK sync (updates only)...\n');
        await runQuickSync();
        break;
        
      case 'validate':
        console.log('Validating download links...\n');
        await validateDownloadLinks();
        break;
        
      case 'cleanup':
        console.log('Cleaning up duplicates...\n');
        await cleanupDuplicates();
        break;
        
      case 'help':
      default:
        console.log(`
Usage: npm run sync [command]

Commands:
  full      - Run full sync from all sources (GitHub, F-Droid)
  quick     - Run quick sync (only updates)
  validate  - Validate all download links
  cleanup   - Remove duplicate entries
  help      - Show this help message

Examples:
  npm run sync full
  npm run sync quick
  npm run sync validate
  npm run sync cleanup
        `);
        break;
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
