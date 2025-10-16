//const { response } = require("express");

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
      overlay.style.backgroundSize = "auto";
      overlay.style.opacity = "0.3";
      overlay.style.animation = "oceanScroll 30s linear infinite";
      return;
      
    default:
      overlay.style.background = "";
      overlay.style.animation = "";
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
    const btn = document.getElementById("themeToggle")
    function applyOverlay(disabled) {
      if(disabled) {
        document.body.classList.add('plain');
        btn.textContent = "🌺";
        overlay.forEach(el => el.style.display = 'none');
      } else {
        document.body.classList.remove('plain');
        btn.textContent = "Remove animation";
        overlay.forEach(el => el.style.display = 'block');
      }
    }
    document.getElementById("themeToggle").addEventListener("click", () => {
      const disabled = !document.body.classList.contains('plain');
      applyOverlay(disabled);
    })
     // Theme handling
    const themeSwitcher = document.getElementById('themeSwitcher');
    const savedTheme = storage.getItem("theme");

    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
      themeSwitcher.value = savedTheme;
      applyAnimatedOverlay(savedTheme); // NEW

    

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
    themeSwitcher.addEventListener("change", (e) => {
      const theme = e.target.value;
      applyAnimatedOverlay(theme); // NEW
      
      //change music per theme
      const music = document.getElementById("bg-music");
      const newSong = musicMap[theme] || "audio/soft-piano.mp3";
      
      if (music && newSong) {
        const wasPlaying = !music.paused;
        music.pause();
        music.src = newSong;
        if (wasPlaying) { 
          try {
            music.play()
          }
          catch(err) {
            console.warn("Couldn't auto play new theme music because:", err);
          }
        }
      }

      // Remove all theme classes
      const themeClasses = [
        'dark-theme', 'dreamy-theme', 'glory-theme', 'celestial-theme', 'ocean-depths-theme',
        'sunrise-theme', 'braveheart-theme', 'royal-theme', 'peaceful-earth-theme', 'choco-theme'
      ];
      document.documentElement.classList.remove(...themeClasses);

      // Add new one
      if (theme !== 'default') {
        document.documentElement.classList.add(theme);
      }

    
      localStorage.setItem("theme", theme);
    });
    
    
   //age persistence logic
   const ageSelect = document.getElementById("ageSelect");
   const savedAge = document.getElementById("selectedAge") || "10";
   if (ageSelect) {
     ageSelect.value = savedAge;
     ageSelect.addEventListener("change", () => {
       storage.setItem("selectedAge", ageSelect.value);
       if (typeof filterQuestionsByAge === "function") {
         filterQuestionsByAge(parseInt(ageSelect.value));
       }
       if (typeof filterQuestions === "function") {
         filterQuestions();
       }
     });
     
     //initial filter on page load
     if (typeof filterQuestionsByAge === "function") {
       filterQuestionsByAge(parseInt(savedAge));
     }
     if (typeof filterQuestions === "function") {
       filterQuestions();
     }
   }
   
  })
  .catch(error => {
    console.error('Failed to load topbar:', error);
  });

fetch('bottombar.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('bottom-bar').innerHTML = html;
  })
  .catch(err => {
    console.error("Failed to load bottombar causse, ", err)
  })


  document.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById("themeSwitcher");
  const savedTheme = localStorage.getItem("theme") || "default";

  // apply theme to body
  document.body.className = savedTheme;

  // if the current page *has* a selector, sync it
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", () => {
      const theme = themeSelect.value;
      document.body.className = theme;
      localStorage.setItem("theme", theme);
    });
  }
});

//play the music
// At the bottom of main.js or topbar-loader.js
window.addEventListener("load", () => {
  const music = document.getElementById("bg-music");
  const button = document.getElementById("start-music-btn");

  if (!music || !button) {
    console.warn("Music or button not found");
    return;
  }

  music.play()

  button.addEventListener("click", async () => {
    try {
      await music.play();
      console.log("🎶 Music started successfully");
      button.style.display = "none"; // hide the button after playing
    } catch (err) {
      console.warn("⚠️ Music play failed:", err);
      alert("Your browser blocked music. Tap again or try a different environment.");
    }
  });
  
});

