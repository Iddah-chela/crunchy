
// You can move this into a separate file later
const prayerPool = {
  love: {
    prayers: [
      "Dear God, help me to love others the way You love me — patiently, unconditionally, and without keeping score. When my heart grows cold or guarded, fill me with Your warmth so I can reflect Your love in everything I do. Amen.",
      "Father, You are love itself. Teach me to love when it’s easy and when it’s hard. Soften my heart when it’s been hardened by pain. Let Your perfect love cast out my fear and fill me with compassion for others. Amen.",
      "Lord, I want to be known for love — not bitterness, not judgment. Teach me to choose love even when I’ve been hurt. Heal my wounds so I don’t pass on pain. Let me see others the way You see them. Amen."
    ],
    bg: "backgrounds/aky.jpeg"
  },
  peace: {
    prayers: [
      "Jesus, my heart is restless and anxious. I’m overwhelmed by thoughts I can’t quiet. Please speak peace over my soul. Remind me that You are near, even when life feels out of control. Let me rest in You. Amen.",
      "God, I long for peace that goes deeper than circumstances. Replace my worry with stillness, my fear with faith. Help me breathe in Your presence and exhale all that weighs me down. You are my peace. Amen.",
      "Lord, in the middle of the noise, be my quiet place. Calm my racing heart and troubled mind. Help me slow down and hear Your whisper — telling me You’re here, and everything will be okay. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  },
  strength: {
    prayers: [
      "Lord, I feel so tired and weak. I’ve tried to do things in my own strength, and I’m worn out. Please carry me today. Be the power I don’t have. When I fall, lift me. When I doubt, remind me I’m not alone. Amen.",
      "God, You said Your strength is made perfect in weakness — so here I am. I don’t have it all together. I need You to hold me up and help me move forward when I feel like giving up. Amen.",
      "Heavenly Father, when I face things I cannot handle, help me lean on You. Let me remember that I don’t need to be strong alone. You are my rock, my refuge, and my strength. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  gratitude: {
    prayers: [
      "God, thank You for today. Thank You for breath in my lungs, a roof over my head, and people who care about me. Even when life isn’t easy, I see Your hand in the little things. You are so good. Amen.",
      "Lord, it’s easy to focus on what I don’t have — but today, I choose to thank You for all that You’ve already done. You’ve been faithful, even when I didn’t notice. I’m grateful. Amen.",
      "Father, help me develop a heart of gratitude, not just when things go right, but even in the storms. Remind me that thankfulness opens my eyes to see You more clearly. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  guidance: {
    prayers: [
      "Lord, I don’t always know which way to go. Please guide me. Light the path ahead — even if it’s just one step at a time. I trust that You’ll lead me where I need to be. Amen.",
      "God, help me not lean on my own understanding. I want to honor You in my decisions. Close the doors I shouldn’t walk through and open the ones that lead me closer to You. Amen.",
      "Father, when I feel confused or lost, be my compass. Let Your Word be the lamp to my feet. Give me wisdom, patience, and clarity as I wait for Your direction. Amen."
    ],
    bg: "backgrounds/help.jpeg"
  },
  forgiveness: {
    prayers: [
      "God, I’ve messed up. I’ve hurt others and made choices I’m not proud of. Please forgive me. Wash me clean and help me walk in freedom — not shame. Thank You for mercy I don’t deserve. Amen.",
      "Lord, help me forgive those who’ve hurt me. I don’t want to carry bitterness anymore. Just as You forgive me over and over, teach me to extend grace. Heal the parts of me that still feel broken. Amen.",
      "Father, thank You that Your forgiveness never runs out. You don’t hold my sins against me. Help me receive that truth and live like someone who’s truly free. Amen."
    ],
    bg: "backgrounds/everlasting.jpeg"
  },
  healing: {
    prayers: [
      "Lord, my body, my heart, and even my mind feel wounded. You are the God who heals. I invite You into my pain. Please bring comfort, restoration, and strength. Heal me, and make me whole. Amen.",
      "Jesus, I lift up those who are suffering right now — in hospitals, homes, or silently in their souls. Surround them with Your presence and touch their lives with Your healing power. Amen.",
      "Father, healing takes time, but I know You’re patient. Walk with me through this journey. Whether You heal me instantly or slowly, I choose to trust You. Amen."
    ],
    bg: "backgrounds/submission.jpeg"
  },
  courage: {
    prayers: [
      "God, I’m afraid. There are things ahead of me that feel too big. Give me courage not because I’m strong — but because You are. Let faith rise in me and fear lose its grip. Amen.",
      "Lord, help me stand for what’s right, even when I stand alone. Fill me with boldness to speak truth, to love well, and to walk in Your purpose. Amen.",
      "Jesus, when I feel small, remind me that You go with me. Like David with Goliath, help me believe that no fear is greater than Your power in me. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  desire: {
    prayers: [
      "God, sometimes I want things that won’t bring life. I’m drawn to things that don’t satisfy. Please purify my desires. Help me want what You want, and crave what brings me closer to You. Amen.",
      "Lord, You see every longing in my heart — the good and the confusing. Teach me to bring my desires to You, not hide them. If something isn’t good for me, change my heart. Amen.",
      "Father, when desire feels overwhelming, remind me that You are enough. Fill every empty space so I don’t look for love or happiness in the wrong places. You’re all I need. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  hope: {
    prayers: [
      "God, when life feels heavy and uncertain, remind me that hope is not gone. Your promises still stand. Let me hold onto You, even when I don’t see the way forward. Amen.",
      "Lord, help me believe that better days are coming — not because life is easy, but because You are faithful. You are my hope when I have none. Amen.",
      "Father, hope feels far right now. But I know You are near. Speak life into the dry places of my soul and renew my strength as I wait for Your goodness. Amen."
    ],
    bg: "backgrounds/sunrise.jpeg"
  },
  emotion: {
    prayers: [
      "God, my emotions are a mess right now. I feel too much and not enough. Please help me bring every feeling to You. Don’t let my emotions control me — let Your Spirit lead me. Amen.",
      "Lord, thank You that You made me emotional. But when my feelings get too loud, please help me quiet them with Your truth. Let peace be louder than panic. Amen.",
      "Father, some days I cry and don’t even know why. You see me. You understand. Thank You for being a safe place for every feeling I have. Teach me to process them with You, not alone. Amen."
    ],
    bg: "backgrounds/creator.jpg"
  },
  purpose: {
    prayers: [
      "God, sometimes I wonder if I matter. What am I here for? Please show me that my life has meaning in You. Use my gifts, my story, and even my pain for something good. Amen.",
      "Lord, I want to live a life that honors You. Guide me to the places and people where I can make a difference. Don’t let fear keep me from the purpose You’ve planned. Amen.",
      "Father, when I feel lost or stuck, remind me that You haven’t forgotten me. You’re still working. You’re still writing my story. Help me trust the process and follow Your lead. Amen."
    ],
    bg: "backgrounds/grass.jpeg"
  },
  serenity: {
    prayers: [
      "God give me the serenity to accept the things I cannot change, the courage to change the things I can and the wisdom to know the difference"
    ],
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  Lord: {
    prayers: [
      "Our Father who art in heaven, hallowed be thy name. Thy kingdom come. Thy will be done on Earth as it is in heaven, give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. Lead us not to temptation, but deliver us from evil. For thine is the kingdom, the power and the glory. Forever and ever. Amen."
    ],
    bg: "backgrounds/sky.jpeg"
  }
};

function generatePrayerByTopic(topic) {
  const category = prayerPool[topic];
  if (!category) return;

  const prayers = category.prayers;
  const display = document.getElementById("prayerdisplay");
  const overlay = document.getElementById("overlay");
  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }

  if (prayers.length === 0) {
    display.textContent = "No prayers available for this topic yet.";
    display.style.display = "block";
    return;
  }

  const randomPrayer = prayers[Math.floor(Math.random() * prayers.length)];
  display.textContent = randomPrayer;
  display.style.display = "block";

  // ✅ Only change display background, not overlay
  display.style.backgroundImage = `url(${category.bg})`;
  display.style.backgroundSize = "cover";
  display.style.backgroundPosition = "center";
  display.style.backgroundRepeat = "no-repeat";
  display.style.padding = "20px";
  display.style.color = "black"; // improves contrast
  display.style.borderRadius = "10px";

  overlay.style.display = "block";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  closeBtn.classList.add("innerbtn");
  closeBtn.onclick = () => {
    overlay.style.display = "none";
    display.style.display = "none";
    display.innerHTML = "";
    display.style.backgroundImage = ""; // Reset background
  };

  display.appendChild(document.createElement("br"));
  display.appendChild(closeBtn);
}

let currentCategory = null;

function toggleCategory(id) {
  const selected = document.getElementById(id);
  if (!selected) return;

  const isVisible = selected.style.display === 'block';

  // Hide all question groups
  const allGroups = document.querySelectorAll('.question-group');
  allGroups.forEach(group => group.style.display = 'none');

  if (!isVisible) {
    selected.style.display = 'block';
    currentCategory = id;
  } else {
    currentCategory = null;
  }
}

function saveCustomPrayer() {
  const text = document.getElementById("customPrayer").value.trim();
  if (text) {
    const li = document.createElement("li");
    li.textContent = text;
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("innerbtn");
    deleteBtn.onclick = function() {
      li.remove();
    }
    li.appendChild(deleteBtn);
    document.getElementById("savedPrayers").appendChild(li);
    document.getElementById("customPrayer").value = "";
    document.getElementById("customPrayer").style.display = "none";
    document.getElementById("savePrayer").style.display = "none";
  }
}

function showSpace() {
  document.getElementById("customPrayer").style.display = "block";
  document.getElementById("savePrayer").style.display = "block";
}

const slides = [
  {
    text: `Hi there! Let’s learn how to pray for the first time.\n\n
Prayer is simply talking to God. You don’t need special words, a perfect voice, or a quiet church. God already knows your thoughts, but He loves when you speak to Him with your own words.`,
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  {
    text: `Why do we pray?\n\n
We pray to build a relationship with God. Just like a friend, God wants to hear from you. In prayer, we thank Him, ask for help, confess our mistakes, and worship who He is. It's not about performance—it's about connection.`,
    bg: "backgrounds/eternal.jpg"
  },
  {
    text: `Let’s remember the ACTS model to help us:\n\n
A = Adoration: Start by telling God how great He is. He is loving, holy, powerful, kind. Just praise Him.\n
C = Confession: Be honest. Tell Him about your sins or things you're struggling with.`,
    bg: "backgrounds/aky.jpeg"
  },
  {
    text: `Next:\n\n
T = Thanksgiving: Thank God for what He’s done—your life, today, your family, even small joys.\n
S = Supplication: This is where you ask. Ask for help, wisdom, healing, peace, courage, or anything on your heart.`,
    bg: "backgrounds/grass.jpeg"
  },
  {
    text: `That’s it. You don’t need to be perfect. God just wants *you*.\n\n
Now let’s pray together. You can say this out loud, quietly, or in your heart.\n
When you're ready, press “Next” to begin.`,
    bg: "backgrounds/sunrise.jpeg"
  },
  {"": ""}
];

const finalPrayerLines = [
  "Dear God...", 
  "Thank You for loving me.",
  "I praise You for being good and kind.",
  "I’m sorry for the wrong things I’ve done.",
  "Thank You for forgiving me.",
  "Please help me love You more each day.",
  "In Jesus’ name, Amen."
];

function playFinalPrayer() {
  let i = 0;

  // Make sure the speech API exists
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported in this browser.");
    return;
  }
  
  
  const synth = window.speechSynthesis;

  function speakNext() {
    if (i >= finalPrayerLines.length) return;

    const utter = new SpeechSynthesisUtterance(finalPrayerLines[i]);
    utter.onend = () => {
      setTimeout(() => {
        i++;
        speakNext();
      }, 1500);
    };

    synth.speak(utter);
  }

  try {
    // Sometimes voices aren't ready right away
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => {
        speakNext();
      };
    } else {
      speakNext();
    }
  } catch (err) {
    console.error("Error using speech synthesis:", err);
  }
}

let currentSlide = 0;

function speak(text) {
  const synth = window.speechSynthesis;

  if (!synth) {
    console.warn("SpeechSynthesis not supported.");
    return;
  }

  const speakNow = () => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    synth.cancel(); // stop any current speech
    synth.speak(utter);
  };

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => speakNow();
  } else {
    speakNow();
  }
}

function showSlideshow() {
  currentSlide = 0;
  const nextBtn = document.getElementById("nextBtn");
if (nextBtn) nextBtn.style.display = "inline-block";
  const backBtn = document.getElementById("backBtn");
if (backBtn) backBtn.style.display = "inline-block";
  document.getElementById("slideshow").classList.remove("hidden");
  updateSlide();
}

function updateSlide() {
  const slideBox = document.getElementById("slideContent");
  const slideShow = document.getElementById("slideshow");
  const { text, bg } = slides[currentSlide];

  slideBox.innerHTML = "";
  slideShow.style.backgroundImage = bg ? `url(${bg})` : "none";
  slideShow.style.backgroundPosition = "center";
  slideShow.style.backgroundSize = "cover";
  slideShow.style.backgroundRepeat = "no-repeat";
  slideShow.style.backgroundColor = bg ? "transparent" : "#cccccc"; // fallback color when no image
  slideBox.innerText = text;

  if (currentSlide === slides.length - 1) {
  // Hide the Next button during final prayer
const nextBtn = document.getElementById("nextBtn");
if (nextBtn) nextBtn.style.display = "none";
// Hide the Back button during final prayer
const backBtn = document.getElementById("backBtn");
if (backBtn) backBtn.style.display = "none";
  const slideBox = document.getElementById("slideContent");
  const slideShow = document.getElementById("slideshow");
  slideBox.innerHTML = ""; // Clear existing content
  slideShow.style.backgroundImage = `url(${slides[currentSlide].bg})`;

  let i = 0;

  function fadeInOutLine(lineText, onDone) {
    document.getElementById("slideshow").style.backgroundImage = "url(backgrounds/peace.jpeg)";
    const line = document.createElement("p");
    line.textContent = lineText;
    line.style.opacity = 0;
    line.style.transition = "opacity 1s";
    line.style.fontSize = "1.4em";
    line.style.margin = "10px 0";

    slideBox.appendChild(line);

    // Fade in
    setTimeout(() => {
      line.style.opacity = 1;

      // Speak if supported
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(lineText);
        utter.onend = () => {
          // Fade out (unless it’s the last line)
          if (i < finalPrayerLines.length - 1) {
            setTimeout(() => {
              line.style.opacity = 0;
              setTimeout(() => {
                line.remove();
                onDone();
              }, 1000); // after fade out
            }, 1000);
          } else {
            // Last line: keep it and show Try button
            showTryNow();
          }
        };
        window.speechSynthesis.speak(utter);
      } else {
        // Fallback: text only
        if (i < finalPrayerLines.length - 1) {
          setTimeout(() => {
            line.style.opacity = 0;
            setTimeout(() => {
              line.remove();
              onDone();
            }, 1000);
          }, 2000);
        } else {
          showTryNow();
        }
      }
    }, 100); // slight delay to trigger CSS transition
  }

  function showNextLine() {
    if (i < finalPrayerLines.length) {
      fadeInOutLine(finalPrayerLines[i], showNextLine);
      i++;
    }
  }

  function showTryNow() {
    const tryBtn = document.createElement("button");
    tryBtn.textContent = "Try Now";
    tryBtn.onclick = () => {
      document.getElementById("slideshow").classList.add("hidden");
      showSpace();
      setTimeout(() => {
        alert("🎉 You just prayed for the first time!");
      }, 500);
    };
    tryBtn.classList.add("innerbtn");
    tryBtn.style.opacity = 0;
    tryBtn.style.transition = "opacity 1s";
    slideBox.appendChild(tryBtn);

    setTimeout(() => {
      tryBtn.style.opacity = 1;
    }, 500);
  }

  showNextLine();
  return;
}; // Start it
    // Just in case: fallback if speech fails or user has no audio
    setTimeout(showTryNow, 15000);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
  } else if (currentSlide === slides.length - 1) {
    // Already at final slide, make sure it's rendered
    updateSlide();
    document.getElementById("slideshow").style.backgroundImage = `url(backgrounds/pray.jpeg)`
    return;
  }
  updateSlide();
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlide();
  }
}

