# Routing Debug Guide

## Issue Report
User melaporkan bahwa saat klik "Download Now", file langsung ter-download tanpa melewati SafelinkU.

## Expected Flow
```
User clicks "Download Now"
  ↓
Browser navigates to: /go/[slug]
  ↓
Server checks database for cached SafelinkU URL
  ↓
If cached: Redirect to SafelinkU immediately
If not cached: Create SafelinkU shortlink via API
  ↓
Save to database
  ↓
Redirect to SafelinkU (or fallback to original URL if API fails)
  ↓
User sees SafelinkU page (monetization)
  ↓
User clicks through to download
```

## Actual Behavior (Reported)
```
User clicks "Download Now"
  ↓
File downloads immediately (bypass SafelinkU)
```

## Verification Steps

### Step 1: Check Test Endpoint
Visit: https://auto-download-center.vercel.app/api/test-routing

This will show:
- Sample app information
- Expected flow
- Test URLs
- Instructions for debugging

### Step 2: Manual Test with DevTools
1. Visit: https://auto-download-center.vercel.app
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Click any "Download Now" button
5. Check the network requests

**Expected Network Flow:**
```
1. Request to: /go/[slug]
   - Type: document
   - Status: 302 (redirect)
   
2. Request to: https://safelinku.com/xxx
   - Type: document
   - Status: 200
   
3. (After SafelinkU page) Request to: original download URL
   - Type: download
```

**If Bypassing (Problem):**
```
1. Request to: https://github.com/.../file.apk
   - Type: download
   - Status: 200
   (No /go/[slug] request!)
```

### Step 3: Check Console Logs
With latest deployment, console will log:
```javascript
[Download Click] Redirecting to: /go/[slug]
[Download Click] App: {title: "...", slug: "..."}
```

If you don't see these logs, there might be:
- Browser cache issue
- JavaScript error
- Different button being clicked

### Step 4: Check Vercel Logs
1. Go to: https://vercel.com/helmi-mubaraks-projects/auto-download-center
2. Click "Logs" tab
3. Filter by: `/go/`
4. Click a download button on the website
5. Check if `/go/[slug]` endpoint is being called

**Expected Log:**
```
[/go/quotio-cross-platform] Download request received
[/go/quotio-cross-platform] Fetching app from database...
[/go/quotio-cross-platform] App found: quotio
...
```

**If No Log:**
- Endpoint is not being called
- Request is being cached
- Different URL is being used

## Possible Causes

### 1. Browser Cache
**Symptoms:**
- Old version of page is loaded
- Links point to old URLs
- No console logs appear

**Solution:**
```
Hard refresh: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
Clear cache: DevTools → Network tab → Disable cache checkbox
Incognito mode: Test in private/incognito window
```

### 2. Service Worker Cache
**Symptoms:**
- Page loads instantly (from cache)
- Changes don't appear
- Old behavior persists

**Solution:**
```
1. Open DevTools
2. Go to Application tab
3. Click "Service Workers"
4. Click "Unregister" for all workers
5. Hard refresh
```

### 3. CDN Cache (Vercel)
**Symptoms:**
- Deployment successful but changes not visible
- Some users see old version, others see new

**Solution:**
```bash
# Purge Vercel cache
vercel --prod --force

# Or wait 60 seconds for cache to expire
```

### 4. Wrong Button Clicked
**Symptoms:**
- Some buttons work, others don't
- Inconsistent behavior

**Check:**
- Are you clicking "Download Now" or "View Source"?
- Is it on homepage, apps page, or detail page?
- Check the href attribute in DevTools

### 5. JavaScript Error
**Symptoms:**
- Console logs don't appear
- onclick handler doesn't fire

**Check:**
```
1. Open DevTools Console tab
2. Look for red error messages
3. Check if onclick is defined
4. Inspect the <a> element
```

## Code Verification

### AppCard Component
File: `/src/components/AppCard.astro`

