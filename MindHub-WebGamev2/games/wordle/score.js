let v = localStorage.getItem("score_wordle10")
if(v){
  document.querySelector(".game-score").textContent = v
}
