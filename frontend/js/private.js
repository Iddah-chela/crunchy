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

    // init socket AFTER user info
    socket = io("http://localhost:4000");

    // Socket listeners
    socket.on("newMessage", addMessageBubble);

    // back button
    backBtn.addEventListener("click", () => {
      chatView.style.display = "none";
      chatListView.style.display = "block";
      // Remove active class from all cards
      document.querySelectorAll(".chat-card").forEach(c => c.classList.remove("active"));
    });

    // send message
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      const activeCard = document.querySelector(".chat-card.active");
      if (!activeCard) {
        console.error("No active chat selected");
        return;
      }
      const otherUserId = Number(activeCard.dataset.userid);

      socket.emit("sendMessage", { receiverId: otherUserId, text });
      chatInput.value = "";
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

  bubble.innerHTML = `
    ${msg.senderId !== currentUserId ? `<img src="${msg.senderProfilePic || '/images/default-avatar.png'}" class="bubble-pic">` : ''}
    <div class="bubble-text">
      ${msg.senderId !== currentUserId ? `<span class="bubble-username">${msg.senderUsername}</span>` : ''}
      ${msg.text}
    </div>
  `;

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function loadChatList() {
  const res = await fetch("/users");
  const users = await res.json();
  
  const list = document.getElementById("chat-list-view");
  list.innerHTML = "<h2>Private Threads</h2>";
  
  users.forEach(u => {
    if (u.id === currentUserId) return; // skip yourself
    const card = document.createElement("div");
    card.className = "chat-card";
    card.dataset.userid = u.id;
    card.innerHTML = `
      <div class="chat-user">${u.username}</div>
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
      chatUsername.textContent = "Chat with " + u.username;

      await loadThread(u.id);
      socket.emit("joinRoom", { userA: currentUserId, userB: u.id });
    });
  });
}