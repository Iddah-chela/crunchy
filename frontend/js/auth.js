// auth.js
function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Example: show username in topbar
window.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const topbarUser = document.getElementById("topbar-user");

  if (user && topbarUser) {
    topbarUser.textContent = `👋 ${user.username}`;
  }
});
