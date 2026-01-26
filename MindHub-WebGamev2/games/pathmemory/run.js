let L=1,sc=0,ok=0,go=0,lock=1
let p=[],u=[]
let SZ=[5,6,7,8,9,10,12],RP=[2,2,2,2,3,3,3]


let g=document.getElementById("grid"),info=document.getElementById("info")
let triesInLevel=1

function ui(){
  document.getElementById("level").textContent="Level "+L
  document.getElementById("current-score").textContent=sc


  document.getElementById("gsize").textContent=SZ[L-1]
  document.getElementById("gsize2").textContent=SZ[L-1]
}




function mk(n){
  g.innerHTML=""
  g.style.gridTemplateColumns="repeat("+n+", 38px)"
  for(let i=0;i<n*n;i++){
    let d=document.createElement("div")
    d.className="cell"



    d.dataset.i=i
    d.onclick=()=>tap(d)
    g.appendChild(d)
  }
}

function tap(cell){
  if(!go) return
  if(lock) return
  let ii=parseInt(cell.dataset.i)
  let k=u.length


  if(ii!==p[k]){ bad(cell); return }
  u.push(ii)
  cell.classList.add("pick")
  if(u.length===p.length) win()
}

function rc(i,n){ return {r:Math.floor(i/n),c:i%n} }
function id(r,c,n){ return r*n+c }

function path(n,len){
  let s=Math.floor(Math.random()*(n*n)),use={},a=[s],t=0
  use[s]=1
  while(a.length<len && t<9999){
    t++
    let cur=a[a.length-1],q=rc(cur,n),o=[]
    if(q.r>0) o.push(id(q.r-1,q.c,n))
    if(q.r<n-1) o.push(id(q.r+1,q.c,n))
    if(q.c>0) o.push(id(q.r,q.c-1,n))
    if(q.c<n-1) o.push(id(q.r,q.c+1,n))
    o=o.filter(x=>!use[x])



    if(o.length==0){ use[cur]=0; a.pop(); continue }
    let nx=o[Math.floor(Math.random()*o.length)]
    use[nx]=1
    a.push(nx)
  }
  if(a.length<len) return path(n,len)
  return a
}

function clearCells(){
  for(let i=0;i<g.children.length;i++) g.children[i].className="cell"
}

function markStart(){ if(p.length>0) g.children[p[0]].classList.add("start") }

function show(){
  lock=1
  u=[]
  let n=SZ[L-1]
  let len=4+L*2
  if(len>n*n-1) len=n*n-1
  p=path(n,len)

  clearCells()
  info.textContent="Memorize the path..."
  for(let i=0;i<p.length;i++) g.children[p[i]].classList.add("show")

  setTimeout(()=>{
    for(let i=0;i<p.length;i++) g.children[p[i]].classList.remove("show")
    clearCells()
    markStart()
    info.textContent="Start from the green tile."
    lock=0
  },2000)
}

function pts(){
  let total=0
  for(let i=0;i<RP.length;i++) total+=RP[i]
  sc=Math.floor((ok/total)*100)
  if(sc>100) sc=100
  document.getElementById("current-score").textContent=sc
}

function flash(txt){
  info.textContent=txt
  for(let i=0;i<p.length;i++) g.children[p[i]].classList.add("show")
  setTimeout(()=>{
    for(let i=0;i<p.length;i++) g.children[p[i]].classList.remove("show")
    next()
  },900)
}

function bad(cell){
  lock=1
  cell.classList.add("bad")
  pts()
  flash("Wrong! Watch it again.")
}

function win(){
  lock=1
  ok++
  pts()
  flash("Nice!")
}

function next(){
  if(!go) return

  if(triesInLevel<RP[L-1]){
    triesInLevel++
    show()
    return
  }

  L++
  triesInLevel=1

  if(L>7){ end(); return }
  mk(SZ[L-1])
  ui()
  show()
}

function end(){
  go=0
  lock=1
  info.textContent="Game Over! Final Score: "+sc+"/100"
  let old=localStorage.getItem("score_path5")
  let ov=old?parseInt(old):0
  if(sc>ov){
    localStorage.setItem("score_path5", sc)
    document.querySelector(".game-score").textContent=sc
  }
  document.getElementById("start").disabled=false
}

function start(){
  go=1
  lock=1
  L=1; sc=0; ok=0; triesInLevel=1
  mk(SZ[0])
  ui()
  info.textContent="Get ready..."
  document.getElementById("start").disabled=true
  setTimeout(()=>show(),500)
}

function reset(){
  go=0
  lock=1
  L=1; sc=0; ok=0; triesInLevel=1
  mk(SZ[0])
  ui()
  info.textContent=""
  document.getElementById("start").disabled=false
}

document.getElementById("start").onclick=()=>start()
document.getElementById("reset").onclick=()=>reset()
reset()