const prayerKeywords = {
  love: ["love", "lonely", "loving", "relationships", "compassion", "affection"],
  peace: ["peace", "anxious", "anxiety", "calm", "stillness", "panic", "rest"],
  strength: ["strength", "tired", "weak", "can’t go on", "overwhelmed"],
  gratitude: ["thanks", "thank you", "grateful", "gratitude", "appreciate"],
  guidance: ["guidance", "lost", "direction", "path", "decisions", "wisdom"],
  forgiveness: ["forgive", "guilt", "shame", "sorry", "regret"],
  healing: ["heal", "healing", "sick", "pain", "broken", "hurt"],
  courage: ["courage", "afraid", "fear", "boldness", "brave", "scared"],
  desire: ["desire", "crave", "want", "lust", "longing"],
  hope: ["hope", "hopeless", "dark", "future", "promise"],
  emotion: ["emotion", "feeling", "mood", "cry", "sad", "happy", "rollercoaster"],
  purpose: ["purpose", "meaning", "why", "exist", "calling", "destiny"]
};

function searchPrayerTopic() {
  const query = document.getElementById("prayerSearch").value.toLowerCase().trim();
  const resultsBox = document.getElementById("searchResults");
  resultsBox.innerHTML = "";

  if (query === "") return;

  const matchedTopics = [];

  // Match against keywords
  for (const topic in prayerKeywords) {
    const keywords = prayerKeywords[topic];
    for (const word of keywords) {
      if (query.includes(word)) {
        matchedTopics.push(topic);
        break; // avoid duplicates
      }
    }
  }

  // Fallback: also check if query is close to the topic itself
  for (const topic in prayerPool) {
    if (topic.includes(query) && !matchedTopics.includes(topic)) {
      matchedTopics.push(topic);
    }
  }

  if (matchedTopics.length === 0) {
    resultsBox.innerHTML = "<p>No matching topics found. Try using words like 'fear', 'healing', or 'love'.</p>";
    return;
  }

  matchedTopics.forEach(topic => {
    const btn = document.createElement("button");
    btn.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
    btn.classList.add("innerbtn");
    btn.onclick = () => {
      generatePrayerByTopic(topic);
      resultsBox.innerHTML = "";
      document.getElementById("prayerSearch").value = "";
    };
    resultsBox.appendChild(btn);
  });
}