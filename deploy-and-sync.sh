#!/bin/bash

# 🚀 Auto Download Center - Deploy and Sync Script
# This script will deploy your app and trigger the initial bulk sync

set -e

echo "============================================================"
echo "🚀 AUTO DOWNLOAD CENTER - DEPLOY & SYNC"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Committing changes...${NC}"
git add .
git commit -m "feat: implement bulk sync system with 140+ queries and multi-source support" || echo "No changes to commit"

echo ""
echo -e "${BLUE}🚀 Step 2: Pushing to repository...${NC}"
git push

echo ""
echo -e "${BLUE}⏳ Step 3: Waiting for Vercel deployment (60 seconds)...${NC}"
echo "   Vercel is building and deploying your app..."
sleep 60

echo ""
echo -e "${GREEN}✅ Deployment should be complete!${NC}"
echo ""

# Step 4: Ask for domain and secret
echo -e "${YELLOW}📝 Please provide the following information:${NC}"
echo ""
read -p "Enter your Vercel domain (e.g., your-app.vercel.app): " DOMAIN
read -p "Enter your CRON_SECRET: " CRON_SECRET

echo ""
echo -e "${BLUE}🔍 Step 4: Checking API status...${NC}"
STATUS_RESPONSE=$(curl -s "https://${DOMAIN}/api/status" || echo "error")

if [[ $STATUS_RESPONSE == *"error"* ]] || [[ -z $STATUS_RESPONSE ]]; then
    echo -e "${RED}❌ Cannot reach API. Please check:${NC}"
    echo "   1. Domain is correct"
    echo "   2. Deployment is complete"
    echo "   3. Website is accessible"
    exit 1
fi

echo -e "${GREEN}✅ API is reachable${NC}"
echo ""

# Parse current app count
CURRENT_APPS=$(echo $STATUS_RESPONSE | grep -o '"totalApps":[0-9]*' | grep -o '[0-9]*' || echo "unknown")
echo "📊 Current database: ${CURRENT_APPS} apps"
echo ""

# Step 5: Trigger initial sync
echo -e "${BLUE}🚀 Step 5: Triggering initial bulk sync...${NC}"
echo "   This will take 15-30 minutes to complete"
echo "   You can monitor progress in Vercel logs"
echo ""

SYNC_RESPONSE=$(curl -s -X POST "https://${DOMAIN}/api/initial-sync" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json")

if [[ $SYNC_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✅ Initial sync triggered successfully!${NC}"
    echo ""
    echo "📊 Sync Details:"
    echo "$SYNC_RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//'
    echo ""
else
    echo -e "${YELLOW}⚠️  Sync response:${NC}"
    echo "$SYNC_RESPONSE"
    echo ""
fi

# Step 6: Instructions
echo ""
echo "============================================================"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Monitor sync progress:"
echo "   → Vercel Dashboard → Your Project → Logs → Functions"
echo ""
echo "2. Check status after 20-30 minutes:"
echo "   curl https://${DOMAIN}/api/status"
echo ""
echo "3. View your website:"
echo "   https://${DOMAIN}"
echo ""
echo "4. Expected results:"
echo "   ✅ Total apps: 2500-3500+"
echo "   ✅ Sources: 2 (GitHub + F-Droid)"
echo "   ✅ Categories: 15+ populated"
echo "   ✅ All pages working"
echo ""
echo "5. Automated maintenance:"
echo "   ✅ Daily sync: 2 AM UTC (automatic)"
echo "   ✅ Weekly validation: Sunday 3 AM UTC (automatic)"
echo "   ✅ Monthly cleanup: 1st of month 4 AM UTC (automatic)"
echo ""
echo "============================================================"
echo -e "${GREEN}🎉 Your app is now running on full auto-pilot!${NC}"
echo "============================================================"
