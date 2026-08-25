"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import { getProductsList, addProduct, updateProduct, deleteProduct } from "./actions";
import { formatRupiah } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function BarangPage() {
  const [daftarBarang, setDaftarBarang] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaBarang, setNamaBarang] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("");
  const [loading, setLoading] = useState(true);

  const daftarTampil = daftarBarang.filter((b) => {
    const matchQuery = !query.trim() || b.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchKategori = !kategoriFilter || b.category === kategoriFilter;
    return matchQuery && matchKategori;
  });

  const kategoriList = [...new Set(daftarBarang.map((b) => b.category).filter(Boolean))].sort();

  const loadProducts = async () => {
    const products = await getProductsList();
    setDaftarBarang(products);
    setLoading(false);
  };

  useEffect(() => {
    getProductsList()
      .then((products) => {
        setDaftarBarang(products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSimpan = async () => {
    if (!namaBarang || !harga) return;
    const numericHarga = parseInt(harga.replace(/\D/g, ""), 10);
    if (isNaN(numericHarga) || numericHarga <= 0) return;

    if (editingId) {
      await updateProduct(editingId, namaBarang, numericHarga, kategori || undefined);
    } else {
      await addProduct(namaBarang, numericHarga, kategori || undefined);
    }

    setNamaBarang("");
    setHarga("");
    setKategori("");
    setEditingId(null);
    setShowForm(false);
    await loadProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setNamaBarang(product.name);
    setHarga(product.price.toString());
    setKategori(product.category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus barang ini?")) return;
    await deleteProduct(id);
    await loadProducts();
  };

  const handleBukaForm = () => {
    setEditingId(null);
    setNamaBarang("");
    setHarga("");
    setKategori("");
    setShowForm(true);
  };

  const handleTutupForm = () => {
    setEditingId(null);
    setNamaBarang("");
    setHarga("");
    setKategori("");
    setShowForm(false);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-8 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Barang</h1>
      </div>

      {/* Cari Barang */}
      {!loading && (
        <div className="px-5 mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari barang..."
              className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white placeholder-gray-400 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] text-base transition-all shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Filter Kategori */}
      {!loading && kategoriList.length > 0 && (
        <div className="px-5 mt-3">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setKategoriFilter("")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                kategoriFilter === ""
                  ? "bg-[#e65c5c] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              Semua
            </button>
            {kategoriList.map((k) => (
              <button
                key={k}
                onClick={() => setKategoriFilter(k)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  kategoriFilter === k
                    ? "bg-[#e65c5c] text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Daftar Barang */}
      {loading ? (
        <div className="px-5 text-center text-gray-400 mt-10">Memuat data...</div>
      ) : daftarBarang.length === 0 ? (
        <div className="px-5 text-center text-gray-400 mt-10">Belum ada barang</div>
      ) : daftarTampil.length === 0 ? (
        <div className="px-5 text-center text-gray-400 mt-10">
          Barang tidak ditemukan
        </div>
      ) : (
        <div className="px-5 mt-4 space-y-3">
          {daftarTampil.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-gray-800 truncate">{b.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-[#e65c5c] font-semibold">{formatRupiah(b.price)}</p>
                  {b.category && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{b.category}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => handleEdit(b)}
                  className="p-3 bg-blue-50 rounded-xl active:bg-blue-100 transition-colors"
                >
                  <Pencil size={18} className="text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-3 bg-red-50 rounded-xl active:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} className="text-[#d9534f]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tombol Tambah */}
      <div className="fixed bottom-28 right-1/2 translate-x-1/2 max-w-md w-full px-5 flex justify-end pointer-events-none">
        <button
          onClick={handleBukaForm}
          className="pointer-events-auto flex items-center gap-2 bg-[#d9534f] text-white px-6 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-base font-bold">Tambah Barang</span>
        </button>
      </div>

      {/* Bottom Sheet Form Tambah/Edit Barang */}
      {showForm && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleTutupForm}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Barang" : "Tambah Barang"}
              </h3>
              <button
                onClick={handleTutupForm}
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
                  placeholder="Contoh: 1 dus Good Day"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]"
                />
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Harga (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 140000"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f]"
                />
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Kategori</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {kategoriList.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKategori(kategori === k ? "" : k)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        kategori === k
                          ? "bg-[#e65c5c] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  placeholder="Atau ketik kategori baru..."
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d9534f] mt-2"
                />
              </div>
              <button
                onClick={handleSimpan}
                disabled={!namaBarang || !harga}
                className={`w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${
                  namaBarang && harga
                    ? "bg-[#d9534f] text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Check size={22} strokeWidth={3} />
                {editingId ? "Simpan Perubahan" : "Simpan Barang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
