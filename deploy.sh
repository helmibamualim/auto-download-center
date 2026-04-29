#!/bin/bash

echo "🚀 Auto Download Monetized Center - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "1. ✅ Supabase project created and database.sql executed"
echo "2. ✅ GitHub personal access token created"
echo "3. ✅ SafelinkU account created and API token obtained"
echo ""

read -p "Have you completed all the above steps? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete the setup steps first"
    exit 1
fi

echo ""
echo "🔧 Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "🚀 Starting deployment..."
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Run initial sync: npm run sync"
echo "3. Visit your deployed site"
echo ""
echo "🔗 Useful links:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo "- SafelinkU Dashboard: https://safelinku.com/dashboard"
echo ""
echo "🎉 Happy monetizing!"