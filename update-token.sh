#!/bin/bash

echo "=========================================="
echo "SafelinkU Token Update Script"
echo "=========================================="
echo ""
echo "Current issue: HTTP 403 Forbidden"
echo "This means the token is invalid or lacks permissions"
echo ""
echo "Steps to fix:"
echo "1. Login to https://safelinku.com"
echo "2. Go to API settings"
echo "3. Generate NEW API token"
echo "4. Copy the token"
echo "5. Run this script"
echo ""
echo "=========================================="
echo ""

# Remove old token
echo "Removing old token..."
vercel env rm SAFELINKU_API_TOKEN production

# Add new token
echo ""
echo "Please paste your NEW SafelinkU API token:"
vercel env add SAFELINKU_API_TOKEN production

# Redeploy
echo ""
echo "Redeploying to production..."
vercel --prod

echo ""
echo "=========================================="
echo "Done! Please test again:"
echo "https://auto-download-center.vercel.app/api/test-safelinku"
echo "=========================================="
