// Bump versi ini SETIAP rilis perubahan.
// Browser menganggap sw.js "berubah" saat byte-nya berbeda, sehingga
// service worker baru diinstal dan semua cache lama dibersihkan.
const CACHE_NAME = "grosir-track-2026-08-29";

// Hanya aset statis yang benar-benar statis & jarang berubah yang di-precache.
// Bundle JS/CSS/HTML dari Next TIDAK di-precache di sini; ditangani
// dengan strategi network-first di event fetch agar pembaruan selalu
// diterima segera tanpa menunggu cache expire.
const STATIC_ASSETS = [
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

const isRscRequest = (request) => {
  const rscHeader = request.headers.get("RSC");
  const prefetchHeader = request.headers.get("Next-Router-Prefetch");
  return rscHeader === "1" || prefetchHeader === "1" || request.url.includes("_rsc=");
};

self.addEventListener("install", (event) => {
  // skipWaiting: proses install segera selesai agar service worker baru
  // langsung bisa menguasai halaman pada kontak berikutnya.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // clients.claim: service worker baru mengambil alih semua tab/halaman
  // yang terbuka tanpa harus dimuat ulang manual oleh pengguna.
  self.clients.claim();
});

// Bersihkan salinan halaman HTML saat logout agar data tidak bisa dibaca
// dari perangkat setelah sesi berakhir. Aset statis tetap disimpan.
self.addEventListener("message", (event) => {
  if (event.data !== "CLEAR_NAV_CACHE") return;
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.keys().then((keys) =>
        Promise.all(
          keys.filter((req) => req.mode === "navigate").map((req) => cache.delete(req))
        )
      )
    )
  );
});

// Pesan dari halaman: ada versi baru & service worker baru sudah aktif,
// minta semua klien memuat ulang agar memakai kode terbaru.
self.addEventListener("message", (event) => {
  if (event.data !== "SKIP_WAITING") return;
  self.skipWaiting();
});
self.addEventListener("message", (event) => {
  if (event.data !== "RELOAD_ALL") return;
  self.clients.matchAll().then((clients) =>
    clients.forEach((client) => client.navigate(client.url))
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Jangan cache request RSC / prefetch dan API — selalu ambil dari jaringan.
  if (isRscRequest(request) || url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first untuk SEMUA aset (navigasi HTML, JS, CSS, gambar).
  // Prioritas selalu ambil dari jaringan agar setiap pembaruan yang
  // sudah di-deploy langsung diterima pengguna di kontak berikutnya,
  // tanpa menunggu cache kadaluarsa. Cache hanya dipakai saat offline.
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request, { redirect: "manual" });
        if (response.type === "opaqueredirect") {
          return fetch(request);
        }
        if (response && (response.status === 200 || response.type === "opaque")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return caches.match("/");
        }
        throw error;
      }
    })()
  );
});
