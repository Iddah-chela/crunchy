// profile-view.js
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


document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  const viewUsername = document.getElementById("viewUsername");
  const viewProfilePic = document.getElementById("viewProfilePic");
  const viewBio = document.getElementById("viewBio"); // <-- new
  const viewTreeImage = document.getElementById("treeImage");
  const profileActions = document.querySelector(".profile-actions");

  if (!userId) {
    document.body.innerHTML = "<p style='padding:20px;text-align:center;'>User not found.</p>";
    return;
  }

  async function loadUser() {
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, { credentials: 'include' });
      if (!res.ok) {
        console.warn("Profile fetch failed:", res.status);
        document.body.innerHTML = "<p style='padding:20px;text-align:center;'>User not found.</p>";
        return;
      }
      const user = await res.json();

      // Populate UI
      viewUsername.textContent = user.username || "Unknown";
      viewProfilePic.src = user.profilePic || "/images/default-avatar.png";
      if (viewBio) viewBio.textContent = user.bio || "No bio yet."; // <-- new
      
      // Apply milestone border
      applyUserBorder(viewProfilePic, user.id);

      // Tree (localStorage-based fallback)
      const treeLevel = parseInt(user.tree_level, 10) || 0;
      const treeImages = [
        "backgrounds/seedling.png","backgrounds/kidplant.png","backgrounds/tweenseed.png",
        "backgrounds/teenplant.png","backgrounds/almost18tree.png","backgrounds/20stree.png",
        "backgrounds/25hapo.png","backgrounds/30sasa.png","backgrounds/bigtree.png"
      ];
      if (viewTreeImage) viewTreeImage.src = treeImages[Math.min(treeLevel, treeImages.length-1)];

      if (viewTreeImage) {
  const safeLevel = Math.min(treeLevel, treeImages.length - 1);

  const baseHeight = 120;  
  const growth = 25 * safeLevel;

  viewTreeImage.style.height = (baseHeight + growth) + "px";
}

      // If this is NOT the logged-in user, show friend UI
      const me = JSON.parse(localStorage.getItem("user") || "null");
      if (!me || me.id !== Number(user.id)) {
        // hide edit form (if any) and show friend button
        
        if (profileActions) profileActions.innerHTML = `<button id="friendRequestBtn" class="auth-btn">Send Friend Request</button>`;
        // rebind friendBtn from DOM
        const btn = document.getElementById("friendRequestBtn");
        if (btn) {
          // check if a pending request exists (uses credentials)
          checkPendingAndBind(btn, Number(user.id));
        }
      } else {
        // viewing own profile: keep edit controls
      }
    } catch (err) {
      console.error("Failed loading profile:", err);
      document.body.innerHTML = "<p style='padding:20px;text-align:center;'>Network error. Please check your connection.</p>";
    }
  }

  async function checkPendingAndBind(btn, otherUserId) {
    try {
      // optional: check pending friend requests that target current user
      const res = await fetch(`${API_BASE}/chat/friend-requests`, { credentials: 'include' });
      if (res.ok) {
        const pending = await res.json();
        const requestSent = pending.some(f => f.userId == otherUserId);
        if (requestSent) {
          btn.textContent = "Request Sent ✅";
          btn.disabled = true;
          return;
        }
      }
    } catch (err) {
      // ignore check errors — still allow sending
      console.warn("Could not check friend requests:", err);
    }

    btn.addEventListener("click", async () => {
      try {
        const r = await fetch(`${API_BASE}/chat/friend-request`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId: otherUserId })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Request failed");
        btn.textContent = "Request Sent ✅";
        btn.disabled = true;
        showModal(data.msg || "Friend request sent! 🤝");
      } catch (err) {
        console.error("Friend request failed:", err);
        showModal(err.message || "Failed to send friend request. Please try again.");
      }
    });
  }

  // Apply user's milestone border
  function applyUserBorder(imgElement, userId) {
    if (!imgElement || !userId) return;
    
    const borderLevel = localStorage.getItem(`profileBorderLevel:${userId}`);
    
    if (borderLevel === "legendary") {
      imgElement.style.border = "4px solid transparent";
      imgElement.style.background = "linear-gradient(white, white) padding-box, linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box";
    } else if (borderLevel === "gold") {
      imgElement.style.border = "4px solid gold";
      imgElement.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.6)";
    } else if (borderLevel === "silver") {
      imgElement.style.border = "4px solid silver";
      imgElement.style.boxShadow = "0 0 10px rgba(192, 192, 192, 0.6)";
    } else if (borderLevel === "bronze") {
      imgElement.style.border = "4px solid #cd7f32";
      imgElement.style.boxShadow = "0 0 8px rgba(205, 127, 50, 0.5)";
    }
  }

  // actually load the user
  loadUser();
});
