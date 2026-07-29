"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { ArrowLeft, MoreVertical, Package, Banknote, X, ShoppingBag, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTransaction, deletePayment } from "./actions";

const formatAngka = (angka: number) => {
  return new Intl.NumberFormat("id-ID").format(angka);
};

interface FlatEntry {
  id: number;
  dbId: string;
  jenis: "barang" | "nitip";
  items?: { nama: string; harga: number }[];
  total?: number;
  nominal?: number;
  sisa: number;
  jam?: string;
}

interface HariRiwayat {
  tanggal: string;
  tanggalDisplay: string;
  entries: FlatEntry[];
}

interface Props {
  pelangganId: string;
  namaPelanggan: string;
  sisaHutang: number;
  riwayatHari: HariRiwayat[];
}

export default function DetailPelangganClient({ pelangganId, namaPelanggan, sisaHutang, riwayatHari }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hapusEntry, setHapusEntry] = useState<FlatEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  const konfirmasiHapus = async () => {
    if (!hapusEntry) return;
    startTransition(async () => {
      if (hapusEntry.jenis === "barang") {
        await deleteTransaction(hapusEntry.dbId, pelangganId);
      } else {
        await deletePayment(hapusEntry.dbId, pelangganId);
      }
      setHapusEntry(null);
      router.refresh();
    });
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] relative pb-28">
      {/* 1. HEADER (sticky) */}
      <div className="sticky top-0 z-10 bg-[#faf9f7] px-5 pt-8 pb-4 flex justify-between items-center">
        <Link href="/pelanggan" className="text-[#e65c5c] active:scale-95 transition-transform">
          <ArrowLeft size={26} />
        </Link>
        <h1 className="text-xl font-bold text-[#e65c5c]">{namaPelanggan}</h1>
        <button className="text-[#e65c5c] active:scale-95 transition-transform">
          <MoreVertical size={26} />
        </button>
      </div>

      {/* Total Sisa Hutang */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-[15px] text-gray-500 font-medium">Total Sisa Hutang</span>
          <span className={`text-xl font-bold ${sisaHutang > 0 ? "text-[#e65c5c]" : "text-[#20a049]"}`}>
            {sisaHutang > 0 ? `Rp ${formatAngka(sisaHutang)}` : "LUNAS"}
          </span>
        </div>
      </div>

      {/* 3. DAFTAR RIWAYAT PER HARI */}
      <div className="px-5 mt-4 space-y-6">
        {riwayatHari.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Belum ada transaksi</p>
        ) : (
          riwayatHari.map((hari) => (
            <div key={hari.tanggal} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h2 className="text-[16px] font-bold text-gray-900 mb-4">{hari.tanggalDisplay}</h2>

              {hari.entries.map((entry) => (
                <div key={entry.id} className="mb-4 last:mb-0 group relative">
                  {entry.jenis === "nitip" ? (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2 text-[#20a049]">
                          <Banknote size={18} strokeWidth={2.5} />
                          <span className="text-[14px] font-bold">Nitip (Pembayaran)</span>
                          <span className="text-[12px] text-gray-400 font-medium">{entry.jam}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHapusEntry(entry)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <span className="text-[14px] font-bold text-[#20a049]">
                            -Rp {formatAngka(entry.nominal!)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[14px] font-bold pl-10">
                        <span className="text-gray-900">Sisa</span>
                        <span className="text-[#e65c5c]">Rp {formatAngka(entry.sisa)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-[#3b82f6]">
                          <Package size={18} strokeWidth={2.5} />
                          <span className="text-[14px] font-bold">Barang ({entry.items!.length} item)</span>
                          <span className="text-[12px] text-gray-400 font-medium">{entry.jam}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHapusEntry(entry)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <span className="text-[14px] font-bold text-gray-900">
                            +Rp {formatAngka(entry.total!)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-2">
                        {entry.items!.map((item, i) => (
                          <div key={i} className="flex justify-between text-[14px] text-gray-700 pl-10">
                            <span>{item.nama}</span>
                            <span>Rp {formatAngka(item.harga)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[14px] font-bold pl-10 mt-3">
                        <span className="text-gray-900">Sisa</span>
                        <span className="text-[#e65c5c]">Rp {formatAngka(entry.sisa)}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {hapusEntry && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] max-w-md mx-auto">
          <div className="bg-white w-full rounded-t-[28px] px-6 pt-6 pb-8 animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Hapus Catatan?</h2>
              <p className="text-[15px] text-gray-500 mt-2">
                {hapusEntry.jenis === "barang"
                  ? `Transaksi barang sebesar Rp ${formatAngka(hapusEntry.total!)} akan dihapus.`
                  : `Pembayaran Rp ${formatAngka(hapusEntry.nominal!)} akan dihapus.`}
              </p>
              <p className="text-[14px] text-red-400 font-semibold mt-1">Tidak bisa dibatalkan.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={konfirmasiHapus}
                disabled={isPending}
                className="w-full py-3.5 font-bold text-white bg-red-500 rounded-[18px] active:bg-red-600 transition-colors text-[17px] disabled:opacity-50"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
              <button
                onClick={() => setHapusEntry(null)}
                disabled={isPending}
                className="w-full py-3.5 font-bold text-gray-900 bg-white border border-gray-200 rounded-[18px] active:bg-gray-100 transition-colors text-[17px]"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      {/* 4. TOMBOL TAMBAH CATATAN */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#e65c5c] text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(230,92,92,0.3)] hover:bg-red-600 active:scale-[0.98] transition-all text-[17px] tracking-wide"
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