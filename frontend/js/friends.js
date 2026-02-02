let currentUser;
window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;


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

function showSafetyReminder() {
  const modal = document.getElementById("appModal");
  const msg = document.getElementById("modalMessage");
  const closeBtn = document.getElementById("modalClose");

  msg.innerHTML = `
    <h3 style="margin:0 0 1rem 0; color:#ffc107;">🛡️ Stay Safe Online</h3>
    <p style="text-align:left; line-height:1.8; margin-bottom:1rem;">
      Before you connect with others, please remember:
    </p>
    <ul style="text-align:left; line-height:1.8; margin:0 0 1.5rem 1.5rem;">
      <li>Never share personal information (phone, address, email)</li>
      <li>People online may not be who they say they are</li>
      <li>Report or block anyone who makes you uncomfortable</li>
      <li>Meet in public spaces if meeting in real life</li>
    </ul>
    <button class="innerbtn" onclick="document.getElementById('appModal').style.display='none'">I Understand</button>
  `;
  modal.style.display = "flex";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE}/me`, { 
      method: "GET",
      credentials: "include" });
    if (!res.ok) throw new Error("Not logged in");
    currentUser = await res.json();

    // Age restriction: Friends/chat features only for users 16+
    if (currentUser.age && currentUser.age < 16) {
      showModal("Friend features and private chat are only available for users 16 and older. This helps keep our community safe.");
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
      return;
    }

    // Show safety reminder for first-time use (16+ users)
    if (currentUser.age >= 16 && !localStorage.getItem('safety_reminder_shown')) {
      showSafetyReminder();
      localStorage.setItem('safety_reminder_shown', 'true');
    }

    await loadFriendRequests();
    await loadFriends();
    await loadAllUsers();
  } catch (err) {
    console.error(err);
    showModal("Please log in first");
   
  }
});

// Load pending friend requests
async function loadFriendRequests() {
  const container = document.getElementById("friend-requests");
  
  try {
    const res = await fetch(`${API_BASE}/chat/friend-requests`, { 
      method: "GET",
      credentials: "include" });
    const requests = await res.json();

    if (requests.length === 0) {
      container.innerHTML = "<p style='color: #888;'>No pending requests</p>";
      return;
    }

    container.innerHTML = "";
    requests.forEach(req => {
      const card = document.createElement("div");
      card.className = "chat-card";
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong>${req.username}</strong>
            <p style="font-size: 12px; color: #888;">wants to be friends</p>
          </div>
          <div>
            <button class="innerbtnc" data-id="${req.id}" data-action="accept">Accept</button>
            <button class="innerbtnc" style="background: #888;" data-id="${req.id}" data-action="decline">Decline</button>
          </div>
        </div>
      `;
      container.appendChild(card);

      card.querySelector('[data-action="accept"]').addEventListener("click", () => {
        acceptRequest(req.id);
        card.remove();
      });
      card.querySelector('[data-action="decline"]').addEventListener("click", () => {
        declineRequest(req.id);
        card.remove();
      });
    });
  } catch (err) {
    console.error("Failed to load requests:", err);
  }
}

async function acceptRequest(friendshipId) {
  try {
    const res = await fetch(`${API_BASE}/chat/friend-accept/${friendshipId}`, { method: "POST", credentials: "include" });
    const data = await res.json();
    showModal(data.msg);
    
    await loadFriendRequests();
    await loadFriends();
  } catch (err) {
    console.error("Failed to accept:", err);
  }
}

async function declineRequest(friendshipId) {
  try {
    const res = await fetch(`${API_BASE}/chat/friend-decline/${friendshipId}`, { method: "POST", credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to decline");

    showModal(data.msg);
    await loadFriendRequests(); // refresh list
  } catch (err) {
    console.error("Failed to decline:", err);
  }
}


// Load current friends
async function loadFriends() {
  const container = document.getElementById("friends-list");
  
  try {
    const res = await fetch(`${API_BASE}/chat/friends`, { 
      method: "GET",
      credentials: "include" });
    const friends = await res.json();

    if (friends.length === 0) {
      container.innerHTML = "<p style='color: #888;'>No friends yet. Search for users below!</p>";
      return;
    }

    container.innerHTML = "";
    friends.forEach(friend => {
      const card = document.createElement("div");
      card.className = "chat-card";
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong>${friend.username}</strong>
          </div>
          <a href="private.html" class="innerbtnc" style="text-decoration: none;">Chat</a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load friends:", err);
  }
}

// Load all users for search
async function loadAllUsers() {
  const container = document.getElementById("users-list");
  const searchInput = document.getElementById("search-users");
  
  try {
    const res = await fetch(`${API_BASE}/users`, { 
      method: "GET",
      credentials: "include" });
    const data = await res.json();
    const allUsers = Object.values(data);

    // Filter out current user
    const users = allUsers.filter(u => u.id !== currentUser.id);

    function renderUsers(filter = "") {
      container.innerHTML = "";
      
      const filtered = users.filter(u => 
        u.username && u.username.toLowerCase().includes(filter.toLowerCase())
      );

      if (filtered.length === 0) {
        container.innerHTML = "<p style='color: #888;'>No users found</p>";
        return;
      }

      filtered.forEach(user => {
        const card = document.createElement("div");
        card.className = "chat-card";
        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong>${user.username}</strong>
            <button class="innerbtnc" data-id="${user.id}">Add Friend</button>
          </div>
        `;
        container.appendChild(card);

        card.querySelector("button").addEventListener("click", () => sendFriendRequest(user.id, user.username));
      });
    }

    searchInput.addEventListener("input", (e) => {
      renderUsers(e.target.value);
    });

    renderUsers();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

async function sendFriendRequest(friendId, username) {
  try {
    const res = await fetch(`${API_BASE}/chat/friend-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ friendId })
    });

    const data = await res.json();
    
    if (res.ok) {
      showModal(`Friend request sent to ${username}! 🤝`);
    } else {
      showModal(data.error || "Failed to send request");
    }
  } catch (err) {
    console.error("Failed to send request:", err);
    showModal("Failed to send friend request");
  }
}