//const { response } = require("express");
function setThemeMusic(theme) {
  const music = document.getElementById("bg-music");
  if (!music) return;

  const newSong = musicMap[theme] || "audio/soft-piano.mp3";
  if (music.src !== newSong) {
    const wasPlaying = !music.paused;
    music.src = newSong;
    if (wasPlaying) music.play().catch(()=>console.warn("Music blocked"));
  }
}

//themes with animated backgrounds 
function applyAnimatedOverlay(theme) {
  const overlay = document.querySelector(".animated-overlay");
  overlay.innerHTML = ""; // Clear previous elements

  let assetUrl, count, size;

  switch (theme) {
    case "celestial-theme":
      assetUrl = "backgrounds/star (1).jpeg";
      overlay.style.background = `black url('${assetUrl}') repeat`;
      overlay.style.opacity = "0.1";
      overlay.style.animation = "starScroll 120s linear infinite";
      return;

    case "dreamy-theme":
      assetUrl = "backgrounds/pink.png";
      count = 20;
      size = "50px";
      break;

    case "peaceful-earth-theme":
      assetUrl = [
        { url: "backgrounds/leaf.png", size: "25px" },
        { url: "backgrounds/branch .png", size: "70px" },
      ]; // two types of leaves
      count = 35;
      break;
      
   case "braveheart-theme":
      assetUrl = "backgrounds/yellow leaf.png"; // falling yellow leaf
      count = 25;
      size = "30px";
      break;

   case "dark-theme":
      assetUrl = "backgrounds/snow (1).png"; // falling blue snow
      count = 80;
      size = "10px";
      break;
      
   case "sunrise-theme":
      assetUrl = "backgrounds/sun.png"; // falling golden ball
      count = 25;
      size = "25px";
      break;
      
   case "glory-theme":
      assetUrl = "backgrounds/ribbon.png"; // falling golden ribbons
      count = 25;
      size = "35px";
      break;
      
   case "royal-theme":
      assetUrl = "backgrounds/purple flower (1).png"; // falling branches
      count = 15;
      size = "40px";
      break;
      
   case "ocean-depths-theme":
      assetUrl = "backgrounds/ocean.jpeg"; // your sideways scrolling ocean texture
      overlay.style.background = `#001f3f url('${assetUrl}') repeat-x`;
      overlay.style.backgroundSize = "auto 100%";
overlay.style.backgroundRepeat = "repeat-x";
overlay.style.backgroundPosition = "center";
overlay.style.width = "100vw";
overlay.style.height = "100vh";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.position = "fixed";
      overlay.style.opacity = "0.3";
      overlay.style.animation = "oceanScroll 30s linear infinite";
      return;
    
    case "light-theme":
      // Floating clouds for light theme only
      assetUrl = "backgrounds/cloud.png";
      count = 10;
      size = "90px";
      overlay.style.background = "";
      overlay.style.opacity = "0.7";
      overlay.style.animation = "none";

      for (let i = 0; i < count; i++) {
        const cloud = document.createElement("div");
        cloud.classList.add("floating-cloud");
        cloud.style.position = "absolute";
        cloud.style.top = `${Math.random() * 70}vh`;
        cloud.style.left = `${-20 - Math.random() * 50}vw`;
        cloud.style.backgroundImage = `url('${assetUrl}')`;
        cloud.style.width = `${70 + Math.random() * 120}px`;
        cloud.style.height = "60px";
        cloud.style.backgroundSize = "contain";
        cloud.style.backgroundRepeat = "no-repeat";
        cloud.style.opacity = `${0.35 + Math.random() * 0.3}`;
        cloud.style.animation = `cloudDrift ${28 + Math.random() * 40}s linear infinite`;
        cloud.style.animationDelay = `${Math.random() * 8}s`;
        overlay.appendChild(cloud);
      }
      return;

    case "choco-theme":
      // Floating chocolate tiles without external assets
      count = 25;
      overlay.style.background = "";
      overlay.style.opacity = "0.9";
      overlay.style.animation = "none";
      for (let i = 0; i < count; i++) {
        const tile = document.createElement("div");
        tile.classList.add("floating-asset");
        tile.style.position = "absolute";
        tile.style.top = `${Math.random() * -20}vh`;
        tile.style.left = `${Math.random() * 100}vw`;
        const sizePx = 12 + Math.random() * 18;
        tile.style.width = `${sizePx}px`;
        tile.style.height = `${sizePx + 6}px`;
        tile.style.background = `linear-gradient(145deg, #4e342e, #3e2723)`;
        tile.style.borderRadius = "3px";
        tile.style.boxShadow = "0 2px 4px rgba(0,0,0,0.35)";
        tile.style.animation = `fall ${12 + Math.random() * 10}s linear infinite`;
        overlay.appendChild(tile);
      }
      return;

    default:
      // Default (Neon) - no overlay/animation
      overlay.style.background = "";
      overlay.style.opacity = "0";
      overlay.style.animation = "none";
      return;
  }

  overlay.style.background = "";
  overlay.style.opacity = "1";
  overlay.style.animation = "none";
  
  
  //instantiate the pic for count number of times at random positions
  for (let i = 0; i < count; i++) {
    const item = document.createElement("div");
    item.classList.add("floating-asset");
    item.style.position = "absolute";
    item.style.top = `${Math.random() * -20}vh`;
    item.style.left = `${Math.random() * 100}vw`;
    let selectedUrl = assetUrl;
    let selectedSize = size;
    
    if (Array.isArray(assetUrl)) {
      const randomAsset = assetUrl[Math.floor(Math.random() * assetUrl.length)];
      selectedUrl = randomAsset.url;
      selectedSize = randomAsset.size;
    }
    item.style.backgroundImage = `url('${selectedUrl}')`;
    item.style.width = selectedSize;
    item.style.height = selectedSize;
    
    item.style.backgroundSize = "contain";
    item.style.backgroundRepeat = "no-repeat";
    item.style.animation = `fall ${10 + Math.random() * 10}s linear infinite`;
    overlay.appendChild(item);
  }
}

