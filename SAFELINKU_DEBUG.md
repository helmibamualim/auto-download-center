# SafelinkU API Debugging Guide

## Overview
Panduan lengkap untuk debugging masalah SafelinkU API integration.

## Latest Changes (2026-04-29)

### ✅ Enhanced Logging
- **Super detailed logging** untuk setiap API call
- Log semua request parameters (URL, headers, body)
- Log semua response details (status, headers, body)
- Log parsing response dengan berbagai field possibilities

### ✅ Fallback System
- **Jika SafelinkU gagal**: Redirect langsung ke original URL
- **Download tidak akan gagal**: User tetap bisa download
- **Monetization optional**: Jika API berhasil = monetized, jika gagal = direct link

### ✅ Response Parsing
- Support multiple response formats:
  - `{ "url": "..." }`
  - `{ "shortlink": "..." }`
  - `{ "short_url": "..." }`
  - `{ "link": "..." }`
  - `{ "data": { "url": "..." } }`
  - `{ "data": { "shortlink": "..." } }`
  - `{ "data": { "short_url": "..." } }`

## How to Debug

### Step 1: Test Download
1. Visit: https://auto-download-center.vercel.app/apps/quotio-cross-platform
2. Click "Download Now"
3. Observe behavior:
   - ✅ **Success**: Redirects to SafelinkU page
   - ⚠️ **Fallback**: Redirects directly to GitHub (SafelinkU failed)

### Step 2: Check Vercel Logs
1. Go to: https://vercel.com/helmi-mubaraks-projects/auto-download-center
2. Click "Logs" tab
3. Filter by: `/go/`
4. Look for debug output

### Step 3: Analyze Debug Output

#### Expected Success Log:
```
================================================================================
[SafelinkU DEBUG] Starting SafelinkU API call
================================================================================
[SafelinkU DEBUG] ✅ API Token found
[SafelinkU DEBUG] - Token length: 64
[SafelinkU DEBUG] - Token prefix: sk_live_abc...
[SafelinkU DEBUG] Request parameters:
[SafelinkU DEBUG] - Original URL: https://github.com/...
[SafelinkU DEBUG] - Alias: quotio-cross-platform
[SafelinkU DEBUG] Request details:
[SafelinkU DEBUG] - Method: POST
[SafelinkU DEBUG] - Endpoint: https://safelinku.com/api/v1/links
[SafelinkU DEBUG] - Headers:
[SafelinkU DEBUG]   * Authorization: Bearer sk_live_abc...
[SafelinkU DEBUG]   * Content-Type: application/json
[SafelinkU DEBUG] - Body: {
  "url": "https://github.com/...",
  "alias": "quotio-cross-platform",
  "passcode": ""
}
[SafelinkU DEBUG] Sending request...
[SafelinkU DEBUG] Response received in 234 ms
[SafelinkU DEBUG] Response status: 200 OK
[SafelinkU DEBUG] Response headers:
[SafelinkU DEBUG]   * content-type: application/json
[SafelinkU DEBUG]   * ...
[SafelinkU DEBUG] Raw response body:
[SafelinkU DEBUG] {"url":"https://safelinku.com/xxx"}
[SafelinkU DEBUG] ✅ JSON parsed successfully
[SafelinkU DEBUG] Response structure: {
  "url": "https://safelinku.com/xxx"
}
[SafelinkU DEBUG] ✅ Found shortlink in "url" field
[SafelinkU DEBUG] ✅ Shortlink created successfully: https://safelinku.com/xxx
================================================================================
[/go/quotio-cross-platform] ✅ SafelinkU URL saved to database
[/go/quotio-cross-platform] ✅ Redirecting to SafelinkU: https://safelinku.com/xxx
```

#### Expected Error Log (Token Invalid):
```
================================================================================
[SafelinkU DEBUG] Starting SafelinkU API call
================================================================================
[SafelinkU DEBUG] ✅ API Token found
[SafelinkU DEBUG] - Token length: 32
[SafelinkU DEBUG] - Token prefix: invalid_tok...
[SafelinkU DEBUG] Request parameters:
[SafelinkU DEBUG] - Original URL: https://github.com/...
[SafelinkU DEBUG] - Alias: quotio-cross-platform
[SafelinkU DEBUG] Sending request...
[SafelinkU DEBUG] Response received in 123 ms
[SafelinkU DEBUG] Response status: 401 Unauthorized
[SafelinkU DEBUG] Raw response body:
[SafelinkU DEBUG] {"error":"Invalid API token"}
[SafelinkU DEBUG] ❌ API returned error status
[SafelinkU DEBUG] Status code: 401
[SafelinkU DEBUG] ❌ 401 Unauthorized - API token is invalid or expired
[SafelinkU DEBUG] Please check your SAFELINKU_API_TOKEN in Vercel environment variables
================================================================================
[/go/quotio-cross-platform] ❌ SafelinkU shortlink creation failed
[/go/quotio-cross-platform] ⚠️ FALLBACK: Redirecting to original download URL
```

#### Expected Error Log (No Token):
```
================================================================================
[SafelinkU DEBUG] Starting SafelinkU API call
================================================================================
[SafelinkU DEBUG] ❌ SAFELINKU_API_TOKEN is undefined or empty
[SafelinkU DEBUG] Environment check:
[SafelinkU DEBUG] - Token exists: false
[SafelinkU DEBUG] - Token type: undefined
================================================================================
[/go/quotio-cross-platform] ❌ SafelinkU shortlink creation failed
[/go/quotio-cross-platform] ⚠️ FALLBACK: Redirecting to original download URL
```

