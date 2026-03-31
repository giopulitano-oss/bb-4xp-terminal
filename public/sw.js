const CACHE_NAME = "4xp-terminal-v1";
const PRECACHE = [
  "/bb-4xp-terminal/",
  "/bb-4xp-terminal/index.html",
];

// Install — precache shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (e) => {
  // Skip non-GET and Firebase/Google API requests
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  if (url.includes("firestore.googleapis.com") ||
      url.includes("identitytoolkit.googleapis.com") ||
      url.includes("securetoken.googleapis.com")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
