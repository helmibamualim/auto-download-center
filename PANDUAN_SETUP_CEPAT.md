# 🚀 Panduan Setup Cepat - Sistem Sync Otomatis

## ✅ Yang Sudah Selesai

1. ✅ **Kode sudah dibuat** - Semua file API dan batch sync sudah lengkap
2. ✅ **Sudah di-commit** - Semua perubahan sudah masuk ke Git
3. ✅ **Sudah di-push** - Kode sudah di GitHub (commit: 0fe6b4a)
4. ✅ **Deployment triggered** - Vercel sedang deploy otomatis

## 🔄 Yang Sedang Berjalan

**Vercel sedang deploy website Anda sekarang!**

Tunggu 2-5 menit, lalu cek:
👉 https://vercel.com/helmi-mubaraks-projects/auto-download-center

Pastikan status: **"Ready"** ✅

## 📋 Langkah Selanjutnya (HANYA 2 LANGKAH!)

### Langkah 1: Buat Tabel Database (WAJIB!)

Setelah Vercel status "Ready", buka Supabase dan jalankan SQL ini:

**Buka**: https://supabase.com/dashboard

**Pilih project Anda** → **SQL Editor** → **New Query**

**Copy-paste SQL ini**:

```sql
-- Buat tabel sync_progress
CREATE TABLE IF NOT EXISTS sync_progress (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'running',
  current_batch INTEGER NOT NULL DEFAULT 0,
  total_processed INTEGER NOT NULL DEFAULT 0,
  total_inserted INTEGER NOT NULL DEFAULT 0,
  total_updated INTEGER NOT NULL DEFAULT 0,
  total_skipped INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  current_source TEXT NOT NULL DEFAULT 'github',
  last_query_index INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert data awal
INSERT INTO sync_progress (id, status, current_batch, total_processed, total_inserted, total_updated, total_skipped, total_failed, current_source, last_query_index)
VALUES (1, 'running', 0, 0, 0, 0, 0, 0, 'github', 0)
ON CONFLICT (id) DO NOTHING;

-- Buat index
CREATE INDEX IF NOT EXISTS idx_sync_progress_status ON sync_progress(status);
CREATE INDEX IF NOT EXISTS idx_sync_progress_updated_at ON sync_progress(updated_at);
```

**Klik "Run"** ✅

### Langkah 2: Cek Status Sync

Buka browser dan akses:

```
https://auto-download-center.vercel.app/api/sync-status
```

**Jika berhasil**, Anda akan lihat JSON seperti ini:

```json
{
  "success": true,
  "sync": {
    "status": "running",
    "currentBatch": 0,
    "currentSource": "github"
  },
  "stats": {
    "totalApps": 116,
    "totalProcessed": 0,
    "totalInserted": 0
  }
}
```

## 🎉 SELESAI! Sistem Sudah Jalan Otomatis!

Setelah 2 langkah di atas, **TIDAK PERLU LAKUKAN APA-APA LAGI!**

### Apa yang Terjadi Otomatis:

✅ **Setiap 5 menit**: Sistem otomatis menambah 30 aplikasi baru
✅ **Tidak perlu trigger manual**: Cron job Vercel jalan sendiri
✅ **Tidak perlu PowerShell**: Semua berjalan di cloud
✅ **Tidak ada timeout**: Batch kecil, aman dari timeout Vercel
✅ **Bisa dilanjutkan**: Jika gagal, otomatis lanjut dari batch terakhir

### Timeline Otomatis:

- **Menit ke-5**: Batch pertama jalan (30 apps)
- **Menit ke-10**: Batch kedua jalan (30 apps)
- **Menit ke-15**: Batch ketiga jalan (30 apps)
- **...dan seterusnya setiap 5 menit**
- **~2-3 jam**: GitHub sync selesai (~1,170 apps)
- **~3-4 jam**: F-Droid sync selesai (~500 apps)
- **Total**: ~1,670 aplikasi ditambahkan otomatis!

## 📊 Cara Monitor Progress

### Cara 1: Cek via Browser
Buka setiap beberapa menit:
```
https://auto-download-center.vercel.app/api/sync-status
```

Perhatikan angka `totalApps` yang terus naik! 📈

### Cara 2: Cek Website Langsung
Buka homepage:
```
https://auto-download-center.vercel.app
```

Lihat jumlah aplikasi di stats card bertambah! 🎯

### Cara 3: Cek Vercel Logs
Buka Vercel dashboard → Project → Logs

Lihat log eksekusi cron job setiap 5 menit.

## ❓ Troubleshooting

### Jika `/api/sync-status` masih 404:
1. Tunggu 5 menit lagi (deployment mungkin belum selesai)
2. Cek Vercel dashboard, pastikan status "Ready"
3. Cek build logs di Vercel, pastikan tidak ada error

### Jika sync tidak jalan:
1. Pastikan tabel `sync_progress` sudah dibuat di Supabase
2. Cek Environment Variables di Vercel:
   - `SUPABASE_URL` ✅
   - `SUPABASE_SERVICE_ROLE_KEY` ✅
   - `GITHUB_TOKEN` ✅
   - `CRON_SECRET` ✅

### Jika ada error di logs:
- Cek Vercel function logs untuk detail error
- Pastikan semua environment variables terisi
- Pastikan GitHub token masih valid

## 🎯 Indikator Sukses

✅ `/api/sync-status` return JSON (bukan 404)
✅ `totalApps` naik setiap 5 menit
✅ Tidak ada error timeout di Vercel logs
✅ Website menampilkan aplikasi baru di kategori
✅ Setelah beberapa jam, `status` berubah jadi "completed"

## 📞 Bantuan

Jika ada masalah:
1. Cek file `DEPLOYMENT_STATUS.md` untuk detail teknis
2. Cek Vercel logs untuk error messages
3. Cek Supabase logs untuk database errors

---

**Terakhir Update**: 30 April 2026
**Status**: Deployment in progress
**Aksi Selanjutnya**: Tunggu Vercel deploy selesai (2-5 menit), lalu buat tabel database

## 🚀 Ringkasan

**YANG HARUS ANDA LAKUKAN**:
1. ✅ Tunggu Vercel deploy selesai (2-5 menit)
2. ✅ Buat tabel `sync_progress` di Supabase (copy-paste SQL di atas)
3. ✅ Cek `/api/sync-status` untuk konfirmasi

**SETELAH ITU**: Sistem jalan 100% otomatis! 🎉

Tidak perlu trigger manual, tidak perlu PowerShell, tidak perlu apa-apa lagi!
Duduk santai dan lihat aplikasi bertambah setiap 5 menit! ☕
