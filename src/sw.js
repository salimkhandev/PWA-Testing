import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";

// Add version tracking
const VERSION = '1.0.0';
console.log('🔧 Service Worker Loading... Version:', VERSION);

// Precache assets from the manifest
precacheAndRoute(self.__WB_MANIFEST);

// 📞 Contact Route Strategy
registerRoute(
    ({ request, url }) => {
        const pathname = url.pathname.toLowerCase();
        console.log('🔍 Checking route:', request.url);
        console.log('😂 Checking route:', request);
        // Match both the page and its assets
        const isContact = pathname.includes('contact') || 
                         pathname.includes('/assets/contact-');
        if (isContact) {
            console.log('🚫 Contact route detected - Using Network Only');
        }
        return isContact;
    },
    new NetworkOnly({
        plugins: [
            {
                requestWillFetch: async ({ request }) => {
                    console.log('🌐 Network request for contact:', request.url);
                    return request;
                }
            }
        ]
    })
);

// 🖼️ Image Caching Strategy
registerRoute(
    ({ request }) => {
        const isImage = request.destination === "image";
        if (isImage) {
            console.log('🖼️ Caching image:', request.url);
        }
        return isImage;
    },
    new CacheFirst({
        cacheName: `images-${VERSION}`,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }),
            {
                cacheDidUpdate: async ({ request }) => {
                    console.log('💾 Updated image cache:', request.url);
                }
            }
        ]
    })
);

// 📦 Static Assets Strategy
registerRoute(
    ({ request, url }) => {
        // const pathname = url.pathname.toLowerCase();
        // console.log('📦 Static Asset Check:', pathname);
        
        // // Don't cache contact-related files
        // if (pathname.includes('contact')) {
        //     console.log('⏭️ Skipping contact asset:', pathname);
        //     return false;
        // }
        
        const isStatic = ["style", "script", "font"].includes(request.destination);
        // if (isStatic) {
        //     console.log('📦 Handling static asset:', pathname);
        // }
        return isStatic;
    },
    new StaleWhileRevalidate({
        cacheName: `static-resources-${VERSION}`,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }),
            {
                cacheDidUpdate: async ({ request }) => {
                    console.log('🔄 Updated static cache:', request.url);
                }
            }
        ]
    })
);

const isFromAssets = ({ referrer }) => {
    return referrer && referrer.includes('/assets/');
};

// Register route to cache only if the request referrer is from /assets/
registerRoute(
    ({ request }) => {
        // Get the referrer from request headers
        const referrer = request.referrer || request.headers.get("referer");

        if (isFromAssets({ referrer })) {
            console.log('📌 Caching request from assets:', request.url);
            return true; // Allow caching
        }
        return false;
    },
    new CacheFirst({
        cacheName: "assets-referrer-cache",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100, // Limit cache size
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    })
);

// Service Worker Lifecycle Events
self.addEventListener("install", () => {
    console.log('🚀 Service Worker installing... Version:', VERSION);
    console.log('⏩ Skipping waiting phase...');
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log('✨ Service Worker activating... Version:', VERSION);
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches from previous versions
            caches.keys().then(cacheNames => {
                console.log('🧹 Checking for outdated caches...');
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete caches that don't match current version
                        if (!cacheName.includes(VERSION) && 
                            (cacheName.startsWith('workbox-') || 
                             cacheName.startsWith('static-resources') || 
                             cacheName.startsWith('images') || 
                             cacheName.startsWith('pages'))) {
                            console.log('🗑️ Deleting outdated cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim().then(() => {
                console.log('👑 Service Worker Version', VERSION, 'is now active');
            })
        ])
    );
});
