import { TrendingUp, TrendingDown, Download } from "lucide-react";

const bulanIni = [
  { label: "Total Hutang Masuk", value: 3250000, icon: TrendingUp, color: "text-[#d9534f]", bg: "bg-red-50" },
  { label: "Total Pembayaran", value: 1800000, icon: TrendingDown, color: "text-green-500", bg: "bg-green-50" },
  { label: "Sisa Piutang", value: 1450000, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
];

const topPelanggan = [
  { name: "Pak Agus", hutang: 2400000 },
  { name: "Bu Ito", hutang: 1697500 },
  { name: "Bu Sari", hutang: 875000 },
  { name: "Bu Mar", hutang: 520000 },
];

function formatRupiah(angka: number) {
  return "Rp " + angka.toLocaleString("id-ID");
}

export default function LaporanPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laporan</h1>
            <p className="text-gray-500 text-base mt-1">Bulan Juli 2026</p>
          </div>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-xl active:bg-gray-200 transition-colors">
            <Download size={20} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-600">Export</span>
          </button>
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

        {/* Top Pelanggan Berhutang */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Pelanggan Berhutang Terbesar</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {topPelanggan.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                    {idx + 1}
                  </span>
                  <span className="text-base font-semibold text-gray-800">{p.name}</span>
                </div>
                <span className="text-base font-bold text-[#d9534f]">{formatRupiah(p.hutang)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
