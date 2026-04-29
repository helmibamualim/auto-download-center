# 🚀 QUICK DEPLOY GUIDE - 5 MENIT SETUP

## Step 1: Deploy ke Vercel (2 menit)

```bash
# Buka terminal di folder auto-download-center
cd auto-download-center

# Install Vercel CLI (jika belum ada)
npm install -g vercel

# Deploy langsung
vercel --prod

# Ikuti prompts:
# - Project name: auto-download-center
# - Link to existing project: No
# - Override settings: No
```

## Step 2: Set Environment Variables (1 menit)

Buka Vercel Dashboard → Project → Settings → Environment Variables

Add semua variables ini:

```
PUBLIC_SITE_URL=https://auto-download-center.vercel.app
SUPABASE_URL=https://xvwzpqkxjqxqxqxq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
SAFELINKU_API_TOKEN=your-safelinku-token
```

## Step 3: Setup Database (1 menit)

1. Buka https://supabase.com
2. Create new project
3. SQL Editor → Paste isi file `database.sql`
4. Run query

## Step 4: Initial Sync (1 menit)

```bash
# Set environment variables locally
cp .env.example .env
# Edit .env dengan credentials

# Run sync
npm run sync
```

## ✅ DONE!

Website live di: https://your-project.vercel.app

Cron job otomatis sync setiap hari jam 00:00 UTC.