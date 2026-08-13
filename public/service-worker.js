const CACHE_NAME = 'arrancha-pwa-v6';

// Static assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest?v=6',
  '/arrancha-icon-16.png?v=6',
  '/arrancha-icon-32.png?v=6',
  '/arrancha-icon-180.png?v=6',
  '/arrancha-icon-192.png?v=6',
  '/arrancha-icon-512.png?v=6',
  '/arrancha-maskable-512.png?v=6',
  '/arrancha-plus-logo.png?v=6'
];

// Helper to determine if a request should NOT be cached
function shouldBypassCache(url, request) {
  // Only handle GET requests
  if (request.method !== 'GET') return true;

  const urlString = url.toString().toLowerCase();

  // NEVER cache Firebase, Firestore, Auth, or API endpoints
  if (
    urlString.includes('firestore.googleapis.com') ||
    urlString.includes('identitytoolkit.googleapis.com') ||
    urlString.includes('securetoken.googleapis.com') ||
    urlString.includes('firebase') ||
    urlString.includes('/api/') ||
    urlString.includes('firebaseapp.com') ||
    urlString.includes('googleapis.com')
  ) {
    return true;
  }

  // Bypass non-http protocols (e.g., chrome-extension)
  if (!url.protocol.startsWith('http')) return true;

  return false;
}

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate for static assets only
self.addEventListener('fetch', (event) => {
  const reqUrl = new URL(event.request.url);

  // Bypass cache completely for Firebase/Auth/APIs/non-GET
  if (shouldBypassCache(reqUrl, event.request)) {
    return; // Let browser handle network request natively
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
