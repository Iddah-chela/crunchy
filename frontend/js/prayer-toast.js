// Prayer toast utility - non-blocking confirmation for prayer actions

function showPrayerToast(message = "🙏 Prayed") {
  const toast = document.getElementById("prayerToast");
  if (!toast) return;
  
  const messageEl = toast.querySelector(".toast-message");
  if (messageEl) {
    messageEl.textContent = message;
  }
  
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Export to global scope
window.showPrayerToast = showPrayerToast;
