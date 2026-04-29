# Monetization System Documentation

## Overview
Sistem monetisasi menggunakan SafelinkU API untuk semua link download dan source. Setiap klik akan melewati SafelinkU terlebih dahulu sebelum mengarah ke URL asli.

## How It Works

### 1. Download Flow (`/go/[slug]`)
```
User clicks "Download Now" 
  → /go/[slug]
  → Check if safelinku_url exists in database
  → If exists: Redirect to SafelinkU
  → If not exists: 
      → Create SafelinkU shortlink via API
      → Save to database
      → Redirect to SafelinkU
  → If API fails: Show error page with retry button
```

### 2. Source Link Flow (`/go/source/[slug]`)
```
User clicks "View Source"
  → /go/source/[slug]
  → Create SafelinkU shortlink for source_url
  → Redirect to SafelinkU
  → If API fails: Redirect directly to source
```

## Key Features

### ✅ Automatic SafelinkU Integration
- All download links automatically go through SafelinkU
- Source links also monetized through SafelinkU
- No direct links to GitHub/F-Droid/SourceForge

### ✅ Smart Caching
- SafelinkU URLs saved to database after first creation
- Subsequent clicks use cached URL (faster, no API calls)
- Reduces API usage and improves performance

### ✅ Rate Limiting
- Respects SafelinkU API limit: 60 requests/minute
- Automatic waiting when limit reached
- Prevents API errors from rate limiting

### ✅ Comprehensive Logging
- All requests logged with detailed information
- Easy debugging through Vercel logs
- Track API success/failure rates

### ✅ Error Handling
- User-friendly error pages
- Retry button for failed requests
- Fallback options when API unavailable

## API Integration

### SafelinkU API Details
```typescript
Endpoint: POST https://safelinku.com/api/v1/links
Headers:
  - Authorization: Bearer {SAFELINKU_API_TOKEN}
  - Content-Type: application/json
Body:
  {
    "url": "original_url",
    "alias": "optional-slug",
    "passcode": ""
  }
Response:
  {
    "url": "https://safelinku.com/xxx"
  }
```

### Error Codes
- **400**: Bad Request - Invalid request body
- **401**: Unauthorized - Invalid API token
- **429**: Rate Limit Exceeded - Too many requests

## Database Schema

### Apps Table
```sql
safelinku_url TEXT  -- Cached SafelinkU shortlink for download
```

## Files Modified

### Core Files
1. **`/src/pages/go/[slug].ts`**
   - Main download redirect endpoint
   - Handles SafelinkU creation and caching
   - Comprehensive logging and error handling

2. **`/src/pages/go/source/[slug].ts`** (NEW)
   - Source link redirect endpoint
   - Monetizes "View Source" button clicks
   - Creates SafelinkU links for source URLs

3. **`/src/lib/sync/safelinku.ts`**
   - SafelinkU API integration
   - Rate limiting implementation
   - Detailed logging for debugging

4. **`/src/pages/apps/[slug].astro`**
   - Updated "View Source" button to use `/go/source/[slug]`
   - All links now go through monetization

## Logging System

### Log Format
```
[/go/{slug}] Download request received
[/go/{slug}] Fetching app from database...
[/go/{slug}] App found: {title}
[/go/{slug}] Original URL: {url}
[/go/{slug}] Existing SafelinkU URL: {url or 'none'}
[/go/{slug}] ✅ Redirecting to existing SafelinkU URL: {url}
[/go/{slug}] 🔄 Creating new SafelinkU shortlink...
[SafelinkU] Creating shortlink for: {url}
[SafelinkU] Using alias: {alias}
[SafelinkU] Sending request to API...
[SafelinkU] Response status: {status}
[SafelinkU] Raw response: {response}
[SafelinkU] ✅ Shortlink created successfully: {url}
[/go/{slug}] ✅ SafelinkU URL saved to database
[/go/{slug}] ✅ Redirecting to SafelinkU: {url}
```

### Error Logs
```
[/go/{slug}] ❌ No original_download_url found for this app
[/go/{slug}] ❌ SafelinkU shortlink creation failed
[/go/{slug}] API Token present: {true/false}
[SafelinkU] ❌ API error response: {error}
[SafelinkU] ❌ Bad Request - Invalid request body
[SafelinkU] ❌ Unauthorized - Check your API token
[SafelinkU] ❌ Rate limit exceeded - 60 requests per minute
```

