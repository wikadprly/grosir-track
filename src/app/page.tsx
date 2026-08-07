import { ReceiptText, ArrowDownToLine, Wallet, UserCircle2, Settings } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "./actions";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Beranda() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Selamat datang Bu 💕</h1>
            <p className="text-gray-500 text-base mt-1">Semoga hari ini lancar selalu</p>
          </div>
          <Link href="/pengaturan" className="p-2 -mt-1 -mr-1 active:bg-gray-100 rounded-xl transition-colors">
            <Settings size={24} className="text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-8">
        {/* Ringkasan Hari Ini */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Ringkasan Hari Ini
          </h2>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><ReceiptText size={24} /></div>
                <span className="text-base font-medium text-gray-700">Transaksi Hari Ini</span>
              </div>
              <span className="font-bold text-gray-900 text-2xl">{data.transaksiHariIni}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-500"><ArrowDownToLine size={24} /></div>
                <span className="text-base font-medium text-gray-700">Uang Masuk</span>
              </div>
              <span className="font-bold text-gray-900 text-xl">{formatRupiah(data.uangMasuk)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl text-red-500"><Wallet size={24} /></div>
                <span className="text-base font-medium text-gray-700">Total Piutang</span>
              </div>
              <span className="font-bold text-[#d9534f] text-xl">{formatRupiah(data.totalPiutang)}</span>
            </div>

          </div>
        </section>

        {/* Pelanggan Terakhir */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold text-gray-800">Pelanggan Terakhir</h2>
            <Link href="/pelanggan" className="text-sm font-semibold text-gray-500 hover:text-gray-800 py-1">
              Lihat Semua →
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {data.pelangganTerakhir.map((item) => (
              <Link
                key={item.id}
                href={`/pelanggan/${item.id}`}
                className="flex justify-between items-center p-4 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserCircle2 size={28} className="text-gray-400" />
                  </div>
                  <span className="text-base font-semibold text-gray-800">{item.name}</span>
                </div>
                <span className={`text-base font-bold ${item.hutang ? "text-[#d9534f]" : "text-gray-900"}`}>
                  {item.hutang ? formatRupiah(item.saldo) : "LUNAS"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
