const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Login imegonga mwamba 😭";
      return;
    }

    msg.textContent = "Karibu tena 🎉";

    // save logged in user in localStorage
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      age: data.user.age
    }));

    // Optional redirect
    window.location.href = "/home.html";
  } catch (err) {
    console.error(err);
    msg.textContent = "Network imechoka 😅";
  }
});
