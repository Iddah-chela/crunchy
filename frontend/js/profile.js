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

const API_BASE = window.location.hostname === "localhost"
  ? ""
  : "https://holyverse-s5s1.onrender.com";


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
        if (!res.ok) return showModal(data.error || "Logout failed 😭");
        localStorage.removeItem("user");
        user = null;
        window.location.href = "/login.html";
      } catch (err) {
        console.error(err);
        showModal("Logout error 😭");
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
          msg.textContent = data.error || "Profile update failed 😭";
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
        msg.textContent = "Network drama 😭";
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

  const lastWaterDayStr = localStorage.getItem(lastWaterDayKey);
const lastWaterDay = lastWaterDayStr ? new Date(lastWaterDayStr) : new Date();
const today = new Date();

// calculate difference in days
const msPerDay = 24 * 60 * 60 * 1000;
const daysMissed = Math.floor((today - lastWaterDay) / msPerDay);

if (daysMissed > 1) {
  // tree goes backward 1 level per missed day, but never below 0
  treeLevel = Math.max(0, treeLevel - daysMissed);
  localStorage.setItem(treeKey, treeLevel);

  // optionally reduce water if you want
  // water = Math.max(0, water - daysMissed);

  localStorage.setItem(lastWaterDayKey, today.toDateString());

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
      console.error("Failed to update tree level on server after missed days:", err);
    }
  }
}



// ---- DAILY WATER GIVE (now AFTER the backward logic) ----
const todayStr = today.toDateString();
const lastGivenDay = localStorage.getItem(lastWaterDayKey) || "";

if (todayStr !== lastGivenDay) {
  water++;
  localStorage.setItem(waterKey, water);
  localStorage.setItem(lastWaterDayKey, todayStr);
}

  // initial render
  updateTree();
});
