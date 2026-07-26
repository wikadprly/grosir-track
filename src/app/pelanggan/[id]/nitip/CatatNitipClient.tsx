"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPayment } from "./actions";

interface Props {
  pelangganId: string;
}

export default function CatatNitipClient({ pelangganId }: Props) {
  const router = useRouter();
  const [tanggal, setTanggal] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("sv-SE");
  });
  const [nominal, setNominal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value === "") {
      setNominal("");
      return;
    }

    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value, 10));
    setNominal(formatted);
  };

  const handleSimpan = async () => {
    if (!nominal || nominal === "0" || saving) return;
    setSaving(true);
    try {
      const amount = parseInt(nominal.replace(/\D/g, ""), 10);
      await createPayment(pelangganId, amount, tanggal, catatan || undefined);
      router.push(`/pelanggan/${pelangganId}`);
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("Gagal menyimpan catatan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] relative pb-32">
      {/* HEADER */}
      <div className="flex items-center gap-4 px-5 pt-8 pb-4 bg-[#faf9f7] sticky top-0 z-20 border-b border-gray-100">
        <Link href={`/pelanggan/${pelangganId}`} className="text-gray-900 active:scale-95 transition-transform">
          <ArrowLeft size={26} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Catat Nitip</h1>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* INPUT TANGGAL */}
        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Tanggal</label>
          <div className="relative">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-[15px] font-medium text-gray-900 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* INPUT JUMLAH PEMBAYARAN */}
        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Jumlah Pembayaran</label>
          <input
            type="text"
            inputMode="numeric"
            value={nominal}
            onChange={handleNominalChange}
            placeholder="0"
            className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-[17px] font-bold text-gray-900 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] transition-all shadow-sm"
          />
        </div>

        {/* INPUT CATATAN (OPSIONAL) */}
        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Catatan (opsional)</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Bayar sebagian"
            rows={4}
            className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e65c5c] focus:ring-1 focus:ring-[#e65c5c] transition-all shadow-sm resize-none"
          />
        </div>
      </div>

      {/* FOOTER: TOMBOL SIMPAN */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-6 max-w-md mx-auto shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
        <button
          onClick={handleSimpan}
          disabled={!nominal || nominal === "0" || saving}
          className={`w-full font-bold py-4 rounded-2xl transition-all text-[17px] tracking-wide flex items-center justify-center gap-2 ${
            nominal && nominal !== "0" && !saving
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
