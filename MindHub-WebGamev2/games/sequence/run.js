let level = 1
let score = 0
let sequence = []
let answers = []
let gameActive = false
let levelSets = [
  [[1,2,3,4],[2,4,6,8],[5,10,15,20],[3,6,9,12],[10,20,30,40]],
  [[1,3,5,7],[10,9,8,7],[2,4,8,16],[100,90,80,70],[1,4,9,16]],
  [[1,2,4,8,16],[5,10,20,40,80],[100,50,25,12,6],[1,3,9,27,81],[2,5,11,23,47]],
  [[1,1,2,3,5,8],[2,3,5,8,13,21],[1,2,6,24,120,720],[1,4,9,16,25,36],[3,6,18,72,360,2160]],
  [[2,3,5,7,11,13],[1,2,4,7,11,16],[1,3,7,15,31,63],[1,2,6,15,31,56],[1,4,10,22,46,94]]
]

function startGame() {
  gameActive = true
  level = 1
  score = 0
  document.getElementById("current-score").textContent = 0
  document.getElementById("start").classList.add("hidden")
  nextLevel()
}

function nextLevel() {
  let setIndex = Math.floor(Math.random() * 5)
  let fullSet = levelSets[level-1][setIndex]
  let showCount = 3
  sequence = fullSet.slice(0, showCount)
  answers = fullSet.slice(showCount)
  
  document.getElementById("level").textContent = "Level " + level
  document.getElementById("sequence").innerHTML = ""
  
  for (let i = 0; i < sequence.length; i++) {
    let box = document.createElement("div")
    box.className = "number-box"
    box.textContent = sequence[i]
    document.getElementById("sequence").appendChild(box)
  }
  
  document.getElementById("question").textContent = "What are the next " + answers.length + " number(s)?"
  
  document.getElementById("answer1").value = ""
  document.getElementById("answer2").value = ""
  document.getElementById("answer3").value = ""
  
  document.getElementById("answer1").classList.remove("hidden")
  document.getElementById("answer2").classList.add("hidden")
  document.getElementById("answer3").classList.add("hidden")
  
  if (answers.length >= 2) {
    document.getElementById("answer2").classList.remove("hidden")
  }
  if (answers.length >= 3) {
    document.getElementById("answer3").classList.remove("hidden")
  }
  
  document.getElementById("answer1").focus()
}

function checkAnswer() {
  if (!gameActive) return
  
  let user1 = parseInt(document.getElementById("answer1").value)
  let user2 = parseInt(document.getElementById("answer2").value)
  let user3 = parseInt(document.getElementById("answer3").value)
  let correct = true
  
  if (isNaN(user1) || user1 !== answers[0]) correct = false
  if (answers.length >= 2 && (isNaN(user2) || user2 !== answers[1])) correct = false
  if (answers.length >= 3 && (isNaN(user3) || user3 !== answers[2])) correct = false
  
  if (correct) {
    score += level * 10
  } 
  
  document.getElementById("current-score").textContent = score
  
  level++
  
  if (level > 5) {
    endGame()
  } else {
    setTimeout(nextLevel, 1500)
  }
}

function endGame() {
  gameActive = false
  document.getElementById("sequence").innerHTML = ""
  document.getElementById("question").textContent = ""
  document.getElementById("info").textContent = "Game Over! Final Score: " + score
  
  let oldScore = localStorage.getItem("score_sequence2")
  let oldScoreValue = oldScore ? parseInt(oldScore) : 0
  
  if (score > oldScoreValue) {
    localStorage.setItem("score_sequence2", score)
    document.querySelector(".game-score").textContent = score
  }
  
  document.getElementById("start").classList.remove("hidden")
}

function resetGame() {
  gameActive = false
  level = 1
  score = 0
  
  document.getElementById("sequence").innerHTML = ""
  document.getElementById("question").textContent = ""
  document.getElementById("info").textContent = ""
  document.getElementById("answer1").value = ""
  document.getElementById("answer2").value = ""
  document.getElementById("answer3").value = ""
  
  document.getElementById("current-score").textContent = 0
  document.getElementById("start").classList.remove("hidden")
}

document.getElementById("start").onclick = startGame
document.getElementById("submit").onclick = checkAnswer
document.getElementById("reset").onclick = resetGame

document.getElementById("answer1").addEventListener("keydown", e => {
  if (e.key === "Enter") checkAnswer()
})
document.getElementById("answer2").addEventListener("keydown", e => {
  if (e.key === "Enter") checkAnswer()
})
document.getElementById("answer3").addEventListener("keydown", e => {
  if (e.key === "Enter") checkAnswer()
})

resetGame()