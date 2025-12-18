// Admin authentication check
// This runs before the page fully loads to redirect unauthorized users

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

(async function checkAdminAuth() {
  try {
    window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : "https://holyverse-s5s1.onrender.com");
    
    const user = JSON.parse(localStorage.getItem("user") || "null");
    
    // Hardcoded admin IDs or usernames - update these with your actual admin identifiers
    const ADMIN_IDS = [1, 10]; // User IDs that are admins
    const ADMIN_USERNAMES = ["admin", "supherhero", "iddah"]; // Usernames that are admins
    
    if (!user || !user.id) {
      // Not logged in
      showModal("⛔ You must be logged in as an admin to access this page.");
      window.location.href = "/login.html";
      return;
    }
    
    // Check if user is admin by ID or username
    const isAdmin = ADMIN_IDS.includes(user.id) || 
                    ADMIN_USERNAMES.includes(user.username?.toLowerCase());
    
    if (!isAdmin) {
      showModal("⛔ Access denied. Admin privileges required.");
      window.location.href = "/home.html";
      return;
    }
    
    // Admin verified - page loads normally
    console.log("✅ Admin access granted");
    
  } catch (err) {
    console.error("Admin auth check error:", err);
    showModal("⛔ Authentication error. Redirecting...");
    window.location.href = "/home.html";
  }
})();
