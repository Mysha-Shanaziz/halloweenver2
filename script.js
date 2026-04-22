const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let game = { running:false, score:0, health:5, wave:1, spawnRate:1200 };

let enemies = [];
let particles = [];
let bgParticles = [];
let path = [];
let drawing = false;

// ================= MENU =================
function showTutorial() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("tutorial").classList.remove("hidden");
}

function hideTutorial() {
  document.getElementById("tutorial").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function startGame() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("tutorial").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
  game.running = true;
}

// ================= BACKGROUND =================
for (let i=0;i<60;i++){
  bgParticles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*2,
    speed:Math.random()*0.5
  });
}

// ================= ENEMY =================
class Enemy {
  constructor(type){
    this.x=Math.random()*800+50;
    this.y=-40;
    this.type=type;
    this.r=type==="boss"?45:18;
    this.speed=type==="fast"?2:1;
    this.hp=type==="tank"?3:(type==="boss"?20:1);
  }
  update(){
    this.y+=this.speed;
    if(this.y>canvas.height){
      game.health--;
      this.y=-40;
    }
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle=
      this.type==="boss"?"orange":
      this.type==="tank"?"purple":
      this.type==="fast"?"red":
      "white";
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fill();
  }
}

// ================= SPAWN =================
function spawnEnemy(){
  if(!game.running) return;

  let r=Math.random(), type="normal";
  if(r<0.2) type="fast";
  if(r<0.1) type="tank";

  enemies.push(new Enemy(type));

  if(game.score && game.score%25===0){
    enemies.push(new Enemy("boss"));
  }
}
setInterval(spawnEnemy,1200);

// ================= INPUT =================
canvas.addEventListener("mousedown",()=>{drawing=true; path=[]});
canvas.addEventListener("mouseup",()=>{drawing=false; detectGesture()});
canvas.addEventListener("mousemove",(e)=>{
  if(!drawing) return;
  const rect=canvas.getBoundingClientRect();
  path.push({x:e.clientX-rect.left,y:e.clientY-rect.top});
});

// ================= SPELLS =================
function detectGesture(){
  if(path.length<10) return;

  let start=path[0], end=path[path.length-1];
  let dist=Math.hypot(start.x-end.x,start.y-end.y);

  // Circle
  if(dist<30){
    enemies.forEach(e=>explode(e.x,e.y));
    enemies=[];
    game.score+=5;
    return;
  }

  // Line
  if(Math.abs(start.x-end.x)<50){
    enemies=enemies.filter(e=>{
      if(Math.abs(e.x-start.x)<60){
        e.hp--;
        explode(e.x,e.y);
        if(e.hp<=0){game.score++; return false;}
      }
      return true;
    });
    return;
  }

  // Zigzag
  enemies.slice(0,5).forEach(e=>{
    explode(e.x,e.y);
    game.score++;
  });
  enemies.splice(0,5);
}

// ================= PARTICLES =================
function explode(x,y){
  for(let i=0;i<25;i++){
    particles.push({
      x,y,
      dx:(Math.random()-0.5)*5,
      dy:(Math.random()-0.5)*5,
      life:40
    });
  }
}

// ================= UPDATE =================
function update(){
  enemies.forEach(e=>e.update());

  particles.forEach(p=>{
    p.x+=p.dx;
    p.y+=p.dy;
    p.life--;
  });

  particles=particles.filter(p=>p.life>0);

  document.getElementById("score").innerText="Score: "+game.score;
  document.getElementById("health").innerText="❤️ "+game.health;
  document.getElementById("wave").innerText="Wave: "+game.wave;
}

// ================= DRAW =================
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  bgParticles.forEach(p=>{
    p.y+=p.speed;
    if(p.y>canvas.height)p.y=0;
    ctx.fillStyle="rgba(100,100,255,0.2)";
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });

  enemies.forEach(e=>e.draw());

  if(path.length>1){
    ctx.strokeStyle="cyan";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(path[0].x,path[0].y);
    path.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.stroke();
  }

  particles.forEach(p=>{
    ctx.fillStyle="orange";
    ctx.fillRect(p.x,p.y,3,3);
  });
}

// ================= LOOP =================
function loop(){
  if(game.running){
    update();
    draw();

    if(game.health<=0){
      alert("Game Over! Score: "+game.score);
      location.reload();
    }
  }
  requestAnimationFrame(loop);
}
loop();
