

console.log("Topbar loaded on", window.location.pathname);

// Dynamically load Capacitor helpers if not already present
if (!window.CapacitorHelpers) {
  const s = document.createElement('script');
  s.src = '/js/capacitor-helpers.js';
  s.defer = true;
  document.head.appendChild(s);
}
// Load hover-to-touch fallback for touch devices
if (!window.HoverTouchFallback) {
  const s2 = document.createElement('script');
  s2.src = '/js/hover-touch-fallback.js';
  s2.defer = true;
  document.head.appendChild(s2);
}
// Load offline sync module (Dexie) if available
if (!window.OfflineSync) {
  const s3 = document.createElement('script');
  s3.src = '/js/offline-sync.js';
  s3.defer = true;
  document.head.appendChild(s3);
}

// Listen for native push registration events and send token to backend
window.addEventListener('capacitor:push:registration', async (e) => {
  const token = e.detail;
  if (!token) return;
  try {
    window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : "https://holyverse-s5s1.onrender.com");
    await fetch(`${window.API_BASE}/push/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: window.Capacitor?.getPlatform?.() || 'unknown' })
    });
    console.log('Sent device token to backend');
  } catch (err) {
    console.warn('Failed to send device token to backend', err);
  }
});

function showModal(message) {
  const modal = document.getElementById("appModal");
  const msg = document.getElementById("modalMessage");
  const closeBtn = document.getElementById("modalClose");

  msg.textContent = message;
  modal.style.display = "flex";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

function initTopbar() {
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");

  if (menuToggle && sideMenu) {
    // ✅ Remove any previous click events safely by cloning the button
    const newToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newToggle, menuToggle);

    // ✅ Add fresh toggle logic
    newToggle.addEventListener("click", (e) => {
      sideMenu.classList.toggle("hidden");
      e.stopPropagation();
    });

    // ✅ Document click to close the menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!sideMenu.contains(e.target) && !newToggle.contains(e.target)) {
        sideMenu.classList.add("hidden");
      }
    });
  }

  //page link highlighting and disabling
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll("nav a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("disabled");
      link.removeAttribute("href");
    }
  });

  const settingsModal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const closeSettings = document.getElementById("closeSettings");


  const streakDisplay = document.getElementById("streakDisplay");

  let isLoggedIn = false;
  window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
    ? ""
    : "https://holyverse-s5s1.onrender.com");
  const API_BASE = window.API_BASE;


const savedUser = localStorage.getItem("user");
if (savedUser) {
  const user = JSON.parse(savedUser);
  isLoggedIn = true;
  updateTopbar(true, user);
} else {
  // only fetch if not offline
  if (navigator.onLine) {
    fetch(`${API_BASE}/me`, {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) throw new Error("Not logged in");
        const data = await res.json();
        isLoggedIn = true;
        localStorage.setItem("user", JSON.stringify(data));
        updateTopbar(true, data);
      })
      .catch(() => updateTopbar(false, null));
  } else {
    updateTopbar(false, null); // offline & no saved user
  }
}

  function updateTopbar(isLoggedIn, user) {
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const profileBtn = document.getElementById("profileBtn");
  const streakDisplay = document.getElementById("streakDisplay");

  if (loginLink) loginLink.style.display = isLoggedIn ? "none" : "block";
  if (signupLink) signupLink.style.display = isLoggedIn ? "none" : "block";
  if (profileBtn) profileBtn.style.display = isLoggedIn ? "block" : "none";
  if (streakDisplay) streakDisplay.style.display = isLoggedIn ? "flex" : "none";

  // Add profile pic
  if (isLoggedIn && user?.profilePic) {
    let img = profileBtn.querySelector("img");
    img.src = user.profilePic || "/images/default-avatar.png";
  }
}

  // Settings modal logic
  settingsBtn.addEventListener("click", () => {
    sideMenu.classList.add("active");
    settingsModal.style.display = "flex";
  });

  // Close settings modal
  closeSettings.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  // Optional: close modal when clicking outside
  settingsModal.addEventListener("click", e => {
    if (e.target === settingsModal) settingsModal.style.display = "none";
  });

  // Streak logic
  const days = streakDisplay.querySelectorAll(".day");

  const today = new Date();
  const todayIndex = today.getDay(); // 0 = Sunday, 6 = Saturday
  const todayDate = today.toDateString(); // e.g. "Sat Oct 18 2025"

  let streakData = JSON.parse(localStorage.getItem("streakData")) || {
    visitedDays: {},
    lastVisit: null
  };

  // Mark today as visited if not already
  if (streakData.lastVisit !== todayDate) {
    streakData.visitedDays[todayIndex] = true;
    streakData.lastVisit = todayDate;
    localStorage.setItem("streakData", JSON.stringify(streakData));
  }

  // Activate streak circles for visited days
  for (let i = 0; i < 7; i++) {
    if (streakData.visitedDays[i]) days[i].classList.add("active");
  }
}




// --- Swipe Logic for All Pages ---
// only do this if page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
// List all your HTML pages in the order you want to swipe through
const pages = ['home.html', 'notes.html', 'bible.html', 'prayer.html', 'music.html', 'community.html', 'private.html']; 

// Get current file name (e.g. 'home.html')
let currentPage = window.location.pathname.split("/").pop();
if (!currentPage || currentPage === '') {
  currentPage = 'home.html'; // default fallback
}



// Find current index in the array
const currentIndex = pages.indexOf(currentPage);

// Only run if current page is found in the list
if (currentIndex !== -1) {
  // Disable page swiping on bible page
if (currentPage === "bible.html") return;

  let startX = 0;

  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  document.addEventListener('touchend', (e) => {
    let endX = e.changedTouches[0].clientX;
    let diff = endX - startX;

    if (diff > 100) {
      // Swipe right → go to previous page
      const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
      window.location.href = pages[prevIndex];
    } else if (diff < -100) {
      // Swipe left → go to next page
      const nextIndex = (currentIndex + 1) % pages.length;
      window.location.href = pages[nextIndex];
    }
  });
}


// Get current page name from URL

// Map page names to nav link IDs
const pageToNavId = {
  "home.html": "nav-index",
  "notes.html": "nav-notes",
  "bible.html": "nav-bible",
  "music.html": "nav-music",
  "prayer.html": "nav-prayer",
  "community.html": "nav-community",
  "private.html": "nav-private"
};

// Activate the matching nav
const activeNavId = pageToNavId[currentPage];
const checkForNav = setInterval (() => {
  const activeLink = document.getElementById(activeNavId);
  if (activeLink) {
    activeLink.classList.add("active");
    clearInterval(checkForNav);
  } 

}, 500); // check every 500ms

const translations = {
  en: {
    "language-label": "🌐 Language ▾",
    "home-title": "QnA",
    "verse-button": "Read Verse",
    "welcome-msg": "Welcome!",
    "title.app": "Holy Verse",
    "label.language": "Language:",
    "label.age": "Choose your age:",
    "label.theme": "Theme:",
    "nav.index": "Qna",
    "nav.notes": "Notes",
    "nav.favorites": "Favorites",
    "nav.prayer": "Prayer",
    "nav.game": "Game",
    "nav.community": "Community"
  },
  sw: {
    "title.app": "Kisomaji cha Mistari ya Biblia",
    "label.language": "Lugha:",
    "label.age": "Chagua umri wako:",
    "label.theme": "Mandhari:",
    "nav.index": "Nyumbani",
    "nav.notes": "Maandishi",
    "nav.favorites": "Mistari",
    "nav.prayer": "Maombi",
    "nav.game": "Mchezo",
    "nav.community": "Jumuiya",
    "language-label": "🌐 Lugha ▾",
    "home-title": "Nyumbani",
    "verse-button": "Soma Aya",
    "welcome-msg": "Karibu!"
    // ➕ Add more as needed...
  }
};

function applyLanguage(lang) {
  const langSet = translations[lang];
  if (!langSet) return;


  // Update all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translated = langSet[key];
    if (translated) {
      el.textContent = translated;
    }
  });
}


  callHeartbeat();
  //hope it works

  // ✅ Add this handler to listen for dropdown changes
  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      const newLang = e.target.value;
      localStorage.setItem("lang", newLang);
      applyLanguage(newLang);
    });
  }

  
  // Apply saved language
  const savedLang = localStorage.getItem("lang") || "en";
  applyLanguage(savedLang);
  
  // Also update dropdown to match saved value
  if (languageSelect) languageSelect.value = savedLang;
 });



function checkStreak() {
  const today = new Date().toDateString(); // e.g., "Thu Jul 18 2025"
  const lastVisit = localStorage.getItem("lastVisit");
  let streak = parseInt(localStorage.getItem("streak")) || 0;

  if (lastVisit === today) {
    // Already visited today — don’t change streak
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastVisit === yesterdayStr) {
    streak++; // continued the streak
  } else {
    streak = 1; // reset streak
  }

  localStorage.setItem("streak", streak);
  localStorage.setItem("lastVisit", today);

  
}


// Run it on page load
checkStreak();

console.log("script loaded");

// Register service worker or use Capacitor push on native
if (window.CapacitorHelpers && window.CapacitorHelpers.isNative && window.CapacitorHelpers.isNative()) {
  // Native app: let Capacitor handle push registration
  window.CapacitorHelpers.requestPushRegistration().then(ok => {
    if (!ok) console.warn('Capacitor push registration not completed');
  });
} else {
  // Web fallback: register service worker and subscribe to web push
  navigator.serviceWorker.register("/service-worker.js").then(reg => {
    return Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        const vapidKey = "BDF7aki5ACDWUSBFkGU_2pEPDWjXPOLU01hb6DAh1Vog5XJwPSuXhGR5AT289QEt8yw0Xw7c40V46RBjFYYRb2k";
        const convertedKey = urlBase64ToUint8Array(vapidKey);

        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      }
    });
  }).then(sub => {
    if (!sub) return console.warn("Subscription failed or permission denied.");

    console.log("Subscription:", sub);
    window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
      ? ""
      : "https://holyverse-s5s1.onrender.com");
    const API_BASE = window.API_BASE;


    // send sub to backend to store for this user
    fetch(`${API_BASE}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
      credentials: "include"
    });
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
// ----- existing stuff above stays the same -----
// (service worker registration, push subscription, urlBase64ToUint8Array, etc.)

let deferredPrompt = null;
const installPromptKey = "installPromptDismissed";

// Make sure the persistent install button (in topbar) is wired
function setupPersistentInstallButton(){
  const pwaBtn = document.getElementById('pwaInstallBtn');
  if(!pwaBtn) return;

  // If user already dismissed or installed, hide the button
  if(localStorage.getItem(installPromptKey)){
    pwaBtn.style.display = 'none';
  } else {
    // show the button always but subtle; click behavior depends on availability
    pwaBtn.style.display = 'inline-flex';
  }

  pwaBtn.addEventListener('click', async () => {
    // If we have a beforeinstallprompt event, use it
    if(deferredPrompt){
      try{
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if(choice && choice.outcome === 'accepted'){
          localStorage.setItem(installPromptKey, 'true');
          pwaBtn.style.display = 'none';
        } else {
          // user dismissed – don't spam again
          localStorage.setItem(installPromptKey, 'true');
        }
      }catch(err){
        console.warn('Install prompt failed', err);
        // fallback to manual instructions
        showModal("To install this app: On Android use the browser menu → Install app. On iOS (Safari): tap Share → Add to Home Screen.");
      } finally {
        deferredPrompt = null;
      }
    } else {
      // No programmatic prompt available — show manual instructions
      showModal("To install this app: On Android use the browser menu → Install app. On iOS (Safari): tap Share → Add to Home Screen.");
    }
  });
}

// Timing / visibility flags
let installTimerId = null;
let installTimerFired = false;
let installTimerShouldShowWhenAvailable = false;

// helper: show the toast and wire buttons (only once)
function showInstallToast() {
  if (localStorage.getItem(installPromptKey)) return; // already dismissed/installed
  const toast = document.getElementById("installPrompt");
  if (!toast) return;

  toast.style.display = "flex";

  const btn = document.querySelector("#installButton");
  const closeBtn = document.querySelector(".close-btnm");

  // install button handler (guard to avoid double listeners)
  if (btn && !btn._hasInstallListener) {
    btn._hasInstallListener = true;
    btn.addEventListener("click", async () => {
      // hide immediate UI to avoid double clicks
      btn.style.display = "none";

      if (!deferredPrompt) {
        // no install prompt available — just mark dismissed to avoid repeating
        localStorage.setItem(installPromptKey, "true");
        toast.style.display = "none";
        return;
      }

      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === "dismissed") {
          localStorage.setItem(installPromptKey, "true");
        }
      } catch (e) {
        // ignore errors, but prevent retry spam
        localStorage.setItem(installPromptKey, "true");
      } finally {
        deferredPrompt = null;
        toast.style.display = "none";
        clearInstallTimer();
      }
    });
  }

  // close/dismiss handler (guard)
  if (closeBtn && !closeBtn._hasCloseListener) {
    closeBtn._hasCloseListener = true;
    closeBtn.addEventListener("click", () => {
      localStorage.setItem(installPromptKey, "true");
      toast.style.display = "none";
      clearInstallTimer();
    });
  }
}

