# 🌐 Domain Migration Guide - Auto Download Center

**Current Domain**: `https://auto-download-center.vercel.app`  
**Target**: Custom domain (when ready)  
**SEO Impact**: Minimal (if done correctly)

---

## ✅ SYSTEM READINESS

Your website is **100% ready** for domain migration. All URLs, links, and SEO elements use dynamic configuration.

### What's Already Prepared:
- ✅ All URLs use `PUBLIC_SITE_URL` environment variable
- ✅ Internal links are relative (no hardcoded domains)
- ✅ Sitemap uses dynamic domain
- ✅ Robots.txt uses dynamic domain
- ✅ Canonical URLs use dynamic domain
- ✅ Structured data uses dynamic domain
- ✅ Open Graph URLs use dynamic domain

---

## 📋 MIGRATION STEPS

### Step 1: Purchase & Configure Domain

**1.1 Purchase Domain**
- Choose a memorable, brandable domain
- Recommended: `.com`, `.app`, or `.io`
- Examples: `autodownload.com`, `freedownloads.app`

**1.2 Add Domain to Vercel**
```
1. Go to Vercel Dashboard
2. Select your project: auto-download-center
3. Go to Settings → Domains
4. Click "Add Domain"
5. Enter your custom domain
6. Follow DNS configuration instructions
```

**1.3 Configure DNS**
- Add A record or CNAME as instructed by Vercel
- Wait for DNS propagation (can take 24-48 hours)
- Vercel will automatically provision SSL certificate

---

### Step 2: Update Environment Variables

**2.1 Update in Vercel Dashboard**
```
1. Go to Vercel Dashboard
2. Select project: auto-download-center
3. Go to Settings → Environment Variables
4. Find: PUBLIC_SITE_URL
5. Update value to your new domain
6. Example: https://yourdomain.com
7. Save changes
```

**2.2 Update Local .env (if needed)**
```bash
# .env
PUBLIC_SITE_URL=https://yourdomain.com
```

---

### Step 3: Deploy Changes

**3.1 Trigger Deployment**
```bash
# Option 1: Push to GitHub (auto-deploy)
git add .
git commit -m "Update domain to yourdomain.com"
git push origin main

# Option 2: Manual deploy via Vercel CLI
vercel --prod
```

**3.2 Verify Deployment**
- Check Vercel deployment logs
- Ensure deployment is successful
- Test new domain loads correctly

---

### Step 4: Set Up 301 Redirects

**4.1 Configure Vercel Redirects**

Create or update `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://yourdomain.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ],
  "crons": [
    {
      "path": "/api/sync-batch",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Important**: This redirect should be configured on the OLD domain (Vercel subdomain) to redirect to NEW domain.

**4.2 Verify Redirects**
```bash
# Test old domain redirects to new
curl -I https://auto-download-center.vercel.app

# Should return:
# HTTP/2 301
# Location: https://yourdomain.com
```

---

### Step 5: Update Google Search Console

**5.1 Add New Property**
```
1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter new domain: https://yourdomain.com
4. Verify ownership (DNS or HTML tag)
```

**5.2 Submit New Sitemap**
```
1. In new property, go to Sitemaps
2. Submit: https://yourdomain.com/sitemap.xml
3. Wait for processing
```

**5.3 Set Up Change of Address**
```
1. In OLD property (Vercel domain)
2. Go to Settings → Change of Address
3. Select new property
4. Submit change of address request
5. Google will transfer ranking signals
```

**Note**: Keep old property active for at least 180 days.

---

### Step 6: Update External Links (Optional)

**6.1 Social Media**
- Update website URL on social profiles
- Update bio links
- Update pinned posts

**6.2 External Listings**
- Update directory listings
- Update backlinks (if possible)
- Update email signatures

---

### Step 7: Monitor & Validate

**7.1 Test All Pages**
```bash
# Homepage
curl -I https://yourdomain.com

# Sitemap
curl https://yourdomain.com/sitemap.xml

# Robots
curl https://yourdomain.com/robots.txt

# Sample app page
curl -I https://yourdomain.com/apps/organic-maps

