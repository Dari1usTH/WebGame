let lvl = 1
let pts = 0
let arr = []
let ask = 0
let run = false
let i = 0



function startGame() {

  run = true
  lvl = 1
  pts = 0

  document.getElementById("current-score").textContent = 0
  document.getElementById("start").classList.add("hidden")

  nextLvl()
}



function nextLvl() {

  arr = []
  i = 0

  let count = lvl + 3

  while (count > 0) {
    arr.push( Math.floor(Math.random() * 100) + 1 )
    count--
  }

  document.getElementById("level").textContent = "Level " + lvl
  document.getElementById("numbers").innerHTML = ""

  for (let x = 0; x < arr.length; x++) {
    let d = document.createElement("div")
    d.className = "number-box"
    d.textContent = "?"
    document.getElementById("numbers").appendChild(d)
  }

  document.getElementById("answer").value = ""
  document.getElementById("answer").disabled = true
  document.getElementById("submit").disabled = true

  showOne()
}



function showOne() {

  let boxes = document.querySelectorAll(".number-box")

  for (let b of boxes) {
    b.textContent = "?"
    b.classList.remove("active")
  }

  if (i < arr.length) {
    boxes[i].textContent = arr[i]
    boxes[i].classList.add("active")
    i++

    setTimeout(showOne , 800)
  }
  else {

    ask = Math.floor(Math.random() * arr.length)

    document.getElementById("question").textContent =
      "What was the number at position " + (ask + 1) + " ?"

    document.getElementById("answer").disabled = false
    document.getElementById("submit").disabled = false
    document.getElementById("answer").focus()
  }
}



function check() {

  if (!run) return

  let v = parseInt(document.getElementById("answer").value)

  document.getElementById("question").textContent = ""
  document.getElementById("answer").value = ""
  document.getElementById("answer").disabled = true
  document.getElementById("submit").disabled = true

  if (v === arr[ask]) pts += lvl * 10
  else {
    pts -= 5
    if (pts < 0) pts = 0
  }

  document.getElementById("current-score").textContent = pts

  lvl++

  if (lvl > 10) end()
  else nextLvl()
}



function end() {

  run = false

  document.getElementById("numbers").innerHTML = ""
  document.getElementById("question").textContent = ""
  document.getElementById("info").textContent =
    "Game Over! Final Score: " + pts

  let s = localStorage.getItem("score_numbers1")

  if (!s || pts > parseInt(s)) {
    localStorage.setItem("score_numbers1", pts)
  }

  document.getElementById("start").classList.remove("hidden")
}



function resetGame() {

  run = false
  lvl = 1
  pts = 0

  document.getElementById("numbers").innerHTML = ""
  document.getElementById("question").textContent = ""
  document.getElementById("info").textContent = ""
  document.getElementById("answer").value = ""

  document.getElementById("current-score").textContent = 0
  document.getElementById("answer").disabled = true
  document.getElementById("submit").disabled = true

  document.getElementById("start").classList.remove("hidden")
}



document.getElementById("start").onclick = startGame
document.getElementById("submit").onclick = check
document.getElementById("reset").onclick = resetGame

document.getElementById("answer").addEventListener("keydown", e => {
  if (e.key === "Enter") check()
})

resetGame()
