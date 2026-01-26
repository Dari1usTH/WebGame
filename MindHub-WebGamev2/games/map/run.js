let  b  =  []  ,  n=5  ,  on=false
let  lv=1 ,  rd=1
let  tpos=-1  ,  lock=true  ,  tm=0

let  score_map14 = 0
let  g=0

let $=(id)=>document.getElementById(id)
function rnd(x){ return Math.floor(Math.random()*x) }

function msg(x){ $("msg").textContent = x }
function uiSc(){ $("sc").textContent = score_map14 }

function setBest(v){
  let  best = localStorage.getItem("score_map14")
  let  nn = best ? parseInt(best) : 0
  if(v>nn){
    localStorage.setItem("score_map14", v)
    document.querySelector(".game-score").textContent = v
  }
}

function pts(){
  return (g<10) ? 7 : 6
}

function mk(){
  $("bd").innerHTML = ""
  b=[]
  for(let r=0;r<n;r++){
    b[r]=[]
    for(let c=0;c<n;c++){
      let d=document.createElement("div")
      d.className="bx off"
      d.id="bx_"+r+"_"+c
      d.dataset.i = (r*n+c)

      d.onclick=()=>{
        if(!on) return
        if(lock) return

        lock=true
        clearTimeout(tm)

        let i = parseInt(d.dataset.i)

        if(i===tpos){
          score_map14 += pts()
          uiSc()
        }

        nxt()
      }

      $("bd").appendChild(d)
      b[r][c]=d
    }
  }
}

function clr(){
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      b[r][c].innerHTML=""
      b[r][c].classList.add("off")
    }
  }
}

function put(i,  sh ,  co){
  let r = Math.floor(i/n)
  let c = i % n

  let e = document.createElement("div")
  e.className = "sh " + sh + " " + co

  b[r][c].innerHTML=""
  b[r][c].appendChild(e)
}

function lvlCfg(){
  if(lv===1) return {  show:1200 ,  wait:2000 ,  k:2  ,  tar:{sh:"c",co:"r"}  }
  if(lv===2) return {  show:900  ,  wait:1700 ,  k:3  ,  tar:{sh:"s",co:"b"}  }
  return           {  show:650  ,  wait:1400 ,  k:4  ,  tar:{sh:"s",co:"r"}  }
}

function pickCells(k){
  let  u = {} , a=[]
  while(a.length<k){
    let x=rnd(n*n)
    if(u[x]) continue
    u[x]=1
    a.push(x)
  }
  return a
}

function showRound(){
  let cfg = lvlCfg()

  $("m2").textContent = "Level " + lv + "  •  Round " + rd + "/5"
  clr()

  let  cells = pickCells(cfg.k)

  tpos = cells[0]

  put(tpos,  cfg.tar.sh , cfg.tar.co)

  for(let i=1;i<cells.length;i++){
    let sh = ["c","s","t"][ rnd(3) ]
    let co = ["r","g","b","y"][ rnd(4) ]

    if(sh===cfg.tar.sh && co===cfg.tar.co){
      if(co==="r") co="g"
      else co="r"
    }

    put(cells[i],  sh , co)
  }

  lock=true
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      b[r][c].classList.add("off")
    }
  }

  setTimeout(()=>{
    clr()

    lock=false
    for(let r=0;r<n;r++){
      for(let c=0;c<n;c++){
        b[r][c].classList.remove("off")
      }
    }

    tm = setTimeout(()=>{
      lock=true
      nxt()
    }, cfg.wait)

    let t = cfg.tar
    msg("Find: " + (t.co==="r"?"RED":"BLUE") + " " + (t.sh==="c"?"CIRCLE": t.sh==="s"?"SQUARE":"TRI") )
  }, cfg.show)
}

function nxt(){
  if(!on) return

  g++

  if(rd<5){
    rd++
    setTimeout(showRound, 220)
    return
  }

  if(lv<3){
    lv++
    rd=1
    setTimeout(showRound, 260)
    return
  }

  on=false
  lock=true
  clr()
  msg("Finish: " + score_map14 + " / 100")
  setBest(score_map14)
}

function goNew(){
  on=true
  lv=1
  rd=1
  g=0
  score_map14=0
  uiSc()
  mk()
  msg(" ")
  showRound()
}

function reset(){
  on=false
  lock=true
  clearTimeout(tm)
  lv=1
  rd=1
  g=0
  score_map14=0
  uiSc()
  mk()
  clr()
  msg("Press New")
  $("m2").textContent=" "
}

$("start").onclick = goNew
$("reset").onclick = reset

reset()

