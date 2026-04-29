# 📦 Sync System Guide - Auto Download Center

## 🎯 Overview

Sistem sync otomatis untuk menambahkan ribuan aplikasi dari sumber legal dan resmi ke database.

## 🔗 Sumber Data Legal

### 1. **GitHub Releases** ✅
- **Jumlah**: 1000+ repositories
- **Kategori**: Semua kategori
- **Update**: Otomatis dari latest releases
- **Validasi**: Link download, file type, legal software

### 2. **F-Droid** ✅
- **Jumlah**: 100+ apps per sync
- **Kategori**: Android Apps
- **Update**: Dari official F-Droid repository
- **Validasi**: APK files, open source only

### 3. **SourceForge** (Optional)
- **Jumlah**: 20+ popular projects
- **Kategori**: Windows, Linux, Mac
- **Update**: Latest files
- **Validasi**: Download links, file types

## 📂 Kategori yang Didukung

### Mobile
- ✅ Android Apps
- ✅ iOS Apps (dari GitHub)

### Desktop
- ✅ Windows Software
- ✅ Mac Software
- ✅ Linux Apps

### Development
- ✅ Developer Tools
- ✅ CLI Tools
- ✅ IDEs & Editors

### AI & ML
- ✅ AI Tools
- ✅ Machine Learning
- ✅ Chatbots
- ✅ LLM Tools

### Productivity
- ✅ Productivity
- ✅ Note Taking
- ✅ Task Management
- ✅ Time Tracking

### Security & Privacy
- ✅ Security
- ✅ Privacy Tools
- ✅ Encryption
- ✅ VPN
- ✅ Password Managers

### Design & Multimedia
- ✅ Design Tools
- ✅ Graphics
- ✅ Image Processing
- ✅ Video Editors
- ✅ Audio Tools
- ✅ Multimedia

### Internet & Communication
- ✅ Internet
- ✅ Browsers
- ✅ Communication
- ✅ Email
- ✅ Messaging

### Utilities
- ✅ Utilities
- ✅ File Management
- ✅ System Tools
- ✅ Backup
- ✅ Automation

### Office & Documents
- ✅ Office Tools
- ✅ PDF Tools
- ✅ Spreadsheets
- ✅ Presentations

### Education
- ✅ Education
- ✅ Learning
- ✅ Tutorials

### Games
- ✅ Games (Open Source)
- ✅ Game Engines

### Extensions
- ✅ Browser Extensions

## 🚀 Cara Menggunakan

### 1. Setup Environment Variables

Buat file `.env` dengan:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_TOKEN=your_github_token
```

**Cara mendapatkan GitHub Token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `read:org`
4. Copy token dan paste ke `.env`

### 2. Run Full Sync

Sync semua sumber (GitHub + F-Droid):

```bash
npm run sync
```

atau

```bash
npm run sync full
```

**Output:**
```
🚀 Starting full sync process...
============================================================

📦 [1/2] Syncing GitHub repositories...
------------------------------------------------------------
🔍 Searching: topic:android stars:>500 language:kotlin
   Found 30 repositories
   ✨ Added: termux-app (Android) v0.118.3
   ✨ Added: Signal-Android (Android) v6.45.2
   ...

📱 [2/2] Syncing F-Droid apps...
------------------------------------------------------------
   ✨ Added: NewPipe (Android) v0.25.2
   ...

📊 SYNC SUMMARY
============================================================
✅ GitHub Enhanced: completed (245.32s)
✅ F-Droid: completed (45.12s)

⏱️  Total sync time: 290.44s

📈 DATABASE STATISTICS
------------------------------------------------------------
📦 Total Apps: 1,247

📂 By Category:
   Android Apps: 342
   Developer Tools: 215
   Linux Apps: 189
   ...
```

### 3. Quick Sync (Updates Only)

Update apps yang sudah ada (lebih cepat):

```bash
npm run sync:quick
```

### 4. Validate Download Links

Cek semua link download masih valid:

```bash
npm run sync:validate
```

**Output:**
```
🔍 Validating download links...

✅ termux-app: Valid
✅ Signal-Android: Valid
❌ old-app: Invalid (404)
...

