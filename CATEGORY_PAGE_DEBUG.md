# Category Page Debug Guide

## Problem
Category page appears blank when accessed: https://auto-download-center.vercel.app/category/android-apps

## Root Cause Analysis

### 1. Environment Variables Issue
The `.env` file contains placeholder values:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Impact**: When the category page tries to query Supabase, it fails silently, resulting in:
- No data fetched
- Empty `apps` array
- Blank page render

### 2. How to Verify

#### Check Vercel Environment Variables:
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Verify these variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PUBLIC_SITE_URL`

#### Check Browser Console:
1. Open https://auto-download-center.vercel.app/category/android-apps
2. Press F12 to open DevTools
3. Check Console tab for errors
4. Check Network tab for failed API requests

## Solution Steps

### Step 1: Set Environment Variables in Vercel

1. **Get Supabase Credentials**:
   - Go to your Supabase project: https://supabase.com/dashboard/project/dowdocbwzjzgfxxzokgq
   - Go to Settings > API
   - Copy:
     - Project URL → `SUPABASE_URL`
     - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

2. **Add to Vercel**:
   ```bash
   # Option 1: Via Vercel Dashboard
   # Go to: https://vercel.com/your-project/settings/environment-variables
   # Add each variable with Production, Preview, and Development scopes
   
   # Option 2: Via Vercel CLI
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add PUBLIC_SITE_URL
   ```

3. **Redeploy**:
   ```bash
   cd auto-download-center
   vercel --prod
   ```

### Step 2: Add Error Handling to Category Page

To prevent blank pages in the future, add error handling:

```astro
---
// In src/pages/category/[slug].astro
let errorMessage = '';

try {
  // Existing query code...
  const { data: apps, count, error } = await query;
  
  if (error) {
    console.error('Supabase error:', error);
    errorMessage = error.message;
  }
} catch (err) {
  console.error('Category page error:', err);
  errorMessage = err.message;
}
---

{errorMessage && (
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <strong>Error:</strong> {errorMessage}
  </div>
)}
```

### Step 3: Test Locally

1. **Update `.env` with real credentials**:
   ```bash
   SUPABASE_URL=https://dowdocbwzjzgfxxzokgq.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-actual-key>
   PUBLIC_SITE_URL=http://localhost:4321
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```

3. **Test category page**:
   - Open: http://localhost:4321/category/android-apps
   - Should show apps, not blank page

### Step 4: Verify Database Has Data

```sql
-- Check if apps table has data
SELECT category, COUNT(*) as count
FROM apps
WHERE is_active = true
GROUP BY category;

-- Check specific category
SELECT title, slug, category
FROM apps
WHERE category = 'Android Apps'
AND is_active = true
LIMIT 5;
```

## Quick Diagnostic Checklist

- [ ] Vercel environment variables are set correctly
- [ ] Supabase credentials are valid (not placeholders)
- [ ] Database has apps with `is_active = true`
- [ ] Category names match exactly (case-sensitive)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API requests

## Expected Behavior

When working correctly:
1. User visits `/category/android-apps`
2. Server queries Supabase for apps in "Android Apps" category
3. Page renders with:
   - Hero section with category name
   - Breadcrumb navigation
   - Grid of app cards
   - Pagination (if > 20 apps)

## Common Issues

### Issue 1: "Missing Supabase environment variables"
**Solution**: Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Issue 2: Empty page but no errors
**Solution**: Check if category name matches exactly in database

### Issue 3: 404 error
**Solution**: Verify dynamic route file exists at `src/pages/category/[slug].astro`

### Issue 4: Infinite loading
**Solution**: Check Supabase query timeout or network issues

## Next Steps After Fix

Once the category page works:

1. **Add Search & Filters**:
   - Search within category
   - Filter by platform, license, size
   - Sort by latest, popular, rating

2. **Add Sidebar Filters** (Desktop):
   - Collapsible filter panel
   - Multi-select options
   - Apply/Reset buttons

3. **Enhance Mobile Experience**:
   - Bottom sheet filters
   - Sticky sort dropdown
   - Infinite scroll option

4. **Add Loading States**:
   - Skeleton loaders
   - Progressive loading
   - Optimistic UI updates

## Contact

If issues persist after following this guide:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Enable debug mode in Astro config
4. Share error messages for further debugging