# Sample category
curl -I https://yourdomain.com/category/android-apps
```

**7.2 Validate SEO Elements**
- Check canonical URLs point to new domain
- Check Open Graph URLs use new domain
- Check structured data uses new domain
- Check sitemap uses new domain

**7.3 Monitor Traffic**
```
- Check Google Analytics (if installed)
- Monitor Google Search Console
- Track keyword rankings
- Watch for indexing issues
```

---

## ⚠️ IMPORTANT NOTES

### DO:
- ✅ Keep 301 redirects active for at least 1 year
- ✅ Monitor Google Search Console for errors
- ✅ Keep old domain active during transition
- ✅ Update environment variables before deploying
- ✅ Test thoroughly before announcing

### DON'T:
- ❌ Delete old domain immediately
- ❌ Remove 301 redirects too soon
- ❌ Change URL structure during migration
- ❌ Forget to update Search Console
- ❌ Rush the process

---

## 📊 EXPECTED TIMELINE

### Day 1: Domain Setup
- Purchase domain
- Configure DNS
- Add to Vercel
- Wait for SSL

### Day 2-3: DNS Propagation
- Wait for DNS to propagate globally
- Test domain accessibility
- Verify SSL certificate

### Day 4: Deploy Changes
- Update PUBLIC_SITE_URL
- Deploy to production
- Set up 301 redirects
- Test all pages

### Day 5-7: Search Engine Updates
- Submit to Google Search Console
- Submit new sitemap
- Request change of address
- Monitor indexing

### Week 2-4: Monitoring
- Watch traffic patterns
- Check for broken links
- Monitor rankings
- Fix any issues

### Month 2-6: Stabilization
- Rankings stabilize
- Traffic normalizes
- Old domain can be retired (after 6 months)

---

## 🔧 TROUBLESHOOTING

### Issue: New domain not loading
**Solution**:
- Check DNS configuration
- Wait for DNS propagation (24-48 hours)
- Verify Vercel domain settings
- Check SSL certificate status

### Issue: Old domain not redirecting
**Solution**:
- Verify `vercel.json` redirects configuration
- Redeploy project
- Check redirect rules in Vercel dashboard
- Test with `curl -I`

### Issue: Sitemap shows old domain
**Solution**:
- Verify `PUBLIC_SITE_URL` is updated
- Redeploy project
- Clear cache
- Test `/sitemap.xml` directly

### Issue: Canonical URLs still use old domain
**Solution**:
- Check environment variables in Vercel
- Ensure `PUBLIC_SITE_URL` is correct
- Redeploy project
- Hard refresh browser cache

### Issue: Google not indexing new domain
**Solution**:
- Submit sitemap in Search Console
- Request indexing for key pages
- Ensure 301 redirects are working
- Wait 1-2 weeks for Google to process

---

## ✅ POST-MIGRATION CHECKLIST

### Immediate (Day 1):
- [ ] New domain loads correctly
- [ ] SSL certificate active
- [ ] Homepage accessible
- [ ] All pages load
- [ ] Sitemap accessible
- [ ] Robots.txt accessible

### Week 1:
- [ ] 301 redirects working
- [ ] Google Search Console updated
- [ ] New sitemap submitted
- [ ] Change of address requested
- [ ] No broken links
- [ ] All internal links work

### Week 2-4:
- [ ] Pages being indexed
- [ ] Traffic stable or growing
- [ ] No ranking drops
- [ ] No 404 errors
- [ ] Structured data valid
- [ ] Core Web Vitals good

### Month 2-6:
- [ ] Rankings recovered/improved
- [ ] Traffic normalized
- [ ] Old domain can be retired
- [ ] All backlinks updated
- [ ] Social profiles updated

---

## 📞 SUPPORT

### If Issues Occur:

**Vercel Support**:
- Dashboard: https://vercel.com/support
- Documentation: https://vercel.com/docs

**Google Search Console**:
- Help: https://support.google.com/webmasters
- Community: https://support.google.com/webmasters/community

**DNS Issues**:
- Check with your domain registrar
- Use DNS checker: https://dnschecker.org

---

## 🎯 SUCCESS CRITERIA

Migration is successful when:
- ✅ New domain loads correctly
- ✅ All pages accessible
- ✅ 301 redirects working
- ✅ Google indexing new domain
- ✅ Traffic stable or growing
- ✅ No SEO ranking drops
- ✅ All SEO elements updated
- ✅ No broken links

---

## 📝 EXAMPLE MIGRATION

### Before:
```
Domain: https://auto-download-center.vercel.app
PUBLIC_SITE_URL: https://auto-download-center.vercel.app
Sitemap: https://auto-download-center.vercel.app/sitemap.xml
```

### After:
```
Domain: https://autodownload.com
PUBLIC_SITE_URL: https://autodownload.com
Sitemap: https://autodownload.com/sitemap.xml
Old domain redirects: 301 → https://autodownload.com
```

---

## 🚀 READY TO MIGRATE?

Your system is **fully prepared** for domain migration. When you're ready:

1. Purchase your domain
2. Follow steps above
3. Update `PUBLIC_SITE_URL`
4. Deploy
5. Set up redirects
6. Update Search Console
7. Monitor for 2-4 weeks

**Estimated downtime**: 0 minutes (if done correctly)  
**SEO impact**: Minimal (with proper 301 redirects)  
**Recovery time**: 2-4 weeks for full ranking transfer

---

**🎉 Your website is migration-ready!**

**Current Status**: ✅ Ready  
**Risk Level**: 🟢 Low (with proper execution)  
**Recommended Timing**: Anytime (no rush, current domain works great)
