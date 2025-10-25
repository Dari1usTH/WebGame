const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

let penColor   = localStorage.getItem('circle_pen_color')   || '#66b3ff';
let bgColor    = localStorage.getItem('circle_bg_color')    || '#0b0e20';
let starsColor = localStorage.getItem('circle_stars_color') || '#ffffff';

let drawing = false;
let points = [];
let score = 0;

// Creează stele random pentru fundal
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  s: Math.random() * 1.5 + 0.5,
  speed: Math.random() * 0.3 + 0.1
}));

function drawStars() {
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = starsColor;
  for (const st of stars) {
    st.x -= st.speed;
    if (st.x < -2) {
      st.x = canvas.width + Math.random() * 40;
      st.y = Math.random() * canvas.height;
    }
    ctx.fillRect(st.x, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1;
}

function reset() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();
  points = [];
  score = 0;
  scoreEl.textContent = 0;
}

function drawLine() {
  if (points.length < 2) return;
  ctx.strokeStyle = penColor;
  ctx.shadowColor = penColor;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function evaluateCircle() {
  if (points.length < 10) return 0;
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  const radii = points.map(p => distance(p, {x: cx, y: cy}));
  const rAvg = radii.reduce((s, r) => s + r, 0) / radii.length;
  const deviation = Math.sqrt(radii.reduce((s, r) => s + (r - rAvg)**2, 0) / radii.length);

  const pct = Math.max(0, 100 - deviation / rAvg * 100);
  return pct.toFixed(1);
}

canvas.addEventListener('mousedown', e => {
  drawing = true;
  points = [{x: e.offsetX, y: e.offsetY}];
});
canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  points.push({x: e.offsetX, y: e.offsetY});
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();
  drawLine();
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  score = evaluateCircle();
  scoreEl.textContent = score;
  showResult();
});

function showResult() {
  const messages = [
    "Aproape perfect! 🎯",
    "Cercul tău e cosmic! 🌕",
    "Nice one! 🔥",
    "Cercul acela are stil! ✨",
    "Bravo, artistule! 🎨"
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e6e9ff';
  ctx.font = '600 26px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`Cercul tău e ${score}% perfect!`, canvas.width/2, canvas.height/2 - 10);
  ctx.font = '400 18px system-ui';
  ctx.fillText(msg, canvas.width/2, canvas.height/2 + 25);
}

restartBtn.addEventListener('click', reset);
reset();
