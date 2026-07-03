/** 手工开发的完整可玩游戏（单文件 HTML，无外部依赖） */

export const GAME_SNAKE = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>霓虹贪吃蛇</title>
<style>
*{margin:0;padding:0}
body{background:#0a0a12;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,"PingFang SC",sans-serif;color:#fff}
canvas{border-radius:16px;border:1px solid #ffffff1f;background:#0d0d17}
.hud{margin:12px;font-size:13px;color:#ffffff90;text-align:center;line-height:1.8}
b{color:#8b6dff}
</style></head><body>
<canvas id="c" width="480" height="480"></canvas>
<div class="hud">方向键 / WASD 移动 · 空格暂停 · 吃到光珠加速<br><b>霓虹贪吃蛇</b> · 手工开发 · 非模板生成</div>
<script>
'use strict';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const N = 24, CELL = 480 / N;
const COLORS = ['#8b6dff', '#22d3ee', '#34d399', '#f472b6', '#fbbf24'];
let snake, dir, nextDir, food, score, best, dead, paused, tick, speed, foodHue, parts;
best = Number(localStorage.getItem('snake_best') || 0);

function reset() {
  snake = [{x: 12, y: 12}, {x: 11, y: 12}, {x: 10, y: 12}];
  dir = {x: 1, y: 0}; nextDir = dir;
  score = 0; dead = false; paused = false; tick = 0; speed = 9; parts = [];
  placeFood();
}
function placeFood() {
  do { food = {x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N)}; }
  while (snake.some(s => s.x === food.x && s.y === food.y));
  foodHue = COLORS[Math.floor(Math.random() * COLORS.length)];
}
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === ' ') { if (dead) reset(); else paused = !paused; e.preventDefault(); return; }
  const map = {arrowup:[0,-1], w:[0,-1], arrowdown:[0,1], s:[0,1], arrowleft:[-1,0], a:[-1,0], arrowright:[1,0], d:[1,0]};
  const d = map[k];
  if (d && !(d[0] === -dir.x && d[1] === -dir.y)) { nextDir = {x: d[0], y: d[1]}; e.preventDefault(); }
});
cv.addEventListener('click', () => { if (dead) reset(); });

