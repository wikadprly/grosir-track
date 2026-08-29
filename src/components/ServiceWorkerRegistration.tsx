"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshPage = false;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Saat service worker baru aktif (update terpasang), muat ulang
        // halaman agar langsung memakai kode terbaru tanpa diminta manual.
        if (refreshPage) {
          window.location.reload();
          return;
        }

        // Pemeriksaan update berkala: selama app terbuka, tetap cek server
        // tiap beberapa menit supaya pembaruan cepat diterima.
        const interval = setInterval(() => {
          registration.update().catch(() => {});
        }, 5 * 60 * 1000);

        // Saat tab kembali terlihat (mis. pengguna kembali ke app), cek update.
        const onVisible = () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        };
        document.addEventListener("visibilitychange", onVisible);

        window.addEventListener("load", () => {
          registration.update().catch(() => {});
        });

        return () => {
          clearInterval(interval);
          document.removeEventListener("visibilitychange", onVisible);
        };
      } catch {
        // Service worker tidak tersedia / gagal daftar — abaikan.
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // controllerchange dipicu saat service worker baru mengambil alih
      // halaman. Tandai untuk reload di siklus berikutnya setelah
      // register selesai, agar tidak reload berkali-kali.
      refreshPage = true;
    });

    registerSW();
  }, []);

  return null;
}
