# Auto Download Monetized Center

🚀 **Automated download center for free and open-source software with built-in monetization through SafelinkU**

A modern, SEO-optimized website built with Astro.js that automatically indexes free and legal software from multiple sources, creates download pages, and monetizes downloads through SafelinkU shortlinks.

## ✨ Features

- **🔄 Automated Data Sync**: Automatically fetches apps from GitHub, F-Droid, and SourceForge
- **💰 Built-in Monetization**: All downloads go through SafelinkU for revenue generation
- **🎨 Modern UI**: Beautiful, responsive design with dark/light mode
- **⚡ Fast Performance**: Built with Astro.js for optimal speed
- **🔍 SEO Optimized**: Automatic sitemaps, meta tags, and structured data
- **📱 Mobile First**: Fully responsive design
- **🛡️ Safe Downloads**: Only indexes legal, free, and open-source software
- **🔧 Easy Deployment**: Ready to deploy to Vercel with one click

## 🛠️ Tech Stack

- **Frontend**: Astro.js + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Automation**: Vercel Cron Jobs
- **APIs**: GitHub API, F-Droid Index, SourceForge API
- **Monetization**: SafelinkU API

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd auto-download-center
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Site Configuration
PUBLIC_SITE_URL=https://your-domain.vercel.app

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub API Token (for accessing repositories)
GITHUB_TOKEN=ghp_your-github-token

# SafelinkU API Token (for monetization)
SAFELINKU_API_TOKEN=your-safelinku-api-token
```

### 3. Database Setup

Create the following table in your Supabase database:

```sql
CREATE TABLE apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  platform TEXT NOT NULL,
  version TEXT NOT NULL,
  license TEXT,
  developer TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  original_download_url TEXT NOT NULL,
  safelinku_url TEXT,
  icon_url TEXT,
  screenshot_url TEXT,
  file_type TEXT NOT NULL,
  file_size TEXT,
  stars INTEGER,
  downloads_count INTEGER,
  changelog TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_apps_platform ON apps(platform);
CREATE INDEX idx_apps_source_url ON apps(source_url);
CREATE INDEX idx_apps_original_download_url ON apps(original_download_url);
CREATE INDEX idx_apps_is_active ON apps(is_active);
CREATE INDEX idx_apps_created_at ON apps(created_at);
CREATE INDEX idx_apps_stars ON apps(stars);
```

### 4. Get API Tokens

#### GitHub Token
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `public_repo` scope
3. Add to `GITHUB_TOKEN` in your environment

#### SafelinkU Token
1. Sign up at [SafelinkU.com](https://safelinku.com)
2. Go to API section in your dashboard
3. Generate API token
4. Add to `SAFELINKU_API_TOKEN` in your environment

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to see your site.

### 6. Initial Data Sync

Run the sync script to populate your database:

```bash
# Sync all sources
npm run sync

# Or sync individual sources
npm run sync:github
npm run sync:fdroid
npm run sync:sourceforge
```

## 🚀 Deployment to Vercel

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or manually:

```bash
npm install -g vercel
vercel
```

### 2. Set Environment Variables

In your Vercel dashboard, go to Settings > Environment Variables and add:

- `PUBLIC_SITE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `SAFELINKU_API_TOKEN`

### 3. Enable Cron Jobs

The `vercel.json` file is already configured for daily sync at midnight UTC. Vercel will automatically set up the cron job.

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Data Sync
npm run sync         # Sync all sources
npm run sync:github  # Sync GitHub repositories only
npm run sync:fdroid  # Sync F-Droid apps only
npm run sync:sourceforge # Sync SourceForge projects only
```

## 🔧 Configuration

### Sync Sources

The system automatically syncs from these sources:

1. **GitHub**: Popular repositories with releases
2. **F-Droid**: Open-source Android apps
3. **SourceForge**: Popular open-source projects

### Categories

Default categories include:
- Android Apps
- Windows Software
- Mac Software
- Linux Apps
- Developer Tools
- AI Tools
- Productivity
- Security
- Design Tools
- Utilities
- Education
- Internet
- Multimedia

### Legal Compliance

The system only indexes:
- ✅ Free and open-source software
- ✅ Freeware with redistribution rights
- ✅ Software from official sources
- ❌ No cracked/pirated software
- ❌ No keygens or patches
- ❌ No copyrighted commercial software

## 🔄 How It Works

1. **Data Collection**: Cron jobs run daily to fetch new apps from GitHub, F-Droid, and SourceForge
2. **Processing**: Apps are filtered for legality and safety
3. **Storage**: Valid apps are stored in Supabase with metadata
4. **Monetization**: Download URLs are converted to SafelinkU shortlinks
5. **SEO**: Automatic sitemap generation and meta tags
6. **User Experience**: Fast, responsive pages with search and filtering

## 🛡️ Security & Safety

- All downloads link to official sources
- No file hosting on our servers
- Regular security updates
- DMCA compliance
- Privacy-focused design

## 📊 Monetization

Revenue is generated through SafelinkU shortlinks:
- Users click download buttons
- Redirected through SafelinkU (with ads)
- Then to original download source
- You earn revenue from ad views

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@autodownloadcenter.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🙏 Acknowledgments

- [Astro.js](https://astro.build) - Amazing static site generator
- [Supabase](https://supabase.com) - Backend as a service
- [Vercel](https://vercel.com) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [SafelinkU](https://safelinku.com) - Monetization platform

---

**Made with ❤️ for the open-source community**