function boom(x, y, c) {
  for (let i = 0; i < 16; i++) parts.push({
    x: x * CELL + CELL/2, y: y * CELL + CELL/2,
    vx: (Math.random()-.5) * 6, vy: (Math.random()-.5) * 6, c, l: 1
  });
}
function step() {
  dir = nextDir;
  const head = {x: (snake[0].x + dir.x + N) % N, y: (snake[0].y + dir.y + N) % N};
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    dead = true;
    if (score > best) { best = score; localStorage.setItem('snake_best', best); }
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++; boom(food.x, food.y, foodHue); placeFood();
    if (score % 4 === 0 && speed < 17) speed++;
  } else snake.pop();
}
function draw() {
  ctx.clearRect(0, 0, 480, 480);
  // 网格微光
  ctx.strokeStyle = '#ffffff08';
  for (let i = 1; i < N; i++) {
    ctx.beginPath(); ctx.moveTo(i*CELL, 0); ctx.lineTo(i*CELL, 480); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*CELL); ctx.lineTo(480, i*CELL); ctx.stroke();
  }
  // 光珠（脉动）
  const pulse = 1 + Math.sin(tick * 0.15) * 0.18;
  ctx.shadowColor = foodHue; ctx.shadowBlur = 18;
  ctx.fillStyle = foodHue;
  ctx.beginPath();
  ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, CELL*0.32*pulse, 0, 7);
  ctx.fill();
  ctx.shadowBlur = 0;
  // 蛇身：头到尾渐变光谱
  snake.forEach((s, i) => {
    const c = COLORS[Math.floor(i / snake.length * COLORS.length) % COLORS.length];
    ctx.fillStyle = c;
    ctx.globalAlpha = 1 - i / snake.length * 0.55;
    ctx.shadowColor = c; ctx.shadowBlur = i === 0 ? 14 : 6;
    const pad = i === 0 ? 1.5 : 2.5;
    ctx.beginPath();
    ctx.roundRect(s.x*CELL + pad, s.y*CELL + pad, CELL - pad*2, CELL - pad*2, i === 0 ? 7 : 5);
    ctx.fill();
  });
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  // 粒子
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.l -= 0.035;
    if (p.l <= 0) { parts.splice(i, 1); continue; }
    ctx.globalAlpha = p.l; ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, 3.5, 3.5);
  }
  ctx.globalAlpha = 1;
  // HUD
  ctx.fillStyle = '#fff'; ctx.font = '600 16px sans-serif';
  ctx.fillText('得分 ' + score, 14, 26);
  ctx.fillStyle = '#ffffff70'; ctx.font = '13px sans-serif';
  ctx.fillText('最佳 ' + best, 14, 46);
  if (paused && !dead) {
    ctx.fillStyle = '#000a'; ctx.fillRect(0, 0, 480, 480);
    ctx.fillStyle = '#fff'; ctx.font = '700 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('已暂停', 240, 232);
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#ffffffa0';
    ctx.fillText('空格继续', 240, 262); ctx.textAlign = 'left';
  }
  if (dead) {
    ctx.fillStyle = '#000b'; ctx.fillRect(0, 0, 480, 480);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = '700 30px sans-serif';
    ctx.fillText('游戏结束', 240, 216);
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#ffffffc0';
    ctx.fillText('得分 ' + score + (score >= best && score > 0 ? ' · 新纪录！' : ' · 最佳 ' + best), 240, 250);
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#ffffff80';
    ctx.fillText('空格或点击重开', 240, 278);
    ctx.textAlign = 'left';
  }
}
let acc = 0, last = 0;
function loop(ts) {
  const dt = ts - last; last = ts; tick++;
  if (!dead && !paused) {
    acc += dt;
    if (acc > 1000 / speed) { acc = 0; step(); }
  }
  draw();
  requestAnimationFrame(loop);
}
reset();
requestAnimationFrame(loop);
</script></body></html>`

export const GAME_SPACE = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>星际穿梭</title>
<style>
*{margin:0;padding:0}
body{background:#0a0a12;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,"PingFang SC",sans-serif;color:#fff}
canvas{border-radius:16px;border:1px solid #ffffff1f;background:linear-gradient(180deg,#0b0b16,#0d0d1a);cursor:none}
.hud{margin:12px;font-size:13px;color:#ffffff90;text-align:center;line-height:1.8}
b{color:#22d3ee}
</style></head><body>
<canvas id="c" width="560" height="460"></canvas>
<div class="hud">鼠标 / 方向键驾驶 · 躲开陨石 · 吃 ◆ 能量得分，蓝色 ● 给护盾<br><b>星际穿梭</b> · 手工开发 · 非模板生成</div>
<script>
'use strict';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const W = 560, H = 460;
let ship, rocks, gems, stars, parts, score, best, shield, dead, t, keys;
best = Number(localStorage.getItem('space_best') || 0);
keys = {};

function reset() {
  ship = {x: W/2, y: H - 70, tx: W/2, ty: H - 70};
  rocks = []; gems = []; parts = []; score = 0; shield = 0; dead = false; t = 0;
  stars = [];
  for (let i = 0; i < 70; i++) stars.push({
    x: Math.random()*W, y: Math.random()*H, s: Math.random()*1.6 + 0.4, v: Math.random()*1.2 + 0.3
  });
}
cv.addEventListener('mousemove', e => {
  const r = cv.getBoundingClientRect();
  ship.tx = (e.clientX - r.left) * (W / r.width);
  ship.ty = (e.clientY - r.top) * (H / r.height);
});
addEventListener('keydown', e => { keys[e.key] = true; if (dead && e.key === ' ') reset(); });
addEventListener('keyup', e => { keys[e.key] = false; });
cv.addEventListener('click', () => { if (dead) reset(); });

function boom(x, y, c, n) {
  for (let i = 0; i < n; i++) parts.push({
    x, y, vx: (Math.random()-.5)*7, vy: (Math.random()-.5)*7,
    c, l: 1, sz: Math.random()*3 + 1.5
  });
}
function spawn() {
  const difficulty = Math.min(1, t / 3600);
  if (t % Math.max(16, 40 - Math.floor(t/240)) === 0) {
    const r = 12 + Math.random() * 22;
    rocks.push({
      x: Math.random()*(W-40)+20, y: -r*2, r,
      v: 1.6 + Math.random()*2 + difficulty*2,
      rot: Math.random()*7, vr: (Math.random()-.5)*0.08,
      verts: Array.from({length: 9}, () => 0.7 + Math.random()*0.5)
    });
  }
  if (t % 90 === 0) gems.push({x: Math.random()*(W-60)+30, y: -12, v: 2.2, kind: Math.random() < 0.82 ? 'gem' : 'shield'});
}
function update() {
  t++;
  if (keys.ArrowLeft) ship.tx -= 5.2;
  if (keys.ArrowRight) ship.tx += 5.2;
  if (keys.ArrowUp) ship.ty -= 5.2;
  if (keys.ArrowDown) ship.ty += 5.2;
  ship.tx = Math.max(18, Math.min(W-18, ship.tx));
  ship.ty = Math.max(30, Math.min(H-24, ship.ty));
  ship.x += (ship.tx - ship.x) * 0.18;
  ship.y += (ship.ty - ship.y) * 0.18;
  spawn();
  // 尾焰
  parts.push({x: ship.x + (Math.random()-.5)*5, y: ship.y + 14, vx: (Math.random()-.5)*0.8, vy: 2.5 + Math.random(), c: Math.random() < 0.5 ? '#22d3ee' : '#8b6dff', l: 0.7, sz: 2.5});
  for (let i = rocks.length-1; i >= 0; i--) {
    const r = rocks[i]; r.y += r.v; r.rot += r.vr;
    if (r.y > H + 60) { rocks.splice(i, 1); score += 2; continue; }
    const dx = r.x - ship.x, dy = r.y - ship.y;
    if (dx*dx + dy*dy < (r.r + 9) * (r.r + 9)) {
      if (shield > 0) { shield = 0; boom(r.x, r.y, '#5ba0f6', 26); rocks.splice(i, 1); }
      else {
        dead = true; boom(ship.x, ship.y, '#f472b6', 40); boom(ship.x, ship.y, '#fbbf24', 30);
        if (score > best) { best = score; localStorage.setItem('space_best', best); }
      }
    }
  }
  for (let i = gems.length-1; i >= 0; i--) {
    const g = gems[i]; g.y += g.v;
    if (g.y > H + 20) { gems.splice(i, 1); continue; }
    const dx = g.x - ship.x, dy = g.y - ship.y;
    if (dx*dx + dy*dy < 500) {
      if (g.kind === 'shield') { shield = 1; boom(g.x, g.y, '#5ba0f6', 14); }
      else { score += 15; boom(g.x, g.y, '#34d399', 14); }
      gems.splice(i, 1);
    }
  }
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  // 星空视差
  for (const s of stars) {
    if (!dead) { s.y += s.v; if (s.y > H) { s.y = -2; s.x = Math.random()*W; } }
    ctx.globalAlpha = 0.25 + s.s * 0.3;
    ctx.fillStyle = '#fff';
    ctx.fillRect(s.x, s.y, s.s, s.s * 2.2);
  }
  ctx.globalAlpha = 1;
  // 能量与护盾道具
  for (const g of gems) {
    ctx.save(); ctx.translate(g.x, g.y);
    if (g.kind === 'gem') {
      ctx.rotate(t * 0.05);
      ctx.fillStyle = '#34d399'; ctx.shadowColor = '#34d399'; ctx.shadowBlur = 14;
      ctx.fillRect(-6, -6, 12, 12);
    } else {
      ctx.fillStyle = '#5ba0f6'; ctx.shadowColor = '#5ba0f6'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill();
    }
    ctx.restore(); ctx.shadowBlur = 0;
  }
  // 陨石（不规则多边形）
  for (const r of rocks) {
    ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
    ctx.beginPath();
    r.verts.forEach((v, i) => {
      const a = i / r.verts.length * Math.PI * 2;
      const px = Math.cos(a) * r.r * v, py = Math.sin(a) * r.r * v;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = '#1c1c2c'; ctx.fill();
    ctx.strokeStyle = '#f472b688'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  // 粒子
  for (let i = parts.length-1; i >= 0; i--) {
    const p = parts[i];
    p.x += p.vx; p.y += p.vy; p.l -= 0.03;
    if (p.l <= 0) { parts.splice(i, 1); continue; }
    ctx.globalAlpha = p.l; ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.sz, p.sz);
  }
  ctx.globalAlpha = 1;
  // 飞船（棱镜造型）
  if (!dead) {
    ctx.save(); ctx.translate(ship.x, ship.y);
    if (shield > 0) {
      ctx.strokeStyle = '#5ba0f6'; ctx.globalAlpha = 0.5 + Math.sin(t*0.2)*0.25;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const g = ctx.createLinearGradient(-12, 0, 12, 0);
    g.addColorStop(0, '#8b6dff'); g.addColorStop(1, '#22d3ee');
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 12); ctx.lineTo(0, 6); ctx.lineTo(-11, 12); ctx.closePath();
    ctx.fillStyle = '#14142a'; ctx.fill();
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  // HUD
  ctx.fillStyle = '#fff'; ctx.font = '600 16px sans-serif';
  ctx.fillText('得分 ' + score, 14, 26);
  ctx.fillStyle = '#ffffff70'; ctx.font = '13px sans-serif';
  ctx.fillText('最佳 ' + best + (shield > 0 ? ' · 🛡 护盾' : ''), 14, 46);
  if (dead) {
    ctx.fillStyle = '#000b'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = '700 30px sans-serif';
    ctx.fillText('飞船损毁', W/2, 206);
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#ffffffc0';
    ctx.fillText('得分 ' + score + (score >= best && score > 0 ? ' · 新纪录！' : ' · 最佳 ' + best), W/2, 240);
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#ffffff80';
    ctx.fillText('空格或点击重开', W/2, 268);
    ctx.textAlign = 'left';
  }
}
function loop() { if (!dead) update(); draw(); requestAnimationFrame(loop); }
reset(); loop();
</script></body></html>`