## Common Issues & Solutions

### Issue 1: Token Not Found
**Symptoms:**
```
[SafelinkU DEBUG] ❌ SAFELINKU_API_TOKEN is undefined or empty
```

**Solution:**
1. Check Vercel environment variables:
   ```bash
   vercel env ls
   ```
2. Add token if missing:
   ```bash
   vercel env add SAFELINKU_API_TOKEN
   ```
3. Redeploy:
   ```bash
   vercel --prod
   ```

### Issue 2: 401 Unauthorized
**Symptoms:**
```
[SafelinkU DEBUG] ❌ 401 Unauthorized - API token is invalid or expired
```

**Solution:**
1. Verify token is correct in SafelinkU dashboard
2. Generate new token if expired
3. Update in Vercel:
   ```bash
   vercel env rm SAFELINKU_API_TOKEN production
   vercel env add SAFELINKU_API_TOKEN production
   ```
4. Redeploy

### Issue 3: 429 Rate Limit
**Symptoms:**
```
[SafelinkU DEBUG] ❌ 429 Rate Limit Exceeded - Too many requests (60/minute limit)
```

**Solution:**
- Rate limiter should handle this automatically
- Wait 1 minute and try again
- Check if sync process is creating too many links at once

### Issue 4: Response Format Mismatch
**Symptoms:**
```
[SafelinkU DEBUG] ❌ Could not find shortlink in response
[SafelinkU DEBUG] Available fields: success, data, message
```

**Solution:**
1. Check the full response structure in logs
2. If SafelinkU changed their API format, update the response parsing in `safelinku.ts`
3. Add new field to check in the parsing logic

### Issue 5: Network/Timeout Error
**Symptoms:**
```
[SafelinkU DEBUG] ❌ Exception occurred during API call
[SafelinkU DEBUG] Error type: FetchError
[SafelinkU DEBUG] Error message: request timeout
```

**Solution:**
- Usually temporary network issue
- Fallback will redirect to original URL
- User can try again later
- SafelinkU API might be down

## Testing SafelinkU API Manually

### Test with curl:
```bash
curl -X POST https://safelinku.com/api/v1/links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/example/repo/releases/download/v1.0.0/app.apk",
    "alias": "test-app",
    "passcode": ""
  }'
```

### Expected Success Response:
```json
{
  "url": "https://safelinku.com/xxx"
}
```

### Expected Error Response (401):
```json
{
  "error": "Invalid API token"
}
```

### Expected Error Response (429):
```json
{
  "error": "Rate limit exceeded"
}
```

## Monitoring Checklist

### Daily Checks:
- [ ] Check Vercel logs for SafelinkU errors
- [ ] Monitor success rate (✅ vs ❌ in logs)
- [ ] Check if fallback is being used frequently
- [ ] Verify token is still valid

### Weekly Checks:
- [ ] Review SafelinkU dashboard for usage stats
- [ ] Check if rate limit is being hit
- [ ] Verify database has safelinku_url populated
- [ ] Test random apps to ensure downloads work

### Monthly Checks:
- [ ] Review SafelinkU API documentation for changes
- [ ] Check if token needs renewal
- [ ] Analyze monetization performance
- [ ] Update response parsing if API changed

## Current Behavior

### ✅ When SafelinkU Works:
1. User clicks "Download Now"
2. System checks database for cached SafelinkU URL
3. If not cached: Creates new SafelinkU shortlink
4. Saves to database
5. Redirects to SafelinkU page
6. User sees ads/monetization
7. User gets download link

### ⚠️ When SafelinkU Fails:
1. User clicks "Download Now"
2. System tries to create SafelinkU shortlink
3. API call fails (logged with details)
4. **FALLBACK**: Redirects directly to GitHub/F-Droid/SourceForge
5. User gets download immediately (no monetization)
6. Error logged for debugging

## Key Points

### ✅ Advantages:
- **Download never fails**: Fallback ensures user always gets file
- **Detailed logging**: Easy to debug API issues
- **Flexible parsing**: Supports multiple response formats
- **Rate limiting**: Prevents API abuse
- **Caching**: Reduces API calls

### ⚠️ Trade-offs:
- **Monetization not guaranteed**: If API fails, no revenue
- **Verbose logging**: Lots of log data (good for debugging)
- **Fallback visible**: Users might notice direct links sometimes

## Next Steps

### If SafelinkU is Working:
1. Monitor logs to ensure consistent success
2. Check SafelinkU dashboard for revenue
3. Optimize by pre-creating links during sync

### If SafelinkU is Failing:
1. Check logs for specific error
2. Verify token in Vercel environment
3. Test token manually with curl
4. Contact SafelinkU support if needed
5. Users still get downloads (fallback working)

## Support

### Need Help?
1. **Check logs first**: Most issues are visible in logs
2. **Test manually**: Use curl to test API directly
3. **Verify environment**: Ensure token is set correctly
4. **Contact SafelinkU**: For API-specific issues

### Useful Commands:
```bash
# Check environment variables
vercel env ls

# View recent logs
vercel logs

# Redeploy
vercel --prod

# Test API manually
curl -X POST https://safelinku.com/api/v1/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","alias":"test","passcode":""}'
```

---

**Last Updated:** 2026-04-29
**Version:** 2.0.0
**Status:** ✅ Production with Fallback
