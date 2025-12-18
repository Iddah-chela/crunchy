import { startCiscoVibe } from './auth.js';
const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;



form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Login failed. Please check your credentials.";
      return;
    }

    const age = data.user.age;


  
    msg.textContent = "Karibu tena 🎉";

    // save logged in user in localStorage
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      age: data.user.age
    }));

    localStorage.setItem("hasSignedUp", "true");

    //trigger animation
    startCiscoVibe();

    
  } catch (err) {
    console.error(err);
    msg.textContent = "Network error 😅";
  }
});

