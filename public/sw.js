const CACHE_PREFIX = "la-dolce-scoperta";
const CACHE_NAME = `${CACHE_PREFIX}-2026-09-13-1`;
const SCOPE_URL = self.registration.scope;
const scopedUrl = (path = "") => new URL(path, SCOPE_URL).toString();
const CORE_URLS = ["", "manifest.webmanifest", "pwa-icon.svg", "favicon.ico"].map(scopedUrl);

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(SCOPE_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to fetch app shell");
  }

  await cache.put(SCOPE_URL, response.clone());
  const html = await response.text();
  const assetUrls = new Set(CORE_URLS);

  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    try {
      const url = new URL(match[1], SCOPE_URL);
      if (url.origin === self.location.origin) {
        assetUrls.add(url.toString());
      }
    } catch {
      // Ignore malformed or unsupported URLs in the generated HTML.
    }
  }

  await Promise.allSettled(
    [...assetUrls].map(async (url) => {
      const request = new Request(url, { cache: "reload" });
      const assetResponse = await fetch(request);
      if (assetResponse.ok) {
        await cache.put(request, assetResponse);
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
              .map((key) => caches.delete(key)),
          ),
        ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) || (await caches.match(SCOPE_URL));
        }),
    );
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then(async (response) => {
            if (response.ok) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      }),
    );
  }
});
