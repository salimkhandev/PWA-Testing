// Injection point for the precache manifest
self.__WB_MANIFEST
// import { CACHE_NAME } from './config';
// const CACHE_NAME = 'pwa-cache15';

// Service Worker version
const CACHE_VERSION = 'v8';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/offline.html',
    '/main.js',
    '/style.css',
    
    
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting(); // Activate SW immediately
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
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
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
    return self.clients.claim(); // Take control immediately
});


self.addEventListener('fetch', (event) => {
    console.log('🚀 Service Worker: Fetch event triggered', event.request.url);

    if (
        !event.request.url.startsWith(self.location.origin) ||
        event.request.url.startsWith('chrome-extension://') ||
        event.request.method !== 'GET'
    ) {
        return;
    }

    if (event.request.url.toLowerCase().includes('/nonono')) {
        console.log('❌ Not caching this page:', event.request.url);
        
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
           
            if (cachedResponse) {
                console.log('✅ Serving from Cache:', event.request.url);
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                const responseToCache = response.clone();
                
                if (response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        // cache.put(event.request, responseToCache);
                        console.log('📥 Cached after Network Fetch:', event.request.url);
                    });
                }
                return response;
            }).catch(() => {
                console.log('❌ Network failed & No Cache:', event.request.url);
                
            });
        })
    );
});

self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New Notification',
        icon: './icons-pwa//android-chrome-192x192.png',
        badge: './icons-pwa/favicon-32x32.png',
        image: './icons-pwa/android-chrome-512x512.png',
        vibrate: [500, 200, 500],
        requireInteraction: true,
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: './icons-pwa/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './icons-pwa/favicon-16x16.png'
            },
        ]
    };

    // For debugging - log the full URLs
    console.log('Icon path:', new URL('./icons-pwa/favicon-32x32.png', self.location.origin).href);
    console.log('Badge path:', new URL('./icons-pwa/favicon-16x16.png', self.location.origin).href);

    // Try to vibrate immediately when push is received
    if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500]);
    }

    event.waitUntil(
        self.registration.showNotification('School Attendance System', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    // Vibrate on notification click
    if ('vibrate' in navigator) {
        navigator.vibrate([200]);
    }
    
    // Handle the click event
    if (event.action === 'explore') {
        // Handle explore action
        clients.openWindow('/attendance');
    }
    event.notification.close();
});
console.log('Service worker updated v2'); // Change version

