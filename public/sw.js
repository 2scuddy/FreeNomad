// Service Worker for FreeNomad - Core Web Vitals 2024 Optimized
const CACHE_NAME = "freenomad-v1";
const STATIC_CACHE = "freenomad-static-v1";
const DYNAMIC_CACHE = "freenomad-dynamic-v1";
const IMAGE_CACHE = "freenomad-images-v1";
const API_CACHE = "freenomad-api-v1";

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  static: {
    name: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100,
  },
  dynamic: {
    name: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 50,
  },
  images: {
    name: IMAGE_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200,
  },
  api: {
    name: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
  },
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/_next/static/css/",
  "/_next/static/js/",
];

// Install event - cache static assets
self.addEventListener("install", event => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS.filter(url => !url.endsWith("/")));
      })
      .then(() => {
        console.log("Static assets cached");
        return self.skipWaiting();
      })
      .catch(error => {
        console.error("Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return (
                cacheName.startsWith("freenomad-") &&
                !Object.values(CACHE_STRATEGIES).some(
                  strategy => strategy.name === cacheName
                )
              );
            })
            .map(cacheName => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler with intelligent caching
async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // API requests - Cache First with Network Fallback
    if (url.pathname.startsWith("/api/")) {
      return await handleApiRequest(request);
    }

    // Images - Cache First with Network Fallback
    if (isImageRequest(request)) {
      return await handleImageRequest(request);
    }

    // Static assets - Cache First
    if (isStaticAsset(request)) {
      return await handleStaticRequest(request);
    }

    // Pages - Network First with Cache Fallback
    return await handlePageRequest(request);
  } catch (error) {
    console.error("Request handling error:", error);
    return fetch(request);
  }
}

// Handle API requests with short-term caching
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Check if cached response is still fresh (5 minutes)
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get("sw-cached-date"));
    const now = new Date();

    if (now - cachedDate < CACHE_STRATEGIES.api.maxAge) {
      console.log("Serving API from cache:", request.url);
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set("sw-cached-date", new Date().toISOString());

      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });

      await cache.put(request, modifiedResponse);
      await cleanupCache(API_CACHE, CACHE_STRATEGIES.api.maxEntries);
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, serving API from cache:", request.url);
    return cachedResponse || new Response("Network error", { status: 503 });
  }
}

// Handle image requests with long-term caching
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log("Serving image from cache:", request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await cleanupCache(IMAGE_CACHE, CACHE_STRATEGIES.images.maxEntries);
    }

    return networkResponse;
  } catch (error) {
    console.log("Failed to fetch image:", request.url);
    return new Response("Image not available", { status: 404 });
  }
}

// Handle static assets with long-term caching
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log("Serving static asset from cache:", request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await cleanupCache(STATIC_CACHE, CACHE_STRATEGIES.static.maxEntries);
    }

    return networkResponse;
  } catch (error) {
    console.log("Failed to fetch static asset:", request.url);
    return (
      cachedResponse || new Response("Asset not available", { status: 404 })
    );
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await cleanupCache(DYNAMIC_CACHE, CACHE_STRATEGIES.dynamic.maxEntries);
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, serving page from cache:", request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    const offlinePage = await cache.match("/");
    return offlinePage || new Response("Offline", { status: 503 });
  }
}

// Utility functions
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname) ||
    url.hostname === "images.unsplash.com"
  );
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/static/") ||
    /\.(css|js|woff|woff2|ttf|eot)$/i.test(url.pathname)
  );
}

// Clean up old cache entries
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxEntries) {
    const entriesToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(entriesToDelete.map(key => cache.delete(key)));
    console.log(
      `Cleaned up ${entriesToDelete.length} entries from ${cacheName}`
    );
  }
}

// Background sync for failed requests
self.addEventListener("sync", event => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log("Performing background sync...");
  // Implement background sync logic here
}

// Push notifications (for future use)
self.addEventListener("push", event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "Explore",
          icon: "/icon-explore.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icon-close.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});
