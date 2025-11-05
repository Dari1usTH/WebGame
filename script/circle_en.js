const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

let penColor = localStorage.getItem('circle_pen_color') || '#7aa2ff';
let bgColor = localStorage.getItem('circle_bg_color') || '#0f1226';
let starsColor = localStorage.getItem('circle_stars_color') || '#ffffff';

let drawing = false;
let points = [];
let score = 0;
let bestScore = parseFloat(localStorage.getItem('circle_best_score') || '0');

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
  document.getElementById('best').textContent = bestScore;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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

function drawLine() {
  if (points.length < 2) return;
  ctx.strokeStyle = penColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

function evaluateCircle() {
  if (points.length < 10) return 0;
  const closed = hasSelfIntersection();
  if (!closed) return 0;

  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  const radii = points.map(p => distance(p, { x: cx, y: cy }));
  const rAvg = radii.reduce((s, r) => s + r, 0) / radii.length;
  const deviation = Math.sqrt(
    radii.reduce((s, r) => s + (r - rAvg) ** 2, 0) / radii.length
  );

  return Math.max(0, 100 - (deviation / rAvg) * 100).toFixed(1);
}

function showConfetti() {
  const particles = Array.from({ length: 100 }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: (Math.random() - 0.5) * 6,
    dy: Math.random() * -4 - 2,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    size: Math.random() * 4 + 2
  }));

  let frame = 0;
  const animate = () => {
    frame++;
    if (frame > 150) return;
    drawStars();
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.1;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    requestAnimationFrame(animate);
  };
  animate();
}

function showResult() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e6e9ff';
  ctx.font = '600 28px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (score <= 0) {
    ctx.fillText('The circle is not closed!', canvas.width / 2, canvas.height / 2);
  } else {
    ctx.fillText(`You drew a ${score}% perfect circle!`, canvas.width / 2, canvas.height / 2);
    if (score >= 80) showConfetti();
  }
}

function showBoundaryWarning() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff6666';
  ctx.font = '600 26px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('You are not allowed to touch the edge!', canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#e6e9ff';
  ctx.font = '500 18px system-ui';
  ctx.fillText('Press Restart to try again', canvas.width / 2, canvas.height / 2 + 35);
}

canvas.addEventListener('mousedown', e => {
  drawing = true;
  points = [{ x: e.offsetX, y: e.offsetY }];
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

  points.push({ x: e.offsetX, y: e.offsetY });
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
  document.getElementById('best').textContent = bestScore;
  showResult();
});

canvas.addEventListener('mouseleave', () => {
  if (drawing) {
    drawing = false;
    showBoundaryWarning();
  }
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

const settingsBtn = document.getElementById('setari');
const settingsPop = document.getElementById('settingsPopover');

if (settingsBtn && settingsPop) {
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = settingsPop.getAttribute('data-open') === 'true';
    settingsPop.setAttribute('data-open', open ? 'false' : 'true');
    settingsBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
    settingsPop.setAttribute('aria-hidden', open ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (settingsPop.getAttribute('data-open') !== 'true') return;
    const clickedInside = settingsPop.contains(e.target) || settingsBtn.contains(e.target);
    if (!clickedInside) {
      settingsPop.setAttribute('data-open', 'false');
      settingsBtn.setAttribute('aria-expanded', 'false');
      settingsPop.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPop.getAttribute('data-open') === 'true') {
      settingsPop.setAttribute('data-open', 'false');
      settingsBtn.setAttribute('aria-expanded', 'false');
      settingsPop.setAttribute('aria-hidden', 'true');
    }
  });
}

const penColorBtn = document.getElementById('penColorBtn');
const bgColorBtn = document.getElementById('bgColorBtn');
const starsColorBtn = document.getElementById('starsColorBtn');

function updateSwatches() {
  const penSwatch = document.getElementById('penSwatch');
  const bgSwatch = document.getElementById('bgSwatch');
  const starsSwatch = document.getElementById('starsSwatch');
  if (penSwatch) penSwatch.style.backgroundColor = penColor;
  if (bgSwatch) bgSwatch.style.backgroundColor = bgColor;
  if (starsSwatch) starsSwatch.style.backgroundColor = starsColor;
}

function openRGBPanel(targetKey, currentColor) {
  if (window.openRGBPanel) {
    openRGBPanel({
      color: currentColor,
      onChange: (newColor) => {
        if (targetKey === 'pen') penColor = newColor;
        if (targetKey === 'bg') bgColor = newColor;
        if (targetKey === 'stars') starsColor = newColor;
        localStorage.setItem(`circle_${targetKey}_color`, newColor);
        updateSwatches();
        reset();
      }
    });
  }
}

if (penColorBtn) {
  penColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openRGBPanel('pen', penColor);
  });
}

if (bgColorBtn) {
  bgColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openRGBPanel('bg', bgColor);
  });
}

if (starsColorBtn) {
  starsColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openRGBPanel('stars', starsColor);
  });
}

updateSwatches();
restartBtn.addEventListener('click', reset);
reset();
