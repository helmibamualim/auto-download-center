#!/bin/bash

echo "=========================================="
echo "Testing SafelinkU Implementation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check for direct download URLs in Astro files
echo "Test 1: Checking for direct download URLs..."
if grep -r "original_download_url" src/**/*.astro 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found direct download URLs in Astro files${NC}"
    echo "   Fix: Replace with /go/[slug]"
else
    echo -e "${GREEN}✅ PASS: No direct download URLs found${NC}"
fi
echo ""

# Test 2: Check if safelinku-handler.js exists
echo "Test 2: Checking for client-side handler..."
if [ -f "public/safelinku-handler.js" ]; then
    echo -e "${RED}❌ FAIL: Client-side handler still exists${NC}"
    echo "   Fix: Delete public/safelinku-handler.js"
else
    echo -e "${GREEN}✅ PASS: No client-side handler found${NC}"
fi
echo ""

# Test 3: Check if /go/[slug].ts exists
echo "Test 3: Checking backend endpoint..."
if [ -f "src/pages/go/[slug].ts" ]; then
    echo -e "${GREEN}✅ PASS: Backend endpoint exists${NC}"
else
    echo -e "${RED}❌ FAIL: Backend endpoint not found${NC}"
    echo "   Fix: Create src/pages/go/[slug].ts"
fi
echo ""

# Test 4: Check if AppCard uses /go/[slug]
echo "Test 4: Checking AppCard component..."
if grep -q "/go/\${app.slug}" src/components/AppCard.astro 2>/dev/null; then
    echo -e "${GREEN}✅ PASS: AppCard uses /go/[slug]${NC}"
else
    echo -e "${RED}❌ FAIL: AppCard doesn't use /go/[slug]${NC}"
    echo "   Fix: Update href in AppCard.astro"
fi
echo ""

# Test 5: Check if app detail page uses /go/[slug]
echo "Test 5: Checking app detail page..."
if grep -q "/go/\${app.slug}" src/pages/apps/\[slug\].astro 2>/dev/null; then
    echo -e "${GREEN}✅ PASS: App detail page uses /go/[slug]${NC}"
else
    echo -e "${RED}❌ FAIL: App detail page doesn't use /go/[slug]${NC}"
    echo "   Fix: Update href in apps/[slug].astro"
fi
echo ""

# Test 6: Check if SafelinkU library exists
echo "Test 6: Checking SafelinkU library..."
if [ -f "src/lib/sync/safelinku.ts" ]; then
    echo -e "${GREEN}✅ PASS: SafelinkU library exists${NC}"
else
    echo -e "${RED}❌ FAIL: SafelinkU library not found${NC}"
    echo "   Fix: Create src/lib/sync/safelinku.ts"
fi
echo ""

# Test 7: Check if test endpoint exists
echo "Test 7: Checking test endpoint..."
if [ -f "src/pages/api/test-safelinku.ts" ]; then
    echo -e "${GREEN}✅ PASS: Test endpoint exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARN: Test endpoint not found${NC}"
    echo "   Optional: Create src/pages/api/test-safelinku.ts"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Fix any failed tests above"
echo "2. Run: npm run build"
echo "3. Deploy: vercel --prod"
echo "4. Test: Visit /api/test-safelinku"
echo "5. Test: Click download button on homepage"
echo "6. Verify: Check Vercel logs for [SafelinkU DEBUG]"
echo ""
