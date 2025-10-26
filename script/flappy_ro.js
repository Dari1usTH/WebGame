const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const levelEl = document.getElementById('level');
const restartBtn = document.getElementById('restart');
window.squareColor = localStorage.getItem('flappy_square_color') || '#7aa2ff';
window.pipesColor  = localStorage.getItem('flappy_pipes_color')  || '#3a9c6b';
window.bgColor     = localStorage.getItem('flappy_bg_color')     || '#0f1226';
window.starsColor  = localStorage.getItem('flappy_stars_color')  || '#ffffff';

function resizeForDPR() {
  const ratio = Math.max(1, Math.min(2, Math.floor(window.devicePixelRatio || 1)));
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  canvas.width  = Math.round(cssW * ratio);
  canvas.height = Math.round(cssH * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
resizeForDPR();
addEventListener('resize', resizeForDPR);

const G = 0.45;
const FLAP = -7.6;
const PIPE_GAP_MIN = 120;
const PIPE_GAP_MAX = 170;
const PIPE_W = 54;
const PIPE_SPACING = 210;
const BASE_SPEED = 2.6;

let state, player, pipes, score, best = Number(localStorage.getItem('flappy_best') || 0);
bestEl.textContent = best;
if (levelEl) levelEl.textContent = computeLevelFromScore(best);

function computeLevelFromScore(s) {
  if (s > 20) return 'Incredibil';
  if (s > 12) return 'Dificil';
  if (s > 5) return 'Medium';
  return 'Ușor';
}

function reset() {
  state = { running: false, gameOver: false, t: 0, paused: false, startAt: 0, freezeMs: 300 };
  player = { x: 120, y: canvas.height / 2, w: 26, h: 26, vy: 0, rot: 0 };
  pipes = [];
  score = 0;
  scoreEl.textContent = score;

  crash.show = false;

  let x = 360;
  while ( x < canvas.width + 4 * PIPE_SPACING ) {
    addPipe(x);
    x += PIPE_SPACING;
  }
}

function getSpeedByScore (score) {
  if (score < 5) return BASE_SPEED * 0.85;
  
  const tier = Math.floor((Math.min(score, 19) -5) / 5) + 1;
  let speed = BASE_SPEED * (1 + tier * 0.12);

  if (score >= 20) {
    const extraTiers = Math.floor((score - 20) / 5) + 1;
    speed *= (1 + extraTiers * 0.08);
  }

  return Math.min(speed, BASE_SPEED * 3.2);
}

function clamp(v, a, b) {return Math.max(a, Math.min(b, v)); }
function setCrashAt(x, y) { crash.x = x; crash.y = y; crash.show = true; }

function addPipe(x) {
  const gap = rand(PIPE_GAP_MIN, PIPE_GAP_MAX);
  const topH = rand(40, canvas.height - gap - 80);
  const sway = {
    phase: Math.random() * Math.PI * 2,
    ampl: rand(3,7)
  }
  pipes.push({ x, w: PIPE_W, topH, gapH: gap, passed: false, sway });
}

function pipeTopWithSway(p) {
  if (score < 20) return p.topH;

  const yOff = Math.sin((state.t * 0.006) + p.sway.phase) * p.sway.ampl;
  const minTop = 20;
  const maxTop = canvas.height - p.gapH - 40;
  return clamp(p.topH + yOff, minTop, maxTop);
}

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function flap() {
  if (state.gameOver) { reset(); state.running = true; state.startAt = state.t; startMusic(); return; }
  if (!state.running) { state.running = true; state.startAt = state.t; startMusic(); }
  if (state.paused) return;
  player.vy = FLAP;
}

addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); flap(); }
  if (e.key === 'p' || e.key === 'P') { 
    if(!state?.running || state?.gameOver) return;

    state.paused = !state.paused; 
    if (state.paused) stopMusic();
    else if (state.running) startMusic();
  }
  if (e.key === 'r' || e.key === 'R') { reset(); stopMusic(); return; }
});
canvas.addEventListener('pointerdown', (e) => {
  if (state?.paused) {
    state.paused = false;
    if (state.running) startMusic();
    return;
  }
  if (!state.running && !state.gameOver) {
    state.running = true;
    state.startAt = state.t; 
    startMusic();
    return;
  }
  flap();
});
restartBtn.addEventListener('click', () => { 
  reset();
  stopMusic(); 
});

let last = performance.now();
function loop(now) {
  const dt = Math.min(32, now - last); last = now; state.t += dt;
  update(dt / 16.67);
  draw();
  requestAnimationFrame(loop);
}