```astro
<a 
  href={`/go/${app.slug}`}
  onclick="console.log('[Download Click] Redirecting to:', this.href);"
  data-title={app.title}
  data-slug={app.slug}
  class="..."
>
  <span>Download Now</span>
</a>
```

✅ **Verified**: All "Download Now" buttons use `/go/${app.slug}`

### App Detail Page
File: `/src/pages/apps/[slug].astro`

```astro
<a href={`/go/${app.slug}`} class="...">
  <span>Download Now</span>
</a>
```

✅ **Verified**: Detail page uses `/go/${app.slug}`

### Download Endpoint
File: `/src/pages/go/[slug].ts`

```typescript
export const GET: APIRoute = async ({ params, redirect }) => {
  // ... logic to create/get SafelinkU URL ...
  
  if (safelinkUrl) {
    return redirect(safelinkUrl, 302); // Redirect to SafelinkU
  }
  
  // Fallback to original URL if SafelinkU fails
  return redirect(app.original_download_url, 302);
};
```

✅ **Verified**: Endpoint redirects to SafelinkU or fallback

## Testing Checklist

- [ ] Clear browser cache
- [ ] Test in incognito/private mode
- [ ] Open DevTools Network tab
- [ ] Click "Download Now" button
- [ ] Verify request goes to `/go/[slug]` first
- [ ] Check console for log messages
- [ ] Check Vercel logs for endpoint calls
- [ ] Test on different browsers
- [ ] Test on mobile device
- [ ] Check if SafelinkU URL is in database

## Database Check

### Check if SafelinkU URLs are being saved:

```sql
-- Connect to Supabase and run:
SELECT 
  slug, 
  title, 
  original_download_url IS NOT NULL as has_original,
  safelinku_url IS NOT NULL as has_safelinku,
  safelinku_url
FROM apps 
WHERE is_active = true 
LIMIT 10;
```

**Expected Result:**
- `has_original`: true
- `has_safelinku`: true (after first download)
- `safelinku_url`: https://safelinku.com/xxx

**If has_safelinku is false:**
- SafelinkU API might be failing
- Check Vercel logs for API errors
- Verify SAFELINKU_API_TOKEN is set

## Quick Fixes

### Fix 1: Force Cache Clear
```bash
# In browser
1. Press Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh (Ctrl + Shift + R)
```

### Fix 2: Test Specific App
```bash
# Visit test endpoint
https://auto-download-center.vercel.app/api/test-routing

# Get a sample slug, then test directly:
https://auto-download-center.vercel.app/go/[slug]

# Should redirect to SafelinkU or original URL
```

### Fix 3: Verify Deployment
```bash
# Check latest deployment
vercel ls

# Check if production is latest
vercel inspect [deployment-url]

# Force redeploy if needed
vercel --prod --force
```

## Contact Information

If issue persists after all checks:

1. **Provide this information:**
   - Browser name and version
   - Operating system
   - Screenshot of DevTools Network tab
   - Screenshot of Console tab
   - URL of the page where you clicked
   - Exact button you clicked

2. **Check Vercel logs:**
   - Go to Vercel dashboard
   - Check if `/go/[slug]` is being called
   - Share any error messages

3. **Test endpoint results:**
   - Visit `/api/test-routing`
   - Share the JSON response

## Summary

**All code is correct:**
- ✅ All buttons use `/go/${app.slug}`
- ✅ Endpoint redirects to SafelinkU
- ✅ Fallback to original URL if API fails
- ✅ Console logging added for debugging
- ✅ Test endpoint available

**Most likely cause:**
- Browser cache showing old version
- Need hard refresh or incognito mode

**How to verify:**
1. Open incognito window
2. Visit homepage
3. Open DevTools Network tab
4. Click "Download Now"
5. Check if `/go/[slug]` appears in network requests

---

**Last Updated:** 2026-04-29
**Deployment:** https://auto-download-center.vercel.app
**Test Endpoint:** https://auto-download-center.vercel.app/api/test-routing
