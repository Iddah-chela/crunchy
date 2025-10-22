let currentUser;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/me");
    if (!res.ok) throw new Error("Not logged in");
    currentUser = await res.json();

    await loadFriendRequests();
    await loadFriends();
    await loadAllUsers();
  } catch (err) {
    console.error(err);
    alert("Please log in first");
    window.location.href = "/login.html";
  }
});

// Load pending friend requests
async function loadFriendRequests() {
  const container = document.getElementById("friend-requests");
  
  try {
    const res = await fetch("/chat/friend-requests");
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

      card.querySelector('[data-action="accept"]').addEventListener("click", () => acceptRequest(req.id));
      card.querySelector('[data-action="decline"]').addEventListener("click", () => declineRequest(req.id));
    });
  } catch (err) {
    console.error("Failed to load requests:", err);
  }
}

async function acceptRequest(friendshipId) {
  try {
    const res = await fetch(`/chat/friend-accept/${friendshipId}`, { method: "POST" });
    const data = await res.json();
    alert(data.msg);
    
    await loadFriendRequests();
    await loadFriends();
  } catch (err) {
    console.error("Failed to accept:", err);
  }
}

async function declineRequest(friendshipId) {
  // For now, just remove from display
  // TODO: Add decline endpoint
  await loadFriendRequests();
}

// Load current friends
async function loadFriends() {
  const container = document.getElementById("friends-list");
  
  try {
    const res = await fetch("/chat/friends");
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
    const res = await fetch("/users");
    const allUsers = await res.json();

    // Filter out current user
    const users = allUsers.filter(u => u.id !== currentUser.id);

    function renderUsers(filter = "") {
      container.innerHTML = "";
      
      const filtered = users.filter(u => 
        u.username.toLowerCase().includes(filter.toLowerCase())
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
    const res = await fetch("/chat/friend-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ friendId })
    });

    const data = await res.json();
    
    if (res.ok) {
      alert(`Friend request sent to ${username}! 🤝`);
    } else {
      alert(data.error || "Failed to send request");
    }
  } catch (err) {
    console.error("Failed to send request:", err);
    alert("Failed to send friend request");
  }
}