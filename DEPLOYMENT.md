# 🚀 Deployment Guide

Complete step-by-step guide to deploy Auto Download Monetized Center to Vercel.

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ GitHub account
- ✅ Vercel account
- ✅ Supabase account
- ✅ SafelinkU account
- ✅ GitHub Personal Access Token

## 🗄️ Step 1: Setup Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Choose a region close to your users
5. Set a strong database password

### 1.2 Run Database Schema

1. Go to your Supabase dashboard
2. Click "SQL Editor" in the sidebar
3. Copy the contents of `database.sql`
4. Paste and run the SQL script
5. Verify the `apps` table was created

### 1.3 Get Supabase Credentials

1. Go to Settings > API
2. Copy your project URL (`SUPABASE_URL`)
3. Copy your service role key (`SUPABASE_SERVICE_ROLE_KEY`)
4. Keep these safe - you'll need them later

## 🔑 Step 2: Get API Tokens

### 2.1 GitHub Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`
4. Generate and copy the token (`GITHUB_TOKEN`)

### 2.2 SafelinkU Token

1. Sign up at [SafelinkU.com](https://safelinku.com)
2. Complete account verification
3. Go to API section in dashboard
4. Generate API token
5. Copy the token (`SAFELINKU_API_TOKEN`)

**Note**: SafelinkU API has a rate limit of 60 requests per minute. Our system automatically handles this.

## 🚀 Step 3: Deploy to Vercel

### 3.1 Fork Repository (if needed)

1. Fork this repository to your GitHub account
2. Clone your fork locally

### 3.2 Deploy with Vercel

#### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### Option B: Manual Deploy

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### 3.3 Configure Environment Variables

In your Vercel dashboard:

1. Go to your project
2. Click Settings > Environment Variables
3. Add the following variables:

```env
PUBLIC_SITE_URL=https://your-project.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_TOKEN=ghp_your-github-token
SAFELINKU_API_TOKEN=your-safelinku-token
```

### 3.4 Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

## ⚙️ Step 4: Configure Cron Jobs

Vercel automatically sets up cron jobs based on `vercel.json`. The sync will run daily at midnight UTC.

To verify:
1. Go to Functions tab in Vercel dashboard
2. Look for `/api/cron/sync` function
3. Check the cron schedule

## 🔄 Step 5: Initial Data Sync

### 5.1 Manual Sync (Recommended)

Run initial sync locally to populate database:

```bash
# Install dependencies
npm install

# Set environment variables in .env file
cp .env.example .env
# Edit .env with your credentials

# Run sync
npm run sync
```

### 5.2 Trigger Sync via API

Alternatively, trigger sync via deployed API:

```bash
curl -X POST https://your-project.vercel.app/api/cron/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## ✅ Step 6: Verify Deployment

### 6.1 Check Website

1. Visit your deployed URL
2. Verify homepage loads correctly
3. Check that apps are displayed (after sync)
4. Test search functionality
5. Try downloading an app

### 6.2 Check Database

1. Go to Supabase dashboard
2. Click "Table Editor"
3. Select `apps` table
4. Verify data is populated

### 6.3 Test Cron Job

1. Wait for next scheduled run (or trigger manually)
2. Check Vercel Functions logs
3. Verify new apps are added to database

## 🔧 Step 7: Custom Domain (Optional)

### 7.1 Add Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 7.2 Update Environment

Update `PUBLIC_SITE_URL` to your custom domain:

```env
PUBLIC_SITE_URL=https://yourdomain.com
```

## 📊 Step 8: Analytics & Monitoring

### 8.1 Vercel Analytics

1. Go to Analytics tab in Vercel
2. Enable Web Analytics
3. Monitor traffic and performance

### 8.2 Supabase Monitoring

1. Monitor database usage in Supabase dashboard
2. Set up alerts for high usage
3. Monitor API requests

## 🛠️ Troubleshooting

### Common Issues

#### Build Fails
- Check environment variables are set
- Verify all dependencies are installed
- Check for TypeScript errors

#### Sync Not Working
- Verify API tokens are valid
- Check Supabase connection
- Review function logs in Vercel

#### Downloads Not Working
- Verify SafelinkU API token
- Check original download URLs
- Test SafelinkU API manually

#### Database Connection Issues
- Verify Supabase URL and key
- Check database permissions
- Ensure RLS policies are correct

### Debug Commands

```bash
# Check build locally
npm run build

# Test sync locally
npm run sync:github

# Check environment variables
vercel env ls

# View function logs
vercel logs
```

## 🔄 Updates & Maintenance

### Regular Tasks

1. **Monitor Sync**: Check daily sync runs successfully
2. **Update Dependencies**: Keep packages updated
3. **Database Cleanup**: Remove inactive apps periodically
4. **Performance**: Monitor site speed and optimize

### Updating Code

1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel auto-deploys from main branch

## 📈 Scaling

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes exist
2. **Caching**: Implement caching for static data
3. **CDN**: Use Vercel's global CDN
4. **Image Optimization**: Optimize app icons and screenshots

### Handling Growth

1. **Database Limits**: Monitor Supabase usage
2. **Function Limits**: Monitor Vercel function usage
3. **Bandwidth**: Monitor data transfer
4. **Rate Limits**: Implement API rate limiting

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel and Supabase documentation
3. Check GitHub issues
4. Contact support if needed

## 🎉 Success!

Your Auto Download Monetized Center is now live! 

- 🌐 Website: `https://your-project.vercel.app`
- 🗄️ Database: Supabase dashboard
- 📊 Analytics: Vercel dashboard
- 💰 Revenue: SafelinkU dashboard

The system will automatically:
- Sync new apps daily
- Generate SEO-optimized pages
- Create monetized download links
- Handle user traffic and downloads

Enjoy your automated download center! 🚀