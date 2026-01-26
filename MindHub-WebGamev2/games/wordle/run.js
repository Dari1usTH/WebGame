let  w  =  [

"people","little","number","before","during",
"always","should","system","friend","family",
"school","public","change","health","though",
"toward","almost","within","mother","father"

]

let  t  = ""   ,  rr = 0  ,  cc = 0  ,  on = false  ,  win = false
let  a  = []   ,  b  = [] ,  score_wordle10 = 100

let $=(id)=>document.getElementById(id)
function rnd(x){ return Math.floor(Math.random()*x) }

function mk(){
  $("bd").innerHTML = ""
  b = []
  for(let r=0;r<6;r++){
    b[r]=[]
    for(let c=0;c<6;c++){
      let d=document.createElement("div")
      d.className="bx"
      d.id="bx_"+r+"_"+c
      d.textContent=" "
      $("bd").appendChild(d)
      b[r][c]=d
    }
  }
}

function pick(){
  t = w[ rnd(w.length) ]
}

function uiRow(){
  for(let r=0;r<6;r++){
    for(let c=0;c<6;c++){
      b[r][c].classList.remove("on")
    }
  }
  if(!on) return
  if(rr<6 && !win){
    b[rr][cc].classList.add("on")
  }
}

function uiSc(){
  $("sc").textContent = score_wordle10
}

function msg(x){ $("msg").textContent = x }

function setBest(v){
  let best = localStorage.getItem("score_wordle10")
  let n = best ? parseInt(best) : 0
  if(v>n){
    localStorage.setItem("score_wordle10", v)
    document.querySelector(".game-score").textContent = v
  }
}

function calcScore(){
  let v = 100 - (rr*15)
  if(v<0) v=0
  score_wordle10 = v
  uiSc()
}

function goNew(){
  on = true
  win = false
  rr = 0
  cc = 0
  a = [ "","","","","","" ]
  score_wordle10 = 100
  $("try").classList.remove("off")
  $("m2").textContent = " "
  pick()
  mk()
  uiRow()
  uiSc()
  msg("Type letters, then press Try!")
}

function reset(){
  on = false
  win = false
  rr = 0
  cc = 0
  a = [ "","","","","","" ]
  score_wordle10 = 100
  $("try").classList.add("off")
  $("m2").textContent = " "
  mk()
  uiSc()
  msg("Press New to start")
}

function paint( g ){
  let st = [0,0,0,0,0,0]
  let used = [0,0,0,0,0,0]

  for(let i=0;i<6;i++){
    if(g[i]===t[i]){
      st[i]=2
      used[i]=1
    }
  }

  for(let i=0;i<6;i++){
    if(st[i]===2) continue
    for(let j=0;j<6;j++){
      if(used[j]) continue
      if(g[i]===t[j]){
        st[i]=1
        used[j]=1
        break
      }
    }
  }

  for(let i=0;i<6;i++){
    b[rr][i].classList.remove("g","y","z")
    if(st[i]===2) b[rr][i].classList.add("g")
    else if(st[i]===1) b[rr][i].classList.add("y")
    else b[rr][i].classList.add("z")
  }

  return st.every(x=>x===2)
}

function doTry(){
  if(!on) return
  if(win) return
  if(rr>=6) return

  if(a[rr].length<6){
    msg("Need 6 letters")
    return
  }

  let g = a[rr]
  let ok = paint(g)

  if(ok){
    win = true
    $("try").classList.add("off")
    msg("You win! Word: "+t.toUpperCase())
    calcScore()
    setBest(score_wordle10)
    return
  }

  if(rr===5){
    score_wordle10 = 0
    uiSc()
    $("try").classList.add("off")
    msg("You lost! Word: "+t.toUpperCase())
    return
  }

  rr++
  cc=0
  calcScore()
  msg("Try again")
  uiRow()
}

function put(ch){
  if(!on) return
  if(win) return
  if(rr>=6) return

  if(a[rr].length>=6) return
  a[rr] += ch
  cc = a[rr].length
  if(cc>5) cc=5

  for(let i=0;i<6;i++){
    b[rr][i].textContent = a[rr][i] ? a[rr][i].toUpperCase() : " "
  }
  uiRow()
}

function back(){
  if(!on) return
  if(win) return
  if(rr>=6) return

  if(a[rr].length<=0) return
  a[rr] = a[rr].slice(0,-1)

  cc = a[rr].length
  for(let i=0;i<6;i++){
    b[rr][i].textContent = a[rr][i] ? a[rr][i].toUpperCase() : " "
  }
  uiRow()
}

document.addEventListener("keydown",(e)=>{
  if(!on) return

  let k = e.key
  if(k==="Enter"){ doTry(); return }
  if(k==="Backspace"){ back(); return }

  if(k.length===1){
    let c = k.toLowerCase()
    if(c>='a' && c<='z'){ put(c) }
  }
})

$("try").onclick = doTry
$("start").onclick = goNew
$("reset").onclick = reset

function uiBest(){
  let v = localStorage.getItem("score_wordle10")
  if(v){
    document.querySelector(".game-score").textContent = v
  }
}

uiBest()
reset()
