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
  "I will never leave you nor forsake you. (Hebrews 13:5)",
  "The Lord is my shepherd; I shall not want. (Psalm 23:1)",
  "Be still, and know that I am God. (Psalm 46:10)",
  "I can do all things through Christ who strengthens me. (Philippians 4:13)",
  "The Lord is my light and my salvation; whom shall I fear? (Psalm 27:1)",
  "Cast all your anxiety on Him because He cares for you. (1 Peter 5:7)",
  "Trust in the Lord with all your heart. (Proverbs 3:5)",
  "The Lord will fight for you; you need only to be still. (Exodus 14:14)",
  "My grace is sufficient for you. (2 Corinthians 12:9)",
  "In all your ways acknowledge Him, and He shall direct your paths. (Proverbs 3:6)",
  "The Lord is near to the brokenhearted. (Psalm 34:18)",
  "With God all things are possible. (Matthew 19:26)",
  "The Lord will perfect that which concerns me. (Psalm 138:8)",
  "The joy of the Lord is your strength. (Nehemiah 8:10)",
  "Those who hope in the Lord will renew their strength. (Isaiah 40:31)",
  "The Lord is faithful, and He will strengthen you. (2 Thessalonians 3:3)",
  "He restores my soul. (Psalm 23:3)",
  "The peace of God will guard your hearts and minds. (Philippians 4:7)",
  "The Lord is good to those who wait for Him. (Lamentations 3:25)",
  "When I am afraid, I put my trust in You. (Psalm 56:3)",
  "For I know the plans I have for you. (Jeremiah 29:11)",
  "Let all that you do be done in love. (1 Corinthians 16:14)",
  "Blessed are the pure in heart, for they shall see God. (Matthew 5:8)",
  "The Lord is my strength and my song. (Exodus 15:2)",
  "If God is for us, who can be against us? (Romans 8:31)",
  "The Lord makes firm the steps of the one who delights in Him. (Psalm 37:23)",
  "Your word is a lamp to my feet and a light to my path. (Psalm 119:105)",
  "Do not be overcome by evil, but overcome evil with good. (Romans 12:21)",
  "He heals the brokenhearted and binds up their wounds. (Psalm 147:3)",
  "Be strong and courageous. (Joshua 1:9)",
  "The Lord is my portion, says my soul. (Lamentations 3:24)",
  "The Lord upholds all who fall. (Psalm 145:14)",
  "You are the light of the world. (Matthew 5:14)",
  "In His presence there is fullness of joy. (Psalm 16:11)",
  "The righteous cry out, and the Lord hears them. (Psalm 34:17)",
  "Do not worry about tomorrow. (Matthew 6:34)",
  "The Lord bless you and keep you. (Numbers 6:24)",
  "He will cover you with His feathers. (Psalm 91:4)",
  "The Lord is compassionate and gracious. (Psalm 103:8)",
  "We love because He first loved us. (1 John 4:19)",
  "The Lord is my helper; I will not be afraid. (Hebrews 13:6)",
  "Rejoice always, pray continually, give thanks in all circumstances. (1 Thessalonians 5:16-18)",
  "The Lord turns my darkness into light. (Psalm 18:28)",
  "The name of the Lord is a strong tower. (Proverbs 18:10)",
  "The Lord will keep you from all harm. (Psalm 121:7)",
  "He who promised is faithful. (Hebrews 10:23)",
  "Let the peace of Christ rule in your hearts. (Colossians 3:15)",
  "God is our refuge and strength, an ever-present help in trouble. (Psalm 46:1)",
  "The Lord is righteous in all His ways. (Psalm 145:17)",
  "The Lord will go before you and be your rear guard. (Isaiah 52:12)",
  "The Lord delights in those who fear Him. (Psalm 147:11)",
  "Be kind and compassionate to one another. (Ephesians 4:32)",
  "The Lord will renew your life. (Ruth 4:15)"
];

document.getElementById("dailyVerse").textContent = verses[Math.floor(Math.random()*verses.length)];

// Update card info (dummy placeholders for now)
document.getElementById("prayerInfo").textContent = "Generate uplifting prayers!";
document.getElementById("bibleInfo").textContent = "Pick up where you left off!";
document.getElementById("notesInfo").textContent = "Write some notes!";

// Make cards clickable
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const link = card.dataset.link;
    window.location.href = link;
  });
});


Promise.all([
  fetch("/commune/questions").then(r => r.json()).catch(() => []),
  fetch("/questions").then(r => r.json()).catch(() => []),
  fetch("/chat/friend-requests").then(r => r.json()).catch(() => [])
])
.then(([community, qna, requests, friends]) => {
  const requestsArray = Array.isArray(requests) ? requests : requests.data || [];
  //const friendsArray = Array.isArray(friends) ? friends : friends.data || [];

  document.getElementById("communityInfo").textContent =
    community[0]?.title
      ? `${community[0].username} asked: ${community[0].title}`
      : "No new community posts.";

  document.getElementById("qnaInfo").textContent =
    `${qna.length || 0} new questions waiting`;

  document.getElementById("commInfo").textContent =
    requestsArray.length
      ? `${requestsArray[0].username} sent you a friend request`
      : "No new friend requests!";
const highlightFeed = document.getElementById("highlightFeed");
const highlights = [];

community.slice(0,2).forEach(q => highlights.push({ type:"community", text:`${q.username} asked: ${q.title}` }));
requestsArray.slice(0,2).forEach(r => highlights.push({ type:"friend", text:`${r.username} sent a friend request` }));

if (!highlights.length) {
  highlights.push(
    { type:"verse", text:"Be strong and courageous. (Joshua 1:9)" },
    { type:"friend", text:"Send friend requests to chat!" }
  );
}

// build track and duplicate it
const track = document.createElement("div");
track.className = "highlight-track";

highlights.forEach(h => {
  const div = document.createElement("div");
  div.className = "highlight-item";
  div.textContent = `${h.type.toUpperCase()}: ${h.text}`;
  track.appendChild(div);
});

// clone once for seamless looping
track.innerHTML += track.innerHTML;

highlightFeed.appendChild(track);

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