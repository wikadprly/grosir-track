import { Package, User, Bell, Info, ChevronRight } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { href: "/pengaturan/barang", icon: Package, label: "Kelola Barang", desc: "Tambah, ubah, hapus daftar barang" },
  { href: "#", icon: User, label: "Profil Toko", desc: "Nama toko dan info lainnya" },
  { href: "#", icon: Bell, label: "Notifikasi", desc: "Pengingat hutang jatuh tempo" },
  { href: "#", icon: Info, label: "Tentang Aplikasi", desc: "Versi 1.0.0" },
];

export default function PengaturanPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
      </div>

      <div className="px-5 space-y-3">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <item.icon size={24} className="text-gray-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </Link>
        ))}
      </div>
    </main>
  );
}
