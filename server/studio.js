/**
 * 创意工坊演示生成器：无上游时按 prompt 种子化生成音乐/网站/游戏，
 * 同一个 prompt 结果稳定，不同 prompt 各不相同。
 */

function hashSeed(str) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function rng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];

// ============ 音乐 ============

const TITLES_A = ["星海", "光谱", "棱镜", "月尘", "极光", "云端", "霓虹", "晨曦"];
const TITLES_B = ["漫游", "序曲", "回响", "脉冲", "折射", "浮游", "航行", "低语"];

export function generateMusic(prompt) {
  const rand = rng(hashSeed(prompt || "prism"));
  const bpm = 88 + Math.floor(rand() * 32);
  const root = 57 + Math.floor(rand() * 8); // A3 ~ E4
  const minor = rand() < 0.4;
  const scale = minor ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9]; // 五声音阶
  // I–V–vi–IV 或 vi–IV–I–V
  const progressions = minor
    ? [[0, 8, 5, 10], [0, 5, 10, 7]]
    : [[0, 7, 9, 5], [9, 5, 0, 7], [0, 5, 7, 5]];
  const prog = pick(rand, progressions);
  const bars = 8;

  const lead = [];
  const bass = [];
  const pad = [];
  const kick = [];
  const hat = [];

  for (let bar = 0; bar < bars; bar++) {
    const chordRoot = root + prog[bar % prog.length];
    const chordMinor = minor || prog[bar % prog.length] === 9;
    const third = chordMinor ? 3 : 4;

    // 低音：每拍根音
    for (let beat = 0; beat < 4; beat++) {
      bass.push([bar * 4 + beat, chordRoot - 24, beat % 2 === 0 ? 0.9 : 0.45]);
    }
    // 铺底：整小节和弦
    pad.push([bar * 4, chordRoot, 4]);
    pad.push([bar * 4, chordRoot + third, 4]);
    pad.push([bar * 4, chordRoot + 7, 4]);
    // 鼓
    kick.push([bar * 4, 36, 0.1], [bar * 4 + 2, 36, 0.1]);
    for (let e = 0; e < 8; e++) {
      if (e % 2 === 1 || rand() < 0.3) hat.push([bar * 4 + e * 0.5, 42, 0.05]);
    }
    // 主旋律：八分音符随机游走
    let degree = Math.floor(rand() * scale.length);
    for (let e = 0; e < 8; e++) {
      if (rand() < 0.28) continue; // 休止
      degree = Math.max(0, Math.min(scale.length * 2 - 1, degree + Math.floor(rand() * 5) - 2));
      const midi = root + 12 + scale[degree % scale.length] + 12 * Math.floor(degree / scale.length);
      const dur = rand() < 0.25 ? 1 : 0.5;
      lead.push([bar * 4 + e * 0.5, midi, dur]);
      if (dur === 1) e++;
    }
  }

  return {
    title: `${pick(rand, TITLES_A)}${pick(rand, TITLES_B)}`,
    bpm,
    key: `${["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][root % 12]} ${minor ? "小调" : "大调"}`,
    tracks: [
      { name: "lead", wave: "triangle", gain: 0.5, notes: lead },
      { name: "bass", wave: "sawtooth", gain: 0.4, notes: bass },
      { name: "pad", wave: "sine", gain: 0.16, notes: pad },
      { name: "kick", wave: "kick", gain: 0.9, notes: kick },
      { name: "hat", wave: "noise", gain: 0.25, notes: hat },
    ],
  };
}

// ============ 网站 ============

const PALETTES = [
  ["#8b6dff", "#22d3ee", "#0a0a12"],
  ["#f472b6", "#fbbf24", "#12080f"],
  ["#34d399", "#22d3ee", "#07120e"],
  ["#fb7185", "#8b6dff", "#120a12"],
  ["#fbbf24", "#f97316", "#120e07"],
];

export function generateSite(prompt) {
  const rand = rng(hashSeed(prompt || "site"));
  const [c1, c2, bg] = pick(rand, PALETTES);
  const title = (prompt || "星辰工作室").replace(/[，。,.!？?]/g, " ").trim().slice(0, 16) || "星辰工作室";
  const features = [
    ["✦", "极致体验", "每一个像素都经过反复打磨，只为呈现最流畅的交互。"],
    ["◈", "闪电性能", "毫秒级响应，全球加速节点覆盖，快到没有等待。"],
    ["❖", "安全可靠", "端到端加密与多重备份，数据安全固若金汤。"],
  ];
  return `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"PingFang SC",sans-serif;background:${bg};color:#fff;overflow-x:hidden}
.hero{min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;position:relative}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(600px 400px at 50% 20%,${c1}33,transparent 70%)}
.badge{position:relative;border:1px solid ${c1}66;color:${c1};padding:6px 16px;border-radius:99px;font-size:13px;background:${c1}1a}
h1{position:relative;font-size:clamp(36px,7vw,68px);margin:24px 0 16px;background:linear-gradient(120deg,#fff 30%,${c1} 60%,${c2});-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:-1px}
.sub{position:relative;color:#ffffffa0;max-width:480px;line-height:1.8}
.cta{position:relative;margin-top:36px;display:inline-block;padding:14px 40px;border-radius:14px;background:linear-gradient(120deg,${c1},${c2});color:#fff;text-decoration:none;font-weight:600;box-shadow:0 12px 40px ${c1}55;transition:.3s}
.cta:hover{transform:translateY(-2px);box-shadow:0 18px 50px ${c1}77}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;max-width:960px;margin:0 auto;padding:60px 24px}
.card{background:#ffffff08;border:1px solid #ffffff14;border-radius:18px;padding:28px;transition:.3s}
.card:hover{transform:translateY(-4px);border-color:${c1}66}
.card .ic{width:44px;height:44px;border-radius:12px;background:${c1}22;color:${c1};display:flex;align-items:center;justify-content:center;font-size:20px}
.card h3{margin:16px 0 10px;font-size:17px}
.card p{color:#ffffff90;font-size:13.5px;line-height:1.7}
footer{text-align:center;padding:40px;color:#ffffff50;font-size:13px;border-top:1px solid #ffffff10}
</style></head><body>
<section class="hero">
  <span class="badge">✨ 由 Prism 棱镜 AI 生成</span>
  <h1>${title}</h1>
  <p class="sub">把想象折射成现实。这个页面由 AI 一次生成——排版、配色、动效全部就绪，改一行字就能上线。</p>
  <a class="cta" href="#f">立即探索 →</a>
</section>
<section class="grid" id="f">
${features.map(([ic, t, d]) => `  <div class="card"><div class="ic">${ic}</div><h3>${t}</h3><p>${d}</p></div>`).join("\n")}
</section>
<footer>© 2026 ${title} · Generated by Prism 棱镜</footer>
</body></html>`;
}

