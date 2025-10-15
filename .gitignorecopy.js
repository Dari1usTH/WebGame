function applyLevelImmediate(){
  size = Number(levelSelect.value);
  imgSrc = imageSelect.value;
  moves = 0; 
  movesEl.textContent = '';

  // Resetează recordul vizual
  bestTimeValueEl.textContent = '';
  bestMovesValueEl.textContent = '';
  bestTimeContainer.style.display = 'none';

  movesContainer.style.display = 'none';
  timerContainer.style.display = 'none';

  preloadImage(imgSrc).then(url => {
    createGrid(size, url);
    do { shuffle(); } while(order.every((v,i)=>v===i));
    renderBestTimes(); // va afișa recordul doar dacă există în localStorage
  }).catch(()=>{
    createGrid(size, imgSrc);
    do { shuffle(); } while(order.every((v,i)=>v===i));
    renderBestTimes();
  });

  stopTimer();
}
