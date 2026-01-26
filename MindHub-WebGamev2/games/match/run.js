let lvl = 1 ,  r = 0
let ok = 0 ,  ans = "" ,  act = 0
let on = false

let cs = [
  {n:"RED",    c:"red"} ,
  {n:"BLUE",   c:"dodgerblue"} ,
  {n:"GREEN",  c:"limegreen"} ,
  {n:"YELLOW", c:"gold"} ,
  {n:"PURPLE", c:"mediumorchid"} ,
  {n:"ORANGE", c:"orange"}
]

let shp = ["circle","square","tri"]

let $ = (id)=>document.getElementById(id)

function rnd(n){ return Math.floor(Math.random()*n) }

function pickC(){  return cs[rnd(cs.length)] }

function wrongWordColor( wordColor ){
  let t = pickC()
  let guard=0
  while( t.c===wordColor && guard<50 ){ t = pickC(); guard++ }
  return t.c
}

function uiScore(){
  let s = Math.round( (ok / 15) * 100 )
  if(s>100) s=100
  $("sc").textContent = s
}

function lockOpts(yes){
  let a = document.querySelectorAll(".opt")
  a.forEach(x=>{ if(yes) x.classList.add("off"); else x.classList.remove("off") })
}

function buildOpts( correctName ){
  $("opts").innerHTML = ""

  let pool = [...cs]
  pool = pool.sort(()=>Math.random()-0.5)

  let arr = pool.slice(0,4).map(x=>x.n)
  if(!arr.includes(correctName)) arr[ rnd(arr.length) ] = correctName
  arr = arr.sort(()=>Math.random()-0.5)

  for(let i=0;i<arr.length;i++){
    let w = arr[i]
    let b = document.createElement("div")
    b.className = "opt"
    b.textContent = w

    let wordObj = cs.find(x=>x.n===w)
    b.style.color = wrongWordColor( wordObj.c )

    b.onclick = ()=> choose(w)
    $("opts").appendChild(b)
  }
}

function setCueColorBox( col ){
  $("cue").innerHTML = ""
  $("cue").style.background = col.c
  $("cue").style.color = "rgba(255,255,255,.95)"
  $("cue").textContent = " "
}

function setCueShape( col , sh ){
  $("cue").style.background = "#1f2140"
  $("cue").textContent = ""

  $("cue").innerHTML = ""
  let d = document.createElement("div")

  if(sh==="tri"){
    d.className = "shape tri"
    d.style.borderBottomColor = col.c
  }else{
    d.className = "shape "+sh
    d.style.background = col.c
  }

  $("cue").appendChild(d)
}

function setCueWord( word , fontColor ){
  $("cue").style.background = "#1f2140"
  $("cue").textContent = word
  $("cue").style.color = fontColor
}

function startGame(){
  on = true
  lvl = 1; r = 0; ok = 0
  $("info").textContent = ""
  $("start").style.display = "none"
  uiScore()
  nextRound()
}

function endLevel(){
  lvl++
  r = 0

  if(lvl>3){ endGame(); return }
  $("lvl").textContent = "Level " + lvl
  $("info").textContent = " "
  setTimeout(nextRound, 650)
}

function nextRound(){
  if(!on) return

  $("lvl").textContent = "Level " + lvl
  $("r").textContent = " "
  $("info").textContent = ""
  lockOpts(false)

  if(lvl===1){
    let col = pickC()
    setCueColorBox(col)

    $("q").textContent = " "
    ans = col.n
    buildOpts(ans)
  }

  if(lvl===2){
    let col = pickC()
    let sh  = shp[rnd(shp.length)]
    setCueShape(col,sh)

    $("q").textContent = "Pick the color"
    ans = col.n
    buildOpts(ans)
  }

  if(lvl===3){
    let w = pickC()
    let fc = pickC()
    let guard=0
    while(fc.n===w.n && guard<50){ fc = pickC(); guard++ }

    act = rnd(2)
    if(act===0){
      ans = w.n
      $("q").textContent = "Pick the WORD"
    }else{
      ans = fc.n
      $("q").textContent = "Pick the COLOR"
    }

    setCueWord(w.n , fc.c)
    buildOpts(ans)
  }
}

function choose( pick ){
  if(!on) return
  lockOpts(true)

  if(pick===ans){ ok++ }
  uiScore()

  $("info").textContent = " "

  r++
  if(r>=5){
    setTimeout(endLevel, 700)
  }else{
    setTimeout(nextRound, 700)
  }
}

function endGame(){
  on = false
  $("q").textContent = ""
  $("r").textContent = " "

  let final = Math.round( (ok/15)*100 )
  if(final>100) final=100
  $("sc").textContent = final

  $("cue").style.background = "#1f2140"
  $("cue").style.color = "white"
  $("cue").textContent = final

  $("info").textContent = " "

  let old = localStorage.getItem("score_match6")
  let oldV = old ? parseInt(old) : 0

  if(final > oldV){
    localStorage.setItem("score_match6", final)
    document.querySelector(".game-score").textContent = final
  }

  $("start").style.display = "inline-block"
  lockOpts(true)
}

function resetGame(){
  on = false
  lvl = 1; r = 0; ok = 0
  ans = ""

  $("lvl").textContent = "Level 1"
  $("r").textContent = " "
  $("q").textContent = ""
  $("info").textContent = ""
  $("opts").innerHTML = ""

  $("cue").style.background = "#1f2140"
  $("cue").style.color = "white"
  $("cue").textContent = " "

  $("sc").textContent = "0"
  $("start").style.display = "inline-block"
}

$("start").onclick = startGame
$("reset").onclick = resetGame
resetGame()
