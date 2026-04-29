#!/usr/bin/env tsx

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
        console.log('🚀 Running FULL sync (all sources)...\n');
        await runFullSync();
        break;
        
      case 'quick':
        console.log('⚡ Running QUICK sync (updates only)...\n');
        await runQuickSync();
        break;
        
      case 'validate':
        console.log('🔍 Validating download links...\n');
        await validateDownloadLinks();
        break;
        
      case 'cleanup':
        console.log('🧹 Cleaning up duplicates...\n');
        await cleanupDuplicates();
        break;
        
      default:
        console.log(`
❌ Unknown command: ${command}

Usage: npm run sync [command]

Commands:
  full      - Run full sync from all sources (GitHub, F-Droid)
  quick     - Run quick sync (updates only)
  validate  - Validate all download links
  cleanup   - Remove duplicate entries

Examples:
  npm run sync
  npm run sync:quick
  npm run sync:validate
  npm run sync:cleanup
        `);
        process.exit(1);
    }
    
    console.log('\n✅ Sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