function update(ut) {
  if (!state.running || state.paused) return;

  const dt = ut;
  const elapsed = state.t - (state.startAt || 0);
  const freezeMs = state.freezeMs || 0;
  const frozen = elapsed < freezeMs;

  if (!frozen) {
    player.vy += G * dt;
    player.y  += player.vy * dt * 1.1;
    player.rot = Math.max(-0.5, Math.min(1.2, player.vy / 12));
  } else {
    player.vy  = 0;
    player.rot = 0;
  }

  const floor = canvas.height - 32;
  const ceil  = 16;

  if (player.y + player.h / 2 > floor) {
    player.y = floor - player.h / 2;
    setCrashAt(player.x, floor);
    die();
    return;
  }

  if (player.y - player.h / 2 < ceil) {
    player.y = ceil + player.h / 2;
    setCrashAt(player.x, ceil);
    die();
    return;
  }

  const curSpeed = getSpeedByScore(score);

  for (const p of pipes) p.x -= curSpeed * dt;
  while (pipes.length && pipes[0].x + PIPE_W < -80) pipes.shift();

  const FRONT_BUFFER_PIPES = 3;
  let lastPipe = pipes[pipes.length - 1];
  if (!lastPipe) {
    addPipe(canvas.width + 120);
    lastPipe = pipes[pipes.length - 1];
  }
  while (lastPipe.x < canvas.width + FRONT_BUFFER_PIPES * PIPE_SPACING) {
    addPipe(lastPipe.x + PIPE_SPACING);
    lastPipe = pipes[pipes.length - 1];
  }

  for (const p of pipes) {
    if (!p.passed && player.x > p.x + p.w) {
      p.passed = true;
      score++;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem('flappy_best', best);
        if (levelEl) levelEl.textContent = computeLevelFromScore(best);
      }
    }

    const topEff = pipeTopWithSway(p);
    const withinX = player.x + player.w / 2 > p.x && player.x - player.w / 2 < p.x + p.w;
    const topBottom = player.y - player.h / 2 < topEff || player.y + player.h / 2 > topEff + p.gapH;
    if (!(withinX && topBottom)) continue;

    const pxL = player.x - player.w / 2;
    const pxR = player.x + player.w / 2;
    const pyT = player.y - player.h / 2;
    const pyB = player.y + player.h / 2;

    const pipeL = p.x;
    const pipeR = p.x + p.w;
    const gapT  = topEff;
    const gapB  = topEff + p.gapH;

    const hitTop    = pyT < gapT;
    const hitBottom = pyB > gapB;

    const penLeft   = pxR - pipeL;
    const penRight  = pipeR - pxL;
    const penTop    = gapT - pyT;
    const penBottom = pyB - gapB;

    let side = 'left';
    let minPen = penLeft;
    if (penRight < minPen) { side = 'right';  minPen = penRight; }
    if (hitTop && penTop < minPen) { side = 'top';    minPen = penTop; }
    if (hitBottom && penBottom < minPen) { side = 'bottom'; minPen = penBottom; }

    const floorY = canvas.height - 28;
    let colSpanMinY, colSpanMaxY;
    if (hitTop) {
      colSpanMinY = 0;
      colSpanMaxY = gapT;
    } else if (hitBottom) {
      colSpanMinY = gapB;
      colSpanMaxY = floorY;
    } else {
      colSpanMinY = 0;
      colSpanMaxY = floorY;
    }
    if (side === 'left') {
      setCrashAt(pipeL, clamp(player.y, colSpanMinY, colSpanMaxY));
    } else if (side === 'right') {
      setCrashAt(pipeR, clamp(player.y, colSpanMinY, colSpanMaxY));
    } else if (side === 'top') {
      setCrashAt(clamp(player.x, pipeL, pipeR), gapT);
    } else {
      setCrashAt(clamp(player.x, pipeL, pipeR), gapB);
    }

    die();
    return;
  }
}


function die() {
  state.gameOver = true;
  state.running = false;
  stopMusic();

  if(audioOn) {
    try {
      gameOverSound.currentTime = 0;
      gameOverSound.play().catch(() => {});
    }
    catch (e) {
    }
  }
}

function draw() {
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  const bg = (typeof bgColor === 'string' && bgColor) ? bgColor : '#0f1226';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawStars();

  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#1b1f47';
  ctx.fillRect(0, h - 28, w, 28);
  ctx.globalAlpha = 1;
  for (const p of pipes) drawPipe(p);
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.rot);
  roundedRect(ctx, -player.w / 2, -player.h / 2, player.w, player.h, 6, squareColor);
  ctx.fillStyle = '#0f1226';
  ctx.beginPath();
  ctx.arc(6, -4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(230,233,255,.9)';
  ctx.font = '600 20px system-ui, -apple-system, Segoe UI, Roboto';
  if (!state.running && !state.gameOver) drawCenterText('Apasă Space / Click pentru a începe');
  if (state.paused) drawCenterText('Pauză');
  if (state.gameOver) drawCenterText('Joc terminat! Click pentru a reîncepe');
  if (crash.show && boomImg.complete && boomImg.naturalWidth) {
    const size = 25;
    ctx.drawImage(boomImg, crash.x - size/2, crash.y - size/2, size, size);
  }
}

