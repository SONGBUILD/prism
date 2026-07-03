/** 手工设计开发的完整网页作品（单文件 HTML，无外部依赖） */

export const SITE_COFFEE = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>拾光咖啡 · 手冲专门店</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--amber:#d9962e;--cream:#f5ead8;--ink:#221a12;--paper:#171008}
body{font-family:-apple-system,"PingFang SC",serif;background:var(--paper);color:var(--cream);overflow-x:hidden}
.hero{min-height:92vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;position:relative}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 460px at 50% 15%,#d9962e26,transparent 70%)}
.steam{position:relative;font-size:56px;animation:float 3.4s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.kicker{position:relative;letter-spacing:6px;font-size:12px;color:var(--amber);margin-top:22px}
h1{position:relative;font-size:clamp(40px,7vw,72px);margin:14px 0 18px;font-weight:800;letter-spacing:2px}
h1 em{font-style:normal;color:var(--amber)}
.sub{position:relative;color:#f5ead8aa;max-width:440px;line-height:2;font-size:14.5px}
.cta{position:relative;margin-top:36px;padding:14px 44px;border-radius:99px;border:1px solid var(--amber);color:var(--amber);text-decoration:none;font-size:14px;letter-spacing:3px;transition:.35s}
.cta:hover{background:var(--amber);color:var(--ink);box-shadow:0 14px 44px #d9962e55}
.line{width:1px;height:64px;background:linear-gradient(#d9962e,transparent);margin:40px auto 0;position:relative}
section{max-width:960px;margin:0 auto;padding:72px 24px}
h2{text-align:center;font-size:28px;letter-spacing:4px}
h2 span{color:var(--amber)}
.menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:44px}
.item{border:1px solid #f5ead81f;border-radius:18px;padding:26px;background:#f5ead806;transition:.35s;position:relative;overflow:hidden}
.item:hover{transform:translateY(-5px);border-color:#d9962e66;background:#d9962e0d}
.item .no{position:absolute;right:18px;top:12px;font-size:40px;color:#f5ead810;font-weight:800}
.item h3{font-size:17px;letter-spacing:1px}
.item .org{font-size:11px;color:var(--amber);letter-spacing:2px;margin-top:4px}
.item p{margin-top:14px;font-size:13px;color:#f5ead890;line-height:1.9}
.item .price{margin-top:16px;font-size:15px;color:var(--amber)}
.story{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}
.story .art{aspect-ratio:1;border-radius:20px;background:conic-gradient(from 210deg at 60% 40%,#2a1c0d,#4a301b,#2a1c0d),radial-gradient(circle at 35% 35%,#d9962e33,transparent 60%);border:1px solid #f5ead81f;display:flex;align-items:center;justify-content:center;font-size:80px}
.story p{color:#f5ead8a8;line-height:2.2;font-size:14px;margin-top:16px}
.story b{color:var(--amber)}
footer{border-top:1px solid #f5ead81a;padding:36px;text-align:center;color:#f5ead860;font-size:12px;letter-spacing:2px}
@media(max-width:720px){.story{grid-template-columns:1fr}}
</style></head><body>
<div class="hero">
  <div class="steam">☕</div>
  <div class="kicker">SINCE 2019 · HAND DRIP ONLY</div>
  <h1>拾光<em>咖啡</em></h1>
  <p class="sub">一间只做手冲的小店。豆子每周直采，水温精确到度，等待一杯咖啡的四分钟，是留给自己的时间。</p>
  <a class="cta" href="#menu">本周豆单</a>
  <div class="line"></div>
</div>
<section id="menu">
  <h2>本周<span>豆单</span></h2>
  <div class="menu">
    <div class="item"><div class="no">01</div><h3>埃塞俄比亚 · 耶加雪菲</h3><div class="org">WASHED · G1</div><p>茉莉花与柠檬皮的清亮，尾韵是杏桃甜。适合第一次喝手冲的你。</p><div class="price">¥ 42</div></div>
    <div class="item"><div class="no">02</div><h3>巴拿马 · 瑰夏</h3><div class="org">NATURAL · BOQUETE</div><p>热带水果炸弹，佛手柑、荔枝与蜂蜜层层展开，每年只有三个月。</p><div class="price">¥ 88</div></div>
    <div class="item"><div class="no">03</div><h3>云南 · 孟连日晒</h3><div class="org">NATURAL · 1600M</div><p>被低估的国产精品，红糖与酒渍樱桃，醇厚里带一点野。</p><div class="price">¥ 36</div></div>
  </div>
</section>
<section>
  <div class="story">
    <div class="art">🫘</div>
    <div>
      <h2 style="text-align:left">为什么<span>只做手冲</span></h2>
      <p>因为快不是我们的事。<b>93°C 的水</b>、<b>1:15 的粉水比</b>、三段式注水——每个变量我们都试过上百次，只为让同一支豆子稳定地好喝。</p>
      <p>店里没有 Wi-Fi 密码，但有一整面墙的手冲器具和愿意跟你聊豆子的主理人。</p>
    </div>
  </div>
</section>
<footer>拾光咖啡 SHIGUANG COFFEE · 每日 10:00 – 20:00 · 周三店休</footer>
</body></html>`

export const SITE_PORTFOLIO = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOVA · 数字产品设计师</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"PingFang SC",sans-serif;background:#0b0b0f;color:#ececf1;overflow-x:hidden}
nav{position:sticky;top:0;display:flex;align-items:center;gap:28px;padding:20px 40px;background:#0b0b0fd0;backdrop-filter:blur(14px);border-bottom:1px solid #ffffff10;z-index:9}
nav b{font-size:18px;letter-spacing:1px}
nav b i{font-style:normal;color:#7cf5c8}
nav a{color:#ececf1a0;text-decoration:none;font-size:13px;transition:.25s}
nav a:hover{color:#fff}
nav .hire{margin-left:auto;border:1px solid #7cf5c855;color:#7cf5c8;padding:8px 20px;border-radius:99px}
nav .hire:hover{background:#7cf5c8;color:#0b0b0f}
.hero{padding:110px 40px 80px;max-width:1080px;margin:0 auto}
.hero .tag{color:#7cf5c8;font-size:13px;letter-spacing:4px}
h1{font-size:clamp(44px,8vw,92px);line-height:1.06;letter-spacing:-2px;margin:18px 0}
h1 .stroke{color:transparent;-webkit-text-stroke:1.5px #ececf166}
.hero p{color:#ececf190;max-width:460px;line-height:2}
.marquee{border-block:1px solid #ffffff12;padding:16px 0;overflow:hidden;white-space:nowrap}
.marquee div{display:inline-block;animation:roll 18s linear infinite;color:#ececf155;font-size:14px;letter-spacing:3px}
@keyframes roll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.works{max-width:1080px;margin:0 auto;padding:80px 40px}
.works h2{font-size:26px;margin-bottom:36px}
.works h2 i{font-style:normal;color:#7cf5c8}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px}
.card{border-radius:20px;border:1px solid #ffffff14;overflow:hidden;background:#111118;transition:.4s;cursor:pointer}
.card:hover{transform:translateY(-6px);border-color:#7cf5c855;box-shadow:0 26px 70px -30px #7cf5c833}
.card .cover{height:190px;display:flex;align-items:center;justify-content:center;font-size:52px}
.c1{background:linear-gradient(135deg,#16233a,#0e3b33)}
.c2{background:linear-gradient(135deg,#2a1633,#3a1626)}
.c3{background:linear-gradient(135deg,#332916,#16332a)}
.card .body{padding:20px 22px 24px}
.card h3{font-size:16px}
.card p{margin-top:8px;font-size:12.5px;color:#ececf180;line-height:1.8}
.card .chips{margin-top:14px;display:flex;gap:6px}
.card .chips span{font-size:11px;color:#7cf5c8;border:1px solid #7cf5c833;padding:3px 10px;border-radius:99px}
footer{border-top:1px solid #ffffff10;padding:48px 40px;text-align:center}
footer a{color:#7cf5c8;font-size:22px;text-decoration:none;letter-spacing:1px}
footer p{margin-top:10px;color:#ececf155;font-size:12px}
</style></head><body>
<nav><b>NOVA<i>.design</i></b><a href="#works">作品</a><a href="#">关于</a><a class="hire" href="#">聊个项目 →</a></nav>
<div class="hero">
  <div class="tag">PRODUCT DESIGNER · 6 YRS</div>
  <h1>把复杂问题<br>设计成<span class="stroke">简单的样子</span></h1>
  <p>我是 Nova，专注 B 端产品与设计系统。相信好的设计不是加法，是一次次克制的减法。</p>
</div>
<div class="marquee"><div>FIGMA · DESIGN SYSTEM · PROTOTYPE · MOTION · WEBGL · BRAND · FIGMA · DESIGN SYSTEM · PROTOTYPE · MOTION · WEBGL · BRAND ·&nbsp;</div></div>
<div class="works" id="works">
  <h2>精选作品 <i>/ 2024—2026</i></h2>
  <div class="grid">
    <div class="card"><div class="cover c1">📊</div><div class="body"><h3>Skyline 数据中台</h3><p>为 3000+ 分析师重构的可视化工作台，图表配置耗时从 6 分钟降到 40 秒。</p><div class="chips"><span>设计系统</span><span>数据可视化</span></div></div></div>
    <div class="card"><div class="cover c2">🎧</div><div class="body"><h3>Wavely 播客社区</h3><p>从 0 到 1 的声音社区，上线三个月留存 42%，App Store 编辑推荐。</p><div class="chips"><span>0→1</span><span>移动端</span></div></div></div>
    <div class="card"><div class="cover c3">🛰</div><div class="body"><h3>Orbit 协作白板</h3><p>多人实时协作的无限画布，重新定义了团队的远程脑暴方式。</p><div class="chips"><span>实时协作</span><span>WebGL</span></div></div></div>
  </div>
</div>
<footer><a href="#">hello@nova.design</a><p>© 2026 NOVA · 用设计让世界少一点摩擦</p></footer>
</body></html>`

export const SITE_HR = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>喵星科技 · 招聘官网</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--pink:#ff6fa8;--pink2:#ff9dc4;--light:#ffe3ee;--cream:#fff6fa;--ink:#5a3446;--gold:#ffd166}
body{font-family:-apple-system,"PingFang SC",sans-serif;background:var(--cream);color:var(--ink);overflow-x:hidden}
nav{position:sticky;top:0;z-index:9;display:flex;align-items:center;gap:26px;padding:16px 40px;background:#fff6fac0;backdrop-filter:blur(14px);border-bottom:2px dashed #ff6fa833}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px}
.logo .ears{position:relative;width:34px;height:30px}
.logo .ears::before,.logo .ears::after{content:"";position:absolute;top:-6px;width:14px;height:16px;background:var(--pink);border-radius:50% 50% 0 0}
.logo .ears::before{left:0;transform:rotate(-14deg)}
.logo .ears::after{right:0;transform:rotate(14deg)}
.logo .ears span{position:absolute;bottom:0;left:2px;width:30px;height:24px;background:#fff;border:2.5px solid var(--pink);border-radius:50%}
nav a{color:#5a3446a0;text-decoration:none;font-size:13.5px;font-weight:600}
nav a:hover{color:var(--pink)}
nav .cta{margin-left:auto;background:var(--pink);color:#fff;padding:10px 22px;border-radius:99px;font-weight:700;box-shadow:0 10px 26px -8px #ff6fa899}
.hero{max-width:1100px;margin:0 auto;padding:70px 40px 40px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center}
.hero .tag{display:inline-flex;align-items:center;gap:6px;background:var(--light);color:var(--pink);padding:7px 16px;border-radius:99px;font-size:12.5px;font-weight:700}
h1{font-size:clamp(32px,5vw,50px);line-height:1.28;margin:18px 0;font-weight:800}
h1 i{font-style:normal;color:var(--pink)}
.hero p{color:#5a344690;line-height:1.9;font-size:14.5px;max-width:420px}
.btns{margin-top:28px;display:flex;gap:14px}
.btn1{background:var(--pink);color:#fff;padding:14px 28px;border-radius:99px;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 14px 34px -10px #ff6fa8aa}
.btn2{border:2px solid var(--pink2);color:var(--pink);padding:12px 26px;border-radius:99px;text-decoration:none;font-weight:700;font-size:14px}
.mascot{position:relative;aspect-ratio:1;display:flex;align-items:center;justify-content:center}
.face{position:relative;width:76%;aspect-ratio:1;background:#fff;border-radius:50%;border:4px solid var(--pink);box-shadow:0 30px 70px -30px #ff6fa877}
.face::before,.face::after{content:"";position:absolute;top:-16%;width:34%;height:38%;background:#fff;border:4px solid var(--pink);border-radius:60% 60% 0 55%}
.face::before{left:2%;transform:rotate(-24deg)}
.face::after{right:2%;transform:rotate(24deg);border-radius:60% 60% 55% 0}
.eye{position:absolute;top:44%;width:9%;height:9%;background:var(--ink);border-radius:50%}
.eye.l{left:28%}.eye.r{right:28%}
.nose{position:absolute;top:53%;left:50%;transform:translateX(-50%);width:7%;height:5%;background:var(--gold);border-radius:50%}
.whisker{position:absolute;top:56%;width:22%;height:2px;background:#5a344640}
.whisker.l1{left:-14%}.whisker.l2{left:-14%;top:60%}
.whisker.r1{right:-14%}.whisker.r2{right:-14%;top:60%}
.bow{position:absolute;top:-2%;right:12%;width:15%;aspect-ratio:1.4;z-index:2}
.bow::before,.bow::after{content:"";position:absolute;top:0;width:44%;height:100%;background:var(--gold);border-radius:40%}
.bow::before{left:0;transform:rotate(-18deg)}
.bow::after{right:0;transform:rotate(18deg)}
section{max-width:1100px;margin:0 auto;padding:60px 40px}
h2{text-align:center;font-size:26px;font-weight:800}
h2 i{font-style:normal;color:var(--pink)}
.sub2{text-align:center;color:#5a344680;font-size:13.5px;margin-top:8px}
.perks{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-top:36px}
.perk{background:#fff;border:2px solid var(--light);border-radius:20px;padding:22px 16px;text-align:center;transition:.3s}
.perk:hover{transform:translateY(-6px) rotate(-1deg);border-color:var(--pink2);box-shadow:0 20px 40px -20px #ff6fa877}
.perk .ic{font-size:30px}
.perk h4{margin-top:10px;font-size:13.5px}
.perk p{margin-top:6px;font-size:11.5px;color:#5a344680;line-height:1.6}
.jobs{margin-top:36px;display:flex;flex-direction:column;gap:12px}
.job{display:flex;align-items:center;gap:16px;background:#fff;border:2px solid var(--light);border-radius:18px;padding:18px 22px;transition:.3s}
.job:hover{border-color:var(--pink2);transform:translateX(4px)}
.job .badge{background:var(--light);color:var(--pink);font-size:11px;font-weight:700;padding:5px 12px;border-radius:99px;white-space:nowrap}
.job .info h4{font-size:15px}
.job .info p{margin-top:4px;font-size:12px;color:#5a344680}
.job .apply{margin-left:auto;background:var(--pink);color:#fff;padding:9px 20px;border-radius:99px;font-size:12.5px;font-weight:700;white-space:nowrap;text-decoration:none}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:36px}
.gcard{aspect-ratio:1.1;border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:44px;color:#fff}
.g1{background:linear-gradient(135deg,#ff9dc4,#ff6fa8)}
.g2{background:linear-gradient(135deg,#ffd166,#ffb85e)}
.g3{background:linear-gradient(135deg,#b8a4ff,#8f7aff)}
.g4{background:linear-gradient(135deg,#7ce0c8,#4fc9ab)}
footer{text-align:center;padding:50px 40px;border-top:2px dashed #ff6fa833}
footer .logo{justify-content:center;margin-bottom:12px}
footer p{color:#5a344670;font-size:12px;margin-top:6px}
@media(max-width:760px){.hero{grid-template-columns:1fr}.mascot{order:-1;max-width:240px;margin:0 auto}}
</style></head><body>
<nav>
  <div class="logo"><div class="ears"><span></span></div>喵星科技</div>
  <a href="#jobs">开放职位</a><a href="#culture">团队日常</a><a href="#perks">员工福利</a>
  <a class="cta" href="#jobs">投递简历 🎀</a>
</nav>
<div class="hero">
  <div>
    <div class="tag">😺 2026 校招 · 社招同步开启</div>
    <h1>和一群猫系人类，<br>一起做点<i>有趣的产品</i></h1>
    <p>喵星科技是一家做互联网产品的小公司，我们不加班文化，但很拼创意。这里没有森严的层级，只有一群认真做事、彼此可爱的同事。</p>
    <div class="btns"><a class="btn1" href="#jobs">查看职位 →</a><a class="btn2" href="#culture">了解团队</a></div>
  </div>
  <div class="mascot">
    <div class="face">
      <div class="bow"></div>
      <div class="eye l"></div><div class="eye r"></div>
      <div class="nose"></div>
      <div class="whisker l1"></div><div class="whisker l2"></div>
      <div class="whisker r1"></div><div class="whisker r2"></div>
    </div>
  </div>
</div>
<section id="perks">
  <h2>员工<i>福利</i></h2>
  <p class="sub2">不画大饼，都是真的每天在享受的小确幸</p>
  <div class="perks">
    <div class="perk"><div class="ic">☕</div><h4>下午茶自由</h4><p>每天 3 点自动配送</p></div>
    <div class="perk"><div class="ic">🐾</div><h4>猫咖办公区</h4><p>工位养猫，划水名正言顺</p></div>
    <div class="perk"><div class="ic">⏰</div><h4>弹性工作制</h4><p>核心时间 10-16 点</p></div>
    <div class="perk"><div class="ic">🎂</div><h4>生日惊喜</h4><p>全员手写卡片 + 蛋糕</p></div>
    <div class="perk"><div class="ic">🩺</div><h4>六险二金</h4><p>补充商业医疗险</p></div>
    <div class="perk"><div class="ic">✈️</div><h4>年度团建旅行</h4><p>去年去了大理喂猫</p></div>
  </div>
</section>
<section id="jobs">
  <h2>开放<i>职位</i></h2>
  <p class="sub2">互联网核心岗位持续招募中，欢迎猫系 / 狗系人类投递</p>
  <div class="jobs">
    <div class="job"><span class="badge">社招</span><div class="info"><h4>前端工程师（Vue/React）</h4><p>技术部 · 上海 · 3-5 年经验</p></div><a class="apply" href="#">投递 →</a></div>
    <div class="job"><span class="badge">社招</span><div class="info"><h4>后端工程师（Node/Go）</h4><p>技术部 · 上海 / 远程 · 3-6 年经验</p></div><a class="apply" href="#">投递 →</a></div>
    <div class="job"><span class="badge">校招</span><div class="info"><h4>产品经理（应届生）</h4><p>产品部 · 上海 · 2026 届</p></div><a class="apply" href="#">投递 →</a></div>
    <div class="job"><span class="badge">社招</span><div class="info"><h4>UI / 视觉设计师</h4><p>设计部 · 上海 · 2 年以上</p></div><a class="apply" href="#">投递 →</a></div>
    <div class="job"><span class="badge">实习</span><div class="info"><h4>测试开发实习生</h4><p>技术部 · 上海 · 长期实习优先</p></div><a class="apply" href="#">投递 →</a></div>
    <div class="job"><span class="badge">社招</span><div class="info"><h4>用户增长运营</h4><p>市场部 · 上海 · 2-4 年经验</p></div><a class="apply" href="#">投递 →</a></div>
  </div>
</section>
<section id="culture">
  <h2>团队<i>日常</i></h2>
  <div class="gallery">
    <div class="gcard g1">🎉</div>
    <div class="gcard g2">🐱</div>
    <div class="gcard g3">🎨</div>
    <div class="gcard g4">🍰</div>
  </div>
</section>
<footer>
  <div class="logo"><div class="ears"><span></span></div>喵星科技</div>
  <p>hr@meowstar.dev · 投递简历请附上一张你和猫（或狗）的合照</p>
  <p>© 2026 喵星科技 · 认真做产品，也认真撸猫</p>
</footer>
</body></html>`

export const SITE_FINANCE = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>衡瑞资本 · HENGRUI CAPITAL</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--navy:#0a1a2f;--navy2:#0f2744;--gold:#c9a227;--paper:#f4f1ea;--ink:#111}
body{font-family:-apple-system,"PingFang SC",Georgia,serif;background:var(--navy);color:#e8ecf3;overflow-x:hidden}
nav{position:sticky;top:0;z-index:9;display:flex;align-items:center;gap:32px;padding:20px 48px;background:#0a1a2fe0;backdrop-filter:blur(14px);border-bottom:1px solid #c9a22733}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:1px}
.logo .mark{width:24px;height:24px;background:linear-gradient(135deg,var(--gold),#8a7013);transform:rotate(45deg);border-radius:4px}
nav a{color:#e8ecf3a0;text-decoration:none;font-size:13px;letter-spacing:.5px}
nav a:hover{color:var(--gold)}
nav .cta{margin-left:auto;border:1px solid var(--gold);color:var(--gold);padding:9px 22px;font-size:12.5px;letter-spacing:1px}
nav .cta:hover{background:var(--gold);color:var(--navy)}
.hero{max-width:1120px;margin:0 auto;padding:100px 48px 60px;position:relative}
.hero::before{content:"";position:absolute;inset:0;background:
  linear-gradient(#c9a22712 1px,transparent 1px) 0 0/100% 64px,
  linear-gradient(90deg,#c9a22712 1px,transparent 1px) 0 0/64px 100%;
  mask-image:radial-gradient(600px 320px at 70% 30%,#000,transparent);pointer-events:none}
.hero .tag{position:relative;color:var(--gold);font-size:12.5px;letter-spacing:5px}
h1{position:relative;font-size:clamp(34px,5.2vw,58px);line-height:1.22;margin:20px 0 22px;font-weight:700;max-width:720px}
h1 span{color:var(--gold)}
.hero p{position:relative;color:#e8ecf3a0;max-width:480px;line-height:2;font-size:14.5px}
.hero .cta-row{position:relative;margin-top:34px;display:flex;gap:16px}
.pbtn{background:var(--gold);color:var(--navy);padding:14px 30px;text-decoration:none;font-weight:700;font-size:13.5px;letter-spacing:.5px}
.sbtn{border:1px solid #e8ecf340;color:#e8ecf3;padding:13px 28px;text-decoration:none;font-size:13.5px;letter-spacing:.5px}
.stats{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:70px;padding-top:36px;border-top:1px solid #c9a22733}
.stat b{font-size:clamp(24px,3vw,34px);color:var(--gold);display:block;font-weight:700}
.stat span{font-size:12px;color:#e8ecf380;letter-spacing:.5px}
section{max-width:1120px;margin:0 auto;padding:70px 48px}
.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap}
.section-head .kicker{color:var(--gold);font-size:12px;letter-spacing:4px}
h2{font-size:28px;margin-top:10px;font-weight:700}
.section-head p{color:#e8ecf380;font-size:13px;max-width:340px;line-height:1.8}
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px;background:#c9a22733;margin-top:40px;border:1px solid #c9a22733}
.svc{background:var(--navy);padding:34px 26px}
.svc .num{color:var(--gold);font-size:12px;letter-spacing:2px}
.svc h3{margin-top:14px;font-size:17px}
.svc p{margin-top:12px;color:#e8ecf380;font-size:13px;line-height:1.9}
.chart-wrap{margin-top:44px;background:var(--navy2);border:1px solid #c9a22733;padding:32px;display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center}
.chart-wrap .desc h3{font-size:19px}
.chart-wrap .desc p{margin-top:12px;color:#e8ecf380;font-size:13px;line-height:1.9}
.chart-wrap svg{width:100%;height:auto}
.team{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;margin-top:40px}
.member{background:var(--navy2);border:1px solid #c9a22733;padding:26px}
.avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#6d5a11);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--navy);font-size:16px}
.member h4{margin-top:16px;font-size:15px}
.member .role{color:var(--gold);font-size:11.5px;letter-spacing:1px;margin-top:3px}
.member p{margin-top:12px;font-size:12.5px;color:#e8ecf380;line-height:1.8}
.trust{display:flex;flex-wrap:wrap;gap:14px;margin-top:36px;justify-content:center}
.trust span{border:1px solid #e8ecf326;padding:10px 22px;font-size:12px;letter-spacing:1px;color:#e8ecf380}
.cta-block{text-align:center;background:var(--navy2);border:1px solid #c9a22733;padding:64px 40px}
.cta-block h2{font-size:26px}
.cta-block p{margin-top:14px;color:#e8ecf380;font-size:13.5px}
.cta-block .pbtn{display:inline-block;margin-top:26px}
footer{border-top:1px solid #c9a22733;padding:40px 48px;text-align:center}
footer p{color:#e8ecf355;font-size:11.5px;line-height:1.9;max-width:640px;margin:0 auto}
@media(max-width:760px){.stats{grid-template-columns:repeat(2,1fr)}.chart-wrap{grid-template-columns:1fr}}
</style></head><body>
<nav>
  <div class="logo"><div class="mark"></div>衡瑞资本</div>
  <a href="#services">业务</a><a href="#track">业绩</a><a href="#team">团队</a>
  <a class="cta" href="#contact">预约咨询</a>
</nav>
<div class="hero">
  <div class="tag">HENGRUI CAPITAL · EST. 2011</div>
  <h1>穿越周期的<span>资产配置</span>智慧，为长期主义者服务</h1>
  <p>衡瑞资本专注高净值客户的全权委托与家族财富传承，以严谨的量化研究与全球化资产配置，追求风险调整后的长期稳健回报。</p>
  <div class="cta-row"><a class="pbtn" href="#contact">预约投资顾问</a><a class="sbtn" href="#track">查看业绩报告</a></div>
  <div class="stats">
    <div class="stat"><b>¥ 380亿+</b><span>资产管理规模 AUM</span></div>
    <div class="stat"><b>2,400+</b><span>服务高净值客户</span></div>
    <div class="stat"><b>9.6%</b><span>近十年平均年化</span></div>
    <div class="stat"><b>15 年</b><span>穿越牛熊的经营历史</span></div>
  </div>
</div>
<section id="services">
  <div class="section-head">
    <div><div class="kicker">CORE SERVICES</div><h2>四大核心业务</h2></div>
    <p>围绕客户全生命周期的财富需求，提供一站式专业解决方案。</p>
  </div>
  <div class="services">
    <div class="svc"><div class="num">01</div><h3>全权委托资产配置</h3><p>基于风险画像的多资产动态配置，覆盖股票、债券、另类投资与现金管理。</p></div>
    <div class="svc"><div class="num">02</div><h3>私募股权投资</h3><p>精选一级市场优质项目，参与企业成长早期与中期的价值创造过程。</p></div>
    <div class="svc"><div class="num">03</div><h3>家族信托与传承</h3><p>为高净值家庭设计跨代资产隔离与传承方案，兼顾税务与治理效率。</p></div>
    <div class="svc"><div class="num">04</div><h3>跨境资产配置</h3><p>依托合规通道布局全球核心市场，分散单一市场系统性风险。</p></div>
  </div>
</section>
<section id="track">
  <div class="section-head">
    <div><div class="kicker">TRACK RECORD</div><h2>业绩与规模双增长</h2></div>
    <p>2016—2026 十年管理规模变化，穿越多轮市场周期仍保持稳健增长曲线。</p>
  </div>
  <div class="chart-wrap">
    <svg viewBox="0 0 400 200" preserveAspectRatio="none">
      <polyline points="0,170 40,150 80,158 120,120 160,130 200,90 240,100 280,60 320,68 360,30 400,20" fill="none" stroke="#c9a227" stroke-width="3"/>
      <polygon points="0,170 40,150 80,158 120,120 160,130 200,90 240,100 280,60 320,68 360,30 400,20 400,200 0,200" fill="url(#g1)" opacity="0.35"/>
      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a227"/><stop offset="1" stop-color="#c9a227" stop-opacity="0"/></linearGradient></defs>
    </svg>
    <div class="desc">
      <h3>规模复合增长率 24.6%</h3>
      <p>自 2016 年以来，衡瑞资本管理规模保持稳健复合增长，历经三次市场大幅波动，客户留存率始终维持在 92% 以上，印证长期主义投资理念的有效性。</p>
    </div>
  </div>
</section>
<section id="team">
  <div class="section-head">
    <div><div class="kicker">LEADERSHIP</div><h2>核心投研团队</h2></div>
    <p>平均从业年限 18 年，来自顶级投行与资管机构的资深团队。</p>
  </div>
  <div class="team">
    <div class="member"><div class="avatar">陈</div><h4>陈望舒</h4><div class="role">创始合伙人 · 首席投资官</div><p>曾任职于大型公募基金，20 年宏观与资产配置研究经验。</p></div>
    <div class="member"><div class="avatar">林</div><h4>林知远</h4><div class="role">合伙人 · 私募股权负责人</div><p>专注一级市场投资 15 年，主导过多起标志性并购案例。</p></div>
    <div class="member"><div class="avatar">苏</div><h4>苏晚晴</h4><div class="role">合伙人 · 家族办公室负责人</div><p>擅长跨境税务架构与家族信托设计，服务上百个高净值家庭。</p></div>
  </div>
  <div class="trust">
    <span>中国证券投资基金业协会会员</span><span>合格境内机构投资者 QDII</span><span>ISO 27001 信息安全认证</span>
  </div>
</section>
<section id="contact">
  <div class="cta-block">
    <h2>与专业投资顾问，聊聊你的财富规划</h2>
    <p>一对一深度访谈，为您定制专属资产配置方案，全程保密。</p>
    <a class="pbtn" href="mailto:ir@hengruicapital.com">预约咨询 →</a>
  </div>
</section>
<footer>
  <p>本页面展示内容仅为产品设计演示，不构成任何投资建议。投资有风险，入市需谨慎，过往业绩不代表未来表现。<br>© 2026 衡瑞资本 HENGRUI CAPITAL · 沪ICP备00000000号</p>
</footer>
</body></html>`

export const SITE_DEMOS = [
  {
    id: 'coffee',
    title: '拾光咖啡 · 品牌官网',
    desc: '暖调衬线排版 · 蒸汽浮动动效 · 豆单卡片 · 品牌叙事分区',
    html: SITE_COFFEE,
  },
  {
    id: 'portfolio',
    title: 'NOVA · 设计师作品集',
    desc: '描边大字标题 · 无缝滚动 Marquee · 作品网格悬停 · 冷萃绿点缀',
    html: SITE_PORTFOLIO,
  },
  {
    id: 'hr',
    title: '喵星科技 · 招聘官网',
    desc: '粉萌猫系风格 · CSS 手绘猫咪吉祥物 · 互联网岗位招聘 · 员工福利卡片',
    html: SITE_HR,
  },
  {
    id: 'finance',
    title: '衡瑞资本 · 财富管理官网',
    desc: '深蓝金专业质感 · AUM 数据看板 · SVG 业绩曲线 · 团队与合规信任背书',
    html: SITE_FINANCE,
  },
]