const musicMap = {
  "celestial-theme": "audio/celestial.mp3",
  "dreamy-theme": "audio/dreamy.mp3",
  "peaceful-earth-theme": "audio/earth.mp3",
  "braveheart-theme": "audio/braveheart.mp3",
  "dark-theme": "audio/dark.mp3",
  "sunrise-theme": "audio/sunrise.mp3",
  "glory-theme": "audio/glory.mp3"
};

const categoryAccents = {
    general: '--accent1',
    god: '--accent2',
    jesus: '--accent3',
    sin: '--accent4',
    bible: '--accent5',
    life: '--accent8',
    prayer: '--accent13',
    relationships: '--accent9',
    struggles: '--accent9',
    wisdom: '--accent14',
    growth: '--accent12',
    desire: '--accent11',
    pray: '--accent13',
    hope: '--accent6',
    emotion: '--accent15',
    purpose: '--accent14',
    boundaries: '--accent16',
    faith: '--accent2',
    tough: '--accent4',
    battle: '--accent7',
    hell: '--accent7',
    heaven: '--accent6',
    war: '--accent10',
    money: '--accent1'
}

// This fetches the HTML and injects it into the page
fetch('topbar.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('topbar-container').innerHTML = html;

    // Now that topbar is loaded
    if (typeof initTopbar === "function") {
      initTopbar();
    }

   
    // Try localStorage first, fallback to sessionStorage
    let storage = null;
    try {
      storage = window.localStorage;
      storage.setItem("test", "1");
      storage.removeItem("test");
    } catch (err) {
      console.warn("localStorage failed, using sessionStorage");
      storage = window.sessionStorage;
    }

    
    const overlay = document.querySelectorAll(".animated-overlay");
    const btn = document.getElementById("themeToggle");

    // Read saved state on page load
    let plainMode = localStorage.getItem("plainMode") === "true";

    function applyOverlay(disabled) {
      if (disabled) {
        document.body.classList.add('plain');
        btn.textContent = "🌺 On";
        overlay.forEach(el => el.style.display = 'none');
        localStorage.setItem("plainMode", "true"); // save preference
      } else {
        document.body.classList.remove('plain');
        btn.textContent = "🥀 Off";
        overlay.forEach(el => el.style.display = 'block');
        localStorage.setItem("plainMode", "false"); // save preference
      }
    }

    // Apply saved state on load
    applyOverlay(plainMode);

    btn.addEventListener("click", () => {
      const disabled = !document.body.classList.contains('plain');
      applyOverlay(disabled);
    });

     // Theme handling
    const themeSwitcher = document.getElementById('themeSwitcher');
    const savedTheme = storage.getItem("theme");

    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
      themeSwitcher.value = savedTheme;
      applyAnimatedOverlay(savedTheme); // NEW
      setThemeMusic(savedTheme); // NEW
    

    const baseStart = 75;
const baseEnd = 95;
const hoverStart = baseStart + 10;
const hoverEnd = baseEnd + 5;

Object.keys(categoryAccents).forEach(category => {
    const accentVar = categoryAccents[category];
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue(accentVar).trim();

    // set category background (darker side of button gradient)
    const categoryEl = document.getElementById(`category-${category}`);
    if (categoryEl) {
        categoryEl.style.background = `color-mix(in srgb, ${accent} ${baseStart}%, #fff)`;
    }

    //apply gradient to all question buttons in this category
    const qBtns = document.querySelectorAll(`.${category}-btn`);
    qBtns.forEach(btn => {
        btn.style.background = 
        `linear-gradient(145deg, 
        color-mix(in srgb, ${accent} ${baseStart}%, #fff) 0%,
        color-mix(in srgb, ${accent} ${baseEnd}%, #fff) 100%
        )`;

        //hover effect
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 
            `linear-gradient(145deg, 
            color-mix(in srgb, ${accent} ${hoverStart}%, #fff) 0%,
            color-mix(in srgb, ${accent} ${hoverEnd}%, #fff) 100%
            )`;
            btn.style.boxShadow = `0 0 10px color-mix(in srgb, ${accent} ${hoverEnd}%, #fff), 0 0 20px color-mix(in srgb, ${accent} ${hoverEnd}%, #fff)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 
            `linear-gradient(145deg, 
            color-mix(in srgb, ${accent} ${baseStart}%, #fff) 0%,
            color-mix(in srgb, ${accent} ${baseEnd}%, #fff) 100%
            )`;
            btn.style.boxShadow = `0 2px 4px rgba(0,0,0,0.1)`;
        });
    });
});


    }
    document.querySelectorAll(".custom-select").forEach(select => {
  const selected = select.querySelector(".selected");
  const options = select.querySelector(".options");

  // toggle options
  selected.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  // restore saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    const option = options.querySelector(`[data-value="${savedTheme}"]`);
    if (option) selected.innerHTML = option.innerHTML;
  }

  // option click
  options.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
      selected.innerHTML = option.innerHTML; // update displayed value
      const theme = option.dataset.value;
      options.style.display = "none";

      // Apply theme logic
      applyAnimatedOverlay(theme);
      setThemeMusic(theme);

      const themeClasses = [
        'midnight-ocean-theme','dark-theme', 'dreamy-theme', 'glory-theme', 'celestial-theme', 'ocean-depths-theme',
        'sunrise-theme', 'braveheart-theme', 'royal-theme', 'peaceful-earth-theme', 'choco-theme'
      ];
      document.documentElement.classList.remove(...themeClasses);
      if (theme !== 'default') document.documentElement.classList.add(theme);
      storage.setItem("theme", theme);
    });
  });
  
    const copyLink = document.getElementById("copyLink");
    const nativeShare = document.getElementById("nativeShare");
    const appUrl = window.location.href;


const shareToggle = document.getElementById("shareToggle");
const shareMenu = document.getElementById("shareMenu");
const shareContainer = document.querySelector(".share-container");
const shareButtons = Array.from(shareMenu.querySelectorAll(".share-icon"));

let isOpen = false;

shareToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  isOpen = !isOpen;
  shareButtons.forEach((btn, i) => {
    const angle = (i / shareButtons.length) * 2 * Math.PI - Math.PI / 2; // start at top
    if (isOpen) {
      const radius = 75; // distance from main button
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      btn.style.transform = `translate(${x}px, ${y}px)`;
      btn.style.opacity = 1;
      btn.style.pointerEvents = "auto";
      shareContainer.style.height = "170px"; // expand container
      shareContainer.style.width = "185px";
      shareContainer.style.marginBottom = "35px";
      shareContainer.style.right = "0";  
    } else {
      btn.style.transform = `translate(0,0)`;
      btn.style.opacity = 0;
      btn.style.pointerEvents = "none";
      shareContainer.style.height = "fit-content"; // collapse container
      shareContainer.style.width = "fit-content";
      shareContainer.style.marginBottom = "0";
      shareContainer.style.right = "8px";  
    }
  });

  // optionally shrink main button text/icon if you want
  if (isOpen) {
    shareToggle.innerHTML = '<i class="fa-solid fa-share-nodes"></i>'; // just icon
    shareToggle.style.bottom = "-10px";
    shareToggle.style.right = "15px";
    shareToggle.style.fontSize = "20px";
  } else {
    shareToggle.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Share HolyVerse';
    shareToggle.style.bottom = "0";
    shareToggle.style.right = "-4px";
    shareToggle.style.fontSize = "16px";
  }
});




    copyLink.addEventListener("click", async () => {
      console.log("🔗 Copy link clicked");
      try {
        await navigator.clipboard.writeText(appUrl);
        showModal("Link copied! Share anywhere ✨");
        console.log("📋 Clipboard write successful, tracking share...");
        // Track app share for milestone
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user && user.id) {
          const uidSuffix = `:${user.id}`;
          const currentCount = parseInt(localStorage.getItem(`app_shared_count${uidSuffix}`) || "0");
          localStorage.setItem(`app_shared_count${uidSuffix}`, currentCount + 1);
          console.log(`📤 App share tracked! Count: ${currentCount + 1}`);
        } else {
          console.warn("⚠️ App share not tracked - user not logged in");
        }
      } catch (err) {
        showModal("Couldn't copy the link.");
      }
    });

    nativeShare.addEventListener("click", async () => {
      console.log("📱 Native share clicked");
      // Prefer Capacitor native share when available
      let shared = false;
      if (window.CapacitorHelpers && window.CapacitorHelpers.isNative && window.CapacitorHelpers.isNative()) {
        try {
          shared = await window.CapacitorHelpers.share({ title: "HolyVerse", text: "✨ A faith app for daily verses, prayer, and community 🙏", url: appUrl });
          if (shared) console.log("✅ Capacitor share completed, tracking...");
        } catch (e) {
          console.warn('Capacitor share failed, falling back', e);
          shared = false;
        }
      }

      if (!shared && navigator.share) {
        try {
          await navigator.share({ title: "HolyVerse", text: "✨ A faith app for daily verses, prayer, and community 🙏", url: appUrl });
          console.log("✅ Share completed, tracking...");
          shared = true;
        } catch (err) {
          console.log("Share canceled:", err);
        }
      }

      if (!shared) {
        showModal("Your device doesn't support native sharing. Try copying the link instead.");
      }

      if (shared) {
          // Track app share for milestone
          const user = JSON.parse(localStorage.getItem("user") || "null");
          if (user && user.id) {
            const uidSuffix = `:${user.id}`;
            const currentCount = parseInt(localStorage.getItem(`app_shared_count${uidSuffix}`) || "0");
            localStorage.setItem(`app_shared_count${uidSuffix}`, currentCount + 1);
            console.log(`📤 App share tracked! Count: ${currentCount + 1}`);
          } else {
            console.warn("⚠️ App share not tracked - user not logged in");
          }
      }
    });

    // Track shares for all social media links (WhatsApp, Telegram, etc.)
    const socialShareLinks = document.querySelectorAll('.share-icon[target="_blank"]');
    socialShareLinks.forEach(link => {
      link.addEventListener('click', () => {
        const platform = link.getAttribute('data-brand') || 'Unknown';
        console.log(`🔗 ${platform} share clicked`);
        
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user && user.id) {
          const uidSuffix = `:${user.id}`;
          const currentCount = parseInt(localStorage.getItem(`app_shared_count${uidSuffix}`) || "0");
          localStorage.setItem(`app_shared_count${uidSuffix}`, currentCount + 1);
          console.log(`📤 App share tracked! Count: ${currentCount + 1} (via ${platform})`);
        } else {
          console.warn("⚠️ App share not tracked - user not logged in");
        }
      });
    });

    // Track email and SMS shares
    const emailSms = document.querySelectorAll('.share-icon[href^="mailto:"], .share-icon[href^="sms:"]');
    emailSms.forEach(link => {
      link.addEventListener('click', () => {
        const platform = link.getAttribute('data-brand') || 'Unknown';
        console.log(`📧 ${platform} share clicked`);
        
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user && user.id) {
          const uidSuffix = `:${user.id}`;
          const currentCount = parseInt(localStorage.getItem(`app_shared_count${uidSuffix}`) || "0");
          localStorage.setItem(`app_shared_count${uidSuffix}`, currentCount + 1);
          console.log(`📤 App share tracked! Count: ${currentCount + 1} (via ${platform})`);
        } else {
          console.warn("⚠️ App share not tracked - user not logged in");
        }
      });
    });

    // --- UI toggles ---

document.getElementById("supportModal").querySelector("#closeSupport").addEventListener("click", () => {
  document.getElementById("supportModal").style.display = "none";
});

document.getElementById("supportBtn").addEventListener("click", () => {
  document.getElementById("supportModal").style.display = "flex";
});

const showBankBtn = document.getElementById('showBankBtn');
  const bankSection = document.getElementById('bankSection');

  showBankBtn.addEventListener('click', () => {
    // Toggle visibility
    if (bankSection.style.display === 'none') {
      bankSection.style.display = 'block';
    } else {
      bankSection.style.display = 'none';
    }
  });
 

  // --- copy bank details ---
  document.getElementById('copyBank').addEventListener('click', async () => {
    const details = `Bank: ${document.getElementById('bankName').textContent}\nAccount name: ${document.getElementById('accName').textContent}\nAccount number: ${document.getElementById('accNumber').textContent}`;
    try {
      await navigator.clipboard.writeText(details);
      showModal('Bank details copied. Paste into your mobile banking app to transfer.');
    } catch {
      showModal('Copy failed. Select and copy manually: ' + details);
    }
  });



  // close if click outside
  document.addEventListener("click", e => {
    if (!select.contains(e.target)) options.style.display = "none";
  });
});

    
    
   // age persistence logic — now tied to stored user age, not dropdown
const user = JSON.parse(localStorage.getItem("user") || "{}");
const storedAge = parseInt(user.age || 10);

// if you still want to show something on the page, like the user's age text
const ageDisplay = document.getElementById("selectedAge");
if (ageDisplay) ageDisplay.textContent = storedAge;

// run filters directly
if (typeof filterQuestionsByAge === "function") {
  filterQuestionsByAge(storedAge);
}
if (typeof filterQuestions === "function") {
  filterQuestions();
}

   const music = document.getElementById("bg-music");
  const button = document.getElementById("start-music-btn");

  if (!music || !button) {
    console.warn("Music or button not found");
    return;
  }

  music.pause();
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

  button.addEventListener("click", async () => {
    if (!music) return;
    try {
      if (music.paused) {
        await music.play();
        localStorage.setItem("playingMode", "true"); // save preference
        button.innerHTML='<i class="fa-solid fa-volume-xmark"></i>';
      } else {
        music.pause();
        localStorage.setItem("playingMode", "false"); // save preference
        button.innerHTML='<i class="fa-solid fa-volume-high"></i>';
      }
    } catch (err) {
      console.warn("⚠️ Music play failed:", err);
      showModal("Your browser blocked music. Tap again or try a different environment.");
    }
  });
   
  })
  .catch(error => {
    console.error('Failed to load topbar:', error);
  });

fetch('bottombar.html')
  .then(response => response.text())
  .then(html => {
    if (!document.getElementById('bottom-bar')) {
      console.log("No bottom bar container found");
      return;
    }
    document.getElementById('bottom-bar').innerHTML = html;
  })
  .catch(err => {
    console.error("Failed to load bottombar:", err)
  })

