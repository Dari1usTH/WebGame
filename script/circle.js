const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

let penColor = localStorage.getItem('circle_pen_color') || '#7aa2ff';
let bgColor  = localStorage.getItem('circle_bg_color') || '#0f1226';
let starsColor = localStorage.getItem('circle_stars_color') || '#ffffff';

let drawing = false;
let points = [];
let score = 0;
let bestScore = parseFloat(localStorage.getItem('circle_best_score')|| '0');

const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  s: Math.random() * 1.5 + 0.5
}));

function drawStars() {
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = starsColor;
  for (const st of stars) {
    st.x -= 0.2;
    if (st.x < -2) { st.x = canvas.width + Math.random() * 40; st.y = Math.random() * canvas.height; }
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
  if (document.getElementById('best')) {
    document.getElementById('best').textContent = bestScore;
  }
}

function drawLine() {
  if (points.length < 2) return;
  ctx.strokeStyle = penColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function linesIntersect(p1, p2, p3, p4) {
  function ccw(a, b, c) {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  }
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
    ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

function hasSelfIntersection() {
  if (points.length < 4) return false;
  for (let i = 0; i < points.length - 3; i++) {
    const a1 = points[i];
    const a2 = points[i + 1];
    for (let j = i + 2; j < points.length - 1; j++) {
      const b1 = points[j];
      const b2 = points[j + 1];
      
      if (Math.abs(i - j) <= 1) continue;
      if (linesIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

function evaluateCircle() {
  if (points.length < 10) return 0;

  const closed = hasSelfIntersection();
  if (!closed) return 0; 

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

  if (
    e.offsetX <= 0 || e.offsetX >= canvas.width ||
    e.offsetY <= 0 || e.offsetY >= canvas.height
  ) {
    drawing = false;
    showBoundaryWarning();
    return;
  }

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
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('circle_best_score', bestScore);
  }
  if (document.getElementById('best')) {
    document.getElementById('best').textContent = bestScore;
  }
  showResult();
});
canvas.addEventListener('mouseleave', e => {
  if (!drawing) return;
  drawing = false;
  showBoundaryWarning();
});
canvas.addEventListener('mouseout', e => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  if (
    e.clientX <= rect.left ||
    e.clientX >= rect.right ||
    e.clientY <= rect.top ||
    e.clientY >= rect.bottom
  ) {
    drawing = false;
    showBoundaryWarning();
  }
});

function showResult() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e6e9ff';
  ctx.font = '600 28px system-ui';
  ctx.textAlign = 'center';

  if (score <= 0) {
    ctx.fillText('Cercul nu este închis!', canvas.width / 2, canvas.height / 2);
  } else {
    ctx.fillText(`Ai desenat un cerc ${score}% perfect!`, canvas.width / 2, canvas.height / 2);
  }
}

function showBoundaryWarning() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff6666';
  ctx.font = '600 26px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Nu ai voie să atingi marginea!', canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#e6e9ff';
  ctx.font = '500 18px system-ui';
  ctx.fillText('Apasă Restart pentru a încerca din nou', canvas.width / 2, canvas.height / 2 + 35);
}
//s
restartBtn.addEventListener('click', reset);
reset();
