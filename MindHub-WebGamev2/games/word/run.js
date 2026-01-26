let lvl = 1 , rd = 0
let ok = 0 , on = false , lock = false

let tm = 0 , left = 0

let bad = "and" , cur = " "
let score_word9 = 0

let $ = (id)=>document.getElementById(id)
function rnd(x){ return Math.floor(Math.random()*x) }

let words = [
 "and","the","but","or","if","then","to","from","in","on","with","without",
 "red","blue","green","fast","slow","up","down","left","right","cat","dog"
]

function pick(){ return words[ rnd(words.length) ] }

function uiBest(){
  let v = localStorage.getItem("score_word9")
  score_word9 = v ? parseInt(v) : 0
  document.querySelector(".game-score").textContent = score_word9
}

function uiScore(){
  let s = Math.round( (ok / 15) * 100 )
  if(s>100) s=100
  $("sc").textContent = s
}

function secForLevel(){
  if(lvl===1) return 1.25
  if(lvl===2) return 0.95
  return 0.70
}

function setBad(){
  bad = pick()
  $("bad").textContent = bad
}

function setCur(){
  cur = pick()
  if(Math.random() < 0.35) cur = bad
  $("w").textContent = cur
}

function makeOpts(){
  let a = []
  a.push(cur)

  while(a.length < 5){
    let w = pick()
    if(!a.includes(w)) a.push(w)
  }

  a.sort(()=>Math.random()-0.5)

  let box = $("opts")
  box.innerHTML = ""

  for(let i=0;i<a.length;i++){
    let b = document.createElement("button")
    b.className = "op"
    b.textContent = a[i]
    b.onclick = ()=> choose(a[i])
    box.appendChild(b)
  }
}

function lockOpts(yes){
  let all = document.querySelectorAll(".op")
  all.forEach(x=>{
    if(yes) x.classList.add("off")
    else x.classList.remove("off")
  })
}

function tick(){
  clearInterval(tm)
  tm = setInterval(()=>{

    if(!on){ clearInterval(tm); return }

    left -= 0.05
    if(left < 0) left = 0

    $("t").textContent = left.toFixed(2)+"s"

    if(left <= 0){
      clearInterval(tm)
      if(lock) return
      lock = true
      lockOpts(true)

      judge(0,"")     
      setTimeout(()=> nextStep() , 320)
    }

  },50)
}

function startGame(){
  on = true

  lvl = 1 ; rd = 0 ; ok = 0
  lock = false

  $("start").style.display = "none"
  $("info").textContent = " "
  $("q").textContent = "Pick the matching word, BUT do nothing if it is forbidden"
  uiScore()

  setBad()
  newRound()
}

function newRound(){
  if(!on) return

  lock = false
  lockOpts(false)

  $("lvl").textContent = "Write - Level " + lvl
  $("info").textContent = " "

  $("r").textContent = "Round " + (rd+1) + " / 5"

  setCur()
  makeOpts()

  left = secForLevel()
  $("t").textContent = left.toFixed(2)+"s"

  tick()
}

function judge(hit, val){
  let good = 0

  if(cur === bad){
    if(hit === 0) good = 1     
  }else{
    if(hit === 1 && val === cur) good = 1
  }

  if(good){
    ok++
    $("info").textContent = "Nice"
  }else{
    $("info").textContent = "Oops"
  }

  uiScore()
}

function choose(val){
  if(!on) return
  if(lock) return

  lock = true
  clearInterval(tm)
  lockOpts(true)

  judge(1,val)

  setTimeout(()=> nextStep() , 320)
}

function nextStep(){
  if(!on) return

  rd++

  if(rd >= 5){
    lvl++
    rd = 0

    if(lvl > 3){
      endGame()
      return
    }

    setBad()
    $("info").textContent = " "
    setTimeout(()=> newRound() , 420)
    return
  }

  newRound()
}

function endGame(){
  on = false
  clearInterval(tm)

  $("t").textContent = " "
  $("r").textContent = " "
  $("info").textContent = " "

  let final = Math.round( (ok/15)*100 )
  if(final>100) final=100

  $("sc").textContent = final
  $("w").textContent = final

  if(final > score_word9){
    score_word9 = final
    localStorage.setItem("score_word9", final)
    document.querySelector(".game-score").textContent = final
  }

  $("start").style.display = "inline-block"
  lockOpts(true)
}

function resetGame(){
  on = false
  clearInterval(tm)

  lvl = 1 ; rd = 0 ; ok = 0
  bad = "and" ; cur = " "
  left = 0 ; lock = false

  $("lvl").textContent = "Write - Level 1"
  $("r").textContent = " "
  $("t").textContent = " "

  $("bad").textContent = bad
  $("w").textContent = " "
  $("opts").innerHTML = ""

  $("q").textContent = "Pick the matching word, BUT do nothing if it is forbidden"
  $("info").textContent = " "

  $("sc").textContent = "0"
  $("start").style.display = "inline-block"
}

$("start").onclick = startGame
$("reset").onclick = resetGame

uiBest()
resetGame()
