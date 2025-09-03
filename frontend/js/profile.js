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
    form.classList.add("hidden");
  document.getElementById("profile-infos").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    msg.textContent = "Network drama 😭";
  }
});
function edit() {
  form.classList.remove("hidden");
  document.getElementById("profile-infos").classList.add("hidden");
}
