"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(app)/pengaturan/actions";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title="Keluar"
      disabled={isPending}
      onClick={() => {
        // Hapus salinan halaman dari Cache Storage sebelum sesi berakhir.
        navigator.serviceWorker.controller?.postMessage("CLEAR_NAV_CACHE");
        startTransition(async () => {
          await logout();
        });
      }}
      className="p-3 rounded-xl bg-gray-50 text-gray-400 active:bg-red-50 active:text-[#d9534f] transition-colors disabled:opacity-50"
    >
      <LogOut size={20} />
    </button>
  );
}
