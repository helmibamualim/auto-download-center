# 🤖 Auto-Sync System - Setup Guide

## 🎯 Overview

Sistem auto-sync yang berjalan otomatis tanpa intervensi manual. Semua proses sync, validasi, dan deploy berjalan secara terjadwal.

## ✨ Features

### 1. **Vercel Cron Jobs** ✅
- **Daily Sync**: Setiap hari jam 2 AM UTC
- **Weekly Validation**: Setiap Minggu jam 3 AM UTC
- **Monthly Cleanup**: Setiap tanggal 1 jam 4 AM UTC

### 2. **GitHub Actions** ✅
- **Auto Sync & Deploy**: Daily at 2 AM UTC
- **Manual Trigger**: Via GitHub Actions UI
- **Auto Build & Deploy**: Setelah sync selesai

### 3. **API Endpoints** ✅
- `/api/sync` - Sync apps dari GitHub & F-Droid
- `/api/validate` - Validasi download links
- `/api/cleanup` - Hapus duplicates
- `/api/status` - Monitor database stats

## 🚀 Setup Instructions

### Step 1: Vercel Environment Variables

Add these to Vercel: https://vercel.com/your-project/settings/environment-variables

```
SUPABASE_URL=https://dowdocbwzjzgfxxzokgq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GITHUB_TOKEN=<your-github-token>
CRON_SECRET=<generate-random-string>
```

**Generate CRON_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: GitHub Secrets

Add these to GitHub: https://github.com/your-repo/settings/secrets/actions

```
SUPABASE_URL=<same-as-vercel>
SUPABASE_SERVICE_ROLE_KEY=<same-as-vercel>
GH_TOKEN=<your-github-token>
VERCEL_TOKEN=<from-vercel-account-settings>
VERCEL_ORG_ID=<from-vercel-project-settings>
VERCEL_PROJECT_ID=<from-vercel-project-settings>
```

**Get Vercel Token**:
1. Go to: https://vercel.com/account/tokens
2. Create new token
3. Copy and add to GitHub secrets

**Get Vercel IDs**:
```bash
cd auto-download-center
vercel link
cat .vercel/project.json
```

### Step 3: Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Step 4: Enable Cron Jobs

Vercel Cron akan otomatis aktif setelah deploy. Cek di:
https://vercel.com/your-project/settings/crons

### Step 5: Enable GitHub Actions

GitHub Actions akan otomatis berjalan sesuai schedule. Cek di:
https://github.com/your-repo/actions

## 📅 Schedule

### Vercel Cron:

| Job | Schedule | Description |
|-----|----------|-------------|
| Sync | Daily 2 AM UTC | Sync new apps from GitHub & F-Droid |
| Validate | Weekly Sunday 3 AM | Check all download links |
| Cleanup | Monthly 1st 4 AM | Remove duplicates |

### GitHub Actions:

| Workflow | Schedule | Description |
|----------|----------|-------------|
| Auto Sync & Deploy | Daily 2 AM UTC | Full sync + build + deploy |

## 🔍 Monitoring

### Check Sync Status

```bash
curl https://auto-download-center.vercel.app/api/status
```

**Response**:
```json
{
  "success": true,
  "timestamp": "2026-04-30T00:00:00.000Z",
  "stats": {
    "totalApps": 1247,
    "categories": 15,
    "platforms": 5,
    "sources": 2
  },
  "breakdown": {
    "byCategory": {
      "Android Apps": 342,
      "Developer Tools": 215,
      ...
    }
  }
}
```

### Check Vercel Logs

1. Go to: https://vercel.com/your-project/deployments
2. Click latest deployment
3. Go to "Functions" tab
4. Check logs for `/api/sync`, `/api/validate`, `/api/cleanup`

### Check GitHub Actions

1. Go to: https://github.com/your-repo/actions
2. Click "Auto Sync & Deploy" workflow
3. View run logs

## 🧪 Manual Testing

### Test Sync Endpoint

```bash
curl -X POST https://auto-download-center.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Validate Endpoint

```bash
curl -X POST https://auto-download-center.vercel.app/api/validate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Cleanup Endpoint

