# ⚡ Quick Start - Sync System

## 🎯 Goal
Menambahkan 1000+ aplikasi dari sumber legal ke database dalam < 10 menit.

## 📋 Prerequisites

1. **GitHub Token** (Required)
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Select: `public_repo`, `read:org`
   - Copy token

2. **Supabase Credentials** (Already configured)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Step-by-Step

### Step 1: Setup Environment (1 min)

Update `.env` file:

```env
SUPABASE_URL=https://dowdocbwzjzgfxxzokgq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_TOKEN=ghp_your_github_token_here
```

### Step 2: Run Sync (5-7 min)

```bash
cd auto-download-center
npm run sync
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Auto Download Center - Sync Manager                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Starting full sync process...

📦 [1/2] Syncing GitHub repositories...
🔍 Searching: topic:android stars:>500 language:kotlin
   Found 30 repositories
   ✨ Added: termux-app (Android) v0.118.3
   ✨ Added: Signal-Android (Android) v6.45.2
   ...

📱 [2/2] Syncing F-Droid apps...
   ✨ Added: NewPipe (Android) v0.25.2
   ...

📊 SYNC SUMMARY
✅ GitHub Enhanced: completed (245s)
✅ F-Droid: completed (45s)

⏱️  Total sync time: 290s

📈 DATABASE STATISTICS
📦 Total Apps: 1,247
📂 By Category:
   Android Apps: 342
   Developer Tools: 215
   Linux Apps: 189
   Windows Software: 156
   ...

✨ Sync process completed!
```

### Step 3: Verify Results (1 min)

1. **Check Homepage**:
   ```
   https://auto-download-center.vercel.app
   ```
   - Should show updated app counts
   - New categories visible

2. **Check Category Pages**:
   ```
   https://auto-download-center.vercel.app/category/android-apps
   https://auto-download-center.vercel.app/category/developer-tools
   ```
   - Should show new apps
   - Pagination working

3. **Check App Details**:
   - Click any app
   - Verify download link works
   - Check description renders properly

### Step 4: Deploy (2 min)

```bash
npm run build
vercel --prod
```

## 📊 What You'll Get

### Apps by Source:
- **GitHub**: 800-1000 apps
- **F-Droid**: 100-150 apps
- **Total**: 900-1150 apps

### Categories:
- Android Apps (300+)
- Developer Tools (200+)
- Linux Apps (150+)
- Windows Software (100+)
- AI Tools (80+)
- Productivity (70+)
- Security (60+)
- Mac Software (50+)
- Design Tools (40+)
- Multimedia (40+)
- Internet (30+)
- Communication (30+)
- Utilities (30+)
- Education (20+)
- Games (20+)

### Platforms:
- Android
- Windows
- Mac
- Linux
- Cross-platform

### File Types:
- APK (Android)
- EXE, MSI (Windows)
- DMG, PKG (Mac)
- DEB, RPM, AppImage (Linux)
- ZIP, TAR.GZ (Cross-platform)

## 🔄 Maintenance Commands

### Daily Update (Quick Sync)
```bash
npm run sync:quick
```
Updates existing apps with new versions (faster).

### Weekly Validation
```bash
npm run sync:validate
```
Checks all download links are still valid.

### Monthly Cleanup
```bash
npm run sync:cleanup
```
Removes duplicate entries.

## ⚠️ Common Issues

### Issue 1: Rate Limit
**Error**: `403 Forbidden`

**Solution**: Wait 1 hour or use GitHub token with higher limits.

### Issue 2: Slow Sync
**Cause**: Too many apps per query

**Solution**: Reduce `maxAppsPerQuery` in sync script:
```typescript
await syncEnhancedGitHubApps(10); // Instead of 30
```

### Issue 3: Duplicates
**Solution**:
```bash
npm run sync:cleanup
```

## 📈 Expected Timeline

| Step | Time | Description |
|------|------|-------------|
| Setup | 1 min | Add GitHub token to .env |
| Sync | 5-7 min | Download app data |
| Verify | 1 min | Check results |
| Deploy | 2 min | Push to production |
| **Total** | **9-11 min** | **Complete process** |

## ✅ Success Checklist

- [ ] GitHub token added to `.env`
- [ ] Sync completed without errors
- [ ] Database shows 1000+ apps
- [ ] Homepage shows new categories
- [ ] Category pages load correctly
- [ ] Download links work
- [ ] Deployed to production

## 🎯 Next Steps

1. **Setup Auto Sync**:
   - Configure daily cron job
   - Monitor sync logs
   - Set up error alerts

2. **Optimize**:
   - Fine-tune categories
   - Improve descriptions
   - Add more sources

3. **Monitor**:
   - Track download stats
   - Monitor link validity
   - Review user feedback

## 💡 Pro Tips

1. **Run sync during low traffic** (e.g., 2 AM)
2. **Monitor GitHub rate limits**: https://api.github.com/rate_limit
3. **Backup database** before major syncs
4. **Test on staging** before production
5. **Keep logs** for debugging

## 🆘 Need Help?

Check these files:
- `SYNC_SYSTEM_GUIDE.md` - Detailed documentation
- `src/lib/sync/enhanced-github.ts` - GitHub sync logic
- `src/lib/sync/sync-orchestrator.ts` - Main orchestrator

---

**Ready?** Run `npm run sync` and watch the magic happen! ✨
