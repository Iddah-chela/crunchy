let user = JSON.parse(localStorage.getItem("user")) || null;

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

window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;


document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("profileForm");
  const msg = document.getElementById("msg");
  const usernameInput = document.getElementById("username");
  const bioInput = document.getElementById("bio");
  const passwordInput = document.getElementById("password");
  const topbarUser = document.getElementById("topbar-user");
  const profileInfos = document.getElementById("profile-infos");
  const profilePicEl = document.querySelector(".profile-pic");
  const logoutBtn = document.getElementById("logoutBtn");
  const fileInput = document.getElementById("profilePic");
  const preview = document.getElementById("previewPic");
  const profileBio = document.getElementById("profileBio");

  if (user) {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${user.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          user = { ...user, ...data };
          localStorage.setItem("user", JSON.stringify(user));

          if (topbarUser) topbarUser.textContent = `👋 ${user.username}`;
          if (profilePicEl)
            profilePicEl.src = user.profilePic || "images/default-avatar.png";
          if (usernameInput) usernameInput.value = user.username || "";
          if (bioInput) bioInput.value = user.bio || "";
          if (profileBio) profileBio.textContent = user.bio || "No bio yet.";
        }
      } catch (err) {
        console.error("Failed to fetch user on load:", err);
      }
    })();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_BASE}/logout`, {
          method: "POST",
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) return showModal(data.error || "Logout failed. Please try again.");
        localStorage.removeItem("user");
        user = null;
        window.location.href = "/login.html";
      } catch (err) {
        console.error(err);
        showModal("Logout error. Please try again.");
      }
    });
  }

  if (fileInput && preview) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => (preview.src = reader.result);
      reader.readAsDataURL(file);
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!user) return showModal("No user logged in.");

      const formData = new FormData();
      const usernameVal = usernameInput?.value.trim() || "";
      const bioVal = bioInput?.value.trim() || "";

      if (usernameVal) formData.append("username", usernameVal);
      if (bioVal) formData.append("bio", bioVal);
      if (passwordInput?.value)
        formData.append("password", passwordInput.value);
      if (fileInput?.files[0])
        formData.append("profilePic", fileInput.files[0]);

      try {
        const res = await fetch(`${API_BASE}/users/${user.id}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) {
          msg.textContent = data.error || "Profile update failed. Please try again.";
          return;
        }

        msg.textContent = data.msg || "Profile updated 🎉";

        const updatedUser = {
          ...user,
          username: formData.get("username") || user.username,
          bio: formData.get("bio") || user.bio,
          profilePic: data.profilePicUrl || user.profilePic
        };

        user = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (topbarUser) topbarUser.textContent = updatedUser.username;
        if (profileBio) profileBio.textContent = updatedUser.bio || "No bio yet.";
        if (profilePicEl)
          profilePicEl.src = updatedUser.profilePic || "images/default-avatar.png";

        form.classList.add("hidden");
        if (profileInfos) profileInfos.classList.remove("hidden");
      } catch (err) {
        console.error(err);
        msg.textContent = "Network error. Please check your connection.";
      }
    });
  }

  window.edit = function () {
    form?.classList.remove("hidden");
    profileInfos?.classList.add("hidden");
  };



  // --- Tree & water system (per-user keys fixed) ---
  const currentUserName = user?.username || "Guest";
  const treeKey = `treeLevel_${currentUserName}`;
  const waterKey = `water_${currentUserName}`;
  const lastWaterDayKey = `lastWaterDay_${currentUserName}`;
  const treeImg = document.getElementById('treeImage')
  const waterCountEl = document.getElementById('waterCount');
  const waterBtn = document.getElementById('waterBtn');

  let water = parseInt(localStorage.getItem(waterKey)) || 0;
  let treeLevel = parseInt(localStorage.getItem(treeKey)) || 0;

  const treeImages = [
    "backgrounds/seedling.png", // seedling
    "backgrounds/kidplant.png",
    "backgrounds/tweenseed.png",
    "backgrounds/teenplant.png",
    "backgrounds/almost18tree.png",
    "backgrounds/20stree.png",
    "backgrounds/25hapo.png",
    "backgrounds/30sasa.png",
    "backgrounds/bigtree.png"  // full-grown
  ];

  function updateTree() {
    if (!treeImg) return;

    const safeLevel = Math.min(Math.max(0, treeLevel), treeImages.length - 1);
    treeImg.src = treeImages[safeLevel];

    // size growth
    const baseHeight = 120; // seedling
    const growth = 25 * safeLevel;
    treeImg.style.height = baseHeight + growth + "px";

    // sparkle + bounce effect
    if (sparkles) sparkles.classList.add("active");
    treeImg.style.opacity = "0";

    setTimeout(() => {
      if (sparkles) sparkles.classList.remove("active");
      treeImg.style.opacity = "1";
      treeImg.style.animation = "bounce 0.6s ease";
      setTimeout(() => (treeImg.style.animation = ""), 600);
    }, 800);

    // update water count text
    if (waterCountEl) waterCountEl.textContent = `Water left: ${water}`;
  }

  function waterTree() {
    if (!waterBtn) return;
    if (water <= 0) {
      showModal("No water left! Come back tomorrow for more!");
      return;
    }

    // pouring animation
    if (wateringCan) wateringCan.classList.add("pouring");
    if (sparkles) sparkles.classList.add("active");

    setTimeout( async () => {
      if (wateringCan) wateringCan.classList.remove("pouring");
      if (sparkles) sparkles.classList.remove("active");

      water = Math.max(0, water - 1);
      if (treeLevel < treeImages.length - 1) treeLevel++;

      localStorage.setItem(waterKey, water);
      localStorage.setItem(treeKey, treeLevel);
      localStorage.setItem(lastWaterDayKey, new Date().toDateString());

      // animate tree change
      if (treeImg) treeImg.style.opacity = "0";
      setTimeout(() => {
        updateTree();
        if (treeImg) {
          treeImg.style.opacity = "1";
          treeImg.style.transform = "scale(1.2)";
          setTimeout(() => (treeImg.style.transform = "scale(1)"), 300);
        }
      }, 300);

      //send updated treeLevel to backend
      if (user?.id) {
        try {
          await fetch(`${API_BASE}/users/${user.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ treeLevel, username: user.username })
          });
        } catch (err) {
          console.error("Failed to update tree level on server:", err);
        }
      }
    }, 1200);

    // update visible count quickly (show anticipated value)
    if (waterCountEl) waterCountEl.textContent = `Water left: ${Math.max(0, water - 1)}`;
  }

  // attach water button
  if (waterBtn) waterBtn.addEventListener("click", waterTree);

  const lastWaterDayKey2 = `lastWaterGiven_${currentUserName}`;
  const lastWaterDay = localStorage.getItem(lastWaterDayKey2);
  const today = new Date();
  const todayStr = today.toDateString();

  // Give daily water FIRST if it's a new day
  if (todayStr !== lastWaterDay) {
    water++;
    localStorage.setItem(waterKey, water);
    localStorage.setItem(lastWaterDayKey2, todayStr);
  }

  // Check if user watered yesterday - if not, tree goes down 1 step
  const lastWateredStr = localStorage.getItem(lastWaterDayKey);
  if (lastWateredStr) {
    const lastWatered = new Date(lastWateredStr);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Set to start of day
    lastWatered.setHours(0, 0, 0, 0); // Set to start of day
    
    // If last watered was before yesterday, tree goes down 1 level
    if (lastWatered < yesterday) {
      treeLevel = Math.max(0, treeLevel - 1);
      localStorage.setItem(treeKey, treeLevel);
      
      // Update backend (wrap in async IIFE)
      if (user?.id) {
        (async () => {
          try {
            await fetch(`${API_BASE}/users/${user.id}`, {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ treeLevel, username: user.username })
            });
          } catch (err) {
            console.error("Failed to update tree level on server:", err);
          }
        })();
      }
    }
  }

  // initial render
  updateTree();

  // ============================================
  // MILESTONES SYSTEM
  // ============================================
  const milestoneData = {
    streak_days: {
      label: "Streak",
      emoji: "🔥",
      thresholds: [
        { value: 3, title: "3 days strong!", reward: "🌱 Seedling" },
        { value: 7, title: "One week!", reward: "🌿 Growing" },
        { value: 14, title: "Two weeks!", reward: "🌳 Strong" },
        { value: 21, title: "21 days habit!", reward: "💪 Dedicated" },
        { value: 30, title: "30-day warrior!", reward: "⚔️ Warrior" },
        { value: 60, title: "60 days!", reward: "🏆 Champion" },
        { value: 90, title: "90-day legend!", reward: "👑 Legend" },
        { value: 365, title: "ONE YEAR!", reward: "🥳 LEGENDARY" }
      ]
    },
    community_posts_count: {
      label: "Community Posts",
      emoji: "🗣️",
      thresholds: [
        { value: 1, title: "First post!", reward: "📢 Voice" },
        { value: 5, title: "5 posts!", reward: "🤝 Connector" },
        { value: 15, title: "15 posts!", reward: "🌟 Encourager" },
        { value: 30, title: "30 posts!", reward: "🧭 Guide" },
        { value: 50, title: "50 posts!", reward: "🏅 Pillar" }
      ]
    },
    chapters_read_count: {
      label: "Chapters Read",
      emoji: "📖",
      thresholds: [
        { value: 1, title: "First chapter!", reward: "📄 Reader" },
        { value: 5, title: "5 chapters!", reward: "📜 Seeker" },
        { value: 20, title: "20 chapters!", reward: "🧭 Explorer" },
        { value: 50, title: "50 chapters!", reward: "🛡️ Disciple" },
        { value: 100, title: "100 chapters!", reward: "🏆 Scholar" }
      ]
    },
    books_read_count: {
      label: "Books Read",
      emoji: "📚",
      thresholds: [
        { value: 1, title: "First book!", reward: "🌱 Beginner" },
        { value: 5, title: "5 books!", reward: "🌿 Growing" },
        { value: 10, title: "10 books!", reward: "🌳 Rooted" },
        { value: 20, title: "20 books!", reward: "🕊️ Faithful" },
        { value: 66, title: "All books!", reward: "👑 Finisher" }
      ]
    },
    prayers_count: {
      label: "Prayers",
      emoji: "🙏",
      thresholds: [
        { value: 1, title: "First prayer!", reward: "🕯️ Seeker" },
        { value: 10, title: "10 prayers!", reward: "💫 Believer" },
        { value: 50, title: "50 prayers!", reward: "🕊️ Faithful" },
        { value: 100, title: "100 prayers!", reward: "✨ Warrior" }
      ]
    },
    app_shared_count: {
      label: "App Shares",
      emoji: "📤",
      thresholds: [
        { value: 1, title: "First share!", reward: "📣 Spreader" },
        { value: 5, title: "5 shares!", reward: "🌍 Ambassador" },
        { value: 10, title: "10 shares!", reward: "🔥 Evangelist" },
        { value: 25, title: "25 shares!", reward: "👑 Influencer" }
      ]
    }
  };

  function initMilestones() {
    const container = document.getElementById("milestonesContainer");
    if (!container) {
      console.warn("⚠️ Milestones container not found!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const uidSuffix = user && user.id ? `:${user.id}` : ":guest";
    console.log(`🎯 Initializing milestones for user: ${user?.username || 'guest'}, uidSuffix: ${uidSuffix}`);

    let milestonesClaimed = JSON.parse(localStorage.getItem(`milestonesClaimed${uidSuffix}`)) || {};
    let milestonesProgress = JSON.parse(localStorage.getItem(`milestonesProgress${uidSuffix}`)) || {};

    let html = "";

    for (const [key, data] of Object.entries(milestoneData)) {
      // Key already includes _count suffix for most, but not for streak_days
      const storageKey = `${key}${uidSuffix}`;
      const count = parseInt(localStorage.getItem(storageKey)) || 0;
      const claimed = milestonesClaimed[key] || [];
      console.log(`🎯 Milestone ${key}: storageKey=${storageKey}, count=${count}, claimed=${claimed.length}`);

      html += `<div class="milestone-category">
        <h3>${data.emoji} ${data.label}</h3>
        <div class="milestone-badges">`;

      for (const threshold of data.thresholds) {
        const isClaimed = claimed.includes(threshold.value);
        const isUnlocked = count >= threshold.value;

        if (isUnlocked && !isClaimed) {
          // Show "Claim" button for unlocked unclaimed milestone
          html += `<button class="milestone-badge unlocked" onclick="claimMilestone('${key}', ${threshold.value}, '${threshold.reward}')">
            <span class="unlock-text">${threshold.value}</span>
            <span class="claim-text">Claim!</span>
            <div class="tooltip">${threshold.title}<br>${threshold.reward}</div>
          </button>`;
        } else if (isClaimed) {
          // Show claimed badge
          html += `<div class="milestone-badge claimed" title="${threshold.title}">
            <span class="badge-value">${threshold.value}</span>
            <span class="badge-emoji">${threshold.reward.split(" ")[0]}</span>
            <div class="tooltip">${threshold.title}<br>${threshold.reward}</div>
          </div>`;
        } else {
          // Show locked badge
          html += `<div class="milestone-badge locked" title="Reach ${threshold.value}">
            <span class="badge-value">?</span>
            <span class="badge-progress">${count}/${threshold.value}</span>
            <div class="tooltip">Reach ${threshold.value}<br>${threshold.title}</div>
          </div>`;
        }
      }

      html += `</div></div>`;
    }

    container.innerHTML = html;
  }

  window.claimMilestone = function(category, value, reward) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const uidSuffix = user && user.id ? `:${user.id}` : ":guest";
    let milestonesClaimed = JSON.parse(localStorage.getItem(`milestonesClaimed${uidSuffix}`)) || {};
    if (!milestonesClaimed[category]) milestonesClaimed[category] = [];
    milestonesClaimed[category].push(value);
    localStorage.setItem(`milestonesClaimed${uidSuffix}`, JSON.stringify(milestonesClaimed));

    // Check if all milestones are complete and unlock profile border
    checkAndUnlockProfileBorder();

    // Celebration!
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showModal(`🎉 Milestone Unlocked!\n${reward}`);

    initMilestones(); // Refresh display
  };

  function checkAndUnlockProfileBorder() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const uidSuffix = user && user.id ? `:${user.id}` : ":guest";
    const milestonesClaimed = JSON.parse(localStorage.getItem(`milestonesClaimed${uidSuffix}`)) || {};
    const totalMilestones = Object.values(milestoneData).reduce((sum, cat) => sum + cat.thresholds.length, 0);
    const claimedCount = Object.values(milestonesClaimed).reduce((sum, arr) => sum + arr.length, 0);
    
    const percentage = Math.round((claimedCount / totalMilestones) * 100);
    console.log(`🏆 Milestone progress: ${claimedCount}/${totalMilestones} (${percentage}%)`);
    
    const profilePic = document.querySelector(".profile-pic");
    if (!profilePic) return;

    // Unlock borders at different completion levels
    if (claimedCount >= totalMilestones) {
      // All milestones complete - legendary rainbow border
      profilePic.style.border = "4px solid transparent";
      profilePic.style.background = "linear-gradient(white, white) padding-box, linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "legendary");
      console.log(`✨ LEGENDARY BORDER UNLOCKED! (100%)`);
    } else if (claimedCount >= totalMilestones * 0.75) {
      // 75% complete - gold border
      profilePic.style.border = "4px solid gold";
      profilePic.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.6)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "gold");
      console.log(`🥇 GOLD BORDER UNLOCKED! (75%+)`);
    } else if (claimedCount >= totalMilestones * 0.5) {
      // 50% complete - silver border
      profilePic.style.border = "4px solid silver";
      profilePic.style.boxShadow = "0 0 10px rgba(192, 192, 192, 0.6)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "silver");
      console.log(`🥈 SILVER BORDER UNLOCKED! (50%+)`);
    } else if (claimedCount >= totalMilestones * 0.25) {
      // 25% complete - bronze border
      profilePic.style.border = "4px solid #cd7f32";
      profilePic.style.boxShadow = "0 0 8px rgba(205, 127, 50, 0.5)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "bronze");
      console.log(`🥉 BRONZE BORDER UNLOCKED! (25%+)`);
    } else {
      console.log(`🎯 Next border at ${Math.ceil(totalMilestones * 0.25)} milestones (currently ${claimedCount})`);
    }
  }

  // Apply saved border on page load - but verify user actually earned it
  function applySavedProfileBorder() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const uidSuffix = user && user.id ? `:${user.id}` : ":guest";
    const borderLevel = localStorage.getItem(`profileBorderLevel${uidSuffix}`);
    const profilePic = document.querySelector(".profile-pic");
    if (!profilePic) return;
    
    // If no border saved for this user, don't apply anything
    if (!borderLevel) {
      profilePic.style.border = "";
      profilePic.style.boxShadow = "";
      profilePic.style.background = "";
      return;
    }

    switch(borderLevel) {
      case "legendary":
        profilePic.style.border = "4px solid transparent";
        profilePic.style.background = "linear-gradient(white, white) padding-box, linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box";
        break;
      case "gold":
        profilePic.style.border = "4px solid gold";
        profilePic.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.6)";
        break;
      case "silver":
        profilePic.style.border = "4px solid silver";
        profilePic.style.boxShadow = "0 0 10px rgba(192, 192, 192, 0.6)";
        break;
      case "bronze":
        profilePic.style.border = "4px solid #cd7f32";
        profilePic.style.boxShadow = "0 0 8px rgba(205, 127, 50, 0.5)";
        break;
    }
  }

  // Track counts from localStorage
  function updateMilestoneTracking() {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const uidSuffix = currentUser && currentUser.id ? `:${currentUser.id}` : ":guest";
    
    // Get current counts from app data
    const streakData = JSON.parse(localStorage.getItem("streakData")) || { visitedDays: {} };
    const streakFromVisited = Object.keys(streakData.visitedDays || {}).length;
    const streakFromTopbar = parseInt(localStorage.getItem("streak")) || 0;
    const streakDays = Math.max(streakFromVisited, streakFromTopbar);
    localStorage.setItem(`streak_days${uidSuffix}`, streakDays);

    // Community posts (exclude drafts, count only current user's posts)
    const community = JSON.parse(localStorage.getItem("community_questions")) || [];
    const publishedPosts = community.filter(q => 
      !q.draft && 
      (q.author === currentUser.username || q.user_id === currentUser.id)
    ).length;
    localStorage.setItem(`community_posts_count${uidSuffix}`, publishedPosts);
    console.log(`📊 Milestones: ${publishedPosts} community posts by ${currentUser.username}`);

    // Bible reading progress
    const chaptersRead = JSON.parse(localStorage.getItem("chaptersRead")) || {};
    const booksReadCount = Object.keys(chaptersRead).length;
    const chaptersReadCount = Object.values(chaptersRead).reduce((sum, arr) => {
      if (Array.isArray(arr)) return sum + arr.length;
      return sum;
    }, 0);
    localStorage.setItem(`books_read_count${uidSuffix}`, booksReadCount);
    localStorage.setItem(`chapters_read_count${uidSuffix}`, chaptersReadCount);
    console.log(`📊 Milestones: ${booksReadCount} books, ${chaptersReadCount} chapters read`);

    // Prayers: total prayed (fallback to saved customs)
    const prayersCountStored = parseInt(localStorage.getItem(`prayers_count${uidSuffix}`)) || 0;
    const customPrayers = JSON.parse(localStorage.getItem("customPrayers")) || [];
    const prayersCount = Math.max(prayersCountStored, customPrayers.length);
    localStorage.setItem(`prayers_count${uidSuffix}`, prayersCount);
    
    // App shares tracking (already uses uidSuffix in topbar-loader.js)
    const appSharedCount = parseInt(localStorage.getItem(`app_shared_count${uidSuffix}`)) || 0;
    
    console.log(`📊 Milestones: ${prayersCount} prayers, ${streakDays} day streak, ${appSharedCount} shares`);
  }

  updateMilestoneTracking();
  initMilestones();
  // Don't apply saved border - recalculate based on current user's actual milestones
  checkAndUnlockProfileBorder();
});
