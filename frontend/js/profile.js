const user = JSON.parse(localStorage.getItem("user"));
const form = document.getElementById("profileForm");
const msg = document.getElementById("msg");

// Pre-fill form with localStorage values
document.getElementById("username").value = user.username;
document.getElementById("age").value = user.age;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    username: document.getElementById("username").value.trim(),
    age: Number(document.getElementById("age").value),
    password: document.getElementById("password").value || null
  };

  try {
    const res = await fetch(`/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Profile update failed 😭";
      return;
    }

    msg.textContent = data.msg;

    // Update localStorage copy
    localStorage.setItem("user", JSON.stringify({
      ...user,
      username: body.username || user.username,
      age: body.age || user.age
    }));
    document.getElementById("topbar-user").textContent = user.username;

    form.classList.add("hidden");
  document.getElementById("profile-infos").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    msg.textContent = "Network drama 😭";
  }
  document.getElementById("topbar-user").textContent = body.username || user.username;

});
function edit() {
  form.classList.remove("hidden");
  document.getElementById("profile-infos").classList.add("hidden");
}
window.addEventListener("DOMContentLoaded", async () => {
  let user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    try {
      const res = await fetch(`/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        user = { ...user, ...data }; // merge with localStorage
        localStorage.setItem("user", JSON.stringify(user));

        document.getElementById("topbar-user").textContent = `👋 ${user.username}`;
        document.querySelector(".profile-pic").src = user.profilePic || "images/default-avatar.png";
      }
    } catch (err) {
      console.error("Failed to fetch user on load:", err);
    }
  }
});


const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("/logout", {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Logout failed 😭");
      return;
    }

    // Clear localStorage
    localStorage.removeItem("user");

    // Redirect to login page
    window.location.href = "/login.html";
  } catch (err) {
    console.error(err);
    alert("Network drama 😭");
  }
});

const fileInput = document.getElementById("profilePic");
const preview = document.getElementById("previewPic");

// Live preview
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => preview.src = reader.result;
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("username", document.getElementById("username").value.trim());
  formData.append("age", Number(document.getElementById("age").value));
  if (document.getElementById("password").value) {
    formData.append("password", document.getElementById("password").value);
  }
  if (fileInput.files[0]) {
    formData.append("profilePic", fileInput.files[0]);
  }

  try {
    const res = await fetch(`/users/${user.id}`, {
      method: "PUT",
      body: formData,
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Profile update failed 😭";
      return;
    }

    msg.textContent = data.msg;

    // Update localStorage & UI
    const updatedUser = {
      ...user,
      username: formData.get("username"),
      age: formData.get("age"),
      profilePic: data.profilePicUrl || user.profilePic
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    document.getElementById("topbar-user").textContent = updatedUser.username;
    document.querySelector(".profile-pic").src = updatedUser.profilePic || "images/default-avatar.png";

    form.classList.add("hidden");
    document.getElementById("profile-infos").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    msg.textContent = "Network drama 😭";
  }
});
