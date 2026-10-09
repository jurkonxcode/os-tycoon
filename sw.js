/**
 * OS Tycoon — Service Worker
 *
 * Strategy: network-first.
 * - Selalu coba ambil dari server (GitHub Pages).
 * - Jika offline atau network gagal, fallback ke cache.
 * - Tidak pernah menyajikan versi lama selama server tersedia.
 */
const CACHE_NAME = "os-tycoon-runtime-v1";

// File yang di-cache saat offline (opsional, hanya untuk fallback).
const OFFLINE_ASSETS = [
  "./",
  "./index.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting(); // Aktifkan versi baru segera
});

self.addEventListener("activate", (event) => {
  // Hapus cache lama dari versi sebelumnya
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Hanya tangani GET (bukan POST/PUT).
  if (request.method !== "GET") return;

  // Jangan cache request lintas domain (misal CDN).
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Simpan salinan terbaru ke cache (hanya jika response valid).
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network gagal → ambil dari cache (mode offline).
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback terakhir: halaman utama.
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
