"use client";

import { useRef, useState } from "react";
import { FileInput, Loader2, TriangleAlert, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RestoreCounts {
  users: number;
  products: number;
  customers: number;
  transactions: number;
  transactionDetails: number;
  payments: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImportClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RestoreCounts | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (!file || loading) return;
    const confirmed = window.confirm(
      "PERHATIAN: Semua data saat ini akan DIHAPUS dan diganti dengan isi file backup.\n\nLanjutkan pemulihan?"
    );
    if (!confirmed) return;

    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.error ?? "Gagal memulihkan data. Coba lagi.");
        return;
      }
      setResult(json.counts as RestoreCounts);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      console.error("Gagal import backup:", err);
      setError("Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {result ? (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
              <p className="text-base font-bold text-gray-800">Data Berhasil Dipulihkan</p>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 pl-1">
              <li>{result.customers} pelanggan</li>
              <li>{result.products} barang</li>
              <li>{result.transactions} catatan barang ({result.transactionDetails} item)</li>
              <li>{result.payments} pembayaran</li>
            </ul>
          </div>
          <Link
            href="/"
            className="block w-full bg-[#d9534f] active:scale-[0.98] transition-all text-white py-4 rounded-2xl text-lg font-bold text-center shadow-sm"
          >
            Selesai
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileInput size={24} className="text-purple-500" />
              </div>
              <p className="text-base font-bold text-gray-800">Pulihkan dari File Backup</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Pilih file backup JSON yang pernah diunduh. Seluruh data saat ini akan
              diganti dengan isi file tersebut.
            </p>
          </div>

          <div className="bg-[#fff8f0] border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
            <TriangleAlert size={20} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700 leading-relaxed">
              Data sekarang akan hilang dan tidak bisa dikembalikan. Pastikan Anda
              sudah membuat backup terbaru.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError("");
            }}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-700 bg-white file:mr-4 file:border-0 file:bg-purple-50 file:text-purple-500 file:font-bold file:text-sm file:px-4 file:py-2 file:rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {file && (
            <p className="text-sm text-gray-500 px-1">
              File dipilih: <span className="font-semibold text-gray-700">{file.name}</span> ({formatSize(file.size)})
            </p>
          )}

          {error && (
            <p className="text-sm font-medium text-red-600 px-1">{error}</p>
          )}

          <button
            onClick={handleRestore}
            disabled={!file || loading}
            className={`w-full text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
              file && !loading
                ? "bg-[#d9534f] active:scale-[0.98]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Memulihkan...
              </>
            ) : (
              <>
                <RotateCcw size={22} />
                Pulihkan Data
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
