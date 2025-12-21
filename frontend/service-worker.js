const CACHE_NAME = "holyverse-cache-v21";
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
  "/about.html",
  "/privacy.html",
  "/writenotes.html",
  "/topbar.html",
  "/bottombar.html",
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
  "/js/modal-utils.js",
  "/js/qna-cache.js",
  "/js/prayer-toast.js",
  "/css/style.css",
  "/icons/icon192.png",
  "/icons/icon512.png",
  "/bible/en_kjv.json",
  "/bible/AMERICAN STANDARD VERSION.json",
  "/bible/AMPLIFIED BIBLE.json",
  "/bible/ANDERSON NEW TESTAMENT.json",
  "/bible/ARAMAIC BIBLE IN PLAIN ENGLISH.json",
  "/bible/BEREAN LITERAL BIBLE.json",
  "/bible/BEREAN STANDARD BIBLE.json",
  "/bible/BRENTON SEPTUAGINT TRANSLATION.json",
  "/bible/CATHOLIC PUBLIC DOMAIN VERSION.json",
  "/bible/CHRISTIAN STANDARD BIBLE.json",
  "/bible/CONTEMPORARY ENGLISH VERSION.json",
  "/bible/crossrefs.json",
  "/bible/DOUAY-RHEIMS BIBLE.json",
  "/bible/ENGLISH REVISED VERSION.json",
  "/bible/ENGLISH STANDARD VERSION.json",
  "/bible/GOD'S WORD® TRANSLATION.json",
  "/bible/GODBEY NEW TESTAMENT.json",
  "/bible/GOOD NEWS TRANSLATION.json",
  "/bible/HAWEIS NEW TESTAMENT.json",
  "/bible/HOLMAN CHRISTIAN STANDARD BIBLE.json",
  "/bible/INTERNATIONAL STANDARD VERSION.json",
  "/bible/JPS TANAKH 1917.json",
  "/bible/KING JAMES BIBLE.json",
  "/bible/LAMSA BIBLE.json",
  "/bible/LEGACY STANDARD BIBLE.json",
  "/bible/LITERAL STANDARD VERSION.json",
  "/bible/MACE NEW TESTAMENT.json",
  "/bible/MAJORITY STANDARD BIBLE.json",
  "/bible/NASB 1977.json",
  "/bible/NASB 1995.json",
  "/bible/NET BIBLE.json",
  "/bible/NEW AMERICAN BIBLE.json",
  "/bible/NEW AMERICAN STANDARD BIBLE.json",
  "/bible/NEW HEART ENGLISH BIBLE.json",
  "/bible/NEW INTERNATIONAL VERSION.json",
  "/bible/NEW KING JAMES VERSION.json",
  "/bible/NEW LIVING TRANSLATION.json",
  "/bible/NEW REVISED STANDARD VERSION.json",
  "/bible/PESHITTA HOLY BIBLE TRANSLATED.json",
  "/bible/SMITH'S LITERAL TRANSLATION.json",
  "/bible/WEBSTER'S BIBLE TRANSLATION.json",
  "/bible/WEYMOUTH NEW TESTAMENT.json",
  "/bible/WORLD ENGLISH BIBLE.json",
  "/bible/WORRELL NEW TESTAMENT.json",
  "/bible/WORSLEY NEW TESTAMENT.json",
  "/bible/YOUNG'S LITERAL TRANSLATION.json",
  "/backgrounds/seedling.png",
  "/backgrounds/kidplant.png",
  "/backgrounds/tweenseed.png",
  "/backgrounds/teenplant.png",
  "/backgrounds/almost18tree.png",
  "/backgrounds/20stree.png",
  "/backgrounds/25hapo.png",
  "/backgrounds/30sasa.webp",
  "/backgrounds/bigtree.png"
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

