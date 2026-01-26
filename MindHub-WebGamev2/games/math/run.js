let on = false  ,  lock = false

let r = 0  ,  tot = 0

let a = 0 , b = 0 , op = "+"
let ans = 0

let score_math12 = 0


let $ = (id)=>document.getElementById(id)

function rnd(a,b){  return Math.floor( Math.random()*(b-a+1) ) + a  }

function cap(x,a,b){  if(x<a) return a ;  if(x>b) return b ;  return x  }

function uiBest(){
  let v = localStorage.getItem("score_math12")
  score_math12 = v ? parseInt(v) : 0
  document.querySelector(".game-score").textContent = score_math12
}

function ui(){
  $("rr").textContent = "Round " + (r) + " / 20"
  $("sc2").textContent = Math.round( cap(tot,0,100) )
}

function pick(){

  let t = rnd(1,4)

  if(t===1){ op="+" }
  if(t===2){ op="-" }
  if(t===3){ op="*" }
  if(t===4){ op="/" }

  if(op==="+"){
    a = rnd(1,25)  ;  b = rnd(1,25)
    ans = a + b
  }

  if(op==="-"){
    a = rnd(5,40)  ;  b = rnd(1,35)
    if(b>a){ let k=a ; a=b ; b=k }
    ans = a - b
  }

  if(op==="*"){
    a = rnd(1,12)  ;  b = rnd(1,12)
    ans = a * b
  }

  if(op==="/"){
    b = rnd(1,12)
    ans = rnd(1,12)
    a = b * ans
  }

  $("q").textContent = a + "  " + op + "  " + b + "  =  ?"
  $("in").value = ""
  $("in").focus()

  $("msg").textContent = " "
  lock = false
}

function startGame(){
  on = true
  lock = false
  r = 0
  tot = 0

  $("st").style.display = "none"
  $("nx").disabled = true
  $("ok").disabled = false

  nextRound()
}

function nextRound(){
  if(!on) return

  r++
  if(r>20){ endGame(); return }

  ui()
  pick()

  $("nx").disabled = true
  $("ok").disabled = false
}

function check(){

  if(!on) return
  if(lock) return

  let v = $("in").value
  if(v===null || v===""){ $("msg").textContent = "Type an answer"; return }

  lock = true

  let g = parseFloat(v)
  let ok = (g===ans)

  if(ok){
    tot += 5
    $("msg").textContent = ""
  }else{
    $("msg").textContent = ""
  }

  tot = cap(tot,0,100)
  ui()

  $("ok").disabled = true
  $("nx").disabled = false
}

function endGame(){
  on = false
  lock = false

  $("ok").disabled = true
  $("nx").disabled = true

  let final = Math.round( cap(tot,0,100) )

  $("rr").textContent = "Done"
  $("q").textContent = "Final score: " + final + " / 100"
  $("msg").textContent = " "

  if(final > score_math12){
    score_math12 = final
    localStorage.setItem("score_math12", final)
    document.querySelector(".game-score").textContent = final
  }

  $("st").style.display = "inline-block"
}

function resetGame(){
  on = false
  lock = false
  r = 0
  tot = 0

  $("rr").textContent = " "
  $("q").textContent = " "
  $("msg").textContent = " "
  $("sc2").textContent = "0"

  $("in").value = ""

  $("ok").disabled = true
  $("nx").disabled = true

  $("st").style.display = "inline-block"
}

$("st").onclick = startGame
$("ok").onclick = check
$("nx").onclick = nextRound
$("rs").onclick = resetGame

$("in").addEventListener("keydown",(e)=>{
  if(e.key==="Enter"){
    if(!$("ok").disabled) check()
    else if(!$("nx").disabled) nextRound()
  }
})

uiBest()
resetGame()
