"use client";

import { ArrowLeft, MoreVertical, Package, Banknote } from "lucide-react";
import Link from "next/link";

// --- DUMMY DATA SESUAI GAMBAR ---
const namaPelanggan = "Bu Ito";
const sisaHutang = 1697500;

const riwayatTransaksi = [
  {
    id: 1,
    tanggal: "7 Juli 2025",
    jenis: "barang",
    items: [
      { nama: "50 Benang", harga: 65000 },
      { nama: "ABC Susu", harga: 197000 },
      { nama: "Good Day", harga: 17000 },
      { nama: "30 Gula Pasir", harga: 904000 },
    ],
    total: 1183000,
    saldo: 2229500,
  },
  {
    id: 2,
    tanggal: "11 Juli 2025",
    jenis: "nitip",
    nominal: 1500000,
    saldo: 729500,
  },
  {
    id: 3,
    tanggal: "13 Juli 2025",
    jenis: "barang",
    items: [
      { nama: "50kg Beras", harga: 650000 },
      { nama: "1 DS Sajiku", harga: 286500 },
    ],
    total: 936500,
    saldo: 1379500,
  },
];

// Fungsi untuk format angka 1000 jadi 1.000 (tanpa Rp)
const formatAngka = (angka: number) => {
  return new Intl.NumberFormat("id-ID").format(angka);
};

export default function DetailPelangganPage() {
  return (
    <main className="min-h-screen bg-[#faf9f7] relative pb-28">
      {/* 1. HEADER (Menempel di atas) */}
      <div className="flex justify-between items-center px-5 pt-8 pb-4 bg-[#faf9f7] sticky top-0 z-10">
        <Link href="/pelanggan" className="text-[#e65c5c] active:scale-95 transition-transform">
          <ArrowLeft size={26} />
        </Link>
        <h1 className="text-xl font-bold text-[#e65c5c]">{namaPelanggan}</h1>
        <button className="text-[#e65c5c] active:scale-95 transition-transform">
          <MoreVertical size={26} />
        </button>
      </div>

      {/* 2. KARTU SISA HUTANG */}
      <div className="px-5 mt-2">
        <div className="bg-[#fff5f5] border border-[#ffe6e6] rounded-2xl p-5 shadow-sm">
          <p className="text-[15px] font-semibold text-gray-700 mb-1">Sisa Hutang</p>
          <p className="text-3xl font-bold text-[#e65c5c]">
            Rp {formatAngka(sisaHutang)}
          </p>
        </div>
      </div>

      {/* 3. DAFTAR RIWAYAT TRANSAKSI */}
      <div className="px-5 mt-8 space-y-6">
        {riwayatTransaksi.map((trx, index) => (
          <div key={trx.id} className={index !== 0 ? "pt-6 border-t border-gray-200" : ""}>
            <p className="text-[15px] font-bold text-gray-900 mb-4">{trx.tanggal}</p>
            
            {trx.jenis === "barang" ? (
              // TAMPILAN JIKA HUTANG BARANG
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#3b82f6]">
                  <Package size={20} strokeWidth={2.5} />
                  <span className="text-[15px] font-bold">Barang</span>
                </div>
                
                <div className="space-y-2.5 mb-3">
                  {trx.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[15px] text-gray-700">
                      <span>{item.nama}</span>
                      <span>{formatAngka(item.harga)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between text-[15px] font-bold text-gray-900 mb-1 pt-1">
                  <span>Total</span>
                  <span>{formatAngka(trx.total || 0)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-bold text-[#e65c5c]">
                  <span>Saldo</span>
                  <span>{formatAngka(trx.saldo)}</span>
                </div>
              </div>
            ) : (
              // TAMPILAN JIKA NITIP / PEMBAYARAN
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-[#20a049]">
                    <Banknote size={20} strokeWidth={2.5} />
                    <span className="text-[15px] font-bold">Nitip (Pembayaran)</span>
                  </div>
                  <span className="text-[15px] font-bold text-[#20a049]">
                    {formatAngka(trx.nominal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-[15px] font-bold text-[#e65c5c]">
                  <span>Saldo</span>
                  <span>{formatAngka(trx.saldo)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. TOMBOL TAMBAH CATATAN (Sticky Bottom) */}
      <div className="fixed bottom-[88px] left-0 right-0 px-5 max-w-md mx-auto z-20 pointer-events-none">
        <button 
          className="w-full bg-[#e65c5c] text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(230,92,92,0.3)] hover:bg-red-600 active:scale-[0.98] transition-all pointer-events-auto text-[17px] tracking-wide"
        >
          + Tambah Catatan
        </button>
      </div>
    </main>
  );
}
