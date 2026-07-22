# Sewing Line Control — GitHub + Vercel + Supabase

Versi serverless dari Sewing Line Control: frontend statis di Vercel,
backend berupa Vercel Serverless Functions, dan data tersimpan di Postgres
(Supabase). Semua fitur (andon board, ringkasan per line, input/update,
riwayat + filter, chart efisiensi/defect/trend/S-curve, export Excel) sama
persis dengan versi Express — hanya cara penyimpanan datanya yang berbeda.

**Untuk pemakaian pribadi/belajar/demo** (lihat catatan ToS di `DEPLOY.md`).

## Cara deploy

Lihat `DEPLOY.md` untuk langkah lengkap: Supabase → GitHub → Vercel.

## Sistem Role User

Ada 3 role, diatur lewat tabel `profiles` di Supabase:

| Role | Bisa lihat data | Bisa input/update | Bisa hapus | Kelola user |
|---|---|---|---|---|
| **Supervisor Produksi** | Tidak (hanya tab Input) | Ya | Tidak | Tidak |
| **IE (superadmin)** | Ya (Ringkasan + Riwayat) | Ya | Ya | Ya |
| **Tamu** | Ya, hanya tab Ringkasan/Dashboard (tanpa Riwayat/Export) | Tidak | Tidak | Tidak |

Login pakai email/password (Supabase Auth). Akun pertama (IE) dibuat manual
lewat Supabase Dashboard (lihat instruksi di `supabase/schema.sql`); setelah
itu, IE bisa membuat akun supervisor/tamu lain langsung dari tab
"Kelola User" di aplikasi — tidak perlu buka Supabase lagi.

Setiap request ke API diverifikasi ulang di server (folder `api/`), jadi
pembatasan ini bukan cuma sembunyi-sembunyi tombol di frontend — walau
seseorang mencoba memanggil API langsung, role tetap dicek di backend.

## Cara kerja

- `index.html` memanggil `/api/entries` (GET/POST) dan `/api/entries/:id`
  (DELETE) — persis seperti versi Express, cuma sekarang di-handle oleh
  Vercel Serverless Functions di folder `api/`.
- Functions di `api/` memakai Supabase **service_role key** (disimpan
  sebagai Environment Variable di Vercel, tidak pernah dikirim ke browser)
  untuk baca/tulis ke tabel `entries`.
- Aturan "satu entry per line per tanggal" tetap sama: kirim data dengan
  `line` + `date` yang sudah ada akan menimpa entry tersebut (bukan bikin
  duplikat), persis seperti versi sebelumnya.
