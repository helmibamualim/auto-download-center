#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Auto Download Monetized Center - One Click Deploy');
console.log('=====================================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: Please run this script from the project root directory');
    process.exit(1);
}

try {
    console.log('📦 Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    
    console.log('\n🚀 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('\n✅ Deployment completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set environment variables in Vercel dashboard');
    console.log('2. Setup Supabase database using database.sql');
    console.log('3. Run initial sync: npm run sync');
    console.log('\n🎉 Your site is now live!');
    
} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have Node.js installed');
    console.log('2. Run: npm install');
    console.log('3. Try again with: node one-click-deploy.js');
}