function drawCenterText(t) {
  const x = canvas.width / 2, y = canvas.height / 2;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  ctx.lineWidth = 3; 
  ctx.strokeStyle = '#000';
  ctx.strokeText(t, x, y);

  ctx.fillStyle = 'rgba(230,233,255,.9)';
  ctx.fillText(t, x, y);
}

function drawPipe(p) {
  const x = p.x, w = p.w, h = canvas.height;
  const topH = pipeTopWithSway(p);   
  const gapH = p.gapH;
  const c = pipesColor;

  ctx.fillStyle = c;
  roundedRect(ctx, x, 0, w, topH, 6, c);
  roundedRect(ctx, x, topH + gapH, w, h - (topH + gapH) - 28, 6, c);

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(x + 4, 6, 4, topH - 12);
  ctx.fillRect(x + 4, topH + gapH + 6, 4, h - (topH + gapH) - 34);
}


function roundedRect(ctx, x, y, w, h, r, fillStyle) {
  ctx.fillStyle = fillStyle;
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.fill();
}

const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  s: Math.random() * 1.5 + 0.5
}));
function drawStars() {
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = starsColor;
  const curSpeed = getSpeedByScore(score);
  for (const st of stars) {
    st.x -= curSpeed * 0.2;
    if (st.x < -2) { st.x = canvas.width + Math.random() * 40; st.y = Math.random() * canvas.height; }
    ctx.fillRect(st.x, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1;
}

const BOOM_SRC = '../images/flappy_explosion.png';
const boomImg = new Image();
boomImg.src = BOOM_SRC;
boomImg.decoding = 'async';
let crash = { x: 0, y: 0, show: false };

const AUDIO_URL = '../sounds/flappy/flappy_dnb_loop.wav';
let audio = new Audio(AUDIO_URL);
audio.loop = true;
audio.volume = 0.25;

const GAME_OVER_SRC = '../sounds/flappy/flappy_lose.wav';
const gameOverSound = new Audio(GAME_OVER_SRC);
gameOverSound.preload = 'auto';
gameOverSound.volume = 0.5;
gameOverSound.load();

function unlockAudioOnce () {
  const tmp = new Audio(GAME_OVER_SRC);
  tmp.muted = true;
  tmp.play().finally(() => {});

  window.removeEventListener('pointerdown', unlockAudioOnce);
  window.removeEventListener('keydown', unlockAudioOnce);
}
window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
window.addEventListener('keydown', unlockAudioOnce, { once: true });

let audioOn = (localStorage.getItem('flappy_audio') ?? 'on') === 'on';

const settingsBtn = document.getElementById('setari');
const settingsPop = document.getElementById('settingsPopover');
const audioToggle = document.getElementById('audioToggle');

if (audioToggle) audioToggle.dataset.state = audioOn ? 'on' : 'off';

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

  const colorPanelEl = document.getElementById('colorPanel');
  document.addEventListener('keydown', (e) => {
    if(e.key !== 'Backspace') return;

    const rgbOpen = colorPanelEl && colorPanelEl.getAttribute('aria-hidden') === 'false';
    if(rgbOpen) return;

    const ae = document.activeElement;
    const typing = ae && ( ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
    if (typing) return;

    if (settingsPop.getAttribute('data-open') === 'true') {
      settingsPop.setAttribute('data-open', 'false');
      settingsPop.setAttribute('aria-expanded', 'false');
      settingsPop.setAttribute('aria-hidden', 'true');
      e.preventDefault();
    }
  })
}

if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    audioOn = !audioOn;
    audioToggle.dataset.state = audioOn ? 'on' : 'off';
    localStorage.setItem('flappy_audio', audioOn ? 'on' : 'off');
    if (!audioOn) { try { audio.pause(); } catch(e) {} }
    else if (state?.running && !state?.paused) { try { audio.currentTime = 0; audio.play(); } catch(e){} }
  });
}

function startMusic() {
  if (!audioOn) return;
  try { audio.currentTime = 0; audio.play(); } catch(e){}
}
function stopMusic() {
  try { audio.pause(); } catch(e){}
}

reset();
requestAnimationFrame(loop);
