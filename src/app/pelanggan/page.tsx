import { Plus } from "lucide-react";
import Link from "next/link";
import { getCustomers } from "./actions";
import PelangganListClient from "./PelangganListClient";

export default async function PelangganPage() {
  const { items, total } = await getCustomers();

  return (
    <main className="min-h-screen bg-[#faf9f7] pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center px-5 pt-8 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Pelanggan</h1>
        <Link
          href="/pelanggan/tambah"
          className="bg-[#e65c5c] text-white p-2.5 rounded-full shadow-sm hover:bg-red-600 active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </Link>
      </div>

      <PelangganListClient initial={items} initialTotal={total} />
    </main>
  );
}
