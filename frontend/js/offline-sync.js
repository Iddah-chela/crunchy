// Offline sync using Dexie.js
(function(){
  if (!window.Dexie) {
    console.warn('Dexie not available; offline sync disabled');
    return;
  }

  const db = new Dexie('HolyVerseSyncDB');
  db.version(1).stores({ outbox: '++id, url, method, created_at' });

  async function enqueueRequest(url, method, payload) {
    try {
      await db.outbox.add({ url, method, payload, created_at: new Date().toISOString() });
      console.log('Offline: queued request', url);
    } catch (e) {
      console.error('Failed to enqueue', e);
    }
  }

  async function processQueue() {
    const items = await db.outbox.toArray();
    for (const item of items) {
      try {
        const body = item.payload;
        let res;
        if (body && body.imageDataUrl) {
          // multipart
          const fd = new FormData();
          for (const k of Object.keys(body)) {
            if (k === 'imageDataUrl') {
              const blob = dataURLtoBlob(body.imageDataUrl);
              fd.append('image', blob, 'upload.png');
            } else {
              fd.append(k, body[k]);
            }
          }
          res = await fetch(item.url, { method: item.method, body: fd, credentials: 'include' });
        } else {
          res = await fetch(item.url, { method: item.method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
        }

        if (res && res.ok) {
          await db.outbox.delete(item.id);
          console.log('Offline: synced', item.url);
        } else {
          console.warn('Offline sync failed for', item.url);
        }
      } catch (e) {
        console.warn('Offline sync error for', item.url, e);
      }
    }
  }

  // process queue when back online
  window.addEventListener('online', () => { processQueue(); });

  // Expose API
  window.OfflineSync = { enqueueRequest, processQueue };
})();
