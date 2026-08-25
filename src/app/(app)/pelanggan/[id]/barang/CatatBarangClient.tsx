"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, Trash2, Plus, Minus, Pencil, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTransaction } from "./actions";
import { enqueuePending, isNetworkError } from "@/lib/offlineQueue";
import { formatRupiah } from "@/lib/format";

interface Product {
  id: string;
  nama: string;
  harga: number;
}

interface SelectedItem extends Product {
  qty: number;
  hargaDefault: number;
}

interface Props {
  pelangganId: string;
  products: Product[];
}

export default function CatatBarangClient({ pelangganId, products }: Props) {
  const router = useRouter();
  const [tanggal, setTanggal] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("sv-SE");
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [saving, setSaving] = useState(false);

  const hasilPencarian = useMemo(
    () =>
      searchQuery
        ? products.filter((item) =>
            item.nama.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [],
    [searchQuery, products]
  );

  const tambahKeDaftar = (barang: Product) => {
    const sudahAda = selectedItems.find((item) => item.id === barang.id);
    if (sudahAda) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === barang.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...barang, qty: 1, hargaDefault: barang.harga }]);
    }
    setSearchQuery("");
  };

  const ubahQty = (id: string, delta: number) => {
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      })
    );
  };

  const hapusBarang = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const mulaiEditHarga = (id: string, hargaSekarang: number) => {
    setEditingPriceId(id);
    setEditingPriceValue(hargaSekarang.toString());
  };

  const simpanEditHarga = (id: string) => {
    const numericValue = parseInt(editingPriceValue.replace(/\D/g, ""), 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === id ? { ...item, harga: numericValue } : item
        )
      );
    }
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const batalEditHarga = () => {
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const handleSimpan = async () => {
    if (selectedItems.length === 0 || saving) return;
    setSaving(true);

    const items = selectedItems.map((item) => ({
      productId: item.id,
      qty: item.qty,
      harga: item.harga,
    }));

    const simpanOffline = async () => {
      await enqueuePending({
        id: crypto.randomUUID(),
        kind: "transaction",
        customerId: pelangganId,
        date: tanggal,
        items,
        createdAt: Date.now(),
        attempts: 0,
      });
      alert("Sinyal sedang tidak ada.\nCatatan sudah disimpan di HP dan akan terkirim otomatis saat online.");
      router.push(`/pelanggan/${pelangganId}`);
    };

    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    if (offline) {
      await simpanOffline();
      setSaving(false);
      return;
    }

    try {
      await createTransaction(pelangganId, tanggal, items, crypto.randomUUID());
      router.push(`/pelanggan/${pelangganId}`);
    } catch (error) {
      if (isNetworkError(error)) {
        try {
          await simpanOffline();
        } catch {
          alert("Gagal menyimpan catatan. Coba lagi.");
        }
      } else {
        console.error("Gagal menyimpan:", error);
        alert("Gagal menyimpan catatan. Coba lagi.");
      }
    } finally {
      setSaving(false);
    }
  };

  const subtotal = selectedItems.reduce(
    (total, item) => total + item.harga * item.qty,
    0
  );

  return (
    <main className="min-h-screen bg-[#faf9f7] relative pb-32">
      {/* HEADER */}
      <div className="flex items-center gap-4 px-5 pt-8 pb-4 bg-[#faf9f7] sticky top-0 z-20 border-b border-gray-100">
        <Link href={`/pelanggan/${pelangganId}`} className="text-gray-900 active:scale-95 transition-transform">
          <ArrowLeft size={26} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Catat Barang</h1>
      </div>

      <div className="px-5 mt-4 space-y-5">
        {/* INPUT TANGGAL */}
        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Tanggal</label>
          <div className="relative">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-[15px] font-medium text-gray-900 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] transition-all"
            />
          </div>
        </div>

        {/* INPUT PENCARIAN BARANG */}
        <div className="relative z-10">
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Cari Barang</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 border-2 border-blue-200 rounded-2xl bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-[15px] font-medium transition-all"
              placeholder="Ketik nama barang..."
            />
          </div>

          {/* HASIL PENCARIAN */}
          {searchQuery && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {hasilPencarian.length > 0 ? (
                hasilPencarian.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => tambahKeDaftar(item)}
                    className="w-full flex justify-between items-center px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 active:bg-blue-50 text-left transition-colors"
                  >
                    <span className="text-[15px] font-bold text-gray-900">{item.nama}</span>
                    <span className="text-[15px] font-bold text-gray-600">{formatRupiah(item.harga)}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-sm text-gray-500">Barang tidak ditemukan</div>
              )}
            </div>
          )}
        </div>

        {/* DAFTAR BARANG YANG SUDAH DIPILIH */}
        {selectedItems.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-5 space-y-4">
            {selectedItems.map((item) => {
              const hargaBeda = item.harga !== item.hargaDefault;
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-gray-900">{item.nama}</h3>

                      {editingPriceId === item.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editingPriceValue}
                            onChange={(e) => setEditingPriceValue(e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") simpanEditHarga(item.id);
                              if (e.key === "Escape") batalEditHarga();
                            }}
                            autoFocus
                            className="w-36 px-3 py-1.5 border-2 border-[#e65c5c] rounded-xl text-[15px] font-bold text-[#e65c5c] focus:outline-none"
                          />
                          <button onClick={() => simpanEditHarga(item.id)} className="p-1.5 bg-green-50 rounded-lg text-green-600 active:scale-95">
                            <Check size={16} strokeWidth={3} />
                          </button>
                          <button onClick={batalEditHarga} className="p-1.5 bg-gray-100 rounded-lg text-gray-500 active:scale-95">
                            <X size={16} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[15px] font-bold text-[#e65c5c]">{formatRupiah(item.harga)}</p>
                          <button
                            onClick={() => mulaiEditHarga(item.id, item.harga)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          {hargaBeda && (
                            <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Harga custom
                            </span>
                          )}
                        </div>
                      )}
                      {hargaBeda && editingPriceId !== item.id && (
                        <p className="text-[12px] text-gray-400 mt-0.5">Harga awal: {formatRupiah(item.hargaDefault)}</p>
                      )}
                    </div>

                    <button onClick={() => hapusBarang(item.id)} className="p-2 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 w-max rounded-xl p-1 border border-gray-200">
                    <span className="text-sm font-semibold text-gray-600 pl-3 pr-2">Qty</span>
                    <button onClick={() => ubahQty(item.id, -1)} className="p-1.5 bg-white rounded-lg shadow-sm active:scale-95">
                      <Minus size={16} className="text-gray-600" />
                    </button>
                    <span className="w-6 text-center font-bold text-[15px] text-gray-900">{item.qty}</span>
                    <button onClick={() => ubahQty(item.id, 1)} className="p-1.5 bg-white rounded-lg shadow-sm active:scale-95">
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER: SUBTOTAL & TOMBOL SIMPAN */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-6 max-w-md mx-auto shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-[16px] font-bold text-gray-900">Subtotal</span>
          <span className="text-xl font-bold text-[#e65c5c]">{formatRupiah(subtotal)}</span>
        </div>
        <button
          onClick={handleSimpan}
          disabled={selectedItems.length === 0 || saving}
          className={`w-full font-bold py-4 rounded-2xl transition-all text-[17px] tracking-wide flex items-center justify-center gap-2 ${
            selectedItems.length > 0 && !saving
              ? "bg-[#e65c5c] text-white shadow-[0_8px_20px_rgba(230,92,92,0.3)] hover:bg-red-600 active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Catatan"
          )}
        </button>
      </div>
    </main>
  );
}
