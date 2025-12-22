// Capacitor helper wrappers for notifications, share, camera, image picking
// Exposes helpers on window.CapacitorHelpers for non-module environments
(function () {
  function isNative() {
    return !!(window.Capacitor && window.Capacitor.Plugins);
  }

  async function requestPushRegistration() {
    if (isNative()) {
      try {
        const { PushNotifications, LocalNotifications } = window.Capacitor.Plugins;
        // Register for push on native devices
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== 'granted') {
          console.warn('Capacitor: push permission not granted');
          return false;
        }
        await PushNotifications.register();
        console.log('Capacitor: Push registration requested');
        // Setup listeners
        setupPushListeners();
        return true;
      } catch (e) {
        console.error('Capacitor: push registration failed', e);
        return false;
      }
    } else {
      // Web fallback: keep existing service worker flow
      return false;
    }
  }

  function setupPushListeners() {
    try {
      const { PushNotifications, LocalNotifications } = window.Capacitor.Plugins;

      PushNotifications.addListener('registration', token => {
        console.log('Push registration token:', token.value);
        // Optionally send token to backend via fetch
        window.dispatchEvent(new CustomEvent('capacitor:push:registration', { detail: token.value }));
      });

      PushNotifications.addListener('registrationError', err => {
        console.error('Push registration error', err);
      });

      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push received', notification);
        // Show a local notification and emit event for app
        if (notification?.title || notification?.body) {
          showLocalNotification(notification.title || 'Notification', notification.body || '');
        }
        window.dispatchEvent(new CustomEvent('capacitor:push:received', { detail: notification }));
      });

      PushNotifications.addListener('pushNotificationActionPerformed', action => {
        console.log('Push action performed', action);
        window.dispatchEvent(new CustomEvent('capacitor:push:action', { detail: action }));
      });
    } catch (e) {
      console.warn('Failed to setup push listeners', e);
    }
  }

  async function showLocalNotification(title, body) {
    if (isNative()) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        await LocalNotifications.schedule({
          notifications: [{ id: Date.now(), title: title, body: body }]
        });
      } catch (e) {
        console.error('Capacitor: local notification failed', e);
      }
    } else {
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }

  async function share(payload) {
    // payload: { title, text, url }
    if (isNative()) {
      try {
        const { Share } = window.Capacitor.Plugins;
        await Share.share({ title: payload.title || '', text: payload.text || '', url: payload.url || '' });
        return true;
      } catch (e) {
        console.error('Capacitor: share failed', e);
        return false;
      }
    } else if (navigator.share) {
      try {
        await navigator.share(payload);
        return true;
      } catch (e) {
        console.warn('Web share failed', e);
        return false;
      }
    } else {
      return false;
    }
  }

  async function pickImage(options = { quality: 80, allowEditing: false }) {
    if (isNative()) {
      try {
        const { Camera } = window.Capacitor.Plugins;
        const photo = await Camera.getPhoto({ quality: options.quality || 80, resultType: 'DataUrl', allowEditing: !!options.allowEditing });
        return { dataUrl: photo && photo.dataUrl };
      } catch (e) {
        console.error('Capacitor: camera/pick failed', e);
        return null;
      }
    } else {
      // Web fallback: trigger an input[type=file] if present
      return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
          const file = input.files[0];
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve({ dataUrl: reader.result });
          reader.readAsDataURL(file);
        };
        input.click();
      });
    }
  }

  window.CapacitorHelpers = {
    isNative,
    requestPushRegistration,
    showLocalNotification,
    share,
    pickImage
  };
})();