export const GAME_MARIO = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>超级玛丽</title>
<style>
*{margin:0;padding:0}
body{background:#5ec8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,"PingFang SC",sans-serif;color:#fff}
canvas{border-radius:16px;border:1px solid #ffffff30;background:#5ec8f0}
.hud{margin:12px;font-size:13px;color:#fff;text-align:center;line-height:1.8;text-shadow:0 1px 3px #0006}
b{color:#fff200}
</style></head><body>
<canvas id="c" width="640" height="400"></canvas>
<div class="hud">← → / A D 移动 · 空格 / ↑ 跳跃 · 踩扁怪物得分 · 吃蘑菇变大<br><b>超级玛丽</b> · 手工开发 · 非模板生成</div>
<script>
'use strict';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const VW = 640, VH = 400;
const GRAVITY = 0.55, JUMP_V = -12.5, MOVE_ACC = 0.6, MAX_SPEED = 3.6, FRICTION = 0.82, MAX_FALL = 14;
const WORLD_W = 3000, GROUND_Y = 340, FLAG_X = 2900;

let player, camX, keys, state, lives, score, coinsCollected, groundSegs, platforms, blocks, pipes, coins, enemies, mushroom, particles, best, checkpointX;
keys = {};
best = Number(localStorage.getItem('mario_best') || 0);

function rect(x, y, w, h) { return { x, y, w, h }; }
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function buildGround(pits) {
  const segs = [];
  let cursor = 0;
  const sorted = pits.slice().sort((a, b) => a.x1 - b.x1);
  for (const p of sorted) {
    if (p.x1 > cursor) segs.push(rect(cursor, GROUND_Y, p.x1 - cursor, 400 - GROUND_Y));
    cursor = p.x2;
  }
  if (cursor < WORLD_W) segs.push(rect(cursor, GROUND_Y, WORLD_W - cursor, 400 - GROUND_Y));
  return segs;
}

function resetLevel() {
  const pits = [{ x1: 520, x2: 600 }, { x1: 1360, x2: 1440 }, { x1: 2150, x2: 2220 }];
  groundSegs = buildGround(pits);
  platforms = [
    rect(300, 260, 96, 16), rect(760, 220, 80, 16), rect(1080, 270, 120, 16),
    rect(1700, 240, 96, 16), rect(2000, 200, 80, 16), rect(2500, 260, 120, 16),
  ];
  pipes = [rect(660, 280, 48, 60), rect(1550, 260, 48, 80), rect(2350, 280, 48, 60)];
  blocks = [
    { x: 340, y: 200, w: 28, h: 28, type: 'coin', used: false },
    { x: 900, y: 180, w: 28, h: 28, type: 'mushroom', used: false },
    { x: 1200, y: 220, w: 28, h: 28, type: 'coin', used: false },
    { x: 1720, y: 190, w: 28, h: 28, type: 'coin', used: false },
    { x: 2020, y: 150, w: 28, h: 28, type: 'coin', used: false },
    { x: 2600, y: 200, w: 28, h: 28, type: 'coin', used: false },
  ];
  coins = [];
  for (let i = 0; i < 10; i++) coins.push({ x: 380 + i * 26, y: 300 - (i % 3) * 10, taken: false });
  for (let i = 0; i < 6; i++) coins.push({ x: 1500 + i * 26, y: 300, taken: false });
  enemies = [
    { x: 350, minX: 300, maxX: 480, vx: -0.8, w: 24, h: 22, dead: false, deadT: 0 },
    { x: 850, minX: 800, maxX: 1000, vx: 0.8, w: 24, h: 22, dead: false, deadT: 0 },
    { x: 1150, minX: 1100, maxX: 1300, vx: -0.8, w: 24, h: 22, dead: false, deadT: 0 },
    { x: 1700, minX: 1650, maxX: 1850, vx: 0.8, w: 24, h: 22, dead: false, deadT: 0 },
    { x: 2500, minX: 2450, maxX: 2650, vx: -0.8, w: 24, h: 22, dead: false, deadT: 0 },
  ];
  mushroom = null;
}
function spawnPlayer(x) {
  player = { x: x || 40, y: GROUND_Y - 30, w: 22, h: 30, vx: 0, vy: 0, onGround: false, big: false, facing: 1, invuln: 0 };
}
function reset() {
  lives = 3; score = 0; coinsCollected = 0; state = 'playing'; camX = 0; particles = []; checkpointX = 40;
  resetLevel();
  spawnPlayer(checkpointX);
}

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === ' ' || k === 'arrowup' || k === 'w') {
    if (state === 'gameover' || state === 'win') reset();
    else if (player.onGround) { player.vy = JUMP_V; player.onGround = false; }
    e.preventDefault();
  }
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
cv.addEventListener('click', () => { if (state === 'gameover' || state === 'win') reset(); });

function boom(x, y, c, n) {
  for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 - 1, c, l: 1 });
}
function onBlockHit(b) {
  if (b.used) return;
  b.used = true;
  boom(b.x + 14, b.y, '#f0b90b', 8);
  if (b.type === 'mushroom' && !player.big) mushroom = { x: b.x + 2, y: b.y - 24, w: 24, h: 24, vx: 1.4, vy: 0 };
  else { score += 20; coinsCollected++; }
}
function growPlayer() {
  if (player.big) return;
  player.big = true;
  const oldH = player.h;
  player.w = 26; player.h = 46;
  player.y -= (player.h - oldH);
}
function shrinkPlayer() {
  if (!player.big) { loseLife(); return; }
  player.big = false;
  const oldH = player.h;
  player.w = 22; player.h = 30;
  player.y += (oldH - player.h);
  player.invuln = 90;
}
function loseLife() {
  lives--;
  boom(player.x + player.w / 2, player.y + player.h / 2, '#f472b6', 20);
  if (lives <= 0) { state = 'gameover'; if (score > best) { best = score; localStorage.setItem('mario_best', best); } }
  else spawnPlayer(checkpointX);
}

function moveAndCollide() {
  const prevBottom = player.y + player.h;
  const solids = groundSegs.concat(pipes).concat(blocks);
  player.x += player.vx;
  player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));
  for (const s of solids) {
    if (aabb(player, s)) {
      if (player.vx > 0) player.x = s.x - player.w;
      else if (player.vx < 0) player.x = s.x + s.w;
      player.vx = 0;
    }
  }
  player.y += player.vy;
  player.onGround = false;
  for (const s of groundSegs.concat(pipes)) {
    if (aabb(player, s)) {
      if (player.vy >= 0) { player.y = s.y - player.h; player.vy = 0; player.onGround = true; }
      else { player.y = s.y + s.h; player.vy = 0; }
    }
  }
  for (const b of blocks) {
    if (aabb(player, b)) {
      if (player.vy >= 0) { player.y = b.y - player.h; player.vy = 0; player.onGround = true; }
      else { player.y = b.y + b.h; player.vy = 0; onBlockHit(b); }
    }
  }
  for (const pl of platforms) {
    if (player.vy >= 0 && prevBottom <= pl.y + 2 && player.x + player.w > pl.x && player.x < pl.x + pl.w) {
      const newBottom = player.y + player.h;
      if (newBottom >= pl.y && newBottom <= pl.y + pl.h + player.vy + 1) { player.y = pl.y - player.h; player.vy = 0; player.onGround = true; }
    }
  }
}

