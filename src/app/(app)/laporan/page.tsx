import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { getLaporanData } from "./actions";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const data = await getLaporanData();

  const bulanIni = [
    { label: "Total Belanja Bulan Ini", value: data.totalHutang, icon: TrendingUp, color: "text-[#d9534f]", bg: "bg-red-50" },
    { label: "Total Pembayaran Bulan Ini", value: data.totalPembayaran, icon: TrendingDown, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Sisa Piutang", value: data.sisaPiutang, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <main className="min-h-screen">
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laporan</h1>
            <p className="text-gray-500 text-base mt-1">Bulan {data.bulan}</p>
          </div>
          <a
            href="/api/export/laporan"
            className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-xl active:bg-gray-200 transition-colors"
          >
            <Download size={20} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-600">Export</span>
          </a>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Ringkasan Bulan */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Ringkasan Bulan Ini</h2>
          <div className="space-y-3">
            {bulanIni.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${item.bg} rounded-xl ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-base font-medium text-gray-700">{item.label}</span>
                </div>
                <span className={`text-lg font-bold ${item.color}`}>
                  {formatRupiah(item.value)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Pelanggan dengan Sisa */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Pelanggan dengan Sisa Terbesar</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {data.topPelanggan.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Semua pelanggan sudah lunas</div>
            ) : (
              data.topPelanggan.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                      {idx + 1}
                    </span>
                    <span className="text-base font-semibold text-gray-800">{p.name}</span>
                  </div>
                  <span className="text-base font-bold text-[#d9534f]">{formatRupiah(p.hutang)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
