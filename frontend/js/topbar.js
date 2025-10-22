
console.log("Topbar loaded on", window.location.pathname);


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

  // ✅ Disable or hide the current page link
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll("nav a");

  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("disabled");
      link.removeAttribute("href");
    }
  });
  
  const settingsModal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const closeSettings = document.getElementById("closeSettings");

  const logoutBtn = document.getElementById("logoutBtn");
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");

logoutBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("/logout", {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Logout failed 😭");
      return;
    }

    // Clear localStorage
    localStorage.removeItem("user");

    // Redirect to login page
    window.location.href = "/login.html";
  } catch (err) {
    console.error(err);
    alert("Network drama 😭");
  }
});
  
  // Fake cookie check (replace with real one if needed)
  const hasCookie = document.cookie.includes("token=");
  const everHadCookie = localStorage.getItem("hasSignedUp") === "true";

  // Visibility logic
  logoutBtn.style.display = hasCookie ? "block" : "none";
  loginLink.style.display = hasCookie ? "none" : "block";
  signupLink.style.display = everHadCookie ? "none" : "block";

  if (hasCookie) localStorage.setItem("hasSignedUp", "true");

 

  // Open settings modal
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
    if (e.target === settingsModal) {
      settingsModal.style.display = "none";
    }
  });

  const streakDisplay = document.getElementById("streakDisplay");
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
    if (streakData.visitedDays[i]) {
      days[i].classList.add("active");
    }
  }



}



// --- Swipe Logic for All Pages ---
// only do this if page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
// List all your HTML pages in the order you want to swipe through
const pages = ['index.html', 'bible.html', 'prayer.html', 'game.html', 'community.html']; 

// Get current file name (e.g. 'home.html')
let currentPage = window.location.pathname.split("/").pop();
if (!currentPage || currentPage === '') {
  currentPage = 'index.html'; // default fallback
}

// Find current index in the array
const currentIndex = pages.indexOf(currentPage);

// Only run if current page is found in the list
if (currentIndex !== -1) {
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
  "index.html": "nav-index",
  "notes.html": "nav-notes",
  "bible.html": "nav-bible",
  "prayer.html": "nav-prayer",
  "game.html": "nav-game",
  "community.html": "nav-community"
};

// Activate the matching nav
const activeNavId = pageToNavId[currentPage];
const checkForNav = setInterval (() => {
  const activeLink = document.getElementById(activeNavId);
  if (activeLink) {
    activeLink.classList.add("active");
    clearInterval(checkForNav);
  } 



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
    "btn.music": "🎵 Start Music",
    "nav.index": "Home",
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
    "btn.music": "🎵 Anza Muziki",
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


  //hope it works

  // ✅ Add this handler to listen for dropdown changes
  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      const newLang = e.target.value;
      storage.setItem("lang", newLang);
      applyLanguage(newLang);
    });
  }


  // Apply saved language
  const savedLang = storage.getItem("lang") || "en";
  applyLanguage(savedLang);
  
  // Also update dropdown to match saved value
  if (languageSelect) languageSelect.value = savedLang;
 });
});

function checkStreak() {
  const today = new Date().toDateString(); // e.g., "Thu Jul 18 2025"
  const lastVisit = storage.getItem("lastVisit");
  let streak = parseInt(storage.getItem("streak")) || 0;

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

  storage.setItem("streak", streak);
  storage.setItem("lastVisit", today);

  
}



// Run it on page load
checkStreak();

console.log("script loaded");

// Register service worker
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

  // send sub to backend to store for this user
  fetch("/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub)
  });
});

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

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show your own “Install” button
  const btn = document.querySelector('#installButton');
  btn.style.display = 'block';

  btn.addEventListener('click', () => {
    btn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => deferredPrompt = null);
  });
});
