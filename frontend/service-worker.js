const CACHE_NAME = "holyverse-cache-v19";
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/home.html",
  "/bible.html",
  "/notes.html",
  "/profile.html",
  "/favorites.html",
  "/prayer.html",
  "/profile-view.js",
  "/writenotes.html",
  "/topbar.html",
  "/js/topbar.js",
  "/js/topbar-loader.js",
  "/js/home.js",
  "/js/main.js",
  "/js/bible.js",
  "/js/bibleMigrator.js",
  "/js/prayer.js",
  "/js/filter.js",
  "/js/notes.js",
  "/js/profile-view.js",
  "/js/profile.js",
  "/js/questionMap.js",
  "/css/style.css",
  "/icons/icon192.png",
  "/bible/en_kjv.json",
  "/backgrounds/seedling.png", // seedling
  "/backgrounds/kidplant.png",
  "/backgrounds/tweenseed.png",
  "/backgrounds/teenplant.png",
  "/backgrounds/almost18tree.png",
  "/backgrounds/20stree.png",
  "/backgrounds/25hapo.png",
  "/backgrounds/30sasa.png",
  "/backgrounds/bigtree.png"  // full-grown
];


// Install event: cache app shell
self.addEventListener("install", event => {
  self.skipWaiting(); // activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log("Cached:", url);
        } catch (err) {
          console.warn("Failed to cache:", url, err);
        }
      }
    })
  );
});


// Activate event: cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // take control of all clients immediately
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// Fetch event: serve cached content when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Handle pages (navigation requests)
if (event.request.mode === "navigate") {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match("/offline.html"));
    })
  );
  return;
}



  const url = new URL(event.request.url);

  // Only apply network-first for these pages
  if (url.pathname === "/community.html" || url.pathname === "/private.html" || url.pathname === "/friends.html" || url.pathname === "/js/community.js" || url.pathname === "/js/private.js" || url.pathname === "/js/friends.js") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // if valid response, update cache
          if (response && response.status === 200 && response.type === "basic") {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // if offline or fetch fails, return cached version
          return caches.match(event.request).then((cached) => cached || caches.match("/offline.html"));
        })
    );
  } else {
    // default cache-first behavior for other resources
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchedResponse) => {
          if (!fetchedResponse || fetchedResponse.status !== 200 || fetchedResponse.type !== "basic") return fetchedResponse;
          const responseClone = fetchedResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return fetchedResponse;
        }).catch(() => caches.match("/offline.html"));
      })
    );
  }
});




// Push event
self.addEventListener("push", event => {
  console.log("Push received:", event.data?.json());
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Hey 👋", {
      body: data.body || "You got a new notification!",
      icon: "/icons/icon.png"
    })
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close(); // close the notification

  const postId = event.notification.data?.postId; // the post ID we’ll send with the notification
  const urlToOpen = postId ? `/community?q=${postId}` : "/"; // default to homepage if no postId

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        // if tab is already open, focus it
        if (client.url.includes("/")) {
          client.navigate(urlToOpen); // navigate to the post
          return client.focus();
        }
      }
      // if no tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