```bash
curl -X POST https://auto-download-center.vercel.app/api/cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Trigger GitHub Action Manually

1. Go to: https://github.com/your-repo/actions
2. Click "Auto Sync & Deploy"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## 📊 Expected Results

### After Auto-Sync:

- ✅ **New apps added**: 50-100 per day
- ✅ **Apps updated**: 20-50 per day
- ✅ **Total apps**: 1000+ after first week
- ✅ **Categories**: 15+ active
- ✅ **Valid links**: 95%+
- ✅ **Auto deploy**: Within 5 minutes

### Performance:

- **Sync duration**: 3-5 minutes
- **Validation duration**: 5-10 minutes
- **Cleanup duration**: < 1 minute
- **Deploy duration**: 2-3 minutes
- **Total**: < 15 minutes end-to-end

## 🔒 Security

### API Protection:

- ✅ **CRON_SECRET**: Required for all cron endpoints
- ✅ **Authorization header**: Bearer token validation
- ✅ **Rate limiting**: Built-in Vercel protection
- ✅ **HTTPS only**: All requests encrypted

### Best Practices:

1. **Never commit secrets** to git
2. **Rotate CRON_SECRET** monthly
3. **Monitor logs** for suspicious activity
4. **Use strong tokens** (32+ characters)

## 🐛 Troubleshooting

### Issue 1: Cron Not Running

**Check**:
1. Vercel cron enabled?
2. Environment variables set?
3. Check Vercel logs

**Solution**:
```bash
# Redeploy
vercel --prod
```

### Issue 2: GitHub Action Failing

**Check**:
1. All secrets configured?
2. Vercel token valid?
3. Check action logs

**Solution**:
1. Verify all secrets
2. Re-run workflow

### Issue 3: Sync Errors

**Check**:
1. GitHub token valid?
2. Supabase credentials correct?
3. Check API logs

**Solution**:
```bash
# Test manually
curl -X POST https://auto-download-center.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Issue 4: No New Apps

**Check**:
1. Sync running successfully?
2. GitHub rate limit?
3. Database connection?

**Solution**:
1. Check `/api/status` endpoint
2. Review sync logs
3. Verify credentials

## 📈 Optimization

### Reduce Sync Time:

```typescript
// In src/pages/api/sync.ts
await syncEnhancedGitHubApps(10); // Reduce from 20 to 10
```

### Increase Sync Frequency:

```json
// In vercel.json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 */6 * * *"  // Every 6 hours
    }
  ]
}
```

### Add More Sources:

```typescript
// In src/pages/api/sync.ts
await syncSourceForgeApps();
await syncOtherSource();
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Vercel cron jobs visible in dashboard
- [ ] GitHub Actions workflow exists
- [ ] All environment variables set
- [ ] All secrets configured
- [ ] `/api/status` returns data
- [ ] `/api/sync` works (test manually)
- [ ] Logs show successful runs
- [ ] Website updates automatically

## 🎯 Success Metrics

### Daily:
- ✅ Sync runs successfully
- ✅ 50-100 new apps added
- ✅ Website auto-updates
- ✅ No manual intervention

### Weekly:
- ✅ Links validated
- ✅ Invalid apps marked inactive
- ✅ 95%+ links valid

### Monthly:
- ✅ Duplicates removed
- ✅ Database optimized
- ✅ 1000+ active apps

## 🚀 Next Steps

1. ✅ Complete setup (Steps 1-5)
2. ✅ Test manually
3. ✅ Wait for first auto-run
4. ✅ Monitor logs
5. ✅ Verify website updates
6. ✅ Enjoy auto-pilot mode! 🎉

## 📚 Resources

- **Vercel Cron**: https://vercel.com/docs/cron-jobs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Vercel API**: https://vercel.com/docs/rest-api
- **Supabase**: https://supabase.com/docs

---

**Status**: ✅ Ready for Auto-Pilot
**Setup Time**: 15-20 minutes
**Maintenance**: Zero manual work required
**Last Updated**: April 30, 2026