function clearInstallTimer() {
  if (installTimerId) {
    clearTimeout(installTimerId);
    installTimerId = null;
  }
  installTimerFired = false;
  installTimerShouldShowWhenAvailable = false;
}

// 1) Capture the beforeinstallprompt and *don't* show immediately.
//    We store the event so we can trigger the real prompt after 10 minutes.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();

  // don't do anything if already dismissed/installed
  if (localStorage.getItem(installPromptKey)) return;

  deferredPrompt = e;

  // If the 10-minute timer already fired, show the toast now.
  // Or if the timer fired earlier and set the "should show" flag, show now.
  if (installTimerFired || installTimerShouldShowWhenAvailable) {
    showInstallToast();
    // once shown, clear the timer flags
    clearInstallTimer();
  }
});

// Initialize the persistent install button early
document.addEventListener('DOMContentLoaded', () => {
  try{ setupPersistentInstallButton(); } catch(e){}
});

// 2) Start a single 10-minute timer (only if the user hasn't dismissed before).
//    After 10 minutes, attempt to show the toast. If the beforeinstallprompt event
//    hasn't arrived yet, wait and show as soon as it does.
if (!localStorage.getItem(installPromptKey)) {
  // don't set multiple timers if this script runs twice
  if (!installTimerId) {
    installTimerId = setTimeout(() => {
      installTimerFired = true;

      // if PWA install prompt already available, show immediately
      if (deferredPrompt) {
        showInstallToast();
        clearInstallTimer();
        return;
      }

      // otherwise mark that we should show as soon as the beforeinstallprompt fires
      installTimerShouldShowWhenAvailable = true;
      // we keep the flags so the beforeinstallprompt handler can show the toast later
    }, 10 * 60 * 1000); // 10 minutes
  }
}

// 3) When the app is installed via browser UI, mark as done and hide toast
window.addEventListener("appinstalled", () => {
  localStorage.setItem(installPromptKey, "true");
  deferredPrompt = null;
  const toast = document.getElementById("installPrompt");
  if (toast) toast.style.display = "none";
  clearInstallTimer();
});

// ----- existing callHeartbeat, visibilitychange, window.initTopbar etc. stay the same -----



async function callHeartbeat() {
  try {
    window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
      ? ""
      : "https://holyverse-s5s1.onrender.com");
    const API_BASE = window.API_BASE;

    const res = await fetch(`${API_BASE}/heartbeat`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      // ignore silently, or handle if you want
      return;
    }
    const data = await res.json();
    // optional: use data.hoursSince or data.sentWelcomeBack to show UI
    console.log("heartbeat ok:", data);
  } catch (err) {
    console.warn("heartbeat failed", err);
  }
}

// In your frontend JS
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version ready
          showModal("New version available! Refresh to update.");
        }
      };
    };
  });
}

// call when page becomes visible (user switches back to tab)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    callHeartbeat();
  }
});

window.initTopbar = initTopbar;