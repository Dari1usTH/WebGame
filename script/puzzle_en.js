( () => {
    const puzzleEl = document.getElementById('puzzle');
    const levelSelect = document.getElementById('levelSelect');
    const imageSelect = document.getElementById('imageSelect');
    const resetBtn = document.getElementById('resetBtn');
    const movesEl = document.getElementById('moves');
    const timerEl = document.getElementById('timer');
    const movesContainer = document.getElementById('movesContainer');
    const timerContainer = document.getElementById('timerContainer');
    const settingsPop = document.getElementById('settingsPopover');
    const settingsBtn = document.getElementById('setari');
    const levelLabel = document.getElementById('levelLabel');
    const imageLabel = document.getElementById('imageLabel');
    const bestTimeValueEl = document.getElementById('bestTimeValue');
    const bestMovesValueEl = document.getElementById('bestMovesValue');
    const bestTimeContainer = document.getElementById('bestTimeContainer');

    let size = Numer(levelSelect.value || 3);
    let imgSrc = imageSelect.value;
    let tiles = [];
    let order = [];
    let selected = null;
    let timerInterval = null;
    let secondsElapsed = 0;
    const bestTimesEl = document.getElementById('bestTimes');

    function getStorageKey(level = size, imageIndex = imageSelect.selectedIndex) {
        return `puzzle_best_${level}_${imageIndex}`;
    }

    function createGrid(n, imageUrl) {
        puzzleEl.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        puzzleEl.innerHTML = '';
        tiles = [];
        order = Array.from({ length: n * n }, (_, i) => i);

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
            const idx = r * n + c;
            const div = document.createElement('div');
            
            div.className = 'piece';
            div.dataset.index = idx;
            div.style.backgroundImage = imageUrl ? `url(${imageUrl})` : 'none';
            if (!imageUrl) div.style.backgroundColor = '#15183a';
            div.style.backgroundSize = `${n * 100}% ${n * 100}%`;
            div.style.backgroundPosition = `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%`;
            
            div.addEventListener('click', onPieceClick);
            puzzleEl.appendChild(div);
            tiles.push(div);
            }
        }
    }

    function shuffle() {
        for(let i=order.length-1;i>0;i--) {
            const j = Math.floor(Math.random()*(i+1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        render();
    }

    function render(){
        const n = size;
        title.forEach((el, i) => {
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
            el.classList.remove('selected');
            return;
        }
        if (selected === el) {
            selected.classList.remove('selected');
            selected = null;
            return;
        }

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


})