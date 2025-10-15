
window.squareColor = window.squareColor || localStorage.getItem('flappy_square_color') || '#E11313';
window.pipesColor  = window.pipesColor  || localStorage.getItem('flappy_pipes_color')  || '#3a9c6b';
window.bgColor     = window.bgColor     || localStorage.getItem('flappy_bg_color')     || '#0f1226';
window.starsColor  = window.starsColor  || localStorage.getItem('flappy_stars_color')  || '#ffffff';

const squareBtn    = document.getElementById('squareColorBtn');
const squareSwatch = document.getElementById('squareSwatch');
const pipesBtn     = document.getElementById('pipesColorBtn');
const pipesSwatch  = document.getElementById('pipesSwatch');
const bgBtn        = document.getElementById('bgColorBtn');
const bgSwatch     = document.getElementById('bgSwatch');
const starsBtn     = document.getElementById('starsColorBtn');
const starsSwatch  = document.getElementById('starsSwatch');

const colorPanel = document.getElementById('colorPanel');
const cpSV  = document.getElementById('cpSV');
const cpHue = document.getElementById('cpHue');
const cpR   = document.getElementById('cpR');
const cpG   = document.getElementById('cpG');
const cpB   = document.getElementById('cpB');
const cpHex = document.getElementById('cpHex');
const cpOk  = document.getElementById('cpOk');

if (squareSwatch) squareSwatch.style.background = squareColor;
if (pipesSwatch)  pipesSwatch.style.background  = pipesColor;
if (bgSwatch)     bgSwatch.style.background     = bgColor;
if (starsSwatch)  starsSwatch.style.background  = starsColor;

let colorTarget = 'square';

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase(); }
function hexToRgb(hex){
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if(!m) return null;
  const n = parseInt(m[1],16);
  return {r:(n>>16)&255, g:(n>>8)&255, b:n&255};
}
function rgbToHsv(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s,v=max;
  const d=max-min; s=max===0?0:d/max;
  if (d===0) h=0;
  else {
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h/=6;
  }
  return {h, s, v};
}
function hsvToRgb(h,s,v){
  let r,g,b; let i=Math.floor(h*6); let f=h*6-i;
  const p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
  switch(i%6){
    case 0: r=v; g=t; b=p; break;
    case 1: r=q; g=v; b=p; break;
    case 2: r=p; g=v; b=t; break;
    case 3: r=p; g=q; b=v; break;
    case 4: r=t; g=p; b=v; break;
    case 5: r=v; g=p; b=q; break;
  }
  return { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255) };
}

let hsv = (()=>{ const rgb = hexToRgb(squareColor) || {r:122,g:162,b:255}; return rgbToHsv(rgb.r, rgb.g, rgb.b); })();
let draggingSV=false, draggingHue=false;

function resizeColorCanvases() {
  const dpr = Math.min(2, Math.round(window.devicePixelRatio || 1));
  const svW = 140, svH = 96, hueW = 12, hueH = 96;

  cpSV.style.width  = svW + 'px';  cpSV.style.height = svH + 'px';
  cpSV.width  = svW * dpr;         cpSV.height = svH * dpr;
  cpSV.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);

  cpHue.style.width = hueW + 'px'; cpHue.style.height = hueH + 'px';
  cpHue.width = hueW * dpr;        cpHue.height = hueH * dpr;
  cpHue.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawHue(){
  const ctx = cpHue.getContext('2d');
  const {width:w, height:h} = cpHue;
  const g = ctx.createLinearGradient(0,0,0,h);
  for(let i=0;i<=360;i+=10) g.addColorStop(i/360, `hsl(${i} 100% 50%)`);
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='white'; ctx.lineWidth=2;
  ctx.strokeRect(0, Math.round(hsv.h*h)-1, w, 2);
}
function drawSV(){
  const ctx = cpSV.getContext('2d');
  const {width:w, height:h} = cpSV;
  ctx.fillStyle = `hsl(${Math.round(hsv.h*360)} 100% 50%)`; ctx.fillRect(0,0,w,h);
  const gW = ctx.createLinearGradient(0,0,w,0); gW.addColorStop(0,'#fff'); gW.addColorStop(1,'#fff0');
  ctx.fillStyle = gW; ctx.fillRect(0,0,w,h);
  const gB = ctx.createLinearGradient(0,0,0,h); gB.addColorStop(0,'#0000'); gB.addColorStop(1,'#000');
  ctx.fillStyle = gB; ctx.fillRect(0,0,w,h);
  const x = hsv.s * w, y = (1-hsv.v) * h;
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.stroke();
}
function updateFieldsFromHSV(){
  const {r,g,b} = hsvToRgb(hsv.h, hsv.s, hsv.v);
  cpR.value=r; cpG.value=g; cpB.value=b;
  cpHex.value = rgbToHex(r,g,b);

  if (colorTarget === 'pipes') {
    if (pipesSwatch)  pipesSwatch.style.background  = cpHex.value;
  } else if (colorTarget === 'bg') {
    if (bgSwatch)     bgSwatch.style.background     = cpHex.value;
  } else if (colorTarget === 'stars') {
    if (starsSwatch)  starsSwatch.style.background  = cpHex.value;
  } else {
    if (squareSwatch) squareSwatch.style.background = cpHex.value;
  }
}

function setPanelFromHex(hex){
  const rgb = hexToRgb(hex) || {r:225,g:19,b:19};
  hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
}

