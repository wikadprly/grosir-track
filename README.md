# 📦 Grosir Track

> Aplikasi pencatatan bon pelanggan untuk usaha grosir, terinspirasi dari proses pencatatan manual pada usaha keluarga.

## 💡 Latar Belakang

Ide **Grosir Track** berawal dari hal sederhana yang saya temui di usaha grosir keluarga.

Proses pencatatan transaksi pelanggan masih dilakukan secara manual menggunakan buku bon. Setiap transaksi perlu ditulis satu per satu, mulai dari barang, jumlah, harga, hingga pembayaran atau pengurangan hutang. Nama barang juga diingat sendiri tanpa daftar — cukup ditulis langsung di buku.

Ketika transaksi semakin banyak, proses pencatatan manual dapat menjadi melelahkan dan meningkatkan risiko kesalahan dalam penulisan maupun perhitungan.

Dari situ muncul sebuah pertanyaan:

> **"Bagaimana jika pencatatan bon dibuat secara digital, tetapi tetap terasa sesederhana menulis di buku?"**

Dari permasalahan tersebut, saya mengembangkan **Grosir Track**, sebuah aplikasi PWA yang dirancang untuk membantu pencatatan transaksi dan hutang pelanggan secara lebih terstruktur.

Fokus utama proyek ini bukan sekadar mengganti buku dengan aplikasi, tetapi mencari cara agar proses digital tetap mudah dipahami oleh pengguna yang sudah terbiasa dengan pencatatan manual.

## 🎯 Tujuan

Proyek ini bertujuan untuk mengeksplorasi bagaimana teknologi dapat membantu:

* Mengurangi pencatatan dan perhitungan manual.
* Mempermudah pengelolaan data pelanggan dan barang.
* Menghitung total transaksi dan sisa hutang secara otomatis.
* Menyimpan riwayat transaksi secara terstruktur.
* Menyediakan laporan transaksi berdasarkan periode.
* Mempertahankan pengalaman penggunaan yang sederhana seperti buku bon.

## ✨ Fitur

* **Dashboard** — ringkasan transaksi hari ini, uang masuk, dan total piutang.
* **Pelanggan** — daftar pelanggan beserta saldo, pencarian, dan paginasi.
* **Buku Bon Digital** — riwayat transaksi pelanggan (barang & pembayaran) dalam satu tampilan.
* **Data Barang** — mengelola daftar barang dan harga default.
* **Harga Fleksibel** — harga default dapat disesuaikan saat transaksi tertentu (tersimpan sebagai harga saat itu).
* **Catat Barang** — menambahkan beberapa barang sekaligus dalam satu transaksi.
* **Catat Pembayaran** — mencatat pembayaran pelanggan, saldo sisa diperbarui otomatis.
* **Laporan** — melihat ringkasan transaksi per bulan, sisa piutang per pelanggan, dan detail transaksi.
* **Ubah PIN** — mengganti PIN keamanan dari halaman pengaturan.
* **Backup & Import** — mencadangkan seluruh data ke JSON dan memulihkannya kembali.
* **Export Laporan** — mengunduh laporan bulanan dalam format Excel (.xlsx).
* **PWA** — dapat diinstal pada perangkat mobile seperti aplikasi.

## 🧠 User-Centered Design

Salah satu tantangan utama dalam proyek ini adalah bagaimana membuat sistem digital yang tetap mudah dipahami oleh pengguna yang sudah terbiasa menggunakan buku bon.

Karena itu, beberapa keputusan desain dibuat berdasarkan kebiasaan pencatatan manual:

* Riwayat transaksi pelanggan ditampilkan dalam satu halaman yang memanjang — seperti membuka buku bon.
* Transaksi barang dan pembayaran berada dalam satu alur pencatatan.
* Sisa hutang selalu ditampilkan dengan jelas.
* Penambahan transaksi dibuat sesingkat mungkin — pilih pelanggan, tambah barang, selesai.
* Antarmuka dirancang **mobile-first** dengan navigasi di bagian bawah layar.
* Perhitungan saldo dilakukan otomatis di database untuk mengurangi kesalahan manual.
* Semua waktu menggunakan zona waktu **Asia/Jakarta** agar konsisten dengan kebiasaan pengguna.

## 🛠️ Tech Stack

* **Next.js 16** — App Router & Server Actions
* **React 19**
* **Tailwind CSS 4**
* **Prisma 7** — ORM dengan PostgreSQL Adapter
* **PostgreSQL** — database
* **JWT Authentication** — PIN-based login, cookie session (httpOnly, 30 hari)
* **ExcelJS** — export laporan ke Excel
* **Zod** — validasi data (backup/import)
* **PWA** — Service Worker + Web App Manifest

## 📱 Screenshots

### Dashboard

*Tambahkan screenshot dashboard di sini.*

### Buku Bon Pelanggan

*Tambahkan screenshot halaman detail pelanggan di sini.*

### Pencatatan Transaksi

*Tambahkan screenshot proses pencatatan barang di sini.*

### Laporan

*Tambahkan screenshot laporan di sini.*

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL

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

## 📌 Status Proyek

**Personal Project — Prototype**

Grosir Track merupakan proyek personal yang dikembangkan berdasarkan observasi terhadap proses pencatatan usaha keluarga.

Aplikasi ini masih berada dalam tahap pengembangan dan evaluasi. Fokus utama proyek adalah mengeksplorasi bagaimana proses pencatatan bon manual dapat diterjemahkan menjadi pengalaman digital yang sederhana dan mudah digunakan.

## 🔍 Pembelajaran

Melalui proyek ini, saya belajar bahwa membangun sebuah aplikasi bukan hanya mengenai bagaimana membuat fitur bekerja, tetapi juga mengenai **memahami kebiasaan, kebutuhan, dan keterbatasan pengguna**.

Sebuah solusi digital belum tentu lebih baik hanya karena lebih modern. Solusi yang baik adalah solusi yang benar-benar sesuai dengan konteks penggunanya.

## 📄 License

MIT
