const chatListView = document.getElementById("chat-list-view");
const chatView = document.getElementById("chat-view");
const backBtn = document.getElementById("backBtn");
const chatUsername = document.getElementById("chat-username");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chatInput");
const chatForm = document.getElementById("chat-input-area");

let currentUserId, currentUsername;
let socket;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/me");
    if (!res.ok) throw new Error("Not logged in");
    const me = await res.json();

    currentUserId = me.id;
    currentUsername = me.username;

    // init socket AFTER user info - WITH credentials for session sharing
    socket = io("http://localhost:4000", {
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
      alert("Failed to send message: " + error.error);
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
        alert("Failed to send message. Please try again.");
      }
    });

    // Load the chat list
    await loadChatList();

  } catch (err) {
    console.error(err);
    alert("Please log in first");
  }
});

async function loadThread(otherUserId) {
  const res = await fetch(`/chat/thread/${otherUserId}`);
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
  const bubble = document.createElement("div");
  bubble.className = msg.senderId === currentUserId ? "bubble you" : "bubble them";

  if (msg.senderId === currentUserId) {
    bubble.innerHTML = `<div class="bubble-text">${msg.text}</div>`;
  } else {
    bubble.innerHTML = `
      <img src="${msg.senderProfilePic || '/images/default-avatar.png'}" class="bubble-pic">
      <div class="bubble-text">
        <span class="bubble-username">${msg.senderUsername}</span>
        <span class="bubble-message">${msg.text}</span>
      </div>
    `;
  }

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  updateChatSnippet(msg.senderId === currentUserId ? msg.receiverId : msg.senderId, msg.text);
}

function updateChatSnippet(friendId, text) {
  const card = document.querySelector(`.chat-card[data-userid='${friendId}']`);
  if (!card) return;
  const snippet = card.querySelector('.chat-snippet');
  const time = card.querySelector('.chat-time');
  snippet.textContent = text.length > 25 ? text.slice(0,25) + '…' : text;
  time.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = chatInput.scrollHeight + 'px';
});

async function loadChatList() {
  // Load friends instead of all users
  const res = await fetch("/chat/friends");
  if (!res.ok) {
    console.error("Failed to load friends");
    return;
  }
  
  const friends = await res.json();
  
  const list = document.getElementById("chat-list-view");
  list.innerHTML = "<h2>Private Threads</h2>";
  
  if (friends.length === 0) {
    list.innerHTML += "<p style='text-align:center; color:#888;'>No friends yet. Add some <a href='friends.html'> friends</a> to start chatting! 👥</p>";
    return;
  }
  
  friends.forEach(friend => {
    const card = document.createElement("div");
    card.className = "chat-card";
    card.dataset.userid = friend.id;
    card.innerHTML = `
      <div class="chat-user">${friend.username}</div>
      <div class="chat-snippet">Start a conversation...</div>
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