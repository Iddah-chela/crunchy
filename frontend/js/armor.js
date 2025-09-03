
// Add all your JS here
const player = document.getElementById("player");
const armor = document.getElementById("armor");
const game = document.getElementById("game");
const book = document.getElementById("book");
let bookTaken = false;

let posX = 10;
let posY = game.clientHeight - 50;
const speed = 10;

//move player using the buttons. 
let moveInterval;

function move(direction) {
  if (direction === "up") posY -= speed;
  if (direction === "down") posY += speed;
  if (direction === "left") posX -= speed;
  if (direction === "right") posX += speed;

  // Keep player inside game area
  posX = Math.max(0, Math.min(posX, game.clientWidth - 40));
  posY = Math.max(0, Math.min(posY, game.clientHeight - 40));

  player.style.left = posX + "px";
  player.style.top = posY + "px";

}

//allows touch and long press 
function handleTouch(buttonId, direction) {
  const btn = document.getElementById(buttonId);
  
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    move(direction);
    moveInterval = setInterval(() => move(direction), 100);
  });

  btn.addEventListener("touchend", () => {
    clearInterval(moveInterval);
  });

  btn.addEventListener("touchcancel", () => {
    clearInterval(moveInterval);
  });
}

// Attach movement to all 4 buttons
handleTouch("btn-up", "up");
handleTouch("btn-down", "down");
handleTouch("btn-left", "left");
handleTouch("btn-right", "right");

const enemy = document.getElementById("enemy1");
let enemyX = 300;
let enemyY = 100;

function moveEnemyTowardPlayer() {
  // Move enemy a bit toward player
  const dx = posX - enemyX;
  const dy = posY - enemyY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const speed = 1.5;
  if (distance > 1) {
    enemyX += (dx / distance) * speed;
    enemyY += (dy / distance) * speed;
    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
  }

  checkCollision();
  checkArmorPickup();
  checkBookPickup();
  checkNPCInteraction();
  checkNPCProximity();
  requestAnimationFrame(moveEnemyTowardPlayer);
}

moveEnemyTowardPlayer(); // Start enemy loop

let faith = 100;
let trust = 100;
let peace = 100;
let life = 100;
let takingDamage = false;

function checkCollision() {
  const playerRect = player.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();

  const overlap =
    playerRect.left < enemyRect.right &&
    playerRect.right > enemyRect.left &&
    playerRect.top < enemyRect.bottom &&
    playerRect.bottom > enemyRect.top;

  if (overlap && !takingDamage) {
    takeDamage();
  }
}

function takeDamage() {
  if (hasShield) return; // No damage when shield is active
  takingDamage = true;

  // Doubt hits faith
  if (faith > 0) {
    faith -= 10;
    updateBars();
  }

  // If faith is too low, life drains
  if (faith < 50 && life > 0) {
    let drain = setInterval(() => {
      if (life > 0 && faith < 50) {
        life -= 2;
        updateBars();
      } else {
        clearInterval(drain);
      }
    }, 500);
  }

  // Cooldown so damage isn't constant
  setTimeout(() => {
    takingDamage = false;
  }, 1000);
}

function updateBars() {
  document.getElementById("faithFill").style.width = faith + "%";
  document.getElementById("lifeFill").style.width = life + "%";
  document.getElementById("trustFill").style.width = trust + "%";
  document.getElementById("peaceFill").style.width = peace + "%";

  if (life <= 0) {
    alert("You died. Try again.");
    location.reload();
  }
}

let hasShield = false;


function checkArmorPickup() {
  const playerRect = player.getBoundingClientRect();
  const armorRect = armor.getBoundingClientRect();

  const overlap =
    playerRect.left < armorRect.right &&
    playerRect.right > armorRect.left &&
    playerRect.top < armorRect.bottom &&
    playerRect.bottom > armorRect.top;

  if (overlap && !hasShield) {
    equipShield();
  }
}

function equipShield() {
  hasShield = true;
  armor.style.display = "none";
  document.getElementById("infoText").innerText = "🛡️ Shield of Faith equipped! You’re protected.";

  setTimeout(() => {
    hasShield = false;
    document.getElementById("infoText").innerText = "Shield has worn off.";
    setTimeout(spawnArmor, 5000); // Armor reappears after 5 seconds
  }, 5000); // Shield lasts for 5 seconds
}

function spawnArmor() {
  // Put it in a new random spot
  armor.style.left = Math.floor(Math.random() * (game.clientWidth - 40)) + "px";
  armor.style.top = Math.floor(Math.random() * (game.clientHeight - 40)) + "px";
  armor.style.display = "block";
  document.getElementById("infoText").innerText = "Shield of Faith has reappeared!";
}



function checkBookPickup() {
  if (bookTaken) return;

  const playerRect = player.getBoundingClientRect();
  const bookRect = book.getBoundingClientRect();

  const overlap =
    playerRect.left < bookRect.right &&
    playerRect.right > bookRect.left &&
    playerRect.top < bookRect.bottom &&
    playerRect.bottom > bookRect.top;

  if (overlap) {
    bookTaken = true;
    restoreFaith();
  }
}

function restoreFaith() {
  let verse = "📖 'Faith comes by hearing, and hearing by the word of God.' – Romans 10:17";
  document.getElementById("infoText").innerText = verse;

  // Increase faith but not above 100
  faith = Math.min(faith + 30, 100);
  updateBars();

  // Hide the book, bring it back later
  book.style.display = "none";

  setTimeout(() => {
    bookTaken = false;
    spawnBook();
  }, 10000); // Respawns after 10 seconds
}

function spawnBook() {
  book.style.left = Math.floor(Math.random() * (game.clientWidth - 40)) + "px";
  book.style.top = Math.floor(Math.random() * (game.clientHeight - 40)) + "px";
  book.style.display = "block";
}

function isColliding(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();

  return !(
    aRect.top > bRect.bottom ||
    aRect.bottom < bRect.top ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function checkNPCInteraction() {
  const npcFaith = document.getElementById("npc-faith");
  if (npcFaith && isColliding(player, npcFaith)) {
    // Restore stat
    faith += 10;
    life += 5;
    updateBars();
    
    // Remove the NPC or disable it
    npcFaith.style.display = "none";
  } 
}

function checkNPCProximity() {
  const npc = document.getElementById("npc-faith");
  const bubble = document.getElementById("faithBubble");

  if (isColliding(player, npc)) {
    bubble.style.display = "block";
  } else {
    bubble.style.display = "none";
  }
}
