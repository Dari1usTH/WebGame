let lvl = 1 ,   r = 0

let on = false ,   go = false ,   lock = false

let tg = 0 ,  st = 0 ,  el = 0 ,  tm = 0


let tot = 0


let gone = false ,   d0 = 0 ,   fail = 0


let score_green13 = 0



let g = "#41ff7a"


let curS = "" ,  curC = "" ,  tar = false ,  reqS = ""


let $ = (id)=>document.getElementById(id)



function rnd(a,b){  return Math.random()*(b-a)+a  }


function cap(x,a,b){   if(x<a) return a ;    if(x>b) return b ;    return x   }


function fmt(x){   return x.toFixed(2) + "s"   }



function nm(s){

  if(s==="sq") return "SQUARE"
  if(s==="ci") return "CIRCLE"
  return "TRIANGLE"
}



function uiBest(){

  let v = localStorage.getItem("score_green13")
  score_green13 = v ? parseInt(v) : 0

  document.querySelector(".game-score").textContent = score_green13
}



function uiScore(){

  let s = Math.round( cap(tot , 0 , 100) )
  $("sc").textContent = s
}



function setAct(txt , off){

  $("act").textContent = txt

  if(off) $("act").classList.add("off")
  else $("act").classList.remove("off")
}



function secForLevel(){

  let a = 1.0 ,  b = 2.8

  if(lvl===2){ a = 0.7 ;  b = 2.1 }
  if(lvl===3){ a = 0.45 ; b = 1.6 }

  return Math.round( rnd(a,b) * 100 ) / 100
}



function mk(){

  let w = document.createElement("div")

  w.id = "sh"
  w.className = ""


  let sh = ["sq","ci","tr"][ Math.floor(Math.random()*3) ]
  let co = ["#41ff7a","#ff4d4d","#4a9eff","#ffd24a","#c77dff"][ Math.floor(Math.random()*5) ]


  curS = sh
  curC = co


  w.classList.add(sh)
  w.style.background = sh==="tr" ? "transparent" : co

  if(sh==="tr"){ w.style.borderBottomColor = co }


  w.onclick = hit


  return w
}



function setRule(){

  tar = false
  reqS = ""


  if(lvl===1){

    tar = true
    $("info").textContent = "Click the shape EXACTLY when it disappears"
    return
  }


  if(lvl===2){

    tar = (curC===g)

    $("info").textContent = "ONLY GREEN. If it's not green: DON'T CLICK."
    return
  }


  if(lvl===3){

    reqS = ["sq","ci","tr"][ Math.floor(Math.random()*3) ]

    tar = (curC===g && curS===reqS)

    $("info").textContent = "ONLY " + nm(reqS) + " AND COLOR GREEN"
    return
  }

}



function okNoClick(){

  lock = true
  go = false

  clearInterval(tm)
  clearTimeout(fail)


  let base = 100 / 15
  let pts  = base

  tot += pts
  uiScore()

  $("info").textContent = ""

  r++

  setAct("..." , true)

  setTimeout(()=>{

    lock = false

    if(r>=5) endLevel()
    else nextRound()

  }, 650)
}



function tick(){

  clearInterval(tm)

  tm = setInterval(()=>{

    if(!on){ clearInterval(tm); return }
    if(!go){ return }

    el = (performance.now() - st) / 1000
    $("t").textContent = fmt(el)

    if(!gone && el>=tg){

      gone = true
      d0 = performance.now()

      let w = $("sh")
      if(w){
        w.classList.add("gone")
      }


      if(tar){

        $("info").textContent = "CLICK  NOW"
        setAct("CLICK!" , true)

        clearTimeout(fail)
        fail = setTimeout(()=>{

          if(!on) return
          if(lock) return
          if(!gone) return
          if(!tar) return

          miss("Too slow")

        }, 1300)

      }else{

        $("info").textContent = "DON'T CLICK"
        setAct("NO CLICK" , true)

        clearTimeout(fail)
        fail = setTimeout(()=>{

          if(!on) return
          if(lock) return
          if(!gone) return
          if(tar) return

          okNoClick()

        }, 420)

      }

    }

  }, 16)
}



function startGame(){

  on = true
  lock = false
  go = false

  lvl = 1 ;  r = 0 ;  tot = 0

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
  gone = false

  clearInterval(tm)
  clearTimeout(fail)


  tg = secForLevel()

  $("cue").textContent = " "

  let c = mk()
  $("cue").appendChild(c)


  setRule()


  $("t").textContent = "0.00s"
  $("r").textContent = "Round " + (r+1) + " / 5"


  setAct("Start Round" , false)
}



function endLevel(){

  lvl++
  r = 0

  if(lvl>3){ endGame(); return }

  $("lvl").textContent = "Level " + lvl
  $("info").textContent = " "

  setTimeout(nextRound , 450)
}



function endGame(){

  on = false
  go = false

  clearInterval(tm)
  clearTimeout(fail)

  setAct("Start Round" , true)

  $("t").textContent = " "
  $("r").textContent = " "

  let final = Math.round( cap(tot,0,100) )
  $("cue").textContent = final

  $("sc").textContent = final


  if(final > score_green13){

    score_green13 = final

    localStorage.setItem("score_green13" , final)
    document.querySelector(".game-score").textContent = final
  }

  $("start").style.display = "inline-block"
}



function miss(msg){

  lock = true
  go = false

  clearInterval(tm)
  clearTimeout(fail)

  $("info").textContent = msg 


  tot += 0
  uiScore()


  r++

  setAct("..." , true)

  setTimeout(()=>{

    lock = false

    if(r>=5) endLevel()
    else nextRound()

  }, 650)
}



function hit(){

  if(!on) return
  if(lock) return
  if(!go) return


  if(!tar){

    miss("Wrong target")
    return
  }


  if(!gone){

    miss("Too early")
    return
  }


  lock = true
  go = false

  clearInterval(tm)
  clearTimeout(fail)


  let dt = (performance.now() - d0) / 1000


  let base = 100 / 15

  let pts  = base - (dt * 1)

  pts = cap(pts , 0 , base)


  tot += pts
  uiScore()

  $("info").textContent = ""


  r++

  setAct("..." , true)


  setTimeout(()=>{

    lock = false

    if(r>=5) endLevel()
    else nextRound()

  }, 650)
}



function actBtn(){

  if(!on) return
  if(lock) return


  if(!go){

    go = true
    gone = false

    st = performance.now()
    $("t").textContent = "0.00s"


    if(lvl===1) $("info").textContent = "Wait for it to disappear."
    if(lvl===2) $("info").textContent = "Click ONLY if it's GREEN"
    if(lvl===3) $("info").textContent = "Follow the rule above"


    setAct("WAIT" , true)


    tick()
    return
  }

}



function resetGame(){

  on = false
  go = false
  lock = false

  clearInterval(tm)
  clearTimeout(fail)

  lvl = 1 ; r = 0

  tg = 0 ; st = 0 ; el = 0
  tot = 0

  gone = false ; d0 = 0

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
