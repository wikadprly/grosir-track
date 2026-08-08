"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { ArrowLeft, MoreVertical, Package, Banknote, X, ShoppingBag, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTransaction, deletePayment } from "./actions";
import { formatRupiah } from "@/lib/format";
import { jakartaDateKey } from "@/lib/time";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function bulanNama(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${BULAN[m - 1]} ${y}`;
}

function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

interface FlatEntry {
  id: number;
  dbId: string;
  jenis: "barang" | "nitip";
  items?: { nama: string; harga: number }[];
  total?: number;
  nominal?: number;
  sisa: number;
  kembalian?: number;
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
  riwayatHari: HariRiwayat[];
}

export default function DetailPelangganClient({ pelangganId, namaPelanggan, riwayatHari }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hapusEntry, setHapusEntry] = useState<FlatEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentMonth = jakartaDateKey(new Date()).slice(0, 7);
  const sortedHari = [...riwayatHari].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const availableMonths = [...new Set(sortedHari.map((h) => h.tanggal.slice(0, 7)))].sort();

  const [monthKey, setMonthKey] = useState(() => {
    const now = jakartaDateKey(new Date()).slice(0, 7);
    if (availableMonths.length === 0) return now;
    if (!availableMonths.includes(now)) return availableMonths[availableMonths.length - 1];
    return now;
  });

  const earliestMonth = availableMonths.length > 0 ? availableMonths[0] : currentMonth;

  let sisaSebelumBulan = 0;
  let bulanSisaSebelum = "";
  if (sortedHari.length > 0) {
    const sisaMap = new Map<string, number>();
    for (const hari of sortedHari) {
      const month = hari.tanggal.slice(0, 7);
      sisaMap.set(month, hari.entries[hari.entries.length - 1].sisa);
    }
    const monthsBefore = [...sisaMap.keys()].filter((m) => m < monthKey).sort();
    if (monthsBefore.length > 0) {
      sisaSebelumBulan = sisaMap.get(monthsBefore[monthsBefore.length - 1]) ?? 0;
      bulanSisaSebelum = monthsBefore[monthsBefore.length - 1];
    }
  }

  const riwayatBulan = sortedHari.filter((h) => h.tanggal.startsWith(monthKey));

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

      {/* 3. NAVIGATOR BULAN */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-1.5">
          <button
            onClick={() => setMonthKey((m) => shiftMonth(m, -1))}
            disabled={monthKey <= earliestMonth}
            className="p-2 rounded-xl text-[#e65c5c] active:bg-red-50 transition-colors disabled:opacity-30 disabled:active:bg-transparent"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="relative flex-1 flex justify-center">
            <select
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              className="appearance-none bg-transparent text-[15px] font-bold text-gray-900 text-center cursor-pointer px-8 focus:outline-none"
            >
              {availableMonths.length > 0 ? (
                availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {bulanNama(m)}
                  </option>
                ))
              ) : (
                <option value={monthKey}>{bulanNama(monthKey)}</option>
              )}
            </select>
            <ChevronLeft
              size={14}
              className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 rotate-90"
            />
          </div>
          <button
            onClick={() => setMonthKey((m) => shiftMonth(m, 1))}
            disabled={monthKey >= currentMonth}
            className="p-2 rounded-xl text-[#e65c5c] active:bg-red-50 transition-colors disabled:opacity-30 disabled:active:bg-transparent"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Sisa dari bulan sebelumnya */}
      {sisaSebelumBulan > 0 && (
        <div className="px-5 mt-3">
          <div className="rounded-2xl p-4 bg-[#fff7f0] border border-orange-100 flex justify-between items-center">
            <span className="text-[14px] font-semibold text-gray-700">
              {bulanSisaSebelum ? `Sisa dari ${bulanNama(bulanSisaSebelum)}` : "Sisa dari bulan sebelumnya"}
            </span>
            <span className="text-[17px] font-extrabold text-[#e65c5c]">{formatRupiah(sisaSebelumBulan)}</span>
          </div>
        </div>
      )}

      {/* 4. DAFTAR RIWAYAT PER HARI (filter bulan) */}
      <div className="px-5 mt-4 space-y-6">
        {riwayatBulan.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-6">
            Tidak ada transaksi di bulan ini
          </p>
        ) : (
          riwayatBulan.map((hari) => (
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
                            -{formatRupiah(entry.nominal!)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[14px] font-bold pl-10 mt-1">
                        <span className="text-gray-900">Sisa</span>
                        <span className={entry.sisa > 0 ? "text-[#e65c5c]" : "text-[#20a049]"}>
                          {entry.sisa > 0 ? formatRupiah(entry.sisa) : "LUNAS"}
                        </span>
                      </div>
                      {entry.kembalian ? (
                        <div className="flex justify-between text-[13px] font-semibold pl-10 mt-0.5">
                          <span className="text-gray-500">Kembalian</span>
                          <span className="text-[#20a049]">{formatRupiah(entry.kembalian)}</span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-[#3b82f6]">
                          <Package size={18} strokeWidth={2.5} />
                          <span className="text-[14px] font-bold">Barang</span>
                          <span className="text-[12px] text-gray-400 font-medium">{entry.jam}</span>
                        </div>
                        <button
                          onClick={() => setHapusEntry(entry)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-1.5 mb-2">
                        {entry.items!.map((item, i) => (
                          <div key={i} className="flex justify-between text-[14px] text-gray-700 pl-10">
                            <span>{item.nama}</span>
                            <span>{formatRupiah(item.harga)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[14px] font-bold pl-10 mt-2 pt-2 border-t border-dashed border-gray-200">
                        <span className="text-gray-900">Sisa</span>
                        <span className={entry.sisa > 0 ? "text-[#e65c5c]" : "text-[#20a049]"}>
                          {entry.sisa > 0 ? formatRupiah(entry.sisa) : "LUNAS"}
                        </span>
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
                  ? `Transaksi barang sebesar ${formatRupiah(hapusEntry.total!)} akan dihapus.`
                  : `Pembayaran ${formatRupiah(hapusEntry.nominal!)} akan dihapus.`}
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
                  <p className="text-[14px] text-gray-500 mt-0.5">Catat pembayaran / nitip</p>
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