"use client";

import { useState } from "react";
import { ArrowLeft, MoreVertical, Package, Banknote, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formatAngka = (angka: number) => {
  return new Intl.NumberFormat("id-ID").format(angka);
};

interface RiwayatBarang {
  jenis: "barang";
  id: string;
  tanggal: string;
  items: { nama: string; harga: number }[];
  total: number;
}

interface RiwayatNitip {
  jenis: "nitip";
  id: string;
  tanggal: string;
  nominal: number;
}

type RiwayatItem = RiwayatBarang | RiwayatNitip;

interface Props {
  pelangganId: string;
  namaPelanggan: string;
  sisaHutang: number;
  riwayatTransaksi: RiwayatItem[];
}

export default function DetailPelangganClient({ pelangganId, namaPelanggan, sisaHutang, riwayatTransaksi }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#faf9f7] relative pb-28">
      {/* 1. HEADER */}
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
            {sisaHutang > 0 ? `Rp ${formatAngka(sisaHutang)}` : "LUNAS"}
          </p>
        </div>
      </div>

      {/* 3. DAFTAR RIWAYAT TRANSAKSI */}
      <div className="px-5 mt-8 space-y-6">
        {riwayatTransaksi.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Belum ada transaksi</p>
        ) : (
          riwayatTransaksi.map((trx, index) => (
            <div key={trx.id} className={index !== 0 ? "pt-6 border-t border-gray-200" : ""}>
              <p className="text-[15px] font-bold text-gray-900 mb-4">{trx.tanggal}</p>
              
              {trx.jenis === "barang" ? (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-[#3b82f6]">
                    <Package size={20} strokeWidth={2.5} />
                    <span className="text-[15px] font-bold">Barang</span>
                  </div>
                  
                  <div className="space-y-2.5 mb-3">
                    {trx.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[15px] text-gray-700">
                        <span>{item.nama}</span>
                        <span>{formatAngka(item.harga)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-[15px] font-bold text-gray-900 mb-1 pt-1">
                    <span>Total</span>
                    <span>{formatAngka(trx.total)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-[#20a049]">
                      <Banknote size={20} strokeWidth={2.5} />
                      <span className="text-[15px] font-bold">Nitip (Pembayaran)</span>
                    </div>
                    <span className="text-[15px] font-bold text-[#20a049]">
                      {formatAngka(trx.nominal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 4. TOMBOL TAMBAH CATATAN */}
      <div className="fixed bottom-[88px] left-0 right-0 px-5 max-w-md mx-auto z-20 pointer-events-none">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#e65c5c] text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(230,92,92,0.3)] hover:bg-red-600 active:scale-[0.98] transition-all pointer-events-auto text-[17px] tracking-wide"
        >
          + Tambah Catatan
        </button>
      </div>

      {/* 5. MODAL BOTTOM SHEET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] max-w-md mx-auto">
          <div className="bg-white w-full rounded-t-[28px] px-6 pt-6 pb-8 animate-in slide-in-from-bottom-10 duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tambah Catatan</h2>
                <p className="text-[15px] text-gray-600 mt-0.5">Mau catat apa?</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-900 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Pilihan */}
            <div className="space-y-3.5">
              <button 
                onClick={() => { setIsModalOpen(false); router.push(`/pelanggan/${pelangganId}/barang`); }}
                className="w-full flex items-center gap-4 bg-white p-4 rounded-[20px] border border-gray-200 active:bg-[#fff5f5] transition-colors text-left shadow-sm"
              >
                <div className="p-3 bg-[#fff5f5] text-[#e65c5c] rounded-2xl">
                  <ShoppingBag size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[17px]">Catat Barang</h3>
                  <p className="text-[14px] text-gray-500 mt-0.5">Catat barang yang dibeli</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsModalOpen(false); router.push(`/pelanggan/${pelangganId}/nitip`); }}
                className="w-full flex items-center gap-4 bg-white p-4 rounded-[20px] border border-gray-200 active:bg-[#ebfaef] transition-colors text-left shadow-sm"
              >
                <div className="p-3 bg-[#ebfaef] text-[#20a049] rounded-2xl">
                  <Banknote size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[17px]">Catat Nitip (Pembayaran)</h3>
                  <p className="text-[14px] text-gray-500 mt-0.5">Catat pembayaran / pengurangan hutang</p>
                </div>
              </button>
            </div>

            {/* Tombol Batal */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-5 py-3.5 font-bold text-gray-900 bg-white border border-gray-200 rounded-[18px] active:bg-gray-100 transition-colors text-[17px]"
            >
              Batal
            </button>

          </div>
        </div>
      )}
    </main>
  );
}
