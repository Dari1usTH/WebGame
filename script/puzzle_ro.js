
(() => {
  const puzzleEl = document.getElementById('puzzle');
  const levelSelect = document.getElementById('levelSelect');
  const imageSelect = document.getElementById('imageSelect');
  const resetBtn = document.getElementById('resetBtn');
  const movesEl = document.getElementById('moves');
  const timerEl = document.getElementById('timer');
  const settingsBtn = document.getElementById('setari');
  const settingsPop = document.getElementById('settingsPopover');
  const levelLabel = document.getElementById('levelLabel');
  const imageLabel = document.getElementById('imageLabel');

  let size = Number(levelSelect.value || 3);
  let imgSrc = imageSelect.value;
  let tiles = [];
  let order = [];
  let selected = null;
  let moves = 0;
  let timerInterval = null;
  let secondsElapsed = 0;
  const bestTimesEl = document.getElementById('bestTimes');

  function createGrid(n, imageUrl){
    puzzleEl.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    puzzleEl.innerHTML = '';
    tiles = [];
    order = Array.from({length: n*n}, (_,i)=>i);

    for(let r=0;r<n;r++){
      for(let c=0;c<n;c++){
        const idx = r*n + c;
        const div = document.createElement('div');
        div.className = 'piece';
        div.dataset.index = idx;
  div.style.backgroundImage = imageUrl ? `url(${imageUrl})` : 'none';
  if (!imageUrl) div.style.backgroundColor = '#15183a';
        div.style.backgroundSize = `${n*100}% ${n*100}%`;
        div.style.backgroundPosition = `${(c/(n-1))*100}% ${(r/(n-1))*100}%`;
        div.addEventListener('click', onPieceClick);
        puzzleEl.appendChild(div);
        tiles.push(div);
      }
    }
  }

  function shuffle(){
    for(let i=order.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    render();
  }

  function render(){
    const n = size;
    tiles.forEach((el, i)=>{
      const pos = order[i];
      const r = Math.floor(pos / n);
      const c = pos % n;
      el.style.order = i;
      el.style.backgroundPosition = `${(c/(n-1))*100}% ${(r/(n-1))*100}%`;
      el.dataset.current = pos;
    });
  }

  function onPieceClick(e){
    const el = e.currentTarget;
    if (selected === null) {
      selected = el;
      el.classList.add('selected');
      return;
    }
    if (selected === el) {
      selected.classList.remove('selected');
      selected = null;
      return;
    }

    // start timer on first actual move
    if (!timerInterval) startTimerIfNeeded();

    const i1 = Array.prototype.indexOf.call(tiles, selected);
    const i2 = Array.prototype.indexOf.call(tiles, el);
    [order[i1], order[i2]] = [order[i2], order[i1]];
    selected.classList.remove('selected');
    selected = null;
    moves++;
    movesEl.textContent = moves;
    render();
    checkSolved();
  }

  function checkSolved(){
    const solved = order.every((v,i)=>v===i);
    if(solved){
      stopTimer();
      // save best time per level
      const level = size;
      const key = `puzzle_best_${level}`;
      const prev = localStorage.getItem(key);
      const prevSec = prev ? Number(prev) : null;
      if (secondsElapsed > 0 && (prevSec === null || secondsElapsed < prevSec)){
        localStorage.setItem(key, String(secondsElapsed));
      }
      renderBestTimes();
      setTimeout(()=> alert(`Felicitări! Ai rezolvat puzzle-ul în ${moves} mutări și ${formatSeconds(secondsElapsed)}.`), 100);
    }
  }

  // startGame removed; gameplay now starts when user makes first move (timer starts on first move)

  function resetGame(){
    stopTimer();
    secondsElapsed = 0;
    updateTimerDisplay();
    moves = 0; movesEl.textContent = moves;
    imgSrc = imageSelect.value;
    // Create a new shuffled board on reset
    preloadImage(imgSrc).then(url => {
      createGrid(size, url);
      do { shuffle(); } while(order.every((v,i)=>v===i));
      renderBestTimes();
    }).catch(()=>{
      createGrid(size, imgSrc);
      do { shuffle(); } while(order.every((v,i)=>v===i));
      renderBestTimes();
    });
  }

  function preloadImage(src){
    return new Promise((resolve, reject)=>{
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('Image load error'));
      img.src = src;
    });
  }

  function startTimerIfNeeded(){
    if (timerInterval) return;
    timerInterval = setInterval(()=>{
      secondsElapsed++;
      updateTimerDisplay();
    }, 1000);
  }
  function stopTimer(){ if(timerInterval){ clearInterval(timerInterval); timerInterval = null; } }
  function updateTimerDisplay(){ if(secondsElapsed<=0){ timerEl.textContent = '00:00'; return; } const m = Math.floor(secondsElapsed/60); const s = secondsElapsed%60; timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }

  resetBtn.addEventListener('click', resetGame);
  // when level selection changes, apply it immediately (rebuild + shuffle)
  function applyLevelImmediate(){
    size = Number(levelSelect.value);
    imgSrc = imageSelect.value;
    moves = 0; movesEl.textContent = moves;
    // create shuffled grid for new level (do not auto-start timer)
    preloadImage(imgSrc).then(url => {
      createGrid(size, url);
      do { shuffle(); } while(order.every((v,i)=>v===i));
    }).catch(()=>{
      createGrid(size, imgSrc);
      do { shuffle(); } while(order.every((v,i)=>v===i));
    });
    // reset timer display; Start button still starts timer for level 4
    timerEl.textContent = '—';
    stopTimer();
    renderBestTimes();
  }

  levelSelect.addEventListener('change', applyLevelImmediate);

  // sync labels in the compact controls
  function updateLabels(){
    const li = levelSelect.options[levelSelect.selectedIndex].text;
    const ii = imageSelect.options[imageSelect.selectedIndex].text;
    if(levelLabel) levelLabel.textContent = li;
    if(imageLabel) imageLabel.textContent = ii;
  }
  updateLabels();
  imageSelect.addEventListener('change', ()=>{ updateLabels(); applyLevelImmediate(); });

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

  // segmented groups handling
  const levelGroup = document.getElementById('levelGroup');
  const imageGroup = document.getElementById('imageGroup');
  function setActiveButton(group, btn){
    group.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }
  if(levelGroup){
    levelGroup.addEventListener('click', (e)=>{
      const b = e.target.closest('button'); if(!b) return;
      const val = b.dataset.value;
      setActiveButton(levelGroup, b);
      levelSelect.value = val;
      updateLabels();
      applyLevelImmediate();
    });
  }
  if(imageGroup){
    imageGroup.addEventListener('click', (e)=>{
      const b = e.target.closest('button'); if(!b) return;
      const val = b.dataset.value;
      setActiveButton(imageGroup, b);
      imageSelect.value = val;
      updateLabels();
      applyLevelImmediate();
    });
  }

  // create initial grid with preloaded image so tiles show immediately (shuffled)
  (function init(){
    const initialSrc = imageSelect.value;
    preloadImage(initialSrc).then(url => {
      createGrid(size, url);
      do { shuffle(); } while(order.every((v,i)=>v===i));
      renderBestTimes();
      updateTimerDisplay();
    }).catch(()=>{
      createGrid(size, initialSrc);
      do { shuffle(); } while(order.every((v,i)=>v===i));
      renderBestTimes();
      updateTimerDisplay();
    });
  })();

  function formatSeconds(sec){
    if (!sec || sec <= 0) return '00:00';
    const m = Math.floor(sec/60); const s = sec%60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function renderBestTimes(){
    if(!bestTimesEl) return;
    const key = `puzzle_best_${size}`;
    const v = localStorage.getItem(key);
    // show only the formatted best time for the selected level
    bestTimesEl.textContent = v ? formatSeconds(Number(v)) : '-';
  }

})();

// timpul trebuie resetata la 1 minut
// sa se blockeze sa nu mai poti face mutari dupa ce ai terminat puzzleul
// trebuie implementata un sistsem de mutari la Best Time
// sound pentru puzzle
