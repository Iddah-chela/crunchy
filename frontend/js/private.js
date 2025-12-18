const chatListView = document.getElementById("chat-list-view");
const chatView = document.getElementById("chat-view");
const backBtn = document.getElementById("backBtn");
const chatUsername = document.getElementById("chat-username");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chatInput");
const chatForm = document.getElementById("chat-input-area");

window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;


let currentUserId, currentUsername;
let socket;

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

document.querySelector('.backbtnb')?.addEventListener('click', () => {
  window.location.href = 'friends.html';
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE}/me`, { 
      method: "GET",
      credentials: "include" });
    if (!res.ok) throw new Error("Not logged in");
    const me = await res.json();

    currentUserId = me.id;
    currentUsername = me.username;

    // init socket AFTER user info - WITH credentials for session sharing
    socket = io(`${API_BASE}/`, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Socket connection debugging
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    // Socket listeners
    socket.on("newMessage", (msg) => {
      // inside socket.on("newMessage")
      if (msg.senderId === currentUserId) return; // skip your own echo
      console.log("📨 Received newMessage:", msg);
      addMessageBubble(msg);
    });

    socket.on("messageError", (error) => {
      console.error("❌ Message error:", error);
      showModal("Failed to send message: " + error.error);
    });

    // back button
    backBtn.addEventListener("click", () => {
      chatView.style.display = "none";
      chatListView.style.display = "block";
      // Remove active class from all cards
      document.querySelectorAll(".chat-card").forEach(c => c.classList.remove("active"));
    });
    

    // send message
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      const activeCard = document.querySelector(".chat-card.active");
      if (!activeCard) {
        console.error("No active chat selected");
        return;
      }
      const otherUserId = Number(activeCard.dataset.userid);

      // Add message to UI immediately for better UX
      const tempMsg = {
        senderId: currentUserId,
        senderUsername: currentUsername,
        text: text,
        timestamp: new Date()
      };
      addMessageBubble(tempMsg);

      try {
        console.log("📤 Sending message:", { receiverId: otherUserId, text });
        socket.emit("sendMessage", { receiverId: otherUserId, text });
        chatInput.value = "";
      } catch (error) {
        console.error("❌ Error sending message:", error);
        // Remove the temporary message if sending failed
        const bubbles = chatMessages.querySelectorAll('.bubble');
        if (bubbles.length > 0) {
          bubbles[bubbles.length - 1].remove();
        }
        showModal("Failed to send message. Please try again.");
      }
    });

    // Load the chat list
    await loadChatList();

  } catch (err) {
    console.error(err);
    showModal("Please log in first");
  }
});

async function loadThread(otherUserId) {
  const res = await fetch(`${API_BASE}/chat/thread/${otherUserId}`, { 
    method: "GET",
    credentials: "include" });
  if (!res.ok) {
    console.error("Failed to load thread", res.status);
    chatMessages.innerHTML = "<p>Failed to load messages</p>";
    return;
  }

  const msgs = await res.json();
  if (!Array.isArray(msgs)) return console.error("Thread response not an array", msgs);

  chatMessages.innerHTML = "";
  msgs.forEach(addMessageBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessageBubble(msg) {
  const bubbleWrapper = document.createElement("div");
  bubbleWrapper.style.cssText = `margin-bottom:1rem; display:flex; align-items:flex-start; gap:8px; ${msg.senderId === currentUserId ? 'justify-content:flex-end; flex-direction:row-reverse;' : 'justify-content:flex-start;'}`;
  
  const bubble = document.createElement("div");
  bubble.className = msg.senderId === currentUserId ? "bubble you" : "bubble them";

  if (msg.senderId === currentUserId) {
    bubble.innerHTML = `<div class="bubble-text">${msg.text}</div>`;
  } else {
    const profilePic = msg.senderProfilePic || '/images/default-avatar.png';
    const senderId = msg.senderId || msg.sender_id;
    
    // Get border style for sender
    const borderStyle = senderId ? getUserBorderStyle(senderId) : '';
    
    const pic = document.createElement('img');
    pic.src = profilePic;
    pic.className = 'bubble-pic';
    pic.style.cursor = 'pointer';
    if (borderStyle) {
      pic.style.cssText += borderStyle;
    }
    pic.onclick = () => {
      if (senderId) {
        window.location.href = `/profile-view.html?id=${encodeURIComponent(senderId)}`;
      }
    };
    
    bubbleWrapper.appendChild(pic);
    
    bubble.innerHTML = `
      <div class="bubble-text">
        <span class="bubble-username">${msg.senderUsername}</span>
        <span class="bubble-message">${msg.text}</span>
      </div>
    `;
  }

  bubbleWrapper.appendChild(bubble);
  chatMessages.appendChild(bubbleWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  updateChatSnippet(msg.senderId === currentUserId ? msg.receiverId : msg.senderId, msg.text);
}

// Helper function to get user milestone border
function getUserBorderStyle(userId) {
  if (!userId) return '';
  const borderLevel = localStorage.getItem(`profileBorderLevel:${userId}`);
  
  if (borderLevel === "legendary") {
    return 'border:4px solid transparent; background:linear-gradient(white, white) padding-box, linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box;';
  } else if (borderLevel === "gold") {
    return 'border:4px solid gold; box-shadow:0 0 15px rgba(255,215,0,0.6);';
  } else if (borderLevel === "silver") {
    return 'border:4px solid silver; box-shadow:0 0 10px rgba(192,192,192,0.6);';
  } else if (borderLevel === "bronze") {
    return 'border:4px solid #cd7f32; box-shadow:0 0 8px rgba(205,127,50,0.5);';
  }
  return '';
}



// Update snippet + localStorage on new message
function updateChatSnippet(friendId, text) {
  if (!friendId) return;

  const card = document.querySelector(`.chat-card[data-userid='${friendId}']`);
  if (!card) return;

  // Load local snippets first
  const localSnippets = JSON.parse(localStorage.getItem("chatSnippets") || "{}");

  // Save/update snippet for this friend
  localSnippets[friendId] = {
    text: text,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem("chatSnippets", JSON.stringify(localSnippets));

  // Update UI
  const snippetText = text.length > 25 ? text.slice(0, 25) + "…" : text;
  const timeText = new Date(localSnippets[friendId].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  card.querySelector(".chat-snippet").textContent = snippetText;
  card.querySelector(".chat-time").textContent = timeText;
}


chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = chatInput.scrollHeight + 'px';
});

async function loadChatList() {
  // Load friends instead of all users
  const res = await fetch(`${API_BASE}/chat/friends`, { 
    method: "GET",
    credentials: "include" });
  if (!res.ok) return console.error("Failed to load friends");
  const friends = await res.json();

  // Restore local snippets/times if they exist
  const localSnippets = JSON.parse(localStorage.getItem('chatSnippets') || '{}');

  const list = document.getElementById("chat-list-view");
  list.innerHTML = "<h2>Threads</h2>";

  if (friends.length === 0) {
    list.innerHTML += "<p style='text-align:center; color:#888;'>No friends yet. Add some <a href='friends.html'> friends</a> to start chatting! 👥</p>";
    return;
  }

  friends.forEach(friend => {
    const card = document.createElement("div");
    card.className = "chat-card";
    card.dataset.userid = friend.id;

    // Use backend lastMessage OR localStorage
    const snippetData = localSnippets[friend.id];
    const snippetText = snippetData ? (snippetData.text.length > 25 ? snippetData.text.slice(0,25)+'…' : snippetData.text) : "Start a conversation…";
    const timeText = snippetData ? new Date(snippetData.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true }) : "–";

    card.innerHTML = `
      <div class="chat-user">${friend.username}</div>
      <div class="chat-snippet">${snippetText}</div>
      <div class="chat-time">${timeText}</div>
    `;

    list.appendChild(card);

    card.addEventListener("click", async () => {
      // Remove active from all cards
      document.querySelectorAll(".chat-card").forEach(c => c.classList.remove("active"));
      // Add active to clicked card
      card.classList.add("active");

      chatView.style.display = "flex";
      chatListView.style.display = "none";
      chatUsername.textContent = "Chat with " + friend.username;

      await loadThread(friend.id);
      socket.emit("joinRoom", { userA: currentUserId, userB: friend.id });
    });
  });
}