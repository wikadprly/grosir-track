"use client";

import { usePathname } from "next/navigation";
import { Home, Users, Package, FileText } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/pelanggan", icon: Users, label: "Pelanggan" },
  { href: "/barang", icon: Package, label: "Barang" },
  { href: "/laporan", icon: FileText, label: "Laporan" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  // Sembunyikan nav di semua halaman di bawah /pelanggan/: buku bon detail
  // pelanggan (/pelanggan/[id]) maupun halaman mencatat (/pelanggan/[id]/barang
  // dan /pelanggan/[id]/nitip). Halaman daftar pelanggan (/pelanggan) tetap
  // menampilkan nav.
  const hideNavOnDetail = segments[0] === "pelanggan" && segments.length >= 2;
  if (hideNavOnDetail) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-lg mx-auto bg-white border-t border-gray-200 flex justify-around items-center pt-2 pb-5 px-2 z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              isActive
                ? "text-[#d9534f]"
                : "text-gray-400 active:text-[#d9534f]"
            }`}
          >
            <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
