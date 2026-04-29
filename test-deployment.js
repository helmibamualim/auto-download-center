#!/usr/bin/env node

const https = require('https');

const SITE_URL = 'https://auto-download-center.vercel.app';

console.log('🧪 Testing Auto Download Center Deployment\n');

// Test 1: Homepage
console.log('1️⃣ Testing Homepage...');
https.get(SITE_URL, (res) => {
  console.log(`   Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('   ✅ Homepage is working!\n');
  } else {
    console.log('   ❌ Homepage error\n');
  }
}).on('error', (err) => {
  console.log('   ❌ Error:', err.message, '\n');
});

// Test 2: API Endpoint
setTimeout(() => {
  console.log('2️⃣ Testing API Endpoint...');
  https.get(`${SITE_URL}/api/cron/sync`, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('   Response:', json);
        if (res.statusCode === 200) {
          console.log('   ✅ API is working!\n');
        } else {
          console.log('   ⚠️ API returned non-200 status\n');
        }
      } catch (e) {
        console.log('   Response:', data);
        console.log('   ⚠️ Non-JSON response\n');
      }
    });
  }).on('error', (err) => {
    console.log('   ❌ Error:', err.message, '\n');
  });
}, 2000);

// Test 3: Apps Page
setTimeout(() => {
  console.log('3️⃣ Testing Apps Page...');
  https.get(`${SITE_URL}/apps`, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('   ✅ Apps page is working!\n');
    } else {
      console.log('   ❌ Apps page error\n');
    }
  }).on('error', (err) => {
    console.log('   ❌ Error:', err.message, '\n');
  });
}, 4000);

// Test 4: Sitemap
setTimeout(() => {
  console.log('4️⃣ Testing Sitemap...');
  https.get(`${SITE_URL}/sitemap.xml`, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('   ✅ Sitemap is working!\n');
    } else {
      console.log('   ❌ Sitemap error\n');
    }
  }).on('error', (err) => {
    console.log('   ❌ Error:', err.message, '\n');
  });
}, 6000);

setTimeout(() => {
  console.log('✅ Testing completed!\n');
  console.log('📋 Next Steps:');
  console.log('1. Setup Supabase database using database.sql');
  console.log('2. Run initial sync: npm run sync');
  console.log('3. Check website: https://auto-download-center.vercel.app');
}, 8000);