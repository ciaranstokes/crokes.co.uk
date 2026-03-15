// Bareca Portal Service Worker
// Cache version — bump this string any time you update the portal HTML
const CACHE_VERSION = 'bareca-v1';

// App shell assets to cache on install
// These are the CDN resources the app needs to function offline / load fast
const PRECACHE_URLS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// ── Install ──────────────────────────────────────────────────────────────────
// Cache the app shell immediately when the SW is installed
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => {
            // Cache what we can — don't fail the install if a CDN resource
            // is temporarily unavailable
            return Promise.allSettled(
                PRECACHE_URLS.map(url =>
                    cache.add(url).catch(err =>
                        console.warn('[SW] Failed to pre-cache:', url, err)
                    )
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// ── Activate ─────────────────────────────────────────────────────────────────
// Delete old caches when a new SW version takes over
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_VERSION)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
// Strategy:
//   Firebase API calls  → Network only (never cache live data)
//   Google Fonts        → Cache first, fall back to network
//   CDN scripts/styles  → Cache first, fall back to network
//   App HTML            → Network first, fall back to cache
//   Everything else     → Network first, fall back to cache
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Always go to network for Firebase — never serve stale auth/Firestore data
    if (
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('identitytoolkit.googleapis.com') ||
        url.hostname.includes('securetoken.googleapis.com') ||
        url.pathname.includes('/firestore/') ||
        url.pathname.includes('/identitytoolkit/')
    ) {
        // Network only — let Firebase handle it
        return;
    }

    // Cache-first for Google Fonts and CDN assets (they're versioned/immutable)
    if (
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdn.tailwindcss.com') ||
        url.hostname.includes('cdn.jsdelivr.net') ||
        url.hostname.includes('framerusercontent.com')
    ) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Network-first for the app HTML and everything else
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ── Push Notifications (future use) ──────────────────────────────────────────
// Placeholder for when push notifications are added later
self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title || 'Bareca Portal', {
            body: data.body || 'You have a new notification.',
            icon: './icons/icon-192.png',
            badge: './icons/icon-96.png',
            vibrate: [200, 100, 200],
            data: { url: data.url || './' }
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || './')
    );
});
