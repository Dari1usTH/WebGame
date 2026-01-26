const savedScore = localStorage.getItem("score_numbers1")
if (savedScore) {
  document.querySelector(".game-score").textContent = savedScore
}