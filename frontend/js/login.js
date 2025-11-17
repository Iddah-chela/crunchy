import { startCiscoVibe } from './auth.js';
const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


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
      body: JSON.stringify(body),
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Login imegonga mwamba 😭";
      return;
    }

    const age = data.user.birthday ? calculateAge(data.user.birthday) : 10;

    msg.textContent = "Karibu tena 🎉";

    // save logged in user in localStorage
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      age: age
    }));

    localStorage.setItem("hasSignedUp", "true");

    //trigger animation
    startCiscoVibe();

    
  } catch (err) {
    console.error(err);
    msg.textContent = "Network imechoka 😅";
  }
});

