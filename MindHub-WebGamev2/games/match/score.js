const s = localStorage.getItem("score_match6")
if(s){
  document.querySelector(".game-score").textContent = s
}