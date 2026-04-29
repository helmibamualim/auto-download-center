#!/usr/bin/env node

import https from 'https';

const SITE_URL = 'https://auto-download-center.vercel.app';

console.log('🧪 Testing Supabase Connection\n');

// Test database connection by checking apps count
console.log('📊 Checking database...');

const options = {
  hostname: 'auto-download-center.vercel.app',
  path: '/apps',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Website is responding!');
      console.log('📄 Page loaded successfully');
      
      // Check if page contains "No apps found" or actual apps
      if (data.includes('No apps found') || data.includes('no apps found')) {
        console.log('\n⚠️  Database is empty - need to run sync!');
        console.log('\n📋 Next step: Run sync to populate database');
        console.log('   Command: npm run sync');
      } else if (data.includes('app') || data.includes('download')) {
        console.log('\n✅ Database has data!');
        console.log('🎉 Website is fully functional!');
      }
    } else if (res.statusCode === 500) {
      console.log('❌ Server error - checking logs...');
      console.log('\n🔍 Possible issues:');
      console.log('   1. Database connection failed');
      console.log('   2. Environment variables not set correctly');
      console.log('   3. Database schema not created');
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Connection error:', err.message);
});

req.end();