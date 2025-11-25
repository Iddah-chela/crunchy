const CACHE_NAME = "holyverse-cache-v11";
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
  "/private.html",
  "/profile-view.js",
  "/writenotes.html",
  "/community.html",
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
  "/js/community.js",
  "/js/private.js",
  "/js/profile-view.js",
  "/js/profile.js",
  "/js/questionMap.js",
  "/css/style.css",
  "/icons/icon192.png",
  // --- NIV Bible JSONs ---
  "/bible/Bible-niv-main/Genesis.json",
  "/bible/Bible-niv-main/Exodus.json",
  "/bible/Bible-niv-main/Leviticus.json",
  "/bible/Bible-niv-main/Numbers.json",
  "/bible/Bible-niv-main/Deuteronomy.json",
  "/bible/Bible-niv-main/Joshua.json",
  "/bible/Bible-niv-main/Judges.json",
  "/bible/Bible-niv-main/Ruth.json",
  "/bible/Bible-niv-main/1 Samuel.json",
  "/bible/Bible-niv-main/2 Samuel.json",
  "/bible/Bible-niv-main/1 Kings.json",
  "/bible/Bible-niv-main/2 Kings.json",
  "/bible/Bible-niv-main/1 Chronicles.json",
  "/bible/Bible-niv-main/2 Chronicles.json",
  "/bible/Bible-niv-main/Ezra.json",
  "/bible/Bible-niv-main/Nehemiah.json",
  "/bible/Bible-niv-main/Esther.json",
  "/bible/Bible-niv-main/Job.json",
  "/bible/Bible-niv-main/Psalms.json",
  "/bible/Bible-niv-main/Proverbs.json",
  "/bible/Bible-niv-main/Ecclesiastes.json",
  "/bible/Bible-niv-main/Song Of Solomon.json",
  "/bible/Bible-niv-main/Isaiah.json",
  "/bible/Bible-niv-main/Jeremiah.json",
  "/bible/Bible-niv-main/Lamentations.json",
  "/bible/Bible-niv-main/Ezekiel.json",
  "/bible/Bible-niv-main/Daniel.json",
  "/bible/Bible-niv-main/Hosea.json",
  "/bible/Bible-niv-main/Joel.json",
  "/bible/Bible-niv-main/Amos.json",
  "/bible/Bible-niv-main/Obadiah.json",
  "/bible/Bible-niv-main/Jonah.json",
  "/bible/Bible-niv-main/Micah.json",
  "/bible/Bible-niv-main/Nahum.json",
  "/bible/Bible-niv-main/Habakkuk.json",
  "/bible/Bible-niv-main/Zephaniah.json",
  "/bible/Bible-niv-main/Haggai.json",
  "/bible/Bible-niv-main/Zechariah.json",
  "/bible/Bible-niv-main/Malachi.json",
  "/bible/Bible-niv-main/Matthew.json",
  "/bible/Bible-niv-main/Mark.json",
  "/bible/Bible-niv-main/Luke.json",
  "/bible/Bible-niv-main/John.json",
  "/bible/Bible-niv-main/Acts.json",
  "/bible/Bible-niv-main/Romans.json",
  "/bible/Bible-niv-main/1 Corinthians.json",
  "/bible/Bible-niv-main/2 Corinthians.json",
  "/bible/Bible-niv-main/Galatians.json",
  "/bible/Bible-niv-main/Ephesians.json",
  "/bible/Bible-niv-main/Philippians.json",
  "/bible/Bible-niv-main/Colossians.json",
  "/bible/Bible-niv-main/1 Thessalonians.json",
  "/bible/Bible-niv-main/2 Thessalonians.json",
  "/bible/Bible-niv-main/1 Timothy.json",
  "/bible/Bible-niv-main/2 Timothy.json",
  "/bible/Bible-niv-main/Titus.json",
  "/bible/Bible-niv-main/Philemon.json",
  "/bible/Bible-niv-main/Hebrews.json",
  "/bible/Bible-niv-main/James.json",
  "/bible/Bible-niv-main/1 Peter.json",
  "/bible/Bible-niv-main/2 Peter.json",
  "/bible/Bible-niv-main/1 John.json",
  "/bible/Bible-niv-main/2 John.json",
  "/bible/Bible-niv-main/3 John.json",
  "/bible/Bible-niv-main/Jude.json",
  "/bible/Bible-niv-main/Revelation.json",
  "/bible/en_kjv.json"
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

  const url = new URL(event.request.url);

  // Only apply network-first for these pages
  if (url.pathname === "/community.html" || url.pathname === "/private.html") {
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

