import { LockKeyhole } from "lucide-react";
import MasukClient from "./MasukClient";

export const metadata = {
  title: "Masuk — Grosir Track",
};

export default function MasukPage() {
  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="bg-white rounded-b-[2rem] shadow-sm border-b border-gray-100 px-6 pt-12 pb-9 text-center relative overflow-hidden">
        <div className="absolute -top-16 -left-10 w-44 h-44 rounded-full bg-[#fff5f5] pointer-events-none" />
        <div className="absolute -top-10 -right-12 w-36 h-36 rounded-full bg-[#fff5f5] pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-[1.6rem] bg-gradient-to-br from-[#e65c5c] to-[#d9534f] shadow-lg shadow-[#d9534f]/25 flex items-center justify-center rotate-3">
            <LockKeyhole size={38} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-5">Grosir Track</h1>
          <p className="text-sm text-gray-400 mt-1">Selamat datang kembali 👋</p>
        </div>
      </div>

      {/* Keypad */}
      <div className="flex-1 flex items-center justify-center px-8 pt-12 pb-16">
        <MasukClient />
      </div>
    </main>
  );
}
