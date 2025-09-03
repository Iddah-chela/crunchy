document.addEventListener("DOMContentLoaded", () => {
  const chatListView = document.getElementById("chat-list-view");
  const chatView = document.getElementById("chat-view");
  const backBtn = document.getElementById("backBtn");
  const chatUsername = document.getElementById("chat-username");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chatInput");
  const chatForm = document.getElementById("chat-input-area");

  // Open chat view on card click
  document.querySelectorAll(".chat-card").forEach(card => {
    card.addEventListener("click", () => {
      chatListView.style.display = "none";
      chatView.style.display = "flex";

      // Set username dynamically
      chatUsername.textContent = "Chat with " + card.querySelector(".chat-user").textContent;
    });
  });

  // Back button
  backBtn.addEventListener("click", () => {
    chatView.style.display = "none";
    chatListView.style.display = "block";
  });

  // Send message
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const msg = document.createElement("div");
    msg.className = "bubble you";
    msg.textContent = text;
    chatMessages.appendChild(msg);

    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});
