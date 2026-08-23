import { ArrowLeft, Database, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function BackupPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-white p-5 pb-4 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/pengaturan" className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Backup Data</h1>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Database size={24} className="text-green-500" />
            </div>
            <p className="text-base font-bold text-gray-800">Cadangkan Semua Data</p>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Seluruh data aplikasi (profil, barang, pelanggan, catat barang, dan pembayaran)
            akan diunduh sebagai satu file JSON. Simpan file ini di tempat aman seperti
            Google Drive atau WhatsApp.
          </p>
        </div>

        <ul className="space-y-2 px-1">
          {[
            "File bisa dipakai untuk memindahkan data ke HP baru",
            "Lakukan backup secara rutin, misalnya seminggu sekali",
            "Data di aplikasi tidak berubah saat backup",
          ].map((text) => (
            <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
              {text}
            </li>
          ))}
        </ul>

        <a
          href="/api/backup"
          download
          className="block w-full bg-[#d9534f] active:scale-[0.98] transition-all text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <Database size={22} />
          Unduh File Backup
        </a>
      </div>
    </main>
  );
}
