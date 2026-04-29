@echo off
REM 🚀 Auto Download Center - Deploy and Sync Script (Windows)
REM This script will deploy your app and trigger the initial bulk sync

setlocal enabledelayedexpansion

echo ============================================================
echo 🚀 AUTO DOWNLOAD CENTER - DEPLOY ^& SYNC
echo ============================================================
echo.

REM Step 1: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Please run this script from the project root directory
    exit /b 1
)

echo 📦 Step 1: Committing changes...
git add .
git commit -m "feat: implement bulk sync system with 140+ queries and multi-source support" 2>nul || echo No changes to commit

echo.
echo 🚀 Step 2: Pushing to repository...
git push

echo.
echo ⏳ Step 3: Waiting for Vercel deployment (60 seconds)...
echo    Vercel is building and deploying your app...
timeout /t 60 /nobreak >nul

echo.
echo ✅ Deployment should be complete!
echo.

REM Step 4: Ask for domain and secret
echo 📝 Please provide the following information:
echo.
set /p DOMAIN="Enter your Vercel domain (e.g., your-app.vercel.app): "
set /p CRON_SECRET="Enter your CRON_SECRET: "

echo.
echo 🔍 Step 4: Checking API status...
curl -s "https://%DOMAIN%/api/status" > status_response.txt

findstr /C:"totalApps" status_response.txt >nul
if errorlevel 1 (
    echo ❌ Cannot reach API. Please check:
    echo    1. Domain is correct
    echo    2. Deployment is complete
    echo    3. Website is accessible
    del status_response.txt
    exit /b 1
)

echo ✅ API is reachable
echo.

REM Parse current app count
for /f "tokens=2 delims=:" %%a in ('findstr /C:"totalApps" status_response.txt') do (
    set APPS_LINE=%%a
)
for /f "tokens=1 delims=," %%b in ("!APPS_LINE!") do (
    set CURRENT_APPS=%%b
)
echo 📊 Current database: %CURRENT_APPS% apps
echo.

del status_response.txt

REM Step 5: Trigger initial sync
echo 🚀 Step 5: Triggering initial bulk sync...
echo    This will take 15-30 minutes to complete
echo    You can monitor progress in Vercel logs
echo.

curl -s -X POST "https://%DOMAIN%/api/initial-sync" ^
    -H "Authorization: Bearer %CRON_SECRET%" ^
    -H "Content-Type: application/json" > sync_response.txt

findstr /C:"success" sync_response.txt >nul
if not errorlevel 1 (
    echo ✅ Initial sync triggered successfully!
    echo.
    echo 📊 Sync Details:
    type sync_response.txt
    echo.
) else (
    echo ⚠️  Sync response:
    type sync_response.txt
    echo.
)

del sync_response.txt

REM Step 6: Instructions
echo.
echo ============================================================
echo ✅ DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo 📝 Next Steps:
echo.
echo 1. Monitor sync progress:
echo    → Vercel Dashboard → Your Project → Logs → Functions
echo.
echo 2. Check status after 20-30 minutes:
echo    curl https://%DOMAIN%/api/status
echo.
echo 3. View your website:
echo    https://%DOMAIN%
echo.
echo 4. Expected results:
echo    ✅ Total apps: 2500-3500+
echo    ✅ Sources: 2 (GitHub + F-Droid)
echo    ✅ Categories: 15+ populated
echo    ✅ All pages working
echo.
echo 5. Automated maintenance:
echo    ✅ Daily sync: 2 AM UTC (automatic)
echo    ✅ Weekly validation: Sunday 3 AM UTC (automatic)
echo    ✅ Monthly cleanup: 1st of month 4 AM UTC (automatic)
echo.
echo ============================================================
echo 🎉 Your app is now running on full auto-pilot!
echo ============================================================

endlocal
