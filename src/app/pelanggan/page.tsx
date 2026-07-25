import { Search, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getCustomers } from "./actions";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID").format(angka);
};

export default async function PelangganPage() {
  const daftarPelanggan = await getCustomers();

  return (
    <main className="min-h-screen bg-[#faf9f7] pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center px-5 pt-8 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Pelanggan</h1>
        <Link
          href="/pelanggan/tambah"
          className="bg-[#e65c5c] text-white p-2.5 rounded-full shadow-sm hover:bg-red-600 active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="px-5 mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white placeholder-gray-400 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] text-base transition-all shadow-sm"
            placeholder="Cari pelanggan..."
          />
        </div>
      </div>

      {/* DAFTAR PELANGGAN */}
      <div className="mt-4 bg-white border-t border-gray-100">
        {daftarPelanggan.map((pelanggan) => (
          <Link
            key={pelanggan.id}
            href={`/pelanggan/${pelanggan.id}`}
            className="flex justify-between items-center px-5 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-[#f4ebeb] transition-colors"
          >
            <span className="text-[17px] font-bold text-gray-900">
              {pelanggan.nama}
            </span>
            
            <div className="flex items-center gap-3">
              {pelanggan.status === "lunas" ? (
                <span className="text-[15px] font-bold text-[#20a049] tracking-wide">
                  LUNAS
                </span>
              ) : (
                <span className="text-[15px] font-bold text-[#e65c5c]">
                  Rp {formatRupiah(pelanggan.saldo)}
                </span>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
