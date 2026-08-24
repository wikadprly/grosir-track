const CACHE_NAME = "grosir-track-v1";
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Jangan cache request RSC / prefetch dan API — selalu ambil dari jaringan.
  // Stream RSC yang basi dari cache bisa merusak React Flight client.
  if (isRscRequest(request) || url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first untuk navigasi (HTML), fallback ke cache saat offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // redirect: "manual" agar respons hasil redirect (mis. sesi habis ->
          // /masuk) tidak ikut tersimpan ke cache di bawah URL asal, yang bisa
          // menyebabkan hydration mismatch (URL != konten).
          const response = await fetch(request, { redirect: "manual" });
          if (response.type === "opaqueredirect") {
            return fetch(request);
          }
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        } catch {
          return caches.match(request);
        }
      })()
    );
    return;
  }

  // Stale-while-revalidate untuk aset statis (CSS, JS, gambar).
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || fetched;
    })
  );
});
