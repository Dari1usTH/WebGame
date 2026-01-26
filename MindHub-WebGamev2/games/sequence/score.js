const savedScore = localStorage.getItem("score_sequence2")
if (savedScore) {
  document.querySelector(".game-score").textContent = savedScore
}