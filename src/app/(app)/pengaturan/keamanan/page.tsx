import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getSessionInfo } from "../actions";
import UbahPinClient from "./UbahPinClient";

export default async function KeamananPage() {
  await requireSession();
  const info = await getSessionInfo();

  return (
    <main className="min-h-screen">
      <div className="bg-white p-5 pb-4 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/pengaturan" className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Keamanan</h1>
        </div>
      </div>

      <div className="px-5">
        {info.viaRecovery && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 mb-4 text-sm font-semibold leading-relaxed">
            Kamu masuk memakai PIN cadangan. Buat PIN utama baru di bawah ini,
            lalu gunakan PIN itu untuk masuk ke aplikasi.
          </div>
        )}
        <UbahPinClient viaRecovery={info.viaRecovery} />
      </div>
    </main>
  );
}
