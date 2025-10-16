//storage fallback (same as community page)
let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}



// Get username from login session
const currentUser = JSON.parse(localStorage.getItem("user"));

// Verse of the day (temporary random verse array)
const verses = [
  "God is love. (1 John 4:8)",
  "Fear not, for I am with you. (Isaiah 41:10)",
  "Jesus is the way, the truth, and the life. (John 14:6)",
  "I will never leave you nor forsake you. (Hebrews 13:5)"
];
document.getElementById("dailyVerse").textContent = verses[Math.floor(Math.random()*verses.length)];

// Update card info (dummy placeholders for now)
document.getElementById("qnaInfo").textContent = "3 new questions waiting";
document.getElementById("prayerInfo").textContent = "2 prayer requests need your amen";
document.getElementById("bibleInfo").textContent = "Pick up where you left off!";
document.getElementById("gamesInfo").textContent = "New trivia unlocked!";
document.getElementById("communityInfo").textContent = "Eli W. asked: Why do I feel far from God?";

// Make cards clickable
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const link = card.dataset.link;
    window.location.href = link;
  });
});

// Highlights feed (sample data for now)
const highlightFeed = document.getElementById("highlightFeed");
const highlights = [
  { type: "verse", text: "Be strong and courageous. (Joshua 1:9)" },
  { type: "question", text: "New: Why does suffering exist?" },
  { type: "prayer", text: "Amen needed: Peace for Kenya" },
  { type: "game", text: "Daily Bible quiz is live!" }
];

// Render highlights
highlights.forEach(h => {
  const div = document.createElement("div");
  div.className = "highlight-item";
  div.textContent = `${h.type.toUpperCase()}: ${h.text}`;
  highlightFeed.appendChild(div);
});

function getTimeGreeting() {
  
  //this gets hour of day
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning ☀️";
  if (hour >= 12 && hour < 17) return "Good afternoon 🌞";
  if (hour >= 17 && hour < 21) return "Good evening 🌙";
  return "Rest well, night owl 🌌";
}

function showGreeting(username) {
  const greetingEl = document.getElementById("welcomeText");
  if(greetingEl) {
    //we'll get username with backend but till then, beautiful work really. . 
   greetingEl.innerText = `${getTimeGreeting()}, ${username}, Welcome back`;
    }
}

// Call it once on load
showGreeting(currentUser.username);