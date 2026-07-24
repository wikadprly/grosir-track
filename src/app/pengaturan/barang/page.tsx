"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import Link from "next/link";

const daftarBarang = [
  { id: "1", name: "Gula 1kg", price: 15000 },
  { id: "2", name: "Kopi 1 bungkus", price: 12000 },
  { id: "3", name: "Minyak 1L", price: 18000 },
  { id: "4", name: "Teh 1 kotak", price: 8000 },
  { id: "5", name: "Beras 1kg", price: 13000 },
  { id: "6", name: "Sabun 1 batang", price: 4000 },
  { id: "7", name: "Rokok 1 bungkus", price: 22000 },
  { id: "8", name: "Gas LPG 3kg", price: 22000 },
];

function formatRupiah(angka: number) {
  return "Rp " + angka.toLocaleString("id-ID");
}

export default function BarangPage() {
  const [showForm, setShowForm] = useState(false);
  const [namaBarang, setNamaBarang] = useState("");
  const [harga, setHarga] = useState("");

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-white p-5 pb-4 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/pengaturan" className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Barang</h1>
        </div>
      </div>

      {/* Daftar Barang */}
      <div className="px-5 space-y-3">
        {daftarBarang.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div>
              <p className="text-base font-bold text-gray-800">{b.name}</p>
              <p className="text-sm text-gray-400">{formatRupiah(b.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-3 bg-blue-50 rounded-xl active:bg-blue-100 transition-colors">
                <Pencil size={18} className="text-blue-500" />
              </button>
              <button className="p-3 bg-red-50 rounded-xl active:bg-red-100 transition-colors">
                <Trash2 size={18} className="text-[#d9534f]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Tambah */}
      <div className="fixed bottom-28 right-1/2 translate-x-1/2 max-w-md w-full px-5 flex justify-end pointer-events-none">
        <button
          onClick={() => setShowForm(true)}
          className="pointer-events-auto flex items-center gap-2 bg-[#d9534f] text-white px-6 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-base font-bold">Tambah Barang</span>
        </button>
      </div>

      {/* Bottom Sheet Form Tambah Barang */}
      {showForm && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setShowForm(false); setNamaBarang(""); setHarga(""); }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4">
              <h3 className="text-xl font-bold text-gray-800">Tambah Barang</h3>
              <button
                onClick={() => { setShowForm(false); setNamaBarang(""); setHarga(""); }}
                className="p-2 active:bg-gray-100 rounded-xl"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="px-5 pb-8 space-y-4">
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Nama Barang</label>
                <input
                  type="text"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Contoh: Gula 1kg"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]"
                />
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Harga (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 15000"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]"
                />
              </div>
              <button className="w-full bg-[#d9534f] text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                <Check size={22} strokeWidth={3} />
                Simpan Barang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
