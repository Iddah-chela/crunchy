// service-worker.js
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Hey 👋", {
      body: data.body || "You got a new notification!",
      icon: "/icons/icon.png",
        //badge: "/icons/badge.png"
    })
  );
});