📊 Validation Summary:
✅ Valid: 1,234
❌ Invalid: 13
```

### 5. Cleanup Duplicates

Hapus duplikat berdasarkan slug dan source_url:

```bash
npm run sync:cleanup
```

## 📊 Sync Statistics

### Expected Results (Full Sync)

| Source | Apps | Time | Categories |
|--------|------|------|------------|
| GitHub | 800-1000 | ~4-5 min | All |
| F-Droid | 100-150 | ~1-2 min | Android |
| **Total** | **900-1150** | **~5-7 min** | **15+** |

### File Types Supported

- **Android**: `.apk`
- **Windows**: `.exe`, `.msi`, `.zip`
- **Mac**: `.dmg`, `.pkg`, `.app`
- **Linux**: `.deb`, `.rpm`, `.AppImage`, `.snap`, `.flatpak`
- **Cross-platform**: `.tar.gz`, `.tar.xz`, `.7z`

## 🔍 Validasi & Filter

### 1. Legal Software Check

```typescript
function isLegalSoftware(name: string, description: string): boolean {
  const illegalKeywords = [
    'crack', 'keygen', 'patch', 'mod', 'hack',
    'pirate', 'warez', 'nulled', 'cracked'
  ];
  
  const text = `${name} ${description}`.toLowerCase();
  return !illegalKeywords.some(keyword => text.includes(keyword));
}
```

### 2. Download URL Validation

```typescript
function isValidDownloadUrl(url: string): boolean {
  if (!url || url.length === 0) return false;
  if (!url.startsWith('http')) return false;
  
  const validExtensions = [
    '.apk', '.exe', '.msi', '.dmg', '.pkg',
    '.deb', '.rpm', '.appimage', '.zip',
    '.tar.gz', '.tar.xz', '.7z'
  ];
  
  return validExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
}
```

### 3. Installable File Check

```typescript
function isInstallableFile(fileType: string): boolean {
  const installableTypes = [
    'apk', 'exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 
    'appimage', 'snap', 'flatpak', 'zip', 'tar.gz'
  ];
  
  return installableTypes.includes(fileType.toLowerCase());
}
```

## 🔄 Auto Sync Schedule

### Recommended Schedule

```bash
# Crontab example (Linux/Mac)

# Full sync every day at 2 AM
0 2 * * * cd /path/to/project && npm run sync

# Quick sync every 6 hours
0 */6 * * * cd /path/to/project && npm run sync:quick

# Validate links weekly (Sunday 3 AM)
0 3 * * 0 cd /path/to/project && npm run sync:validate

# Cleanup monthly (1st day, 4 AM)
0 4 1 * * cd /path/to/project && npm run sync:cleanup
```

### Vercel Cron (Recommended)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Create `src/pages/api/sync.ts`:

```typescript
import type { APIRoute } from 'astro';
import { runQuickSync } from '../../lib/sync/sync-orchestrator';

export const GET: APIRoute = async () => {
  try {
    await runQuickSync();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

## 📈 Performance Optimization

### 1. Rate Limiting

```typescript
// Delay between requests
await delay(1000); // 1 second

// Respect GitHub rate limits
if (response.status === 403) {
  console.log('Rate limit exceeded. Waiting 60s...');
  await delay(60000);
}
```

### 2. Batch Processing

```typescript
// Process in batches
const batchSize = 30;
for (let i = 0; i < repos.length; i += batchSize) {
  const batch = repos.slice(i, i + batchSize);
  await processBatch(batch);
}
```

### 3. Pagination

```typescript
// Database pagination
const limit = 20;
const offset = (page - 1) * limit;

query = query.range(offset, offset + limit - 1);
```

## 🐛 Troubleshooting

### Issue 1: GitHub Rate Limit

**Error**: `403 Forbidden - Rate limit exceeded`

**Solution**:
1. Check rate limit: https://api.github.com/rate_limit
2. Wait 1 hour or use authenticated requests
3. Use GitHub Token with higher limits

### Issue 2: Supabase Connection Error

**Error**: `Missing Supabase environment variables`

**Solution**:
1. Check `.env` file exists
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Restart sync process

### Issue 3: Duplicate Apps

**Error**: Multiple apps with same slug

**Solution**:
```bash
npm run sync:cleanup
```

### Issue 4: Invalid Download Links

**Error**: 404 Not Found

**Solution**:
```bash
npm run sync:validate
```

Apps with invalid links will be marked as inactive.

## 📝 Best Practices

### 1. Regular Sync Schedule
- **Daily**: Full sync for new apps
- **Every 6 hours**: Quick sync for updates
- **Weekly**: Validate all links
- **Monthly**: Cleanup duplicates

### 2. Monitor Sync Logs
- Check console output
- Monitor error rates
- Track sync duration
- Review database stats

### 3. Database Maintenance
- Regular backups
- Index optimization
- Remove inactive apps
- Update outdated data

### 4. Quality Control
- Verify new apps manually (sample)
- Check download links work
- Test on different platforms
- Monitor user feedback

## 🎯 Target Metrics

### After Full Sync:
- ✅ **Total Apps**: 1,000+ apps
- ✅ **Categories**: 15+ categories
- ✅ **Platforms**: 5+ platforms
- ✅ **Sources**: 2+ sources
- ✅ **Valid Links**: 95%+ success rate
- ✅ **Update Frequency**: Daily
- ✅ **Sync Time**: < 10 minutes

## 🚀 Next Steps

1. **Run Initial Sync**:
   ```bash
   npm run sync
   ```

2. **Verify Results**:
   - Check homepage for new categories
   - Browse category pages
   - Test download links
   - Check app details

3. **Setup Auto Sync**:
   - Configure cron job or Vercel cron
   - Monitor sync logs
   - Set up alerts for failures

4. **Optimize**:
   - Adjust sync frequency
   - Fine-tune filters
   - Add more sources
   - Improve categorization

## 📚 Resources

- **GitHub API**: https://docs.github.com/en/rest
- **F-Droid API**: https://f-droid.org/en/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Cron**: https://vercel.com/docs/cron-jobs

---

**Status**: ✅ Ready to Use
**Last Updated**: April 29, 2026
**Version**: 1.0.0
