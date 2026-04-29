# Quick Fix Checklist - Category Page Blank Issue

## 🎯 Problem
Category page shows blank: https://auto-download-center.vercel.app/category/android-apps

## ✅ Solution (5 Minutes)

### Step 1: Get Supabase Credentials (2 min)
1. Open: https://supabase.com/dashboard/project/dowdocbwzjzgfxxzokgq
2. Go to: **Settings** → **API**
3. Copy these values:
   - **Project URL** (starts with `https://`)
   - **service_role key** (long string, NOT the anon key)

### Step 2: Set Vercel Environment Variables (2 min)
1. Open: https://vercel.com/your-project/settings/environment-variables
2. Add 3 variables:

   **Variable 1:**
   - Name: `SUPABASE_URL`
   - Value: `https://dowdocbwzjzgfxxzokgq.supabase.co`
   - Scope: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `<paste your service_role key here>`
   - Scope: ✅ Production ✅ Preview ✅ Development

   **Variable 3:**
   - Name: `PUBLIC_SITE_URL`
   - Value: `https://auto-download-center.vercel.app`
   - Scope: ✅ Production ✅ Preview ✅ Development

3. Click **Save** for each variable

### Step 3: Redeploy (1 min)

**Option A: Trigger Redeploy in Vercel Dashboard**
1. Go to: https://vercel.com/your-project/deployments
2. Click on latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Click **Redeploy** to confirm

**Option B: Deploy via CLI**
```bash
cd auto-download-center
vercel --prod
```

**Option C: Push to Git** (if connected)
```bash
git add .
git commit -m "Fix category page"
git push origin main
```

### Step 4: Verify (30 sec)
1. Wait for deployment to complete (~2 minutes)
2. Open: https://auto-download-center.vercel.app/category/android-apps
3. ✅ Should show apps grid (not blank!)

## 🔍 If Still Blank

### Check 1: Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for errors or `[Category Page]` messages
4. Share any error messages

### Check 2: Vercel Function Logs
1. Go to: https://vercel.com/your-project/deployments
2. Click latest deployment
3. Go to **Functions** tab
4. Look for errors in logs

### Check 3: Verify Environment Variables
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Verify all 3 variables are set
3. Verify no typos in variable names
4. Verify values are not placeholders like `your-key-here`

## 📞 Need Help?

If still not working, provide:
1. Screenshot of browser console (F12)
2. Screenshot of Vercel function logs
3. Confirmation that environment variables are set

## 🎉 Success Indicators

When working correctly, you'll see:
- ✅ Category hero section with icon
- ✅ Breadcrumb navigation
- ✅ Apps count (e.g., "24 free apps and software")
- ✅ Grid of app cards
- ✅ Sort dropdown
- ✅ Pagination (if > 20 apps)

## ⏱️ Total Time: ~5 minutes

That's it! The category page should work after setting the environment variables and redeploying.
