# 📦 Grosir Track

> Aplikasi pencatatan bon pelanggan untuk usaha grosir, terinspirasi dari proses pencatatan manual pada usaha keluarga.

## 💡 Latar Belakang

Ide **Grosir Track** berawal dari hal sederhana yang saya temui di usaha grosir keluarga.

Proses pencatatan transaksi pelanggan masih dilakukan secara manual menggunakan buku bon. Setiap transaksi perlu ditulis satu per satu, mulai dari barang, jumlah, harga, hingga pembayaran. Nama barang juga diingat sendiri tanpa daftar — cukup ditulis langsung di buku.

Ketika transaksi semakin banyak, proses pencatatan manual menjadi melelahkan dan meningkatkan risiko kesalahan.

> **"Bagaimana jika pencatatan bon dibuat secara digital, tetapi tetap terasa sesederhana menulis di buku?"**

Dari permasalahan tersebut, saya mengembangkan **Grosir Track** — sebuah aplikasi PWA yang membantu pencatatan transaksi dan hutang pelanggan secara lebih terstruktur, tanpa menghilangkan kemudahan yang sudah biasa dirasakan dari buku bon.

---

## 🎯 Tujuan

- Mengurangi pencatatan dan perhitungan manual.
- Mempermudah pengelolaan data pelanggan dan barang.
- Menghitung total transaksi dan sisa hutang secara otomatis.
- Menyimpan riwayat transaksi secara terstruktur.
- Menyediakan laporan transaksi berdasarkan periode.
- Mempertahankan pengalaman penggunaan yang sederhana seperti buku bon.

---

## ✨ Fitur

- **Dashboard** — ringkasan transaksi hari ini, uang masuk, dan total piutang.
- **Pelanggan** — daftar pelanggan beserta saldo, pencarian, dan paginasi.
- **Buku Bon Digital** — riwayat transaksi pelanggan (barang & pembayaran) dalam satu tampilan.
- **Data Barang** — mengelola daftar barang dan harga default.
- **Harga Fleksibel** — harga default dapat disesuaikan saat transaksi tertentu dan tersimpan sebagai harga transaksi pada saat itu.
- **Catat Barang** — menambahkan beberapa barang sekaligus dalam satu transaksi.
- **Catat Pembayaran** — mencatat pembayaran pelanggan dan memperbarui saldo secara otomatis.
- **Laporan** — melihat ringkasan transaksi per bulan, sisa piutang per pelanggan, dan detail transaksi.
- **Ubah PIN** — mengganti PIN keamanan dari halaman pengaturan.
- **Backup & Import** — mencadangkan seluruh data ke JSON dan memulihkannya kembali.
- **Export Laporan** — mengunduh laporan bulanan dalam format Excel `.xlsx`.
- **PWA** — dapat diinstal pada perangkat mobile seperti aplikasi.

---

## 🧠 User-Centered Design

Salah satu tantangan utama adalah membuat sistem digital yang tetap mudah dipahami oleh pengguna yang sudah terbiasa menggunakan buku bon.

Beberapa keputusan desain dibuat berdasarkan kebiasaan pencatatan manual:

- Riwayat transaksi pelanggan ditampilkan dalam satu halaman yang memanjang — seperti membuka buku bon.
- Transaksi barang dan pembayaran berada dalam satu alur pencatatan.
- Sisa hutang selalu ditampilkan dengan jelas.
- Penambahan transaksi dibuat sesingkat mungkin — pilih pelanggan, tambah barang, selesai.
- Beberapa barang dapat ditambahkan dalam satu transaksi tanpa berpindah halaman berulang kali.
- Harga default barang dapat digunakan sebagai nilai awal, tetapi tetap dapat disesuaikan ketika transaksi dibuat.
- Antarmuka dirancang **mobile-first** dengan navigasi di bagian bawah layar.
- Perhitungan saldo dilakukan secara otomatis untuk mengurangi kesalahan perhitungan manual.
- Semua waktu menggunakan zona waktu **Asia/Jakarta** agar konsisten dengan kebiasaan pengguna.

Tujuan utamanya adalah membuat aplikasi yang tidak terasa seperti sistem administrasi yang kompleks, tetapi lebih seperti **buku bon yang dibuat dalam bentuk digital**.

---

## 🏗️ Perancangan Sistem

Dalam merancang Grosir Track, saya menentukan kebutuhan berdasarkan proses pencatatan yang berjalan secara manual. Beberapa keputusan utama:

### Pelanggan

Setiap pelanggan memiliki buku bon digital yang berisi seluruh riwayat transaksi.

### Barang

Barang disimpan dalam database beserta harga default yang dapat dikelola melalui aplikasi.

### Transaksi

Satu transaksi dapat berisi beberapa barang sekaligus. Harga yang digunakan pada transaksi disimpan sebagai harga transaksi sehingga perubahan harga barang di kemudian hari tidak mengubah riwayat transaksi sebelumnya.

### Pembayaran

Pembayaran pelanggan dicatat sebagai transaksi tersendiri dan otomatis mengurangi saldo hutang.

### Saldo

