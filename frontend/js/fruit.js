/* Fruit Defense - Phaser 3
   - Collect fruits to store them in inventory
   - Press J to throw currently selected fruit at enemies
   - Different fruits have different powers
   - Collect fruit / defeat enemies to fill the Rescue Meter
   - When meter fills you rescue the NPC (win)
   - If too many enemies reach the base, you lose
*/
window.onload = () => {
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 520,
  parent: 'game',
  backgroundColor: '#0b1220',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload(){ 
  // We'll generate textures on create using graphics to avoid external assets
}

function create() {
  const scene = this;

  // --- SETTINGS (tweak these) ---
  const FRUIT_SPAWN_INTERVAL = 1400; // ms
  const ENEMY_SPAWN_INTERVAL = 2000; // ms
  const RESCUE_GOAL = 1000; // rescue meter target
  const MAX_BASE_DAMAGE = 5; // enemies allowed through before losing

  // --- STATE ---
  this.score = 0; // points for defeating enemies
  this.rescueMeter = 0;
  this.baseDamage = 0;
  this.inventory = {}; // fruitId -> count
  this.selectedFruit = null; // selected key
  this.isGameOver = false;
  this.isPaused = false;

  // --- background & ground ---
  drawBackground(scene);

  const ground = this.add.rectangle(450, 480, 900, 80, 0x18303b); // ground block
  this.physics.add.existing(ground, true);

  // --- player ---
  this.player = this.physics.add.sprite(160, 360, null).setSize(36,56).setOffset(0,0);
  this.player.body.setCollideWorldBounds(true);
  this.player.setTint(0x9ad3bc);
  this.player.setBounce(0.05);

  // create a simple player texture
  makeBoxTexture(scene, 'player', 36, 56, 0x2dd4bf, 'YOU');
  this.player.setTexture('player');

  this.physics.add.collider(this.player, ground);

  // --- groups ---
  this.fruits = this.physics.add.group();
  this.enemies = this.physics.add.group();
  this.projectiles = this.physics.add.group();

  // collisions
  this.physics.add.overlap(this.player, this.fruits, pickFruit, null, this);
  this.physics.add.overlap(this.projectiles, this.enemies, hitEnemy, null, this);
  this.physics.add.overlap(this.enemies, ground, enemyHitsBase, null, this);

  // timers
  this.fruitTimer = this.time.addEvent({ delay: FRUIT_SPAWN_INTERVAL, callback: spawnFruit, callbackScope: this, loop: true });
  this.enemyTimer = this.time.addEvent({ delay: ENEMY_SPAWN_INTERVAL, callback: spawnEnemy, callbackScope: this, loop: true });

  // controls
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
  this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

  // UI elements
  this.scoreText = this.add.text(16, 12, 'Score: 0', { fontSize:'18px', fill:'#fff' });
  this.rescueText = this.add.text(740, 12, 'Rescue: 0%', { fontSize:'18px', fill:'#fff' });
  this.baseText = this.add.text(16, 40, 'Base Damage: 0', { fontSize:'14px', fill:'#ffb3b3' });

  // inventory UI
  createInventoryUI(scene);

  // instructions cover for initial hint
  this.time.delayedCall(600, ()=>{ showHint(scene, "Collect fruits and press J to throw them. Different fruits do different effects."); });

  // audio simple beeps
  this.sfx = {
    pickup: createBeep(scene, 500, 0.06),
    throw: createBeep(scene, 750, 0.09),
    hit: createBeep(scene, 320, 0.09),
    win: createBeep(scene, 880, 0.12),
    lose: createBeep(scene, 120, 0.18)
  };

  // initial fruit types (id -> config)
  this.fruitTypes = {
    apple: { color: 0xF87171, power: 1, label:'Apple', desc:'Basic fruit. Small damage.' },
    banana: { color: 0xFBBF24, power: 2, label:'Banana', desc:'Slightly stronger, slides and hits multiple.' },
    grape: { color: 0xA78BFA, power: 3, label:'Grape', desc:'Small area effect on hit.' },
    orange: { color: 0xFB923C, power: 4, label:'Orange', desc:'Strong single-target hit.' }
  };

  // register fruit textures
  for (const [id, conf] of Object.entries(this.fruitTypes)) {
    makeCircleTexture(scene, 'fruit_' + id, 28, conf.color, conf.label[0]);
  }

  // spawn an NPC on the right (visual only)
  this.npcSprite = this.add.container(820, 360);
  const npcBox = scene.add.rectangle(0,0,72,96,0x6ee7b7).setStrokeStyle(2,0x164e63);
  const npcText = scene.add.text(-22,-8,'NPC',{fontSize:'16px',color:'#012'}).setOrigin(0,0);
  this.npcSprite.add([npcBox,npcText]);

  // victory / lose texts
  this.winText = this.add.text(240, 200, 'Rescue Complete!', { fontSize:'40px', fill:'#fff' }).setVisible(false);
  this.loseText = this.add.text(240, 200, 'Base Overrun!', { fontSize:'40px', fill:'#ffbbbb' }).setVisible(false);

  // debug: set selected fruit default
  this.selectedFruit = 'apple';
  updateInventoryUI(scene);
  
  // Pause handling
  this.input.keyboard.on('keydown-P', () => {
    if (scene.isGameOver) return;
    scene.isPaused = !scene.isPaused;
    scene.scene.pause(scene.isPaused ? [''] : []);
    if (scene.isPaused) {
      scene.showCenterMessage("Paused — press P to resume");
      scene.fruitTimer.paused = true;
      scene.enemyTimer.paused = true;
    } else {
      scene.hideCenterMessage();
      scene.fruitTimer.paused = false;
      scene.enemyTimer.paused = false;
    }
  });

  // show controls helper
  this.centerMsg = this.add.text(450, 260, '', { fontSize:'22px', fill:'#fff' }).setOrigin(0.5).setDepth(50).setVisible(false);

  // helper methods
  function spawnFruit() {
    if (scene.isGameOver || scene.isPaused) return;
    const keys = Object.keys(scene.fruitTypes);
    const id = Phaser.Utils.Array.GetRandom(keys);
    const x = Phaser.Math.Between(280, 820);
    const y = Phaser.Math.Between(120, 280);
    const f = scene.fruits.create(x, y, 'fruit_' + id);
    f.setData('type', id);
    f.setBounce(0.6);
    f.setCollideWorldBounds(true);
    scene.tweens.add({ targets: f, y: y-8, yoyo:true, repeat:-1, duration:1000, ease:'Sine.easeInOut' });
  }

  function spawnEnemy() {
    if (scene.isGameOver || scene.isPaused) return;
    const x = 900, y = 380;
    const g = scene.add.graphics();
    g.fillStyle(0xef4444, 1).fillEllipse(0,0,44,56);
    const textureKey = 'e_'+Phaser.Math.RND.uuid();
    g.generateTexture(textureKey, 44, 56);
    g.destroy();
    const e = scene.enemies.create(x, y-28, textureKey);
    e.setVelocityX(-110 - Phaser.Math.Between(0,50));
    e.setData('hp', 6 + Phaser.Math.Between(0,6));
    e.setData('maxhp', e.getData('hp'));
  }

  function pickFruit(player, fruit) {
    // add to inventory
    const type = fruit.getData('type');
    scene.inventory[type] = (scene.inventory[type] || 0) + 1;
    fruit.destroy();
    scene.sfx.pickup.play();
    updateInventoryUI(scene);
    // small rescue bump for collecting
    scene.changeRescueMeter(12);
  }

  function hitEnemy(projectile, enemy) {
    const power = projectile.getData('power') || 1;
    // damage
    const hp = enemy.getData('hp') - power;
    enemy.setData('hp', hp);
    projectile.destroy();
    scene.sfx.hit.play();

    // small explosion effect
    const eX = enemy.x, eY = enemy.y;
    const p = scene.add.particles();
    const part = p.createEmitter({
      x: eX, y: eY, lifespan: 300, speed: { min: 50, max: 150 }, scale: { start: 0.4, end: 0 },
      tint: 0xffffcc, quantity: 6
    });
    scene.time.delayedCall(220, ()=>{ p.destroy(); });

    if (hp <= 0) {
      enemy.destroy();
      scene.score += 10;
      scene.sfx.throw.play();
      scene.scoreText.setText('Score: ' + scene.score);
      // reward rescue meter
      scene.changeRescueMeter(35);
    }
  }

  function enemyHitsBase(enemy, ground) {
    // enemy reached base (ground), count as damage and destroy
    enemy.destroy();
    scene.baseDamage++;
    scene.baseText.setText('Base Damage: ' + scene.baseDamage);
    scene.changeRescueMeter(-70);
    if (scene.baseDamage >= MAX_BASE_DAMAGE) {
      scene.gameOver(false);
    }
  }

  // methods on scene
  this.spawnProjectile = function(type) {
    if (!type) return;
    if (!this.inventory[type] || this.inventory[type] <= 0) {
      this.showCenterMessage("No " + this.fruitTypes[type].label + "s left!");
      return;
    }
    // consume
    this.inventory[type]--;
    updateInventoryUI(this);

    // generate a projectile
    const x = this.player.x + 28;
    const y = this.player.y - 6;
    const key = 'fruit_' + type;
    const proj = this.projectiles.create(x, y, key);
    proj.setScale(0.6);
    proj.setData('power', this.fruitTypes[type].power);
    proj.body.setAllowGravity(false);
    proj.setVelocityX(420);
    // slight wobble
    this.tweens.add({ targets: proj, y: proj.y - 12, duration: 230, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    this.sfx.throw.play();
  };

  this.changeRescueMeter = function(delta) {
    if (this.isGameOver) return;
    this.rescueMeter = Phaser.Math.Clamp(this.rescueMeter + delta, 0, RESCUE_GOAL);
    const pct = Math.floor((this.rescueMeter / RESCUE_GOAL) * 100);
    this.rescueText.setText('Rescue: ' + pct + '%');
    // update NPC tint or scale
    const scale = 0.9 + (this.rescueMeter / RESCUE_GOAL) * 0.5;
    this.npcSprite.setScale(scale);
    if (this.rescueMeter >= RESCUE_GOAL) {
      this.gameOver(true);
    }
  };

  this.gameOver = function(victory) {
    this.isGameOver = true;
    if (victory) {
      this.winText.setVisible(true);
      this.sfx.win.play();
    } else {
      this.loseText.setVisible(true);
      this.sfx.lose.play();
    }
    // stop timers
    this.fruitTimer.remove(false);
    this.enemyTimer.remove(false);
    // freeze physics for clarity
    this.physics.pause();
    // show restart button
    showRestart(scene);
  };

  this.showCenterMessage = function(text, ms=900) {
    this.centerMsg.setText(text).setVisible(true);
    if (this._centerMsgTimer) this._centerMsgTimer.remove(false);
    this._centerMsgTimer = this.time.delayedCall(ms, ()=>{ this.centerMsg.setVisible(false); });
  };

  this.hideCenterMessage = function(){ this.centerMsg.setVisible(false); };

  // Input to switch selected fruit via number keys 1..4
  this.input.keyboard.on('keydown', function(event) {
    if (scene.isGameOver) return;
    const key = event.key;
    if (key === '1') { scene.selectedFruit = 'apple'; updateInventoryUI(scene); }
    if (key === '2') { scene.selectedFruit = 'banana'; updateInventoryUI(scene); }
    if (key === '3') { scene.selectedFruit = 'grape'; updateInventoryUI(scene); }
    if (key === '4') { scene.selectedFruit = 'orange'; updateInventoryUI(scene); }
    // J = throw, K = special (throw all of type)
    if (key.toLowerCase() === 'j') {
      scene.spawnProjectile(scene.selectedFruit);
    }
    if (key.toLowerCase() === 'k') {
      // throw all of selected fruit in quick succession
      const count = (scene.inventory[scene.selectedFruit]||0);
      for (let i=0;i<count;i++){
        scene.time.delayedCall(i*120, ()=>scene.spawnProjectile(scene.selectedFruit));
      }
    }
  });

} // end create

function update() {
  const scene = this;
  if (scene.isGameOver || scene.isPaused) return;

  // simple player left/right movement
  const left = scene.cursors.left.isDown || scene.keyA.isDown;
  const right = scene.cursors.right.isDown || scene.keyD.isDown;
  if (left) {
    scene.player.setVelocityX(-180);
  } else if (right) {
    scene.player.setVelocityX(180);
  } else {
    scene.player.setVelocityX(0);
  }
  // jump
  if ((scene.cursors.up.isDown || scene.keyJ.isDown || scene.cursors.space.isDown) && scene.player.body.onFloor()) {
    // space was reserved for jump, but we used J for throw; allow SPACE
    scene.player.setVelocityY(-420);
  }

  // remove off-screen projectiles and enemies
  scene.projectiles.getChildren().forEach(p => { if (p.x > 980) p.destroy(); });
  scene.enemies.getChildren().forEach(e => { if (e.x < -50) { e.destroy(); } });

}

// ----------------- Utility helpers -----------------

function makeCircleTexture(scene, key, size, color, letter) {
  const g = scene.add.graphics({ x:0,y:0, add:false });
  g.fillStyle(color,1).fillCircle(size/2, size/2, size/2);
  // inner highlight
  g.fillStyle(0xffffff,0.12).fillCircle(size/2 - 6, size/2 - 8, size/5);
  if (letter) {
    const rt = scene.add.renderTexture(0,0,size,size).setVisible(false);
    rt.draw(g);
    const txt = scene.add.text(size/2, size/2, letter, { fontSize: size/2.2, color: '#012' }).setOrigin(0.5);
    rt.draw(txt);
    rt.saveTexture(key);
    txt.destroy();
    rt.destroy();
  } else {
    g.generateTexture(key, size, size);
  }
  g.destroy();
}

function makeBoxTexture(scene, key, w, h, color, label) {
  const g = scene.add.graphics({x:0,y:0, add:false});
  g.fillStyle(color,1).fillRoundedRect(0,0,w,h,8);
  g.lineStyle(2, 0x012, 1).strokeRoundedRect(0,0,w,h,8);
  if (label) {
    const txt = scene.add.text(w/2, h/2, label, { fontSize: 14, color:'#011' }).setOrigin(0.5);
    const rt = scene.add.renderTexture(0,0,w,h).setVisible(false);
    rt.draw(g);
    rt.draw(txt);
    rt.saveTexture(key);
    txt.destroy();
    rt.destroy();
  } else {
    g.generateTexture(key, w, h);
  }
  g.destroy();
}

function drawBackground(scene) {
  // gradient-ish sky
  const bg = scene.add.graphics();
  const grd = bg.createLinearGradient(0,0,0,480);
  // Phaser graphics doesn't support canvas gradient API conveniently here; do layered rectangles
  for (let i=0;i<8;i++){
    const col = Phaser.Display.Color.Interpolate.ColorWithColor(
      new Phaser.Display.Color(6,10,22),
      new Phaser.Display.Color(7+20*i,30+8*i,40+12*i),
      8, i
    );
    const hex = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
    bg.fillStyle(hex, 1).fillRect(0, i*60, 900, 60);
  }
  // distant hills
  bg.fillStyle(0x123a2b, 1).fillRoundedRect(-40, 320, 1000, 140, 60);
  bg.fillStyle(0x175b47, 1).fillEllipse(150, 340, 220, 120);
  bg.fillStyle(0x144f3f, 1).fillEllipse(480, 330, 260, 110);
  bg.fillStyle(0x123a2b, 1).fillEllipse(780, 350, 200, 90);
  bg.setDepth(-2);
}

// inventory UI creation
function createInventoryUI(scene) {
  const keys = Object.keys(scene.fruitTypes);
  const panel = scene.add.container(520, 10);
  let x = 0;
  keys.forEach((k, idx) => {
    const cfg = scene.fruitTypes[k];
    // slot background
    const slot = scene.add.rectangle(x + 36, 28, 72, 54, 0x02111b, 0.6).setStrokeStyle(2, 0x18424b);
    const icon = scene.add.image(x + 36, 28, 'fruit_' + k).setScale(0.75);
    const countText = scene.add.text(x + 56, 48, '0', { fontSize:'14px', color:'#fff' }).setOrigin(1,1);
    const label = scene.add.text(x + 12, 44, (idx+1)+'. '+cfg.label, { fontSize:'12px', color:'#fff' }).setOrigin(0,1);
    panel.add([slot, icon, label, countText]);
    // attach for updating
    scene.fruitTypes[k].uiCount = countText;
    x += 88;
  });
  // selected hint
  scene.selText = scene.add.text(520, 70, 'Selected: 1', { fontSize:'13px', color:'#cfe8e1' }).setOrigin(0);
}

// update inventory UI helper
function updateInventoryUI(scene) {
  for (const [id, conf] of Object.entries(scene.fruitTypes)) {
    const count = scene.inventory[id] || 0;
    conf.uiCount.setText(String(count));
  }
  const mapping = { apple:1, banana:2, grape:3, orange:4 };
  scene.selText.setText('Selected: ' + (mapping[scene.selectedFruit] || '?') + ' (' + (scene.fruitTypes[scene.selectedFruit]?.label||'') + ')');
}

// show restart
function showRestart(scene) {
  const btn = scene.add.text(420, 280, 'Restart', { fontSize:'20px', backgroundColor:'#fff', color:'#012', padding:{x:10,y:6} }).setOrigin(0.5).setInteractive();
  btn.on('pointerdown', ()=>{ location.reload(); });
}

// small center hint
function showHint(scene, text) {
  const t = scene.add.text(450, 200, text, { fontSize:'18px', fill:'#fff', backgroundColor:'rgba(0,0,0,0.45)', padding:{x:10,y:8} }).setOrigin(0.5);
  scene.time.delayedCall(2200, ()=>t.destroy());
}

// simple beep sound generator
function createBeep(scene, freq=440, dur=0.08) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return {
      play: function() {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = 0.06;
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        setTimeout(()=>{ o.stop(); }, dur*1000);
      }
    };
  } catch (e) {
    return { play: ()=>{} };
  }
}
  
}