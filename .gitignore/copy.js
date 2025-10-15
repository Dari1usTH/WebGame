function resetGame(){
  stopTimer();
  secondsElapsed = 0;
  moves = 0;

  movesEl.textContent = '';
  timerEl.textContent = '';
  
  // Ascunde dacă nu există mutări/timp
  movesContainer.style.display = 'none';
  timerContainer.style.display = 'none';

  imgSrc = imageSelect.value;

  const key = getStorageKey(size, imageSelect.selectedIndex);

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
