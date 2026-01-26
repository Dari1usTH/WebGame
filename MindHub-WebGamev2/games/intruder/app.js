let score = 0
let roundIndex = 0
let gameActive = false

let currentIntruderIndex = -1

let correctCount = 0
let TOTAL_ROUNDS = 18


function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}



function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }

  return arr
}


function makeNumberPuzzle(mainLevel) {
  let good = []
  let intruder = null

  if (mainLevel === 1) {
    let even = (Math.random() < 0.5)

    while (good.length < 11) {
      let n = rand(1, 30)
      if (even && n % 2 === 0) good.push(n)
      if (!even && n % 2 === 1) good.push(n)
    }

    intruder = even ? rand(1, 29) : rand(2, 30)
    if (even && intruder % 2 === 0) intruder++

    if (!even && intruder % 2 === 1) intruder++

  } else if (mainLevel === 3) {
    while (good.length < 11) {
      let n = rand(3, 60)
      if (n % 3 === 0) good.push(n)
    }

    intruder = rand(5, 59)
    if (intruder % 3 === 0) intruder += 1

  } else {
    for (let i = 0; i < 11; i++) good.push(rand(10, 40))
    intruder = (Math.random() < 0.5) ? rand(1, 9) : rand(41, 70)
  }

  let items = good.slice(0, 11)
  items.push(intruder)
  shuffle(items)

  return { items, intruderIndex: items.indexOf(intruder) }
}




function makeLetterPuzzle(mainLevel) {
  let vowels = ["A", "E", "I", "O", "U"]
  let consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "V", "X", "Z"]

  let items = []
  let intruder = ""

  if (mainLevel === 2) {
    let v = vowels[rand(0, vowels.length - 1)]
    for (let i = 0; i < 11; i++) items.push(v)
    intruder = consonants[rand(0, consonants.length - 1)]

  } else if (mainLevel === 4) {
    let base = consonants[rand(0, consonants.length - 1)]
    let lower = base.toLowerCase()
    for (let i = 0; i < 11; i++) items.push(lower)
    intruder = base

  } else {
    let group1 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]
    let group2 = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

    let g = group1[rand(0, group1.length - 1)]
    for (let i = 0; i < 11; i++) items.push(g)
    intruder = group2[rand(0, group2.length - 1)]
  }


  items.push(intruder)
  shuffle(items)

  return { items, intruderIndex: items.indexOf(intruder) }
}


function renderRound() {
  let mainLevel = Math.floor(roundIndex / 3) + 1
  let subRound = (roundIndex % 3) + 1
  let isNumbers = (mainLevel % 2 === 1)

  document.getElementById("title").textContent = "Level " + mainLevel
  document.getElementById("subTitle").textContent = "Round " + subRound + " / 3"

  document.getElementById("question").textContent = "Click the intruder!"
  document.getElementById("info").textContent = ""

  let data = isNumbers ? makeNumberPuzzle(mainLevel) : makeLetterPuzzle(mainLevel)
  currentIntruderIndex = data.intruderIndex

  let grid = document.getElementById("grid")
  grid.innerHTML = ""

  for (let i = 0; i < data.items.length; i++) {
    let div = document.createElement("div")
    div.className = "box"
    div.textContent = data.items[i]
    div.onclick = function () { handleClick(i, div) }
    grid.appendChild(div)
  }
}


function disableAllBoxes() {
  let boxes = document.querySelectorAll(".box")

  for (let i = 0; i < boxes.length; i++) {

    boxes[i].classList.add("disabled")
  }
}




function updateScore() {
  score = Math.round((correctCount / TOTAL_ROUNDS) * 100)

  if (score < 0) score = 0
  if (score > 100) score = 100

  document.getElementById("current-score").textContent = score
}


function handleClick(index, el) {
  if (!gameActive) return

  disableAllBoxes()

  let correct = (index === currentIntruderIndex)

  if (correct) {
    correctCount++
    el.classList.add("good")


  } else {
    el.classList.add("bad")
  }

  updateScore()
  roundIndex++

  if (roundIndex >= TOTAL_ROUNDS) {
    endGame()
  } else {
    setTimeout(renderRound, 900)
  }
}


function endGame() {
  gameActive = false

  document.getElementById("grid").innerHTML = ""
  document.getElementById("question").textContent = "Game Over!"
  document.getElementById("info").textContent = ""



  let oldVal = Number(localStorage.getItem("score_intr4")) || 0
  if (score > oldVal) {
    localStorage.setItem("score_intr4", String(score))
    let hsEl = document.querySelector(".game-score")
    if (hsEl) hsEl.textContent = score
  }

  document.getElementById("start").textContent = "Start Again"
}



function startGame() {
  gameActive = true
  score = 0
  roundIndex = 0
  correctCount = 0

  updateScore()

  document.getElementById("start").textContent = "Playing..."
  renderRound()
}


function resetGame() {
  gameActive = false
  score = 0
  roundIndex = 0
  correctCount = 0

  document.getElementById("title").textContent = "Level 1"
  document.getElementById("subTitle").textContent = "Round 1 / 3"
  document.getElementById("question").textContent = "Click the intruder!"


  document.getElementById("grid").innerHTML = ""
  document.getElementById("info").textContent = ""

  updateScore()
  document.getElementById("start").textContent = "Start Game"
}


document.getElementById("start").onclick = startGame
document.getElementById("reset").onclick = resetGame

resetGame()