// ============ 游戏 ============

export function generateGame(prompt) {
  const rand = rng(hashSeed(prompt || "game"));
  const [c1, c2] = pick(rand, PALETTES);
  const speed = 1.5 + rand() * 1.2;
  const title = (prompt || "").trim().slice(0, 12) || "光子守护者";
  return `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{margin:0;padding:0}body{background:#0a0a12;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,"PingFang SC",sans-serif;color:#fff}
canvas{border-radius:16px;border:1px solid #ffffff1f;background:radial-gradient(500px 300px at 50% 0%,${c1}14,#0d0d17);cursor:none;max-width:100%}
.hud{margin:14px;font-size:13px;color:#ffffff90}
b{color:${c1}}
</style></head><body>
<canvas id="c" width="560" height="420"></canvas>
<div class="hud">← → 或鼠标移动接住光子 · 漏掉 3 个游戏结束 · <b>${title}</b></div>
<script>
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const W=560,H=420;let px=W/2,score=0,lives=3,over=false,tick=0;
const photons=[],parts=[],COLORS=['${c1}','${c2}','#34d399','#fbbf24','#f472b6'];
addEventListener('keydown',e=>{if(e.key==='ArrowLeft')px-=34;if(e.key==='ArrowRight')px+=34;if(over&&e.key===' ')reset()});
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();px=(e.clientX-r.left)*(W/r.width)});
cv.addEventListener('click',()=>{if(over)reset()});
function reset(){score=0;lives=3;over=false;photons.length=0;parts.length=0}
function spawn(){photons.push({x:30+Math.random()*(W-60),y:-10,v:${speed.toFixed(2)}+Math.random()*1.6+score*0.02,c:COLORS[Math.floor(Math.random()*COLORS.length)],r:6+Math.random()*4})}
function boom(x,y,c){for(let i=0;i<14;i++)parts.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,c,l:1})}
function loop(){
ctx.clearRect(0,0,W,H);tick++;
if(!over&&tick%Math.max(22,52-Math.floor(score/3))===0)spawn();
px=Math.max(40,Math.min(W-40,px));
// 棱镜挡板
ctx.save();ctx.translate(px,H-30);
const g=ctx.createLinearGradient(-36,0,36,0);g.addColorStop(0,'${c1}');g.addColorStop(1,'${c2}');
ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(38,10);ctx.lineTo(-38,10);ctx.closePath();
ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.stroke();ctx.fillStyle='${c1}22';ctx.fill();ctx.restore();
for(let i=photons.length-1;i>=0;i--){const p=photons[i];p.y+=over?0:p.v;
ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=p.c;ctx.shadowColor=p.c;ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;
if(p.y>H-46&&p.y<H-16&&Math.abs(p.x-px)<44){score++;boom(p.x,p.y,p.c);photons.splice(i,1)}
else if(p.y>H+10){photons.splice(i,1);if(!over&&--lives<=0)over=true}}
for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.x+=q.vx;q.y+=q.vy;q.l-=.03;
if(q.l<=0){parts.splice(i,1);continue}
ctx.globalAlpha=q.l;ctx.fillRect(q.x,q.y,3,3);ctx.fillStyle=q.c;ctx.globalAlpha=1}
ctx.fillStyle='#fff';ctx.font='600 15px sans-serif';ctx.fillText('得分 '+score,16,26);
ctx.fillStyle='#f87171';ctx.fillText('❤'.repeat(Math.max(0,lives)),W-70,26);
if(over){ctx.fillStyle='#000a';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';
ctx.font='700 30px sans-serif';ctx.fillText('游戏结束',W/2,H/2-16);
ctx.font='14px sans-serif';ctx.fillStyle='#ffffffa0';ctx.fillText('最终得分 '+score+' · 点击或按空格重开',W/2,H/2+18);ctx.textAlign='left'}
requestAnimationFrame(loop)}
loop();
</script></body></html>`;
}

/** 根据 system 提示中的工坊标记生成内容，返回 null 表示非工坊请求 */
export function studioReply(systemText, userText) {
  if (!systemText) return null;
  if (systemText.includes("PRISM_STUDIO:music")) {
    return "```json\n" + JSON.stringify(generateMusic(userText), null, 1) + "\n```";
  }
  if (systemText.includes("PRISM_STUDIO:site")) {
    return "```html\n" + generateSite(userText) + "\n```";
  }
  if (systemText.includes("PRISM_STUDIO:game")) {
    return "```html\n" + generateGame(userText) + "\n```";
  }
  return null;
}