function update() {
  if (state !== 'playing') return;
  if (keys.arrowleft || keys.a) { player.vx -= MOVE_ACC; player.facing = -1; }
  else if (keys.arrowright || keys.d) { player.vx += MOVE_ACC; player.facing = 1; }
  else player.vx *= FRICTION;
  player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx));
  if (Math.abs(player.vx) < 0.02) player.vx = 0;
  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY);
  moveAndCollide();
  if (player.invuln > 0) player.invuln--;
  if (player.onGround && player.x > checkpointX + 250) checkpointX = Math.max(40, player.x - 60);

  if (player.y > 420) loseLife();

  for (const c of coins) {
    if (!c.taken && Math.abs(c.x - (player.x + player.w / 2)) < 16 && Math.abs(c.y - (player.y + player.h / 2)) < 18) {
      c.taken = true; score += 10; coinsCollected++; boom(c.x, c.y, '#f0b90b', 6);
    }
  }

  for (const en of enemies) {
    if (en.dead) { en.deadT--; continue; }
    en.x += en.vx;
    if (en.x < en.minX || en.x > en.maxX) en.vx = -en.vx;
    const eb = { x: en.x, y: GROUND_Y - en.h, w: en.w, h: en.h };
    if (aabb(player, eb) && player.invuln <= 0) {
      const stomp = player.vy > 0 && (player.y + player.h - eb.y) < eb.h * 0.6;
      if (stomp) { en.dead = true; en.deadT = 20; player.vy = -8; score += 50; boom(eb.x + eb.w / 2, eb.y, '#8b5a2b', 10); }
      else shrinkPlayer();
    }
  }
  enemies = enemies.filter(en => !(en.dead && en.deadT <= 0));

  if (mushroom) {
    mushroom.vy = Math.min(MAX_FALL, mushroom.vy + GRAVITY);
    mushroom.x += mushroom.vx;
    mushroom.y += mushroom.vy;
    for (const s of groundSegs) {
      if (mushroom.x + mushroom.w > s.x && mushroom.x < s.x + s.w && mushroom.y + mushroom.h >= s.y && mushroom.y + mushroom.h - mushroom.vy <= s.y + 1) {
        mushroom.y = s.y - mushroom.h; mushroom.vy = 0;
      }
    }
    if (mushroom && aabb(player, mushroom)) { growPlayer(); score += 100; boom(mushroom.x, mushroom.y, '#34d399', 14); mushroom = null; }
    else if (mushroom && mushroom.y > 420) mushroom = null;
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.l -= 0.03;
    if (p.l <= 0) particles.splice(i, 1);
  }

  if (player.x + player.w > FLAG_X) { state = 'win'; if (score > best) { best = score; localStorage.setItem('mario_best', best); } }

  camX = Math.max(0, Math.min(WORLD_W - VW, player.x - VW / 2));
}

