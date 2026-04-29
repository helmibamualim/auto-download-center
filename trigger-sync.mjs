#!/usr/bin/env node

/**
 * Script to trigger initial bulk sync via API
 * This will populate the database with 2500-3500+ apps
 */

const VERCEL_URL = 'https://auto-download-center.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET || '';

if (!CRON_SECRET) {
  console.error('❌ Error: CRON_SECRET environment variable is required');
  console.error('Usage: CRON_SECRET=your-secret node trigger-sync.mjs');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║   🚀 TRIGGERING INITIAL BULK SYNC                             ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📍 Target: ${VERCEL_URL}/api/initial-sync`);
console.log('⏱️  Expected duration: 15-30 minutes');
console.log('📊 Expected result: 2,500-3,500+ apps');
console.log('');
console.log('🚀 Sending request...');
console.log('');

try {
  const response = await fetch(`${VERCEL_URL}/api/initial-sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Initial sync triggered successfully!');
    console.log('');
    console.log('📊 Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Monitor progress in Vercel logs:');
    console.log('   https://vercel.com/dashboard → Your Project → Logs');
    console.log('');
    console.log('2. Check status after 20-30 minutes:');
    console.log(`   curl ${VERCEL_URL}/api/status`);
    console.log('');
    console.log('3. Expected results:');
    console.log('   ✅ Total apps: 2,500-3,500+');
    console.log('   ✅ Sources: 2 (GitHub + F-Droid)');
    console.log('   ✅ Categories: 15+ populated');
    console.log('');
  } else {
    console.error('❌ Failed to trigger sync');
    console.error('Status:', response.status);
    console.error('Response:', JSON.stringify(data, null, 2));
    console.error('');
    console.error('Possible issues:');
    console.error('1. CRON_SECRET is incorrect');
    console.error('2. Vercel deployment not ready');
    console.error('3. API endpoint error');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error triggering sync:', error.message);
  console.error('');
  console.error('Please check:');
  console.error('1. Internet connection');
  console.error('2. Vercel URL is correct');
  console.error('3. CRON_SECRET is set');
  process.exit(1);
}