## Monitoring

### Check Logs in Vercel
1. Go to Vercel Dashboard
2. Select project: auto-download-center
3. Click "Logs" tab
4. Filter by function: `/go/[slug]` or `/go/source/[slug]`
5. Look for:
   - ✅ Success indicators
   - ❌ Error indicators
   - 🔄 Processing indicators
   - ⏳ Rate limit warnings

### Key Metrics to Monitor
- SafelinkU API success rate
- Rate limit hits per hour
- Average response time
- Error rate by type
- Cache hit rate (existing safelinku_url usage)

## Troubleshooting

### Issue: "Download Temporarily Unavailable"
**Possible Causes:**
1. SafelinkU API token invalid or expired
2. Rate limit exceeded (60/minute)
3. Network connectivity issues
4. SafelinkU API downtime

**Solutions:**
1. Check environment variable: `SAFELINKU_API_TOKEN`
2. Wait 1 minute if rate limited
3. Check Vercel logs for detailed error
4. User can click "Try Again" button

### Issue: Direct GitHub Links
**Cause:** Old cached pages or browser cache

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check deployment is latest version

### Issue: Rate Limit Errors
**Cause:** Too many requests in short time

**Solution:**
- Rate limiter automatically handles this
- Waits until rate limit window resets
- No manual intervention needed

## Testing

### Test Download Flow
1. Visit: `https://auto-download-center.vercel.app/apps/{any-slug}`
2. Click "Download Now"
3. Should redirect to SafelinkU page
4. Check Vercel logs for success messages

### Test Source Flow
1. Visit: `https://auto-download-center.vercel.app/apps/{any-slug}`
2. Click "View Source"
3. Should redirect to SafelinkU page
4. Check Vercel logs for success messages

### Test Error Handling
1. Temporarily set invalid API token
2. Try to download
3. Should show error page with retry button
4. Restore valid API token
5. Click retry - should work

## Revenue Optimization

### Best Practices
1. **Cache SafelinkU URLs**: Reduces API calls, improves speed
2. **Monitor Rate Limits**: Ensure no requests are lost
3. **User Experience**: Fast redirects = more clicks = more revenue
4. **Error Recovery**: Retry buttons give second chance for monetization

### Expected Behavior
- First click: Creates SafelinkU link (~1-2 seconds)
- Subsequent clicks: Instant redirect (cached)
- All downloads monetized: 100% coverage
- Source links monetized: Additional revenue stream

## Environment Variables

### Required
```env
SAFELINKU_API_TOKEN=your_api_token_here
```

### Verification
```bash
# Check if token is set in Vercel
vercel env ls

# Test API token locally
curl -X POST https://safelinku.com/api/v1/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","alias":"test","passcode":""}'
```

## Future Improvements

### Potential Enhancements
1. **Analytics Dashboard**: Track clicks, revenue, conversion rates
2. **A/B Testing**: Test different SafelinkU configurations
3. **Bulk Link Creation**: Pre-create links during sync
4. **Link Expiration**: Refresh old SafelinkU links periodically
5. **Custom Domains**: Use custom domain for SafelinkU links
6. **Geo-Targeting**: Different monetization by country

## Support

### Need Help?
1. Check Vercel logs first
2. Review this documentation
3. Test with curl commands
4. Contact SafelinkU support for API issues

### Common Questions

**Q: Why not direct links?**
A: Direct links = no monetization. SafelinkU = revenue.

**Q: Will this slow down downloads?**
A: First click: ~1-2 seconds. Subsequent: instant (cached).

**Q: What if SafelinkU is down?**
A: Error page shown with retry option. User can try again later.

**Q: Can users bypass SafelinkU?**
A: No. All download buttons go through `/go/[slug]` endpoint.

**Q: How much revenue can I expect?**
A: Depends on traffic and SafelinkU rates. Monitor your SafelinkU dashboard.

---

**Last Updated:** 2026-04-29
**Version:** 1.0.0
**Status:** ✅ Production Ready