function drawBrick(x, y, w, h, color, line) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let bx = 0; bx < w; bx += 16) { ctx.beginPath(); ctx.moveTo(x + bx, y); ctx.lineTo(x + bx, y + h); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
}
function drawPlayer() {
  const px = player.x - camX, py = player.y;
  ctx.save();
  if (player.invuln > 0 && Math.floor(player.invuln / 4) % 2 === 0) ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#2050c0';
  ctx.fillRect(px, py + player.h * 0.45, player.w, player.h * 0.55);
  ctx.fillStyle = '#f4b183';
  ctx.fillRect(px + 3, py + player.h * 0.15, player.w - 6, player.h * 0.32);
  ctx.fillStyle = '#e02020';
  ctx.fillRect(px, py, player.w, player.h * 0.2);
  ctx.fillRect(px + (player.facing > 0 ? player.w - 4 : 0), py + player.h * 0.12, 6, 6);
  ctx.restore();
}

function draw() {
  const grad = ctx.createLinearGradient(0, 0, 0, VH);
  grad.addColorStop(0, '#5ec8f0'); grad.addColorStop(1, '#bdeaff');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = '#ffffffcc';
  for (let i = 0; i < 6; i++) {
    const wx = (i * 420 - camX * 0.3) % (WORLD_W + 400);
    ctx.beginPath(); ctx.ellipse(wx, 60 + (i % 3) * 20, 30, 16, 0, 0, 7);
    ctx.ellipse(wx + 26, 55 + (i % 3) * 20, 22, 13, 0, 0, 7);
    ctx.fill();
  }
  ctx.fillStyle = '#3fae5c';
  for (let i = 0; i < 8; i++) {
    const wx = (i * 320 - camX * 0.55) % (WORLD_W + 300);
    ctx.beginPath(); ctx.arc(wx, VH - 40, 46, Math.PI, 0); ctx.fill();
  }

  for (const s of groundSegs) {
    drawBrick(s.x - camX, s.y, s.w, s.h, '#8b5a2b', '#6e4520');
    ctx.fillStyle = '#3fae5c'; ctx.fillRect(s.x - camX, s.y - 6, s.w, 6);
  }
  for (const p of platforms) drawBrick(p.x - camX, p.y, p.w, p.h, '#a0662f', '#7a4c22');
  for (const p of pipes) {
    ctx.fillStyle = '#2e9e3e'; ctx.fillRect(p.x - camX, p.y, p.w, p.h);
    ctx.fillStyle = '#247d31'; ctx.fillRect(p.x - camX - 4, p.y, p.w + 8, 14);
  }
  for (const b of blocks) {
    ctx.fillStyle = b.used ? '#7a5a3a' : '#f0b90b';
    ctx.fillRect(b.x - camX, b.y, b.w, b.h);
    ctx.strokeStyle = '#5a4326'; ctx.lineWidth = 2; ctx.strokeRect(b.x - camX + 1, b.y + 1, b.w - 2, b.h - 2);
    if (!b.used) { ctx.fillStyle = '#5a4326'; ctx.font = '700 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', b.x - camX + b.w / 2, b.y + b.h * 0.72); ctx.textAlign = 'left'; }
  }
  for (const c of coins) {
    if (c.taken) continue;
    ctx.fillStyle = '#f0b90b'; ctx.shadowColor = '#f0b90b'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(c.x - camX, c.y, 7, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
  }
  if (mushroom) {
    ctx.fillStyle = '#e02020'; ctx.beginPath(); ctx.arc(mushroom.x - camX + mushroom.w / 2, mushroom.y + mushroom.h * 0.4, mushroom.w / 2, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(mushroom.x - camX + 4, mushroom.y + mushroom.h * 0.4, mushroom.w - 8, mushroom.h * 0.5);
  }
  for (const en of enemies) {
    const ex = en.x - camX, ey = GROUND_Y - en.h;
    ctx.save();
    if (en.dead) { ctx.translate(ex + en.w / 2, ey + en.h - 4); ctx.scale(1.2, 0.3); ctx.translate(-en.w / 2, -en.h / 2); }
    ctx.fillStyle = '#8b5a2b';
    ctx.beginPath(); ctx.arc((en.dead ? 0 : ex) + en.w / 2, (en.dead ? 0 : ey) + en.h * 0.5, en.w / 2, Math.PI, 0); ctx.fill();
    ctx.fillRect(en.dead ? -en.w / 2 : ex, (en.dead ? 0 : ey) + en.h * 0.5, en.w, en.h * 0.4);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc((en.dead ? 0 : ex) + en.w * 0.3, (en.dead ? 0 : ey) + en.h * 0.45, 3, 0, 7); ctx.arc((en.dead ? 0 : ex) + en.w * 0.7, (en.dead ? 0 : ey) + en.h * 0.45, 3, 0, 7); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#c9c9c9'; ctx.fillRect(FLAG_X - camX, GROUND_Y - 160, 6, 160);
  ctx.fillStyle = '#34d399'; ctx.beginPath();
  ctx.moveTo(FLAG_X - camX + 6, GROUND_Y - 150); ctx.lineTo(FLAG_X - camX + 34, GROUND_Y - 140); ctx.lineTo(FLAG_X - camX + 6, GROUND_Y - 130); ctx.fill();

  drawPlayer();

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.l); ctx.fillStyle = p.c;
    ctx.fillRect(p.x - camX, p.y, 4, 4);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff'; ctx.font = '600 16px sans-serif';
  ctx.fillText('得分 ' + score, 14, 26);
  ctx.fillStyle = '#ffffffd0'; ctx.font = '13px sans-serif';
  ctx.fillText('金币 ' + coinsCollected + ' · 生命 ' + '\u2764'.repeat(Math.max(0, lives)) + ' · 最佳 ' + best, 14, 46);

  if (state === 'gameover') {
    ctx.fillStyle = '#000b'; ctx.fillRect(0, 0, VW, VH);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 30px sans-serif';
    ctx.fillText('游戏结束', VW / 2, VH / 2 - 14);
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#ffffffc0';
    ctx.fillText('得分 ' + score + ' · 最佳 ' + best, VW / 2, VH / 2 + 18);
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#ffffff80';
    ctx.fillText('空格或点击重新开始', VW / 2, VH / 2 + 44);
    ctx.textAlign = 'left';
  } else if (state === 'win') {
    ctx.fillStyle = '#000b'; ctx.fillRect(0, 0, VW, VH);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 30px sans-serif';
    ctx.fillText('通关！', VW / 2, VH / 2 - 14);
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#ffffffc0';
    ctx.fillText('得分 ' + score + ' · 最佳 ' + best, VW / 2, VH / 2 + 18);
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#ffffff80';
    ctx.fillText('空格或点击再玩一次', VW / 2, VH / 2 + 44);
    ctx.textAlign = 'left';
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
reset();
requestAnimationFrame(loop);
</script></body></html>`

export const GAME_DEMOS = [
  {
    id: 'snake',
    title: '霓虹贪吃蛇',
    desc: '光谱渐变蛇身 · 粒子特效 · 变速机制 · 本地最佳纪录',
    html: GAME_SNAKE,
  },
  {
    id: 'space',
    title: '星际穿梭',
    desc: '视差星空 · 不规则陨石 · 护盾道具 · 难度递增',
    html: GAME_SPACE,
  },
  {
    id: 'mario',
    title: '超级玛丽',
    desc: '横版闯关 · 踩怪吃蘑菇变大 · 问号砖 · 通关旗杆与存档点',
    html: GAME_MARIO,
  },
]
