const canvas = document.getElementById('streaks');
const ctx = canvas.getContext('2d');
let w,h,particles = [];

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  particles = [];
  for (let i = 0; i<200; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 0.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 1.5,
    });
  }
}
window.addEventListener('resize', resize);
resize();

function animate() {
  ctx.fillStyle = 'rgba(0,5,15,0.25)';
  ctx.fillRect(0,0,w,h);
  const cx = w/2, cy= h/2;
  for (let p of particles) {
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pull = Math.min(3/Math.max(dist, 50), 0.08);
    const angleBend = Math.sin(dist/50) * 0.28;

    //wrap the path slightly as it approaches center 
    const dir = Math.atan2(dy,dx) + angleBend;
    p.x += Math.cos(dir) * p.speed * (1 + pull);
    p.y += Math.sin(dir) * p.speed * (1 + pull);
    p.size *= 0.992;

    ctx.fillStyle = `rgba(80,150,255,${0.6 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (dist < 10 || p.size < 0.1) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.size = 1 + Math.random() * 1.5;
    }
  }
  requestAnimationFrame(animate);
}
animate();

// lens shimmer
const lensCanvas = document.getElementById('lens');
const lctx = lensCanvas.getContext('2d');
lensCanvas.width = window.innerWidth;
lensCanvas.height = window.innerHeight;
let t = 0;
function lensEffect() {
  lctx.clearRect(0,0,lensCanvas.width, lensCanvas.height);
  const cx = lensCanvas.width / 2;
  const cy = lensCanvas.height / 2;
  const gradient = lctx.createRadialGradient(cx,cy,50,cx,cy,400);
  gradient.addColorStop(0, 'rgba(90,160,255,0.25)');
  gradient.addColorStop(0.3, 'rgba(0,0,0,0)');
  lctx.fillStyle = gradient;
  lctx.save();
  lctx.translate(cx,cy);
  lctx.rotate(Math.sin(t/40) * 0.2);
  lctx.scale(1 + Math.sin(t/25) * 0.05, 1 + Math.cos(t/25)* 0.05);
  lctx.translate(-cx, -cy);
  lctx.fillRect(0,0,lensCanvas.width, lensCanvas.height);
  lctx.restore();
  t++;
  requestAnimationFrame(lensEffect);
}
lensEffect();

//login interaction
document.addEventListener("DOMContentLoaded", () => {
const portal = document.getElementById('portal');
const btn = document.getElementById('auth-btn');
const sign = document.getElementById('sign')
const home = document.getElementById('home');
const inputs = document.querySelectorAll('input');

inputs.forEach( i => {
  i.addEventListener('focus', () => portal.classList.add('glow'));
  i.addEventListener('blur', () => portal.classList.remove('blur'));
});

});

export function startCiscoVibe() {
  portal.classList.add('expand');
  document.body.classList.add('engage');

  //phase 1: stretch streaks
  canvas.classList.add('warp-start');

  //phase 2: go through portal
  setTimeout(() => {
    portal.classList.add('warp');
  }, 800);

  setTimeout(() => home.classList.add("visible"), 1000);

  //phase 3: fade to black
  setTimeout(() => {
    document.body.classList.add('fade-black');
  }, 2000);

  //phase 4: redirect
  setTimeout(() => {
    window.location.href = "home.html";
  }, 3000);
}

