let lvl = 1 ,  r = 0
let on = false ,  lock = false ,  go = false

let tg = 0 ,  st = 0 ,  el = 0
let tm = 0

let tot = 0

let score_stop11 = 0


let $ = (id)=>document.getElementById(id)


function rnd(a,b){  return Math.random()*(b-a)+a  }

function cap(x,a,b){  if(x<a) return a ;  if(x>b) return b ;  return x  }

function fmt(x){  return x.toFixed(2) + "s"  }

function mult(d){

  if(d<=0.50) return 1.00

  if(d<=1.00) return 0.95
  if(d<=1.50) return 0.90
  if(d<=2.00) return 0.85
  if(d<=3.00) return 0.80

  if(d<=4.00) return 0.65
  if(d<=5.00) return 0.50
  if(d<=7.00) return 0.30

  return 0.10
}

function uiBest(){
  let v = localStorage.getItem("score_stop11")
  score_stop11 = v ? parseInt(v) : 0
  document.querySelector(".game-score").textContent = score_stop11
}

function uiScore(){
  let s = Math.round( cap(tot,0,100) )
  $("sc").textContent = s
}

function setAct(txt , off){
  $("act").textContent = txt
  if(off) $("act").classList.add("off"); else $("act").classList.remove("off")
}

function secForLevel(){
  let a = 10 , b = 20
  if(lvl===2){ a = 5 ; b = 17 }
  if(lvl===3){ a = 3 ; b = 10 }
  return Math.round( rnd(a,b) * 10 ) / 10
}

function tick(){
  clearInterval(tm)

  tm = setInterval(()=>{
    if(!on){ clearInterval(tm); return }
    if(!go){ return }

    el = (performance.now() - st) / 1000
    $("t").textContent = fmt(el)

  },20)
}

function startGame(){
  on = true
  lock = false
  go = false

  lvl = 1 ; r = 0
  tot = 0

  $("start").style.display = "none"
  $("info").textContent = " "
  $("lvl").textContent = "Level 1"

  uiScore()
  nextRound()
}

function nextRound(){
  if(!on) return

  lock = false
  go = false
  clearInterval(tm)

  tg = secForLevel()

  $("cue").textContent = "Target: " + tg.toFixed(1) + "s"
  $("t").textContent = "0.00s"
  $("r").textContent = "Round " + (r+1) + " / 5"

  $("info").textContent = " "
  setAct("Start Round" , false)
}

function endLevel(){
  lvl++
  r = 0

  if(lvl>3){ endGame(); return }

  $("lvl").textContent = "Level " + lvl
  $("info").textContent = " "
  setTimeout(nextRound, 450)
}

function endGame(){
  on = false
  go = false
  clearInterval(tm)

  setAct("Start Round" , true)

  $("t").textContent = " "
  $("r").textContent = " "
  $("cue").textContent = Math.round( cap(tot,0,100) )

  let final = Math.round( cap(tot,0,100) )
  $("sc").textContent = final

  if(final > score_stop11){
    score_stop11 = final
    localStorage.setItem("score_stop11", final)
    document.querySelector(".game-score").textContent = final
  }

  $("start").style.display = "inline-block"
}

function actBtn(){
  if(!on) return
  if(lock) return

  if(!go){

    go = true
    st = performance.now()
    setAct("STOP" , false)

    tick()
    return
  }

  lock = true
  go = false
  clearInterval(tm)

  let diff = Math.abs(el - tg)
  let base = 100 / 15
  let m = mult(diff)
  let pts = base * m

  tot += pts
  uiScore()

  let ok = (diff<=0.50)
  $("info").textContent = ""

  r++

  setAct("..." , true)

  setTimeout(()=>{
    lock = false

    if(r>=5){
      endLevel()
    }else{
      nextRound()
    }

  },650)
}

function resetGame(){
  on = false
  go = false
  lock = false
  clearInterval(tm)

  lvl = 1 ; r = 0
  tg = 0 ; st = 0 ; el = 0
  tot = 0

  $("lvl").textContent = "Level 1"
  $("r").textContent = " "
  $("t").textContent = " "
  $("cue").textContent = " "
  $("info").textContent = " "
  $("sc").textContent = "0"

  $("start").style.display = "inline-block"
  setAct("Start Round" , true)
}

$("start").onclick = startGame
$("act").onclick = actBtn
$("reset").onclick = resetGame

uiBest()
resetGame()