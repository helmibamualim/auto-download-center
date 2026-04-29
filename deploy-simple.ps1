# 🚀 Auto Download Center - Simple Deploy Script
# Script ini akan membantu Anda deploy dengan mudah

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 AUTO DOWNLOAD CENTER - SIMPLE DEPLOY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Cek apakah sudah ada remote
Write-Host "📋 Step 1: Cek Git Remote..." -ForegroundColor Blue
$remote = git remote -v 2>$null

if ([string]::IsNullOrEmpty($remote)) {
    Write-Host "⚠️  Git remote belum dikonfigurasi" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Silakan setup GitHub repository terlebih dahulu:" -ForegroundColor Yellow
    Write-Host "1. Buka: https://github.com/new" -ForegroundColor White
    Write-Host "2. Buat repository baru (nama: auto-download-center)" -ForegroundColor White
    Write-Host "3. Jangan centang 'Initialize with README'" -ForegroundColor White
    Write-Host "4. Setelah dibuat, jalankan command berikut:" -ForegroundColor White
    Write-Host ""
    Write-Host "   git remote add origin https://github.com/USERNAME/REPO_NAME.git" -ForegroundColor Green
    Write-Host "   git branch -M main" -ForegroundColor Green
    Write-Host "   git push -u origin main" -ForegroundColor Green
    Write-Host ""
    Write-Host "5. Setelah itu, jalankan script ini lagi" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Apakah Anda sudah setup GitHub? (y/n)"
    if ($continue -ne "y") {
        Write-Host "❌ Deployment dibatalkan. Silakan setup GitHub terlebih dahulu." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Git remote sudah dikonfigurasi" -ForegroundColor Green
    Write-Host $remote
    Write-Host ""
}

# Step 2: Push ke GitHub
Write-Host "📋 Step 2: Push ke GitHub..." -ForegroundColor Blue
$push = Read-Host "Push ke GitHub sekarang? (y/n)"

if ($push -eq "y") {
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push berhasil!" -ForegroundColor Green
    } else {
        Write-Host "❌ Push gagal. Pastikan remote sudah dikonfigurasi dengan benar." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⏭️  Skip push" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Informasi Vercel
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 Step 3: Deploy ke Vercel" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Silakan deploy ke Vercel secara manual:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Buka: https://vercel.com/new" -ForegroundColor White
Write-Host "2. Import repository GitHub Anda" -ForegroundColor White
Write-Host "3. Framework Preset: Astro" -ForegroundColor White
Write-Host "4. Tambahkan Environment Variables:" -ForegroundColor White
Write-Host "   - SUPABASE_URL=your_supabase_url" -ForegroundColor Cyan
Write-Host "   - SUPABASE_KEY=your_supabase_key" -ForegroundColor Cyan
Write-Host "   - GITHUB_TOKEN=your_github_token" -ForegroundColor Cyan
Write-Host "   - CRON_SECRET=your_random_secret" -ForegroundColor Cyan
Write-Host "5. Klik Deploy" -ForegroundColor White
Write-Host "6. Tunggu 2-3 menit" -ForegroundColor White
Write-Host ""

$deployed = Read-Host "Apakah deployment ke Vercel sudah selesai? (y/n)"

if ($deployed -ne "y") {
    Write-Host "⏸️  Silakan deploy ke Vercel terlebih dahulu, lalu jalankan script ini lagi." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Step 4: Trigger Initial Sync
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 Step 4: Trigger Initial Sync" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$domain = Read-Host "Masukkan domain Vercel Anda (contoh: your-app.vercel.app)"
$secret = Read-Host "Masukkan CRON_SECRET Anda"

Write-Host ""
Write-Host "🚀 Triggering initial bulk sync..." -ForegroundColor Yellow
Write-Host "⏱️  Ini akan memakan waktu 15-30 menit" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $secret"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://$domain/api/initial-sync" -Method POST -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Initial sync berhasil di-trigger!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    
} catch {
    Write-Host "❌ Error triggering sync:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Silakan coba manual dengan command berikut:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "`$headers = @{`"Authorization`" = `"Bearer $secret`"}" -ForegroundColor Cyan
    Write-Host "Invoke-RestMethod -Uri `"https://$domain/api/initial-sync`" -Method POST -Headers `$headers" -ForegroundColor Cyan
    Write-Host ""
}

# Step 5: Monitoring
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 Step 5: Monitoring" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Untuk memonitor progress:" -ForegroundColor Yellow
Write-Host "1. Buka Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Pilih project Anda" -ForegroundColor White
Write-Host "3. Klik 'Logs' → 'Functions'" -ForegroundColor White
Write-Host "4. Anda akan melihat log sync berjalan" -ForegroundColor White
Write-Host ""
Write-Host "Untuk cek status setelah 20-30 menit:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Invoke-RestMethod -Uri `"https://$domain/api/status`"" -ForegroundColor Cyan
Write-Host ""

# Step 6: Summary
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Monitor sync progress (15-30 menit)" -ForegroundColor White
Write-Host "   → Vercel Dashboard → Logs → Functions" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Cek status setelah sync selesai:" -ForegroundColor White
Write-Host "   → https://$domain/api/status" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Buka website Anda:" -ForegroundColor White
Write-Host "   → https://$domain" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Expected results:" -ForegroundColor White
Write-Host "   ✅ Total apps: 2,500-3,500+" -ForegroundColor Green
Write-Host "   ✅ Sources: 2 (GitHub + F-Droid)" -ForegroundColor Green
Write-Host "   ✅ Categories: 15+ populated" -ForegroundColor Green
Write-Host "   ✅ All pages working" -ForegroundColor Green
Write-Host ""
Write-Host "5. Automated maintenance:" -ForegroundColor White
Write-Host "   ✅ Daily sync: 2 AM UTC (automatic)" -ForegroundColor Green
Write-Host "   ✅ Weekly validation: Sunday 3 AM UTC (automatic)" -ForegroundColor Green
Write-Host "   ✅ Monthly cleanup: 1st of month 4 AM UTC (automatic)" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🎉 Your app is now running on full auto-pilot!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
