import { startCiscoVibe } from './auth.js';
window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;


// Hii script ndio inabonga na backend
const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const birthdayInput = document.getElementById("birthday").value;

  const body = {
    username: document.getElementById("username").value.trim(),
    birthday: birthdayInput,
    password: document.getElementById("password").value
  };

  // hygiene kidogo
  if (!body.username || !body.birthday || !body.password) {
    msg.textContent = "Fill all fields";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signup`, { // same origin, no full URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include" // muhimu kwa sessions
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Signup failed.";
      return;
    }

    msg.textContent = "Signup successful! 🎉";

    // Hapa tunahifadhi “logged-in-ish” state (temporary)
    // NB: leo hatuna tokens; tutaweka baadaye. Sasa hivi ni demo tu.
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      age: data.user.age
      // password haifai kuhifadhiwa hapa IRL, lakini tuta-fix tukianza auth proper
    }));
    localStorage.setItem("hasSignedUp", "true");

    // play animation
    startCiscoVibe();
    
  } catch (err) {
    console.error(err);
    msg.textContent = "Network error.";
  }
});
