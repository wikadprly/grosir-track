# Audit Sistem — Toko Rema

Tanggal audit: 26 Oktober 2026
Stack: Next.js 16 + React 19 + Prisma 7 (PostgreSQL) + Tailwind 4 + PWA

## Ringkasan Hasil

| Pemeriksaan | Hasil |
| --- | --- |
| TypeScript (`npx tsc --noEmit`) | Bersih |
| ESLint (`npm run lint`) | 1 warning (`<img>` di halaman masuk) |
| `npm audit --omit=dev` | Beberapa advisory high pada dependensi build/tooling |
| Test otomatis | Unit test qty + `npm run check` di CI; `scripts/verify-*` database masih manual |

Arsitektur sudah baik: Server Actions selalu diawali `requireSession()`, saldo dihitung di database, `clientRef` membuat sync offline idempoten, `recordTime` memakai advisory lock, dan relasi sudah cascade.

## Prioritas P1 — Bug & Risiko Data (dikerjakan)

- [x] **P1-1 Ikon publik terblokir middleware.** `/icon.png` dipakai halaman login dan manifest, tetapi tidak ada di `PUBLIC_PATHS` (`src/proxy.ts`). Akibatnya logo login rusak dan ikon PWA bisa gagal dimuat sebelum login. Perbaikan: tambahkan seluruh aset ikon publik (termasuk maskable & apple touch).
- [x] **P1-2 Import backup kehilangan data.** `category` dan `clientRef` tidak ada di skema zod import (`src/app/api/import/route.ts`), padahal diekspor oleh backup. Perbaikan: tambahkan kedua field dan simpan saat restore.
- [x] **P1-3 Import backup besar timeout.** `$transaction` interaktif tanpa opsi memakai default 5 detik. Perbaikan: `timeout` 5 menit + `maxWait` 15 detik.
- [x] **P1-4 Import bisa mengunci aplikasi & menghidupkan sesi lama.** Jika `users` kosong semua akun terhapus; `tokenVersion` juga kembali 0 sehingga cookie lama yang sudah dicabut bisa valid lagi. Perbaikan: tolak backup tanpa user, naikkan `tokenVersion`, pertahankan `recoveryPin` untuk akun yang sama, dan terbitkan ulang sesi agar pengguna tidak terkunci setelah restore.
- [x] **P1-5 Overflow saldo.** `saldo` di-cast `::int` (`src/lib/balanceQuery.ts`), maksimum ±Rp2,1 miliar. Perbaikan: hitung sebagai `bigint` lalu konversi aman ke `Number`.
- [x] **P1-6 Zona waktu bergantung pada TZ server.** Helper di `src/lib/time.ts` memakai konstruktor `Date` lokal. Di server UTC batas hari/bulan bergeser. Perbaikan: bangun timestamp dengan offset `+07:00` eksplisit (WIB tidak memakai DST).
- [x] **P1-7 PIN seed lemah.** `prisma/seed.ts` membuat PIN `123456`. Perbaikan: seeding wajib diisi `SEED_PIN` 6 digit; tanpa itu seed berhenti sebelum menulis data.

## Prioritas P2 — Performa (sebagian dikerjakan)

- [x] **P2-9 Index tanggal.** Query laporan/dashboard memfilter `date` saja, sedangkan index yang ada `[customerId, date]`. Perbaikan: tambah `@@index([date])` pada `Transaction` & `Payment` + migration.
- [x] **P2-11 Aset ikon berat.** Semua ikon 1278×1230 dan ±1,2 MB, ukuran deklarasi manifest tidak cocok. Perbaikan: generate ulang 192/512/maskable/apple-touch yang persegi dan terkompresi, update manifest + precache SW.
- [ ] **P2-8 Saldo dihitung penuh setiap request.** `getCustomerBalances()` memindai seluruh riwayat dan dipanggil di dashboard, daftar pelanggan, laporan, dan export. Rencana: kolom saldo ter-cache yang diperbarui saat transaksi/pembayaran berubah, atau materialized view + refresh.
- [ ] **P2-10 Detail pelanggan memuat seluruh riwayat.** `getCustomerDetail()` mengambil semua transaksi lalu difilter per bulan di client. Rencana: filter rentang bulan di server dan hitung saldo awal bulan dengan query agregat.
- [ ] **P2-12 Cache service worker menyimpan HTML terautentikasi.** Pembersihan hanya saat tombol logout diklik. Rencana: penanda sesi + pembersihan saat cookie kedaluwarsa, dan batas ukuran cache.

## Prioritas P3 — Kualitas & Operasional (sebagian dikerjakan)

- [x] **P3-15 Validasi harga menerima desimal.** Perbaikan: `Number.isInteger` pada transaksi/edit, serta validasi nama/harga pada CRUD barang.
- [x] **P3-13 Test & CI.** Perbaikan: `npm run check` menjalankan ESLint, TypeScript, dan `scripts/verify-qty.ts`; GitHub Actions menjalankan pemeriksaan yang sama. Tes database `scripts/verify-*` masih manual karena membutuhkan PostgreSQL berisi data.
- [ ] **P3-14 Duplikasi ringkasan laporan** antara `laporan/actions.ts` dan `api/export/laporan/route.ts`. Rencana: satu fungsi agregat bersama.
- [ ] **P3-16 Sisa konfigurasi tak terpakai.** `NEXTAUTH_URL`/`NEXTAUTH_SECRET` di `.env` dan folder kosong `buku-bon/`. Rencana: bersihkan saat menyentuh environment deploy.
- [ ] **P3-17 Database lokal.** `DATABASE_URL` mengarah ke `localhost`; deploy butuh Postgres terkelola + pooling + SSL.
- [ ] **P3-18 Middleware tidak cek `tokenVersion`.** Aman karena setiap akses data memanggil `requireSession()`, tetapi pemeriksaan tambahan di proxy akan menambah lapisan pertahanan (dengan biaya query DB per request).
- [x] **P3-19 Tombol masuk menerima 4 digit.** UI mengaktifkan tombol masuk pada 4 digit, sedangkan server mewajibkan 6 digit. Perbaikan: tombol dan pengiriman PIN menunggu tepat 6 digit.
- [x] **P3-20 Jumlah barang hanya bilangan bulat.** Transaksi curah seperti 1,5 kg tidak bisa dicatat. Perbaikan: `qty` menjadi `Decimal(12,3)`, input menerima koma/titik, validasi 3 desimal, subtotal dibulatkan ke rupiah, dan backup/import serta export menangani format desimal.

## Batasan Perbaikan Ini

- Migration `add_date_indexes` dan `decimal_qty` perlu dijalankan dengan `npx prisma migrate deploy` (atau `migrate dev` saat pengembangan).
- Perubahan zona waktu aman untuk data yang sudah ada bila server berjalan di WIB. Data lama yang dibuat di server non-WIB perlu diverifikasi ulang.
- Perbaikan P2-8/P2-10/P2-12 sengaja ditunda karena menyentuh alur data inti dan perlu pengujian terpisah.
