let lvl = 1 ,  r = 0
let ok = 0 ,  ans = "" ,  on = false
let tm = 0 ,  left = 0 ,  lock = false

let score_catchit7 = 0

let it = []
let a="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let n="0123456789"
let s="@$#%&?!*+"

for(let i=0;i<a.length;i++) it.push(a[i])
for(let i=0;i<n.length;i++) it.push(n[i])
for(let i=0;i<s.length;i++) it.push(s[i])

let $ = (id)=>document.getElementById(id)

function rnd(x){ return Math.floor(Math.random()*x) }

function pick(){
  return it[ rnd(it.length) ]
}

function uiBest(){
  let v = localStorage.getItem("score_catchit7")
  score_catchit7 = v ? parseInt(v) : 0
  document.querySelector(".game-score").textContent = score_catchit7
}

function uiScore(){
  let s = Math.round( (ok / 15) * 100 )
  if(s>100) s=100
  $("sc").textContent = s
}

function lockOpts(yes){
  let b = document.querySelectorAll(".opt")
  b.forEach(x=>{ if(yes) x.classList.add("off"); else x.classList.remove("off") })
}

function mkArr( need ){
  let arr = []
  while(arr.length<8){
    let v = pick()
    if(!arr.includes(v)) arr.push(v)
  }
  if(!arr.includes(need)) arr[ rnd(arr.length) ] = need
  return arr.sort(()=>Math.random()-0.5)
}

function build(){
  $("opts").innerHTML = ""
  let arr = mkArr(ans)

  for(let i=0;i<arr.length;i++){
    let v = arr[i]
    let d = document.createElement("div")
    d.className = "opt"
    d.textContent = v
    d.onclick = ()=> choose(v)
    $("opts").appendChild(d)
  }
}

function secForLevel(){
  if(lvl===1) return 5
  if(lvl===2) return 3
  return 2
}

function tick(){
  clearInterval(tm)
  tm = setInterval(()=>{
    if(!on) { clearInterval(tm); return }
    left -= 0.1
    if(left<0) left = 0
    $("t").textContent = left.toFixed(1)+"s"

    if(left<=0){
      clearInterval(tm)
      if(lock) return
      lock = true
      lockOpts(true)
      $("cue").textContent = " "
      setTimeout(nextRound, 450)
    }
  },100)
}

function startGame(){
  on = true
  lvl = 1; r = 0; ok = 0
  lock = false

  $("info").textContent = " "
  $("start").style.display = "none"
  $("q").textContent = "Click the matching box"
  $("r").textContent = " "
  uiScore()
  nextRound()
}

function endLevel(){
  lvl++
  r = 0

  if(lvl>3){ endGame(); return }
  $("lvl").textContent = "Level " + lvl
  $("info").textContent = " "
  setTimeout(nextRound, 550)
}



function nextRound(){
  if(!on) return

  lock = false
  $("lvl").textContent = "Level " + lvl
  $("r").textContent = " "
  $("info").textContent = " "
  lockOpts(false)

  ans = pick()
  $("cue").textContent = ans
  build()

  left = secForLevel()
  $("t").textContent = left.toFixed(1)+"s"
  tick()




  r++
  if(r>5){
    clearInterval(tm)
    endLevel()
  }
}

function choose(v){
  if(!on) return
  if(lock) return

  lock = true
  clearInterval(tm)
  lockOpts(true)

  if(v===ans) ok++

  $("cue").textContent = " "
  uiScore()

  setTimeout(()=>{
    if(!on) return
    if(r>=5){
      endLevel()
    }else{
      nextRound()
    }


  },450)
}

function endGame(){
  on = false
  clearInterval(tm)

  $("t").textContent = " "
  $("r").textContent = " "


  $("q").textContent = ""
  $("info").textContent = " "

  let final = Math.round( (ok/15)*100 )
  if(final>100) final=100

  $("sc").textContent = final
  $("cue").textContent = final

  if(final > score_catchit7){
    score_catchit7 = final
    localStorage.setItem("score_catchit7", final)
    document.querySelector(".game-score").textContent = final
  }

  $("start").style.display = "inline-block"
  lockOpts(true)
}

function resetGame(){
  on = false
  clearInterval(tm)

  lvl = 1; r = 0; ok = 0
  ans = ""; left = 0
  lock = false

  $("lvl").textContent = "Level 1"
  $("r").textContent = " "
  $("t").textContent = " "
  $("q").textContent = "Click the matching box"
  $("info").textContent = " "
  $("opts").innerHTML = ""

  $("cue").textContent = " "
  $("sc").textContent = "0"
  $("start").style.display = "inline-block"
  lockOpts(true)
}

$("start").onclick = startGame
$("reset").onclick = resetGame

uiBest()
resetGame()