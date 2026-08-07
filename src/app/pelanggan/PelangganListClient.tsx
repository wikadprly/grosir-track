"use client";

import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID").format(angka);
};

interface Pelanggan {
  id: string;
  nama: string;
  saldo: number;
  status: "hutang" | "lunas";
}

interface Props {
  initial: Pelanggan[];
}

export default function PelangganListClient({ initial }: Props) {
  const [query, setQuery] = useState("");

  const daftar = query
    ? initial.filter((p) => p.nama.toLowerCase().includes(query.toLowerCase()))
    : initial;

  return (
    <>
      {/* SEARCH BAR */}
      <div className="px-5 mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white placeholder-gray-400 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] text-base transition-all shadow-sm"
            placeholder="Cari pelanggan..."
          />
        </div>
      </div>

      {/* DAFTAR PELANGGAN */}
      <div className="mt-4 bg-white border-t border-gray-100">
        {daftar.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            {query ? `Tidak ada pelanggan dengan nama "${query}"` : "Belum ada pelanggan"}
          </p>
        ) : (
          daftar.map((pelanggan) => (
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
          ))
        )}
      </div>
    </>
  );
}
