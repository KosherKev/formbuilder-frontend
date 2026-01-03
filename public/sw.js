/**
 * Service Worker for FormBuilder PWA
 * Handles offline caching and background sync
 */

const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `formbuilder-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
];

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: "network-first",
  CACHE_FIRST: "cache-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// Route patterns
const ROUTE_PATTERNS = {
  FORMS: /\/f\/[^/]+$/,
  STATIC: /\.(js|css|png|jpg|jpeg|svg|woff2?|ttf|eot)$/,
  API: /\/api\//,
};

// ============= INSTALL =============
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching assets");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// ============= ACTIVATE =============
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// ============= FETCH =============
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Route to appropriate strategy
  if (ROUTE_PATTERNS.FORMS.test(url.pathname)) {
    // Forms: Network first with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (ROUTE_PATTERNS.STATIC.test(url.pathname)) {
    // Static assets: Cache first
    event.respondWith(cacheFirstStrategy(request));
  } else if (ROUTE_PATTERNS.API.test(url.pathname)) {
    // API: Network only (don't cache API responses)
    event.respondWith(networkOnlyStrategy(request));
  } else {
    // Default: Stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// ============= STRATEGIES =============

/**
 * Network First - Try network, fallback to cache
 * Perfect for forms that may have been updated
 */
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log("[SW] Network failed, using cache:", request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // No cache available, return offline page
    return caches.match("/offline");
  }
}

/**
 * Cache First - Try cache, fallback to network
 * Perfect for static assets
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache and network failed:", request.url);
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Stale While Revalidate - Return cache, update in background
 * Perfect for pages that update frequently but stale is acceptable
 */
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Network Only - Don't cache
 * Perfect for API requests
 */
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error("[SW] Network request failed:", request.url);
    return new Response(
      JSON.stringify({ error: "Network unavailable" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// ============= BACKGROUND SYNC =============
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "sync-responses") {
    event.waitUntil(syncPendingResponses());
  }
});

/**
 * Sync pending responses when back online
 */
async function syncPendingResponses() {
  try {
    // This will be handled by the SyncService in the app
    // Just send a message to all clients to trigger sync
    const clients = await self.clients.matchAll();

    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_TRIGGERED",
        timestamp: Date.now(),
      });
    });

    console.log("[SW] Sync message sent to all clients");
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error; // Will retry
  }
}

// ============= PUSH NOTIFICATIONS (for future use) =============
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [200, 100, 200],
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "FormBuilder", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it
      for (let client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || "/");
      }
    })
  );
});

// ============= MESSAGE HANDLER =============
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_FORM") {
    const { formSlug } = event.data;
    event.waitUntil(cacheFormAssets(formSlug));
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log("[SW] Cache cleared");
      })
    );
  }
});

/**
 * Cache form-specific assets
 */
async function cacheFormAssets(formSlug) {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Cache the form page
    await cache.add(`/f/${formSlug}`);

    console.log(`[SW] Cached form: ${formSlug}`);
  } catch (error) {
    console.error(`[SW] Failed to cache form ${formSlug}:`, error);
  }
}

// ============= ERROR HANDLER =============
self.addEventListener("error", (event) => {
  console.error("[SW] Error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("[SW] Unhandled rejection:", event.reason);
});

console.log("[SW] Service Worker loaded");
