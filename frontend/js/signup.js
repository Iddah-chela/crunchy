import { startCiscoVibe } from './auth.js';

// Hii script ndio inabonga na backend
const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const birthdayInput = document.getElementById("birthday").value;
const birthDate = new Date(birthdayInput);
const today = new Date();

let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

  const body = {
    username: document.getElementById("username").value.trim(),
    age,
    password: document.getElementById("password").value
  };

  // hygiene kidogo
  if (!body.username || !body.age || !body.password) {
    msg.textContent = "Ebu jaza boxes zote 😒";
    return;
  }

  try {
    const res = await fetch("/signup", { // same origin, no full URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include" // muhimu kwa sessions
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Signup imekwama 🤕";
      return;
    }

    msg.textContent = "Account imeundwa safi 🎉";

    // Hapa tunahifadhi “logged-in-ish” state (temporary)
    // NB: leo hatuna tokens; tutaweka baadaye. Sasa hivi ni demo tu.
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      age: data.user.age
      // password haipaswi kuhifadhiwa hapa IRL, lakini tuta-fix tukianza auth proper
    }));
    localStorage.setItem("hasSignedUp", "true");

    // play animation
    startCiscoVibe();
    
  } catch (err) {
    console.error(err);
    msg.textContent = "Network drama 😭";
  }
});
