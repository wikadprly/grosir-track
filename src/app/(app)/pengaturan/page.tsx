import { ArrowLeft, Package, Users, Database, FileOutput, FileInput, Shield, Info, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { getUserProfile, logout } from "./actions";

interface MenuItem {
  href: string | null;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  color: string;
  iconColor: string;
  comingSoon?: boolean;
}

const menuItems: MenuItem[] = [
  { href: "/barang", icon: Package, label: "Data Barang", desc: "Kelola daftar barang & harga", color: "bg-[#fff5f5]", iconColor: "text-[#e65c5c]" },
  { href: "/pelanggan", icon: Users, label: "Data Pelanggan", desc: "Tambah, ubah, atau hapus pelanggan", color: "bg-blue-50", iconColor: "text-blue-500" },
  { href: "/laporan", icon: FileOutput, label: "Export Laporan", desc: "Unduh laporan Excel bulan ini", color: "bg-amber-50", iconColor: "text-amber-500" },
  { href: "/pengaturan/backup", icon: Database, label: "Backup Data", desc: "Cadangkan semua data ke file", color: "bg-green-50", iconColor: "text-green-500" },
  { href: "/pengaturan/import", icon: FileInput, label: "Import Data", desc: "Pulihkan data dari file backup", color: "bg-purple-50", iconColor: "text-purple-500" },
  { href: "/pengaturan/keamanan", icon: Shield, label: "Keamanan", desc: "Ubah PIN aplikasi", color: "bg-red-50", iconColor: "text-[#d9534f]" },
  { href: null, icon: Info, label: "Tentang Aplikasi", desc: "Versi aplikasi & bantuan", color: "bg-gray-100", iconColor: "text-gray-500", comingSoon: true },
];

export default async function PengaturanPage() {
  const user = await getUserProfile();

  return (
    <main className="min-h-screen">
      <div className="bg-white p-6 pb-5 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
        </div>
      </div>

      {/* Profil Akun */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#e65c5c] rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0) || "I"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-800">{user?.name || "Ibu"}</p>
            <p className="text-sm text-gray-400">Pemilik Toko</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Keluar"
              className="p-3 rounded-xl bg-gray-50 text-gray-400 active:bg-red-50 active:text-[#d9534f] transition-colors"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 space-y-3">
        {menuItems.map((item, idx) => {
          const content = (
            <>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon size={24} className={item.iconColor} />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
              {item.comingSoon ? (
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  Segera hadir
                </span>
              ) : (
                <ChevronRight size={20} className="text-gray-300" />
              )}
            </>
          );

          return item.href ? (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
            >
              {content}
            </Link>
          ) : (
            <div
              key={idx}
              aria-disabled
              className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 opacity-70"
            >
              {content}
            </div>
          );
        })}
      </div>
    </main>
  );
}
