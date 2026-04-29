#!/usr/bin/env node

// This file is now a wrapper that calls the TypeScript version
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const command = process.argv[2] || 'full';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Auto Download Center - Sync Manager                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

function runSync() {
  if (command === 'help') {
    console.log(`
Usage: npm run sync [command]

Commands:
  full      - Run full sync from all sources (GitHub, F-Droid)
  quick     - Run quick sync (only updates)
  validate  - Validate all download links
  cleanup   - Remove duplicate entries
  help      - Show this help message

Examples:
  npm run sync
  npm run sync:quick
  npm run sync:validate
  npm run sync:cleanup
    `);
    return;
  }

  // Run the TypeScript version using tsx
  const tsScript = join(rootDir, 'scripts', 'sync-runner.ts');
  const child = spawn('npx', ['tsx', tsScript, command], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error('\n❌ Failed to start sync:', error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

runSync();
