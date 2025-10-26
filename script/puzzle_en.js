(() => {
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

    let size = Number(levelSelect.value || 3);
    let imgSrc = imageSelect.value;
    let tiles = [];
    let order = [];
    let selected = null;
    let moves = 0;
    let timerInterval = null;
    let secondsElapsed = 0;

    let previewEl = null;
    let previewActive = false;
    const previewBtn = document.getElementById('previewBtn');

    function getStorageKey(level = size, imageIndex = imageSelect.selectedIndex) {
        return `puzzle_best_${level}_${imageIndex}`;
    }

    function formatSeconds(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function renderBestTimes() {
        const key = getStorageKey();
        const prev = localStorage.getItem(key);
        if (!prev) {
            bestTimeContainer.style.display = 'none';
            return;
        }
        const obj = JSON.parse(prev);
        bestTimeValueEl.textContent = formatSeconds(obj.time);
        bestMovesValueEl.textContent = obj.moves;
        bestTimeContainer.style.display = '';
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
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        render();
    }

    function render() {
        const n = size;
        tiles.forEach((el, i) => {
            const pos = order[i];
            const r = Math.floor(pos / n);
            const c = pos % n;
            el.style.order = i;
            el.style.backgroundPosition = `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%`;
            el.dataset.current = pos;
        });
    }

    function onPieceClick(e) {
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

        if (!timerInterval) startTimerIfNeeded();

        const i1 = tiles.indexOf(selected);
        const i2 = tiles.indexOf(el);
        [order[i1], order[i2]] = [order[i2], order[i1]];

        const moveSound = new Audio('../sounds/puzzle/puzzle_move1.mp3');
        moveSound.play();

        selected.classList.remove('selected');
        selected = null;
        moves++;
        movesEl.textContent = moves;
        render();
        checkSolved();
    }

    function checkSolved() {
        const solved = order.every((v, i) => v === i);
        if (!solved) return;

        stopTimer();
        tiles.forEach(tile => tile.removeEventListener('click', onPieceClick));

        const key = getStorageKey();
        const prev = localStorage.getItem(key);
        let prevObj = prev ? JSON.parse(prev) : null;

        if (!prevObj || secondsElapsed < prevObj.time) {
            localStorage.setItem(key, JSON.stringify({
                time: secondsElapsed,
                moves: moves
            }));
        }

        renderBestTimes();

        const winSound = new Audio('../sounds/puzzle/puzzle_win.mp3');
        winSound.volume = 0.4;
        winSound.play();

        setTimeout(() => {
            const winModal = document.getElementById('winModal');
            const winModalText = document.getElementById('winModalText');
            const closeWinModal = document.getElementById('closeWinModal');

            if (!winModal || !winModalText || !closeWinModal) return;

            winModalText.textContent = `Congratulations! You have solved the puzzle in ${moves} moves and ${formatSeconds(secondsElapsed)}.`;
            winModal.style.display = 'flex';

            closeWinModal.onclick = () => { winModal.style.display = 'none'; };
        }, 100);
    }

    function resetGame() {
        stopTimer();
        secondsElapsed = 0;
        moves = 0;
        movesEl.textContent = '';
        timerEl.textContent = '';
        movesContainer.style.display = 'none';
        timerContainer.style.display = 'none';

        imgSrc = imageSelect.value;

        preloadImage(imgSrc).then(url => {
            createGrid(size, url);
            do { shuffle(); } while (order.every((v, i) => v === i));
            renderBestTimes();
        }).catch(() => {
            createGrid(size, imgSrc);
            do { shuffle(); } while (order.every((v, i) => v === i));
            renderBestTimes();
        });

        previewActive = false;
        if (previewEl) {
            previewEl.remove();
            previewEl = null;
        }
    }

    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject(new Error('Cannot load image!'));
            img.src = src;
        });
    }

    function startTimerIfNeeded() {
        if (timerInterval) return;
        movesContainer.style.display = '';
        timerContainer.style.display = '';
        timerInterval = setInterval(() => {
            secondsElapsed++;
            updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        timerEl.textContent = secondsElapsed > 0 ? formatSeconds(secondsElapsed) : '';
    }

    resetBtn.addEventListener('click', resetGame);

    function applyLevelImmediate() {
        size = Number(levelSelect.value);
        imgSrc = imageSelect.value;
        moves = 0;
        movesEl.textContent = '';
        bestTimeValueEl.textContent = '';
        bestMovesValueEl.textContent = '';
        bestTimeContainer.style.display = 'none';
        movesContainer.style.display = 'none';
        timerContainer.style.display = 'none';
        stopTimer();

        preloadImage(imgSrc).then(url => {
            createGrid(size, url);
            do { shuffle(); } while (order.every((v, i) => v === i));
            renderBestTimes();
        }).catch(() => {
            createGrid(size, imgSrc);
            do { shuffle(); } while (order.every((v, i) => v === i));
            renderBestTimes();
        });

        previewActive = false;
        if (previewEl) {
            previewEl.remove();
            previewEl = null;
        }
    }

    levelSelect.addEventListener('change', applyLevelImmediate);
    imageSelect.addEventListener('change', () => { updateLabels(); applyLevelImmediate(); });

    function updateLabels() {
        const li = levelSelect.options[levelSelect.selectedIndex].text;
        const ii = imageSelect.options[imageSelect.selectedIndex].text;
        if (levelLabel) levelLabel.textContent = li;
        if (imageLabel) imageLabel.textContent = ii;
    }
    updateLabels();

    if (settingsBtn && settingsPop) {
        settingsBtn.addEventListener('click', e => {
            e.stopPropagation();
            const open = settingsPop.getAttribute('data-open') === 'true';
            settingsPop.setAttribute('data-open', open ? 'false' : 'true');
            settingsBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
            settingsPop.setAttribute('aria-hidden', open ? 'true' : 'false');
        });
        document.addEventListener('click', e => {
            if (settingsPop.getAttribute('data-open') !== 'true') return;
            if (!(settingsPop.contains(e.target) || settingsBtn.contains(e.target))) {
                settingsPop.setAttribute('data-open', 'false');
                settingsBtn.setAttribute('aria-expanded', 'false');
                settingsPop.setAttribute('aria-hidden', 'true');
            }
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && settingsPop.getAttribute('data-open') === 'true') {
                settingsPop.setAttribute('data-open', 'false');
                settingsBtn.setAttribute('aria-expanded', 'false');
                settingsPop.setAttribute('aria-hidden', 'true');
            }
        });
    }

    const levelGroup = document.getElementById('levelGroup');
    const imageGroup = document.getElementById('imageGroup');

    function setActiveButton(group, btn) {
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (levelGroup) levelGroup.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        levelSelect.value = b.dataset.value;
        setActiveButton(levelGroup, b);
        updateLabels();
        applyLevelImmediate();
    });

    if (imageGroup) imageGroup.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        imageSelect.value = b.dataset.value;
        setActiveButton(imageGroup, b);
        updateLabels();
        applyLevelImmediate();
    });

    previewBtn.addEventListener('click', () => {
        if (previewActive) {
            previewEl.remove();
            previewEl = null;
            previewActive = false;
            previewBtn.textContent = 'Preview';
        } else {
            previewEl = document.createElement('div');
            previewEl.className = 'preview-overlay';
            previewEl.style.backgroundImage = `url(${imgSrc})`;
            puzzleEl.appendChild(previewEl);
            previewActive = true;
            previewBtn.textContent = 'Hide Preview';
            setTimeout(() => {
                if (previewActive && previewEl) {
                    previewEl.remove();
                    previewEl = null;
                    previewActive = false;
                    previewBtn.textContent = 'Preview';
                }
            }, 3000);
        }
    });

    (function init() {
        const initialSrc = imageSelect.value;
        preloadImage(initialSrc).then(url => {
            createGrid(size, url);
            do { shuffle(); } while (order.every((v, i) => v === i));
            renderBestTimes();
            updateTimerDisplay();
        }).catch(() => {
            createGrid(size, initialSrc);
            do { shuffle(); } while (order.every((v, i) => v === i));
            renderBestTimes();
            updateTimerDisplay();
        });
    })();
})();
