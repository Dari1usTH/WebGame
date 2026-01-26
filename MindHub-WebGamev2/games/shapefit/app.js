let lvl = 1
let pts = 0
let run = false
let correct = null
let waiting = false

let shapes = ["circle", "square", "triangle"]
let colors = ["#ff4d4d", "#4a9eff", "#22c55e", "#fbbf24"]
let rots = [0, 90, 180]
let good = 0

let totalExercises = 6
let playExercises = 3
let exPick = []
let exDone = 0

function pick(a) {
  return a[Math.floor(Math.random() * a.length)]
}

function same(a, b) {
  return a.shape === b.shape && a.color === b.color && a.rot === b.rot
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function setInfo(s) {
  document.getElementById("info").textContent = s
}

function setScore() {
  document.getElementById("current-score").textContent = pts
}

function setLevel() {
  document.getElementById("level").textContent = "Level " + lvl
}

function rulesForLevel(l) {
  if (l === 1) return { count: 3, needColor: false, needRot: false, memory: false, rotSameShapeOnly: false }
  if (l === 2) return { count: 3, needColor: true, needRot: false, memory: false, rotSameShapeOnly: false }
  if (l === 3) return { count: 3, needColor: false, needRot: true, memory: false, rotSameShapeOnly: true }
  if (l === 4) return { count: 4, needColor: true, needRot: true, memory: false, rotSameShapeOnly: false }
  return { count: 5, needColor: true, needRot: true, memory: true, rotSameShapeOnly: false }
}

function svgShape(o, outline) {
  let s = 96
  let stroke = o.color || "#bdbdd7"
  let fill = outline ? "none" : (o.color || "#bdbdd7")
  let sw = outline ? 6 : 0

  if (o.shape === "circle") {
    return `
      <svg width="${s}" height="${s}" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="34" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />
      </svg>
    `
  }

  if (o.shape === "square") {
    return `
      <svg width="${s}" height="${s}" viewBox="0 0 100 100">
        <g transform="rotate(${o.rot} 50 50)">
          <rect x="22" y="22" width="56" height="56" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />
        </g>
      </svg>
    `
  }

  return `
    <svg width="${s}" height="${s}" viewBox="0 0 100 100">
      <g transform="rotate(${o.rot} 50 50)">
        <polygon points="50,18 82,78 18,78" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />
      </g>
    </svg>
  `
}

function makeTarget(r) {
  let o = { shape: pick(shapes), color: null, rot: 0 }

  if (r.needRot) {
    if (r.rotSameShapeOnly) o.shape = pick(["square", "triangle"])
    o.rot = pick(rots)
  }

  if (r.needColor) o.color = pick(colors)

  return o
}

function makeWrong(r, t) {
  let o = { shape: t.shape, color: t.color, rot: t.rot }

  if (r.rotSameShapeOnly) {
    o.shape = t.shape
    o.color = null
    let rr = pick(rots)
    while (rr === t.rot) rr = pick(rots)
    o.rot = rr
    return o
  }

  let tries = 0
  while (tries < 50) {
    let x = { shape: pick(shapes), color: null, rot: 0 }
    if (r.needColor) x.color = pick(colors)
    if (r.needRot) x.rot = pick(rots)
    if (!r.needColor) x.color = null
    if (!r.needRot) x.rot = 0
    if (!same(x, t)) return x
    tries++
  }

  o.shape = pick(shapes)
  if (o.shape === t.shape) o.shape = shapes[(shapes.indexOf(o.shape) + 1) % shapes.length]
  return o
}

function clearTarget() {
  document.getElementById("target").innerHTML = ""
}

function lockOptions(v) {
  let btns = document.querySelectorAll(".opt")
  btns.forEach(b => b.disabled = v)
}

function drawTarget(t, r) {
  let el = document.getElementById("target")
  el.innerHTML = svgShape(t, true)
  if (r.memory) el.style.visibility = "visible"
}

function drawOptions(list) {
  let wrap = document.getElementById("options")
  wrap.innerHTML = ""

  for (let o of list) {
    let b = document.createElement("button")
    b.className = "opt"
    b.innerHTML = svgShape(o, false)
    b.onclick = () => choose(o)
    wrap.appendChild(b)
  }

  if (waiting) lockOptions(true)
}

function updateBestUI() {
  let s = localStorage.getItem("score_shape3")
  if (s) {
    let el = document.querySelector('.game-score[data-game="shape3"]')
    if (el) el.textContent = s
  }
}

function pickExercises() {
  let ids = []
  for (let i = 0; i < totalExercises; i++) ids.push(i)
  shuffle(ids)
  exPick = ids.slice(0, playExercises)
  exDone = 0
}

function buildRound() {
  let r = rulesForLevel(lvl)
  correct = makeTarget(r)

  let opts = [correct]
  while (opts.length < r.count) {
    let w = makeWrong(r, correct)
    let ok = true
    for (let z of opts) if (same(z, w)) ok = false
    if (ok) opts.push(w)
  }

  shuffle(opts)

  setLevel()
  setInfo("")
  drawTarget(correct, r)

  waiting = false

  if (r.memory) {
    waiting = true
    document.getElementById("options").innerHTML = ""
    setTimeout(() => {
        document.getElementById("target").style.visibility = "hidden"
        setTimeout(() => {
        document.getElementById("target").style.visibility = "visible"
        document.getElementById("target").innerHTML = ""
        waiting = false
        drawOptions(opts)
        lockOptions(false)
        }, 150)
    }, 2000)
    } else {
    drawOptions(opts)
    }
}

function nextStep() {
  exDone++
  if (exDone >= playExercises) {
    lvl++
    if (lvl > 5) endGame()
    else {
      pickExercises()
      buildRound()
    }
  } else {
    buildRound()
  }
}

function choose(o) {
  if (!run) return
  if (waiting) return

  lockOptions(true)

  if (same(o, correct)) {
    good++
    if (good <= 10) pts += 7
    else pts += 6
    if (pts > 100) pts = 100
    setInfo("Correct!")
  } else {
    pts -= 5
    if (pts < 0) pts = 0
    setInfo("Wrong!")
  }



  setScore()

  setTimeout(() => {
    nextStep()
  }, 650)
}

function startGame() {
  run = true
  lvl = 1
  pts = 0
  good = 0
  waiting = false
  correct = null

  setScore()
  setInfo("")
  clearTarget()
  document.getElementById("options").innerHTML = ""
  document.getElementById("start").classList.add("hidden")

  pickExercises()
  buildRound()
}

function endGame() {
  run = false
  clearTarget()
  document.getElementById("options").innerHTML = ""
  setInfo("Game Over! Final Score: " + pts)

  let s = localStorage.getItem("score_shape3")
  if (!s || pts > parseInt(s)) localStorage.setItem("score_shape3", pts)

  updateBestUI()
  document.getElementById("start").classList.remove("hidden")
}

function resetGame() {
  run = false
  lvl = 1
  pts = 0
  good = 0
  waiting = false
  correct = null

  setLevel()
  setScore()
  setInfo("")
  clearTarget()
  document.getElementById("options").innerHTML = ""
  document.getElementById("start").classList.remove("hidden")
  updateBestUI()
}

document.getElementById("start").onclick = startGame
document.getElementById("reset").onclick = resetGame

resetGame()
