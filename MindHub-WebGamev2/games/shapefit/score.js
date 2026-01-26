const savedScore = localStorage.getItem("score_shape3")
if (savedScore) {
  document.querySelector(".game-score").textContent = savedScore
}
