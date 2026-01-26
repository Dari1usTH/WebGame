let lvl = 1 ,  r = 0
let ok = 0  ,  on = false
let tm = 0  ,  left = 0  ,  lock = false

let score_countit8 = 0

let a="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let n="0123456789"
let sh=["●","■","▲","★","◆","⬟","⬢","⬣","⬤","✚","✖","✦"]

let $ = (id)=>document.getElementById(id)
function rnd(x){ return Math.floor(Math.random()*x) }




function pick(t){

  if(t==="n") return n[ rnd(n.length) ]
  if(t==="a") return a[ rnd(a.length) ]
  return sh[ rnd(sh.length) ]

}

function uiBest(){
  let v = localStorage.getItem("score_countit8")
  score_countit8 = v ? parseInt(v) : 0
  document.querySelector(".game-score").textContent = score_countit8
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

function secForLevel(){
  if(lvl===1) return 3
  if(lvl===2) return 2



  return 1
}

let want = ""  ,  ans = 0  ,  pack = []

function mkSeq(){

  pack = []

  let len = 4 + rnd(4) + (lvl-1)
  if(len>10) len=10

  let tp = ["n","a","s"] [ rnd(3) ]

  let t2 = ["n","a","s"] [ rnd(3) ]
  let t3 = ["n","a","s"] [ rnd(3) ]

  let mix = rnd(3)===0

  for(let i=0;i<len;i++){

    let t = tp
    if(mix){
      if(i%3===1) t = t2
      if(i%3===2) t = t3
    }

    let v = pick(t)
    let k = (t==="n"?"n":(t==="a"?"a":"s"))
    pack.push({v:v ,  t:k})

  }


  let cn = 0 , ca = 0 , cs = 0

  for(let i=0;i<pack.length;i++){
    if(pack[i].t==="n") cn++
    if(pack[i].t==="a") ca++
    if(pack[i].t==="s") cs++
  }

  let w = []

  if(cn>0) w.push("n")
  if(ca>0) w.push("a")
  if(cs>0) w.push("s")

  w.push("all")

  want = w[ rnd(w.length) ]

  ans = countNeed(want)

}





function countNeed(w){
  let c = 0
  for(let i=0;i<pack.length;i++){
    if(w==="all") c++
    else if(pack[i].t===w) c++
  }
  return c
}

function drawSeq(){

  $("box").innerHTML = ""

  for(let i=0;i<pack.length;i++){
    let sp = document.createElement("div")
    sp.className = "p"
    sp.textContent = pack[i].v
    $("box").appendChild(sp)
  }

}

function qTxt(w){
  if(w==="n") return "How many NUMBERS did you see?"
  if(w==="a") return "How many LETTERS did you see?"
  if(w==="s") return "How many SHAPES did you see?"

  return "How many ITEMS in total did you see?"
}

function mkOpts(){

  $("opts").innerHTML = ""

  let arr = []

  arr.push(ans)

  while(arr.length<4){

    let v = ans + (-3 + rnd(7))
    if(v<0) v=0
    if(v>12) v=12
    if(!arr.includes(v)) arr.push(v)

  }

  arr = arr.sort(()=>Math.random()-0.5)

  for(let i=0;i<arr.length;i++){

    let v = arr[i]

    let d = document.createElement("div")
    d.className = "opt"
    d.textContent = v
    d.onclick = ()=> choose(v)

    $("opts").appendChild(d)
  }




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

      $("box").innerHTML = " "
      $("q").textContent = qTxt(want)

      mkOpts()
      lockOpts(false)

    }

  },100)
}

function startGame(){

  on = true

  lvl = 1; r = 0; ok = 0
  lock = false

  $("info").textContent = " "
  $("start").style.display = "none"

  $("q").textContent = "Memorize... then count"
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
  setTimeout(nextRound, 600)

}

function nextRound(){

  if(!on) return

  lock = false

  $("lvl").textContent = "Level " + lvl
  $("r").textContent = " "   
  $("info").textContent = " "

  $("opts").innerHTML = ""
  lockOpts(true)

  mkSeq()
  drawSeq()



  $("q").textContent = "Look... "

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
  if(!lock) return

  lock = false
  lockOpts(true)

  if(v===ans) ok++

  uiScore()

  $("info").textContent = (v===ans) ? "" : ""   

  setTimeout(()=>{

    if(!on) return

    if(r>=5) endLevel()
    else nextRound()

  },520)

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
  $("box").innerHTML = '<div style="font-size:54px;font-weight:900;">'+final+'</div>'

  if(final > score_countit8){

    score_countit8 = final
    localStorage.setItem("score_countit8", final)
    document.querySelector(".game-score").textContent = final

  }

  $("start").style.display = "inline-block"
  lockOpts(true)

}

function resetGame(){

  on = false
  clearInterval(tm)

  lvl = 1; r = 0; ok = 0
  left = 0
  lock = false

  $("lvl").textContent = "Level 1"
  $("r").textContent = " "   
  $("t").textContent = " "
  $("q").textContent = "Count what you saw"
  $("info").textContent = " "
  $("opts").innerHTML = ""
  $("box").innerHTML = ""

  $("sc").textContent = "0"
  $("start").style.display = "inline-block"
  lockOpts(true)

}



$("start").onclick = startGame
$("reset").onclick = resetGame

uiBest()
resetGame()