Saldo pelanggan dihitung berdasarkan riwayat transaksi barang dan pembayaran sehingga posisi hutang dapat diketahui tanpa perhitungan manual.

---

## 🛠️ Tech Stack

- **Next.js 16** — App Router & Server Actions
- **React 19**
- **Tailwind CSS 4**
- **Prisma 7** — ORM dengan PostgreSQL Adapter
- **PostgreSQL** — database
- **JWT Authentication** — PIN-based login dengan cookie session
- **ExcelJS** — export laporan ke Excel
- **Zod** — validasi data backup/import
- **PWA** — Service Worker + Web App Manifest

---

## 🤖 AI Usage & Development Disclaimer

Proyek ini dikembangkan dengan memanfaatkan AI tools sebagai **development assistant** selama proses perancangan dan pengembangan.

### AI yang digunakan

- **ChatGPT**
- **Gemini**
- **Claude**

Ketiga AI tersebut saya gunakan terutama sebagai **partner diskusi** untuk:

- Brainstorming ide dan solusi
- Menganalisis permasalahan
- Mengevaluasi user flow dan desain UX/UI
- Membahas struktur sistem dan business rules
- Mengevaluasi pilihan teknologi
- Membantu memahami error atau masalah teknis

Untuk implementasi kode, saya menggunakan **OpenCode** sebagai coding assistant.

### Peran Developer

Meskipun menggunakan AI, **perancangan dan pengambilan keputusan utama tetap dilakukan oleh saya**:

- Identifikasi masalah dan kebutuhan pengguna
- User flow dan business rules
- Konsep aplikasi dan struktur fitur
- Keputusan UX/UI dan rancangan database
- Pemilihan teknologi dan bagaimana sistem seharusnya bekerja

Setiap implementasi dari AI tetap saya **review, pahami, sesuaikan, uji, dan validasi** terhadap kebutuhan sistem. AI digunakan sebagai alat bantu, sedangkan tanggung jawab terhadap desain, keputusan teknis, dan hasil akhir tetap berada pada developer.

---

## 📱 Screenshots

### Dashboard

> Tambahkan screenshot dashboard di sini.

### Buku Bon Pelanggan

> Tambahkan screenshot halaman detail pelanggan di sini.

### Pencatatan Transaksi

> Tambahkan screenshot proses pencatatan barang di sini.

### Laporan

> Tambahkan screenshot laporan di sini.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
git clone https://github.com/wikadprly/grosir-track.git
cd grosir-track
npm install
```

### Environment Variables

Buat file `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grosirtrack"
AUTH_SECRET="minimal-32-karakter-acak"
```

### Database Setup

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Kemudian buka:

```text
http://localhost:3000/masuk
```

---

## 📂 Struktur Aplikasi

```text
src/
├── app/
│   ├── (app)/                  # Halaman utama (protected)
│   │   ├── page.tsx            # Dashboard
│   │   ├── pelanggan/          # Daftar & detail pelanggan
│   │   │   ├── [id]/           # Buku bon digital per pelanggan
│   │   │   └── tambah/         # Tambah pelanggan baru
│   │   ├── barang/             # Kelola data barang
│   │   ├── laporan/            # Laporan transaksi per periode
│   │   └── pengaturan/         # Pengaturan aplikasi
│   │       ├── keamanan/       # Ubah PIN
│   │       ├── backup/         # Backup data
│   │       ├── import/         # Import data dari backup
│   │       └── barang/         # Import data barang
│   ├── api/
│   │   ├── backup/             # API endpoint backup JSON
│   │   ├── export/laporan/     # API endpoint export Excel
│   │   └── import/             # API endpoint import backup
│   └── masuk/                  # Halaman login PIN
├── lib/
│   ├── auth.ts                 # Autentikasi & sesi
│   ├── balance.ts              # Logika perhitungan saldo (JS)
│   ├── balanceQuery.ts         # Query SQL saldo (window function)
│   ├── format.ts               # Format angka & rupiah
│   ├── jwt.ts                  # JWT HS256 via Web Crypto
│   ├── prisma.ts               # Prisma client singleton
│   ├── recordTime.ts           # Timestamp urut per hari
│   ├── session.ts              # Konstanta session cookie
│   └── time.ts                 # Helper zona waktu Asia/Jakarta
├── components/
│   ├── BottomNav.tsx           # Navigasi bawah
│   └── ServiceWorkerRegistration.tsx
└── proxy.ts                    # Middleware autentikasi
```

---

## 📌 Status Proyek

**Personal Project — Prototype**

Grosir Track merupakan proyek personal yang dikembangkan berdasarkan observasi terhadap proses pencatatan usaha keluarga. Aplikasi ini masih berada dalam tahap pengembangan dan evaluasi.

---

## 🔍 Pembelajaran

Melalui proyek ini, saya belajar bahwa membangun sebuah aplikasi bukan hanya mengenai bagaimana membuat fitur bekerja, tetapi juga mengenai **memahami kebiasaan, kebutuhan, dan keterbatasan pengguna**.

Sebuah solusi digital belum tentu lebih baik hanya karena lebih modern. Solusi yang baik adalah solusi yang benar-benar sesuai dengan konteks penggunanya.

---

## 📄 License

MIT
