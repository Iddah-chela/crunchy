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

// Helper to escape HTML in modal messages
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Confirm modal with yes/no - returns a Promise
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(4px); z-index:9999; align-items:center; justify-content:center;';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:400px; text-align:center; background:#1a1a2e; padding:2rem; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);">
        <p style="margin:1rem 0 1.5rem 0; line-height:1.6; color:#fff; font-size:1.05rem;">${escapeHtml(message)}</p>
        <div style="display:flex; gap:1rem; justify-content:center;">
          <button class="innerbtn cancel-btn" style="background:#555; color:#fff; padding:0.75rem 1.5rem; border:none; border-radius:8px; cursor:pointer; font-size:1rem;">Cancel</button>
          <button class="innerbtn confirm-btn" style="background:#e74c3c; color:#fff; padding:0.75rem 1.5rem; border:none; border-radius:8px; cursor:pointer; font-size:1rem;">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.confirm-btn').onclick = () => {
      modal.remove();
      resolve(true);
    };
    
    modal.querySelector('.cancel-btn').onclick = () => {
      modal.remove();
      resolve(false);
    };
    
    // Close on background click (counts as cancel)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    });
  });
}

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
          // Show admin link only for user id 10
          try {
            if (user && user.id === 10) {
              const adminLink = document.createElement('a');
              adminLink.href = '/admin.html';
              adminLink.textContent = 'Admin Dashboard';
              adminLink.className = 'admin-link';
              adminLink.style.display = 'inline-block';
              adminLink.style.marginTop = '8px';
              if (profileInfos) profileInfos.appendChild(adminLink);
            }
          } catch (e) {
            console.warn('Failed to append admin link', e);
          }
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

  // Delete account button
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      if (!user) return showModal("You must be logged in to delete your account.");
      
      const confirmDelete = await showConfirm("Are you sure you want to delete your account?\n\nThis will permanently delete:\n• Your profile and personal information\n• All your private messages\n• Your prayer requests and testimonies\n• Your friendships and favorites\n\nThis action cannot be undone.");
      if (!confirmDelete) return;

      try {
        // Check if user has community posts
        let deletePosts = false;
        try {
          const checkRes = await fetch(`${API_BASE}/api/user-has-posts/${user.id}`, {
            credentials: "include"
          });
          
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            console.log("User has posts check:", checkData);
            
            if (checkData.hasPosts) {
              console.log("User has posts, asking for confirmation...");
              
              // Ask if they want to delete posts
              const deletePostsChoice = await showConfirm("You have posts in the community. Do you want to delete all your posts too?\n\nConfirm = Delete posts\nCancel = Keep posts and continue");
              
              if (deletePostsChoice === null || deletePostsChoice === undefined) {
                console.log("User cancelled the entire deletion process");
                return; // User cancelled, abort everything
              }
              
              deletePosts = deletePostsChoice;
              console.log("User chose to delete posts:", deletePosts);
              
              // Final confirmation before deletion
              const finalConfirm = await showConfirm(deletePosts 
                ? "Final confirmation: Delete your account AND all your posts?" 
                : "Final confirmation: Delete your account but KEEP your posts visible?");
              
              if (!finalConfirm) {
                console.log("User cancelled at final confirmation");
                return; // User cancelled, abort everything
              }
            } else {
              console.log("User has no posts to delete");
            }
          } else {
            console.warn("Failed to check posts, status:", checkRes.status);
          }
        } catch (checkErr) {
          console.warn("Could not check for posts:", checkErr);
          // Continue with deletion even if check fails
        }

        console.log("Proceeding with account deletion, deletePosts =", deletePosts);

        // Delete account
        const res = await fetch(`${API_BASE}/users/${user.id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deletePosts })
        });
        
        const data = await res.json();
        if (!res.ok) return showModal(data.error || "Failed to delete account. Please try again.");
        
        showModal("Your account has been deleted. You will be redirected to the home page.");
        localStorage.removeItem("user");
        user = null;
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 2000);
      } catch (err) {
        console.error(err);
        showModal("Error deleting account. Please try again.");
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

  // If running as native Capacitor app, allow picking image via native camera/image picker
  let nativePickedImageData = null;
  if (window.CapacitorHelpers && window.CapacitorHelpers.isNative && window.CapacitorHelpers.isNative()) {
    if (profilePicEl) {
      profilePicEl.style.cursor = 'pointer';
      profilePicEl.addEventListener('click', async () => {
        const res = await window.CapacitorHelpers.pickImage({ quality: 80 });
        if (res && res.dataUrl) {
          nativePickedImageData = res.dataUrl;
          if (preview) preview.src = nativePickedImageData;
        }
      });
    }
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

      // If native image was picked via Capacitor, convert dataURL to blob and append
      if (nativePickedImageData) {
        const res = await fetch(nativePickedImageData);
        const blob = await res.blob();
        formData.append('profilePic', blob, 'profile.jpg');
      }

      try {
        const res = await fetch(`${API_BASE}/users/${user.id}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) {
          msg.textContent = "Profile update failed. Please try again.";
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

  let water = parseInt(localStorage.getItem(waterKey));
  if (isNaN(water)) water = 2;
  let treeLevel = parseInt(localStorage.getItem(treeKey)) || 0;

  const treeImages = [
    "backgrounds/seedling.png", // seedling
    "backgrounds/kidplant.png",
    "backgrounds/tweenseed.png",
    "backgrounds/teenplant.png",
    "backgrounds/almost18tree.png",
    "backgrounds/20stree.png",
    "backgrounds/25hapo.png",
    "backgrounds/30sasa.webp",
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

  const lastDailyWaterKey = `lastDailyWater_${currentUserName}`;

  const today = new Date();
  const lastDailyWater = localStorage.getItem(lastDailyWaterKey);
  const todayStr = today.toDateString();

  // Give daily water if not already given today

if (todayStr !== lastDailyWater) {
  water++;
  localStorage.setItem(waterKey, water);
  localStorage.setItem(lastDailyWaterKey, todayStr);
}


  // Check if tree should decrease - only if they haven't watered in 2+ days
  // Example: Water on Monday → No water Tuesday → Tree decreases on Wednesday
  const lastWateredStr = localStorage.getItem(lastWaterDayKey);
  if (lastWateredStr) {
    const lastWatered = new Date(lastWateredStr);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0); // Set to start of day
    lastWatered.setHours(0, 0, 0, 0); // Set to start of day
    
    // If last watered was before (or on) the day before yesterday, tree goes down 1 level
    if (lastWatered <= twoDaysAgo) {
      treeLevel = Math.max(0, treeLevel - 1);
      localStorage.setItem(treeKey, treeLevel);
      console.log(`🌳 Tree decreased to level ${treeLevel} (last watered: ${lastWateredStr})`);
      
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
        { value: 100, title: "100 chapters!", reward: "🏆 Scholar" },
        { value: 150, title: "150 chapters!", reward: "👑 Master" },
        { value: 200, title: "200 chapters!", reward: "📚 Bookworm" },
        { value: 250, title: "250 chapters!", reward: "📖 Scribe" },
        { value: 300, title: "300 chapters!", reward: "🔮 Sage" },
        { value: 350, title: "350 chapters!", reward: "🌟 Mentor" },
        { value: 400, title: "400 chapters!", reward: "🔥 Torchbearer" },
        { value: 450, title: "450 chapters!", reward: "🦉 Oracle" },
        { value: 500, title: "500 chapters!", reward: "🌠 Luminary" }
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
    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
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

    // Add tooltip on click for next border info
    profilePic.onclick = function (e) {
      // Remove any existing tooltip
      let oldTip = document.getElementById("profilePicTooltip");
      if (oldTip) oldTip.remove();
      // Create tooltip
      const tip = document.createElement("div");
      tip.id = "profilePicTooltip";
      let nextBorder = null;
      let nextLabel = "";
      if (claimedCount < totalMilestones * 0.2) {
        nextBorder = Math.ceil(totalMilestones * 0.2);
        nextLabel = "bronze";
      } else if (claimedCount < totalMilestones * 0.4) {
        nextBorder = Math.ceil(totalMilestones * 0.4);
        nextLabel = "silver";
      } else if (claimedCount < totalMilestones * 0.6) {
        nextBorder = Math.ceil(totalMilestones * 0.6);
        nextLabel = "gold";
      } else if (claimedCount < totalMilestones * 0.8) {
        nextBorder = Math.ceil(totalMilestones * 0.8);
        nextLabel = "platinum";
      } else if (claimedCount < totalMilestones) {
        nextBorder = totalMilestones;
        nextLabel = "legendary";
      }
      if (nextBorder && claimedCount < nextBorder) {
        tip.textContent = `🎯 Next border (${nextLabel}) at ${nextBorder} milestones (currently ${claimedCount})`;
      } else if (claimedCount >= totalMilestones) {
        tip.textContent = `🏆 All borders unlocked! (${claimedCount} milestones)`;
      } else {
        tip.textContent = `🎯 Next border at ??? (currently ${claimedCount})`;
      }
      tip.style.position = "absolute";
      tip.style.background = "#222";
      tip.style.color = "#fff";
      tip.style.padding = "6px 12px";
      tip.style.borderRadius = "8px";
      tip.style.fontSize = "13px";
      tip.style.zIndex = 1000;
      tip.style.top = (profilePic.offsetTop + profilePic.offsetHeight + 8) + "px";
      tip.style.left = (profilePic.offsetLeft + profilePic.offsetWidth/2 - 90) + "px";
      tip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
      tip.style.pointerEvents = "none";
      document.body.appendChild(tip);
      setTimeout(() => { tip.remove(); }, 2200);
    };

    // Unlock borders at different completion levels
    if (claimedCount >= totalMilestones) {
      // All milestones complete - legendary rainbow border
      profilePic.style.border = "4px solid transparent";
      profilePic.style.background = "linear-gradient(white, white) padding-box, linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "legendary");
      const lastBorderShown = localStorage.getItem(`lastBorderShown${uidSuffix}`);
if (claimedCount >= totalMilestones && lastBorderShown !== "legendary") {
    // show modal
    showModal(`✨ LEGENDARY BORDER UNLOCKED! (100%)`);
    localStorage.setItem(`lastBorderShown${uidSuffix}`, "legendary");
}
    } else if (claimedCount >= totalMilestones * 0.8) {
      // 80% complete - platinum border
      profilePic.style.border = "4px solid transparent";
      profilePic.style.background =
        "linear-gradient(white, white) padding-box, linear-gradient(135deg, #e5e4e2, #bfc1c2, #f5f7fa) border-box";
      profilePic.style.boxShadow = "0 0 18px rgba(229, 228, 226, 0.8)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "platinum");

      if (claimedCount >= totalMilestones * 0.8 && localStorage.getItem(`lastBorderShown${uidSuffix}`) !== "platinum") {
        showModal(`💎 PLATINUM BORDER UNLOCKED! (80%+)`);
        localStorage.setItem(`lastBorderShown${uidSuffix}`, "platinum");
      }

    } else if (claimedCount >= totalMilestones * 0.6) {
      // 60% complete - gold border
      profilePic.style.border = "4px solid gold";
      profilePic.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.6)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "gold");
      if (claimedCount >= totalMilestones * 0.6 && localStorage.getItem(`lastBorderShown${uidSuffix}`) !== "gold") {
        // show modal
        showModal(`🥇 GOLD BORDER UNLOCKED! (60%+)`);
        localStorage.setItem(`lastBorderShown${uidSuffix}`, "gold");
      }
    } else if (claimedCount >= totalMilestones * 0.4) {
      // 40% complete - silver border
      profilePic.style.border = "4px solid silver";
      profilePic.style.boxShadow = "0 0 10px rgba(192, 192, 192, 0.6)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "silver");
      if (claimedCount >= totalMilestones * 0.4 && localStorage.getItem(`lastBorderShown${uidSuffix}`) !== "silver") {
        // show modal
        showModal(`🥈 SILVER BORDER UNLOCKED! (40%+)`);
        localStorage.setItem(`lastBorderShown${uidSuffix}`, "silver");
      }
    } else if (claimedCount >= totalMilestones * 0.2) {
      // 20% complete - bronze border
      profilePic.style.border = "4px solid #cd7f32";
      profilePic.style.boxShadow = "0 0 8px rgba(205, 127, 50, 0.5)";
      localStorage.setItem(`profileBorderLevel${uidSuffix}`, "bronze");
      if (claimedCount >= totalMilestones * 0.2 && localStorage.getItem(`lastBorderShown${uidSuffix}`) !== "bronze") {
        // show modal
        showModal(`🥉 BRONZE BORDER UNLOCKED! (20%+)`);
        localStorage.setItem(`lastBorderShown${uidSuffix}`, "bronze");
      }
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
  initBorderSelector();
  
// =============================
// BORDER SELECTOR
// =============================
function initBorderSelector() {
  const container = document.getElementById('borderOptions');
  if (!container) return;
  
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const uidSuffix = user && user.id ? `:${user.id}` : ":guest";
  
  const milestonesClaimed = JSON.parse(localStorage.getItem(`milestonesClaimed${uidSuffix}`)) || {};
  const totalMilestones = Object.values(milestoneData).reduce((sum, cat) => sum + cat.thresholds.length, 0);
  const claimedCount = Object.values(milestonesClaimed).reduce((sum, arr) => sum + arr.length, 0);
  
  const currentBorder = localStorage.getItem(`profileBorderLevel${uidSuffix}`) || 'none';
  
  const borders = [
    { id: 'none', label: 'Default', req: 0 },
    { id: 'bronze', label: '\ud83e\udd49 Bronze', req: Math.ceil(totalMilestones * 0.2) },
    { id: 'silver', label: '\ud83e\udd48 Silver', req: Math.ceil(totalMilestones * 0.4) },
    { id: 'gold', label: '\ud83e\udd47 Gold', req: Math.ceil(totalMilestones * 0.6) },
    { id: 'platinum', label: '\ud83d\udc8e Platinum', req: Math.ceil(totalMilestones * 0.8) },
    { id: 'legendary', label: '\u2728 Legendary', req: totalMilestones }
  ];
  
  borders.forEach(border => {
    const earned = claimedCount >= border.req;
    const btn = document.createElement('button');
    btn.className = 'border-option-btn innerbtn';
    btn.textContent = border.label;
    btn.disabled = !earned;
    btn.style.cssText = `
      padding: 0.75rem 1.5rem;
      ${!earned ? 'opacity: 0.4; cursor: not-allowed;' : 'cursor: pointer;'}
      ${currentBorder === border.id ? 'background: #4682b4; box-shadow: 0 0 10px rgba(70,130,180,0.5);' : ''}
    `;
    
    if (!earned) {
      btn.title = `Unlock at ${border.req} milestones`;
    }
    
    if (earned) {
      btn.onclick = () => selectBorder(border.id);
    }
    
    container.appendChild(btn);
  });
}

async function selectBorder(borderLevel) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user.id) return;
  
  const uidSuffix = `:${user.id}`;
  localStorage.setItem(`profileBorderLevel${uidSuffix}`, borderLevel);
  
  // Save to database
  try {
    await fetch(`${API_BASE}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ profile_border: borderLevel })
    });
  } catch (err) {
    console.error('Failed to save border:', err);
  }
  
  // Reapply border
  applySavedProfileBorder();
  
  // Refresh selector
  initBorderSelector();
  
  showModal(`\u2705 Border changed to ${borderLevel}!`);
}

window.selectBorder = selectBorder;

// =============================
// CAPACITOR/MOBILE COMPATIBILITY NOTE
// =============================
// - Most features work in Capacitor (localStorage, fetch, UI, etc.)
// - Push notifications require a plugin (e.g. @capacitor/push-notifications) and Firebase setup. If you use browser notification APIs, they will NOT work in the APK. You must use the Capacitor plugin for notifications to work on Android/iOS.
// - File uploads, camera, and sharing may need Capacitor plugins for best experience.
// - If you add new native features, check Capacitor docs for the right plugin.

});
