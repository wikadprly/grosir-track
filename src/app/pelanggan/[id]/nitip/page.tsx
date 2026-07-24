import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NitipPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-white p-5 pb-4 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/pelanggan" className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Barang Nitip</h1>
        </div>
      </div>
      <div className="px-5">
        <p className="text-base text-gray-400 text-center mt-10">Fitur ini segera hadir.</p>
      </div>
    </main>
  );
}
