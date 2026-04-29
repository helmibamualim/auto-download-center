#!/usr/bin/env node

import https from 'https';

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
        console.log('   Response:', data.substring(0, 100));
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

setTimeout(() => {
  console.log('✅ Testing completed!\n');
}, 6000);