// Injection point for the precache manifest
self.__WB_MANIFEST


const CACHE_NAME = 'pwa-cache';

const images = 'images';
const routes = 'routes';
const css = 'style';
const other='other';

const FILES_TO_CACHE = [
    // '/',
    // '/index.html',
    // '/src/index.css',
    // '/src/App.css',
    // '/manifest.json',
    // '/icons-pwa/android-chrome-192x192.png',
    // '/icons-pwa/android-chrome-512x512.png',
    // '/icons-pwa/apple-touch-icon.png',
    // '/icons-pwa/favicon-16x16.png',
    // '/icons-pwa/favicon-32x32.png',
    // '/icons-pwa/favicon.ico'
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('🚀 Service Worker: Installation Started');
            // Cache files one by one to handle failures gracefully
            for (const file of FILES_TO_CACHE) {
                try {
                    await cache.add(new Request(file, { cache: 'reload' }));
                    console.log('✅ Cached Successfully:', file);
                } catch (error) {
                    console.warn('❌ Cache Failed:', file, error);
                }
            }
            console.log('🎉 Service Worker: Installation Complete');
        })
    );
    self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('💪 Service Worker: Activated');
    return self.clients.claim();
});


self.addEventListener('fetch', (event) => {
    console.log('🚀 Service Worker: Fetch event triggered', event.request.url);

    // Define variables for different request destinations
    let imageRequests = [];
    let scriptRequests = [];
    let styleRequests = [];
    let otherRequests = [];

    // Filter based on req.destination
    switch (event.request.destination) {
        case 'image':
            imageRequests.push(event.request);
            break;
        case 'script':
            scriptRequests.push(event.request);
            break;
        case 'style':
            styleRequests.push(event.request);
            break;
        default:
            otherRequests.push(event.request);
            break;
    }

    // Log the categorized requests
    console.log('Image Requests:', imageRequests);
    console.log('Script Requests:', scriptRequests);
    console.log('Style Requests:', styleRequests);
    console.log('Other Requests:', otherRequests);

    // Only handle same-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('✅ Serving from Cache:', event.request.url);
                return cachedResponse;
            }

            // If not in cache, fetch from network and cache it
            return fetch(event.request).then((response) => {
                const responseToCache = response.clone();
                
                if (response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                        console.log('📥 Cached after Network Fetch:', event.request.url);
                        console.log('🚀 Service Worker: Fetch event triggered', event);
                    });
                }
                return response;
            }).catch(() => {
                console.log('❌ Network failed & No Cache:', event.request.url);
                return new Response('Offline & not cached', { status: 503 });
            });
        })
    );
});