function openColorPanel(target = 'square'){
  colorTarget = target;
  colorPanel.setAttribute('aria-hidden','false');
  if (squareBtn) squareBtn.setAttribute('aria-expanded', target === 'square' ? 'true' : 'false');
  if (pipesBtn)  pipesBtn.setAttribute('aria-expanded',  target === 'pipes'  ? 'true' : 'false');
  if (bgBtn)     bgBtn.setAttribute('aria-expanded',     target === 'bg'     ? 'true' : 'false');
  if (starsBtn)  starsBtn.setAttribute('aria-expanded',  target === 'stars'  ? 'true' : 'false');

  resizeColorCanvases();
  setPanelFromHex(
    target === 'pipes' ? pipesColor :
    target === 'bg'    ? bgColor    :
    target === 'stars' ? starsColor : squareColor
  );
  drawHue(); drawSV(); updateFieldsFromHSV();
}
function closeColorPanel(){
  colorPanel.setAttribute('aria-hidden','true');
  if (squareBtn) squareBtn.setAttribute('aria-expanded','false');
  if (pipesBtn)  pipesBtn.setAttribute('aria-expanded','false');
  if (bgBtn)     bgBtn.setAttribute('aria-expanded','false');
  if (starsBtn)  starsBtn.setAttribute('aria-expanded','false');
}
function toggleColorPanel(target){
  const open = colorPanel.getAttribute('aria-hidden') === 'false';
  if (open && colorTarget === target) closeColorPanel(); else openColorPanel(target);
}

if (squareBtn) squareBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleColorPanel('square'); });
if (pipesBtn)  pipesBtn.addEventListener('click',  (e)=>{ e.stopPropagation(); toggleColorPanel('pipes');  });
if (bgBtn)     bgBtn.addEventListener('click',     (e)=>{ e.stopPropagation(); toggleColorPanel('bg');     });
if (starsBtn)  starsBtn.addEventListener('click',  (e)=>{ e.stopPropagation(); toggleColorPanel('stars');  });

document.addEventListener('click', (e)=>{
  if (colorPanel.getAttribute('aria-hidden') === 'true') return;
  const inside = colorPanel.contains(e.target)
              || (squareBtn && squareBtn.contains(e.target))
              || (pipesBtn  && pipesBtn.contains(e.target))
              || (bgBtn     && bgBtn.contains(e.target))
              || (starsBtn  && starsBtn.contains(e.target));
  if (!inside) closeColorPanel();
});
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && colorPanel.getAttribute('aria-hidden') === 'false') closeColorPanel();
});

cpSV.addEventListener('mousedown', (e)=>{
  draggingSV=true; const r=cpSV.getBoundingClientRect();
  const set=(e2)=>{ hsv.s = clamp((e2.clientX-r.left)/r.width,0,1);
                    hsv.v = clamp(1 - (e2.clientY-r.top)/r.height,0,1);
                    drawSV(); updateFieldsFromHSV(); };
  set(e);
  const mm=(ev)=>set(ev), mu=()=>{draggingSV=false; window.removeEventListener('mousemove',mm); window.removeEventListener('mouseup',mu);};
  window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
});
cpHue.addEventListener('mousedown', (e)=>{
  draggingHue=true; const r=cpHue.getBoundingClientRect();
  const set=(e2)=>{ hsv.h = clamp((e2.clientY-r.top)/r.height,0,1); drawHue(); drawSV(); updateFieldsFromHSV(); };
  set(e);
  const mm=(ev)=>set(ev), mu=()=>{draggingHue=false; window.removeEventListener('mousemove',mm); window.removeEventListener('mouseup',mu);};
  window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
});

function applyRGBFields(){
  const r=clamp(parseInt(cpR.value||'0',10),0,255);
  const g=clamp(parseInt(cpG.value||'0',10),0,255);
  const b=clamp(parseInt(cpB.value||'0',10),0,255);
  hsv = rgbToHsv(r,g,b);
  drawHue(); drawSV(); updateFieldsFromHSV();
}
[cpR,cpG,cpB].forEach(inp=>{
  inp.addEventListener('input', applyRGBFields);
  inp.addEventListener('keydown', e=>{ if(e.key==='Enter') cpOk.click(); });
});
cpHex.addEventListener('input', ()=>{
  const rgb = hexToRgb(cpHex.value);
  if (!rgb) return;
  hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  drawHue(); drawSV(); updateFieldsFromHSV();
});
cpHex.addEventListener('keydown', e=>{ if(e.key==='Enter') cpOk.click(); });

cpOk.addEventListener('click', ()=>{
  const rgb = hexToRgb(cpHex.value) || {r:225,g:19,b:19};
  const hex = rgbToHex(rgb.r,rgb.g,rgb.b);

  if (colorTarget === 'pipes') {
    pipesColor = hex;
    localStorage.setItem('flappy_pipes_color', hex);
    if (pipesSwatch) pipesSwatch.style.background = hex;
  } else if (colorTarget === 'bg') {
    bgColor = hex;
    localStorage.setItem('flappy_bg_color', hex);
    if (bgSwatch) bgSwatch.style.background = hex;
  } else if (colorTarget === 'stars') {
    starsColor = hex;
    localStorage.setItem('flappy_stars_color', hex);
    if (starsSwatch) starsSwatch.style.background = hex;
  } else {
    squareColor = hex;
    localStorage.setItem('flappy_square_color', hex);
    if (squareSwatch) squareSwatch.style.background = hex;
  }
  closeColorPanel();
});
