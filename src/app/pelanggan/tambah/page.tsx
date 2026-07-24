"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TambahPelangganPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");

  return (
    <main className="min-h-screen">
      <div className="bg-white p-5 pb-4 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/pelanggan" className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Tambah Pelanggan</h1>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <div>
          <label className="text-base font-medium text-gray-700 mb-2 block">Nama Pelanggan</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Bu Rina"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]"
          />
        </div>
        <div>
          <label className="text-base font-medium text-gray-700 mb-2 block">Nomor HP (opsional)</label>
          <input
            type="tel"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            placeholder="Contoh: 0812xxxxxxx"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]"
          />
        </div>
        <button
          onClick={() => router.push("/pelanggan")}
          className="w-full bg-[#d9534f] text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Check size={22} strokeWidth={3} />
          Simpan Pelanggan
        </button>
      </div>
    </main>
  );
}
