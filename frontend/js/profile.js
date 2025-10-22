const user = JSON.parse(localStorage.getItem("user"));
const form = document.getElementById("profileForm");
const msg = document.getElementById("msg");

// Pre-fill form with localStorage values
document.getElementById("username").value = user.username;
document.getElementById("age").value = user.age;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    username: document.getElementById("username").value.trim(),
    age: Number(document.getElementById("age").value),
    password: document.getElementById("password").value || null
  };

  try {
    const res = await fetch(`/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Profile update failed 😭";
      return;
    }

    msg.textContent = data.msg;

    // Update localStorage copy
    localStorage.setItem("user", JSON.stringify({
      ...user,
      username: body.username || user.username,
      age: body.age || user.age
    }));
    document.getElementById("topbar-user").textContent = user.username;

    form.classList.add("hidden");
  document.getElementById("profile-infos").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    msg.textContent = "Network drama 😭";
  }
  document.getElementById("topbar-user").textContent = body.username || user.username;

});
function edit() {
  form.classList.remove("hidden");
  document.getElementById("profile-infos").classList.add("hidden");
}
window.addEventListener("DOMContentLoaded", async () => {
  let user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    try {
      const res = await fetch(`/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        user = { ...user, ...data }; // merge with localStorage
        localStorage.setItem("user", JSON.stringify(user));

        document.getElementById("topbar-user").textContent = `👋 ${user.username}`;
        document.querySelector(".profile-pic").src = user.profilePic || "images/default-avatar.png";
      }
    } catch (err) {
      console.error("Failed to fetch user on load:", err);
    }
  }
});


const logoutBtn = document.getElementById("logoutBtn");

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

const fileInput = document.getElementById("profilePic");
const preview = document.getElementById("previewPic");

// Live preview
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => preview.src = reader.result;
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("username", document.getElementById("username").value.trim());
  formData.append("age", Number(document.getElementById("age").value));
  if (document.getElementById("password").value) {
    formData.append("password", document.getElementById("password").value);
  }
  if (fileInput.files[0]) {
    formData.append("profilePic", fileInput.files[0]);
  }

  try {
    const res = await fetch(`/users/${user.id}`, {
      method: "PUT",
      body: formData,
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Profile update failed 😭";
      return;
    }

    msg.textContent = data.msg;

    // Update localStorage & UI
    const updatedUser = {
      ...user,
      username: formData.get("username"),
      age: formData.get("age"),
      profilePic: data.profilePicUrl || user.profilePic
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    document.getElementById("topbar-user").textContent = updatedUser.username;
    document.querySelector(".profile-pic").src = updatedUser.profilePic || "images/default-avatar.png";

    form.classList.add("hidden");
    document.getElementById("profile-infos").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    msg.textContent = "Network drama 😭";
  }
});

// in profile.js
const treeImg = document.getElementById("treeImage");
const waterBtn = document.getElementById("waterBtn");

const currentUser = JSON.parse(localStorage.getItem("user"))?.username || "Guest";
const treeKey = `treeLevel_${currentUser}`;
const waterKey = `water_${currentUser}`;

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
  treeImg.src = treeImages[treeLevel];
  
  // make tree grow in size as it levels up
  const baseHeight = 120; // seedling
  const growth = 25 * treeLevel; // each level adds 25px
  treeImg.style.height = baseHeight + growth + "px";
  
  // sparkle + bounce effect
  const sparkles = document.getElementById("sparkles");
  sparkles.classList.add("active");
  treeImg.style.opacity = "0"; // hide while sparkles cover it

  setTimeout(() => {
    sparkles.classList.remove("active");
    treeImg.style.opacity = "1";
    treeImg.style.animation = "bounce 0.6s ease";
    setTimeout(() => (treeImg.style.animation = ""), 600);
  }, 800);
}


function waterTree() {
  const sparkles = document.getElementById("sparkles");
  const can = document.getElementById("wateringCan");

  if (water <= 0) {
    alert("No water left! Come back tomorrow for more!");
    return;
  }

  // Start pouring animation
  can.classList.add("pouring");
  sparkles.classList.add("active");

  setTimeout(() => {
    // finish watering after animation
    can.classList.remove("pouring");
    sparkles.classList.remove("active");

    water--;
    if (treeLevel < treeImages.length - 1) {
      treeLevel++;
    }

    localStorage.setItem(waterKey, water);
    localStorage.setItem(treeKey, treeLevel);

    // bounce animation
    treeImg.style.opacity = "0";
    setTimeout(() => {
      updateTree();
      treeImg.style.opacity = "1";
      treeImg.style.transform = "scale(1.2)";
      setTimeout(() => {
        treeImg.style.transform = "scale(1)";
      }, 300);
    }, 300);
  }, 1200);
  document.getElementById("waterCount").textContent = `Water left: ${water}`;
}


//give water once per day
const today = new Date().toDateString();
const lastWaterDay = localStorage.getItem("lastWaterDay");

if (today !== lastWaterDay) {
  water++;
  localStorage.setItem("water", water);
  localStorage.setItem("lastWaterDay", today);
}


updateTree();
