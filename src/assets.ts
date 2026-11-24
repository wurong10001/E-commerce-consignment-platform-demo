// 由 scripts/bundle-assets.mjs 自动生成，请勿手动编辑。
// 源：demo/ —— 修改前端后重新运行：node scripts/bundle-assets.mjs
export interface Asset { body: string; contentType: string }
export const assets: Record<string, Asset> = {
  "/": { contentType: "text/html; charset=UTF-8", body: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#f5f5f7">
<title>电商代销平台 · 交互式演示</title>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<div id="app">

  <!-- ===== 桌面版侧栏（仅分辨率 ≥ 821px 显示） ===== -->
  <aside class="sidebar" aria-label="主导航">
    <div class="brand">
      <div class="brand-mark">DS</div>
      <div class="brand-text">
        <div class="brand-name">代销中台</div>
        <div class="brand-sub">E-Commerce Platform</div>
      </div>
    </div>
    <nav id="nav" class="nav-list">
      <button class="nav-item active" data-page="dashboard"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>总览看板</span></button>
      <button class="nav-item" data-page="products"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/></svg><span>商品与库存</span></button>
      <button class="nav-item" data-page="orders"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v5h5M9 12h8M9 16h8"/></svg><span>订单中心</span></button>
      <button class="nav-item" data-page="funds"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><circle cx="17" cy="14.5" r="1.25"/></svg><span>资金中台</span></button>
      <button class="nav-item" data-page="reconcile"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="11" cy="19" r="2"/></svg><span>对账中心</span></button>
      <button class="nav-item" data-page="commission"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg><span>分销佣金</span></button>
      <button class="nav-item" data-page="debug"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="4"/></svg><span>调试控制台</span></button>
    </nav>
    <div class="sidebar-footer">
      <div class="env-badge"><span class="live-dot"></span> 本地演示环境</div>
      <button id="resetBtn" class="btn-text">↺ 重置演示数据</button>
    </div>
  </aside>

  <!-- ===== 主区域 ===== -->
  <main class="main">
    <header id="topbar" class="topbar glass">
      <div class="topbar-inner">
        <div class="topbar-title">
          <h1 id="pageTitle">总览看板</h1>
          <p id="pageDesc">全链路业务与资金流实时概览</p>
        </div>
        <div class="topbar-right">
          <span class="clock" id="clock"></span>
          <span class="status-pill"><span class="live-dot"></span> 数据已就绪</span>
        </div>
      </div>
    </header>
    <div id="content" class="content"></div>
  </main>

  <!-- ===== 触摸版底部 Tab Bar（仅分辨率 ≤ 820px 显示） ===== -->
  <nav class="tabbar glass" aria-label="底部导航">
    <button class="tab active" data-page="dashboard"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>总览</span></button>
    <button class="tab" data-page="orders"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v5h5M9 12h8M9 16h8"/></svg><span>订单</span></button>
    <button class="tab" data-page="funds"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><circle cx="17" cy="14.5" r="1.25"/></svg><span>资金</span></button>
    <button class="tab" data-page="reconcile"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="11" cy="19" r="2"/></svg><span>对账</span></button>
    <button class="tab" data-page="debug"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="4"/></svg><span>调试</span></button>
  </nav>
</div>

<!-- 触摸版：页面切换时的“更多”入口（商品/佣金放在总览页入口卡片）-->

<!-- 弹层：桌面居中对话框 / 触摸版底部 sheet -->
<div id="scrim" class="scrim"></div>
<div id="modal" class="modal" role="dialog" aria-modal="true">
  <div class="modal-box">
    <div class="grab"></div>
    <div class="modal-head"><h3 id="modalTitle">提示</h3><button id="modalClose" class="icon-btn" aria-label="关闭">✕</button></div>
    <div id="modalBody" class="modal-body"></div>
    <div id="modalFoot" class="modal-foot"></div>
  </div>
</div>
<div id="toast" class="toast" role="status"></div>

<script src="js/seed.js"></script>
<script src="js/state.js"></script>
<script src="js/actions.js"></script>
<script src="js/utils.js"></script>
<script src="js/pages.js"></script>
<script src="js/pages2.js"></script>
<script src="js/app.js"></script>
</body>
</html>
` },
  "/css/tokens.css": { contentType: "text/css; charset=UTF-8", body: `/* ════════════════════════════════════════════════════════════════
   Apple Liquid Glass — design tokens
   Drop into any project. Reference everything via var(--…);
   never hard-code a raw value that a token already names.
   ════════════════════════════════════════════════════════════════ */

:root {
  /* ── Neutrals (the interface skeleton) ── */
  --bg:        #f5f5f7;   /* page ground — COOL grey-white, never warm/cream */
  --surface:   #ffffff;   /* panels / cards */
  --hover:     #fbfbfd;   /* row hover tint */
  --text:      #1d1d1f;   /* primary text / titles */
  --text-body: #424245;   /* long-form body */
  --text-2:    #6e6e73;   /* secondary / summary / meta */
  --text-3:    #86868b;   /* tertiary / captions */
  --text-4:    #aeaeb2;   /* placeholder / quaternary */
  --faint:     #d2d2d7;   /* index numbers, arrows, dividers (very light) */
  --hairline:  rgba(0,0,0,0.07);   /* the divider line — used everywhere */

  /* ── Accents (emphasis ONLY — body stays grayscale) ── */
  --accent:      #0071e3;  /* Apple blue — primary action / link / focus */
  --accent-link: #0066cc;  /* link/tag text on tinted ground */
  --indigo:      #5e5ce6;  /* gradient 2nd stop / supporting */
  --x-blue:      #1d9bf0;  /* platform / brand mark (e.g. X) */
  --heat:        #ff6b00;  /* heat / "hottest" accent */
  --heat-bg:     rgba(255,107,0,0.1);
  --live:        #30d158;  /* live / online (pulsing dot) */

  /* ── Signature gradients (hero / CTA / placeholder art ONLY) ── */
  --grad-blue: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);
  --grad-warm: linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%);
  --grad-green:linear-gradient(135deg, #30d158 0%, #0a84ff 100%);
  --grad-cta:  linear-gradient(135deg, #0071e3 0%, #5e5ce6 100%);

  /* ── Type ── */
  --font: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display',
          'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --mono: ui-monospace, 'SF Mono', Menlo, monospace;

  /* ── Radius (semantic tiers — don't invent in-between values) ── */
  --r-pill:  999px;  /* pills / segmented controls / tags / buttons */
  --r-chip:  6px;    /* tiny marks (platform badge, brand monogram) */
  --r-thumb: 12px;   /* thumbnails / small squares */
  --r-card:  18px;   /* standard card */
  --r-panel: 22px;   /* large panel / section container */
  --r-hero:  26px;   /* hero / CTA / focal card */
  --r-sheet: 16px;   /* overlay sheet/modal buttons — between thumb and card, for stacked full-width actions */

  /* ── Shadow (two-layer: tight contact + soft spread; never one hard shadow) ── */
  --sh-card:    0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05);
  --sh-panel:   0 1px 3px rgba(0,0,0,0.05), 0 14px 40px rgba(0,0,0,0.05);
  --sh-lift:    0 12px 32px rgba(0,0,0,0.1);          /* hover lift, with translateY(-3px) */
  --sh-cta:     0 20px 54px rgba(0,113,227,0.24);     /* colored CTA — tinted shadow */
  --sh-overlay: 0 2px 8px rgba(0,0,0,0.10), 0 30px 80px rgba(0,0,0,0.24); /* modal/sheet/popover — deeper than panel, still two-layer */

  /* ── Component greys (semantic — don't hand-pick a one-off grey) ── */
  --track:  #e8e8ed;  /* progress/meter track, toggle-off track — visible-but-quiet fill grey */

  /* ── Layout ── */
  --max-read: 720px;   /* reading column */
  --max-grid: 1080px;  /* grid / dense column */
  --pad-x:    22px;    /* container side padding */
}

/* Base reset + page ground (optional — include if not already set) */
/*
*  { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: var(--bg); color: var(--text); font-family: var(--font);
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}
*/

/* Liquid-glass frost — ONLY on sticky nav / overlay / colored-CTA labels */
.glass-nav {
  background: rgba(245,245,247,0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--hairline);
}
.glass-chip {            /* glass element ON a colored ground (needs blur orbs behind) */
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Live/online pulsing dot */
@keyframes pulse-dot {
  0%   { box-shadow: 0 0 0 0 rgba(48,209,88,0.5); }
  70%  { box-shadow: 0 0 0 7px rgba(48,209,88,0); }
  100% { box-shadow: 0 0 0 0 rgba(48,209,88,0); }
}

/* Motion easing (see motion.md) — spring-like curves, CSS-first */
:root {
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);   /* enter: sheets/dialogs/popovers (~400ms) */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1); /* small moves: hover, segmented slide (~200ms) */
}
` },
  "/css/styles.css": { contentType: "text/css; charset=UTF-8", body: `/* ══════════════════════════════════════════════════════════════════
   电商代销平台 · Apple Liquid Glass 视觉系统
   —— CSS 变量来自 tokens.css；玻璃只在图层重叠处（nav / 侧栏 / 弹层 / CTA）
   —— 纯分辨率切换：≥821px 桌面版；≤820px 触摸版（底部 Tab Bar）
   ══════════════════════════════════════════════════════════════════ */

*{margin:0;padding:0;box-sizing:border-box}
html{font-optical-sizing:auto;-webkit-text-size-adjust:100%}
body{
  background:var(--bg);color:var(--text);font-family:var(--font);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  line-height:1.6;font-size:14px;
}
button,input,select{font-family:inherit;color:inherit}
.ic{color:var(--text-3);flex:none}

/* live dot */
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--live);flex:none;animation:pulse-dot 2.2s infinite}

/* ══════════ 桌面布局 ══════════ */
#app{display:flex;min-height:100vh}

.sidebar{
  position:sticky;top:0;height:100vh;width:244px;flex:none;
  background:rgba(245,245,247,.78);
  backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);
  border-right:1px solid var(--hairline);
  display:flex;flex-direction:column;z-index:30;
}
.brand{display:flex;align-items:center;gap:11px;padding:22px 20px 18px}
.brand-mark{
  width:38px;height:38px;border-radius:var(--r-chip);flex:none;
  background:var(--grad-blue);color:#fff;font-weight:700;font-size:13px;letter-spacing:-.02em;
  display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(10,132,255,.24)
}
.brand-name{font-size:15px;font-weight:650;letter-spacing:-.01em;line-height:1.25}
.brand-sub{font-size:11px;color:var(--text-3);letter-spacing:.02em}
.nav-list{padding:8px 12px;flex:1;display:flex;flex-direction:column;gap:2px}
.nav-item{
  display:flex;align-items:center;gap:11px;width:100%;height:44px;padding:0 12px;
  background:transparent;border:none;border-radius:10px;cursor:pointer;
  color:var(--text-2);font-size:13.5px;font-weight:500;text-align:left;
  transition:background .18s var(--ease-out-quart),color .18s;
}
.nav-item .ic{width:19px;height:19px}
.nav-item:hover{background:rgba(0,0,0,.045);color:var(--text)}
.nav-item:active{transform:scale(.98)}
.nav-item.active{background:var(--surface);color:var(--accent);font-weight:600;box-shadow:var(--sh-card)}
.nav-item.active .ic{color:var(--accent)}
.sidebar-footer{padding:14px 18px 22px;border-top:1px solid var(--hairline)}
.env-badge{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--text-2);margin-bottom:10px}
.btn-text{background:none;border:none;color:var(--text-3);font-size:12px;cursor:pointer;padding:6px 0;transition:color .18s}
.btn-text:hover{color:var(--accent)}

.main{flex:1;min-width:0;display:flex;flex-direction:column}
.topbar{
  position:sticky;top:0;z-index:25;
  background:rgba(245,245,247,.72);
  backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);
  border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s;
}
.topbar.scrolled{border-bottom-color:var(--hairline);box-shadow:0 1px 12px rgba(0,0,0,.04)}
.topbar-inner{
  max-width:var(--max-grid);margin:0 auto;padding:0 var(--pad-x);height:64px;
  display:flex;align-items:center;justify-content:space-between;gap:16px
}
.topbar-title h1{font-size:20px;font-weight:700;letter-spacing:-.02em;line-height:1.2}
.topbar-title p{font-size:12px;color:var(--text-2);margin-top:1px}
.topbar-right{display:flex;align-items:center;gap:14px}
.clock{font-family:var(--mono);font-size:11.5px;color:var(--text-3);font-variant-numeric:tabular-nums}
.status-pill{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--text-2);background:var(--surface);border:1px solid var(--hairline);border-radius:var(--r-pill);padding:5px 12px}

.content{width:100%;max-width:var(--max-grid);margin:0 auto;padding:clamp(22px,3.5vw,38px) var(--pad-x) 72px;flex:1}

/* ══════════ 通用组件 ══════════ */
.card{background:var(--surface);border-radius:var(--r-card);box-shadow:var(--sh-card);padding:clamp(16px,2.2vw,22px)}
.panel{background:var(--surface);border-radius:var(--r-panel);box-shadow:var(--sh-panel);overflow:hidden}
.panel-head{padding:18px clamp(17px,2.5vw,24px);border-bottom:1px solid var(--hairline);display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.panel-head h3{font-size:16px;font-weight:650;letter-spacing:-.01em}
.panel-head .sub{font-size:12px;color:var(--text-3)}
.section-label{font-size:11px;font-weight:650;letter-spacing:.13em;color:var(--text-4);text-transform:uppercase;margin:clamp(26px,4vw,38px) 0 13px}

.grid{display:grid;gap:14px}
.g4{grid-template-columns:repeat(4,1fr)}
.g3{grid-template-columns:repeat(3,1fr)}
.g2{grid-template-columns:repeat(2,1fr)}
.mt{margin-top:16px}

.stat{display:flex;flex-direction:column;gap:7px}
.stat .label{font-size:12px;color:var(--text-2);display:flex;align-items:center;gap:7px}
.stat .value{font-size:clamp(24px,3.2vw,30px);font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.1}
.stat .foot{font-size:11.5px;color:var(--text-3)}
.stat .value.blue{color:var(--accent)}
.stat .value.purple{color:var(--indigo)}
.stat .value.green{color:#248a3d}
.stat .value.heat{color:var(--heat)}
.stat .value.red{color:#d70015}

/* badge — grayscale + one accent; heat for warnings */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:var(--r-pill);font-size:11px;font-weight:600;white-space:nowrap;background:rgba(0,0,0,.05);color:var(--text-2)}
.badge.blue{color:var(--accent-link);background:rgba(0,113,227,.09)}
.badge.indigo{color:var(--indigo);background:rgba(94,92,230,.1)}
.badge.green{color:#248a3d;background:rgba(48,209,88,.12)}
.badge.heat{color:var(--heat);background:var(--heat-bg)}
.badge.red{color:#d70015;background:rgba(215,0,21,.09)}
.badge.grey{color:var(--text-3);background:rgba(0,0,0,.05)}

/* tables — one panel, hairline rows */
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:560px}
th{text-align:left;font-weight:550;color:var(--text-3);font-size:11.5px;padding:11px 14px;border-bottom:1px solid var(--hairline);white-space:nowrap}
td{padding:11px 14px;border-bottom:1px solid var(--hairline);font-variant-numeric:tabular-nums;color:var(--text-body)}
tr:last-child td{border-bottom:none}
tbody tr:hover{background:var(--hover)}
.mono{font-family:var(--mono);font-size:11.5px}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:0 15px;border-radius:var(--r-pill);border:1px solid var(--hairline);background:var(--surface);color:var(--text);font-size:12.5px;font-weight:550;cursor:pointer;transition:transform .12s ease-out,background .18s,box-shadow .18s;white-space:nowrap}
.btn:hover{box-shadow:var(--sh-card)}
.btn:active{transform:scale(.96)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
.btn.primary:hover{background:#0077eb}
.btn.green{color:#248a3d}
.btn.danger{color:#d70015}
.btn.sm{min-height:28px;padding:0 11px;font-size:11.5px}
.btn-row{display:flex;gap:8px;flex-wrap:wrap}

/* progress */
.bar{height:6px;background:var(--track);border-radius:var(--r-pill);overflow:hidden;margin-top:8px}
.bar>i{display:block;height:100%;background:var(--grad-blue);border-radius:var(--r-pill);transition:width .4s var(--ease-out-quart)}
.bar.green>i{background:var(--grad-green)}

/* flow / timeline */
.flow{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.flow .node{padding:5px 11px;border-radius:var(--r-pill);background:rgba(0,0,0,.04);color:var(--text-3);font-size:11.5px;white-space:nowrap}
.flow .node.on{background:var(--accent);color:#fff;font-weight:600}
.flow .node.done{background:rgba(0,113,227,.1);color:var(--accent-link)}
.flow .arr{color:var(--faint);font-size:11px}
.timeline{position:relative;padding-left:20px}
.timeline:before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:1px;background:var(--hairline)}
.tl-item{position:relative;padding-bottom:13px;font-size:12.5px;color:var(--text-body)}
.tl-item:before{content:"";position:absolute;left:-18px;top:6px;width:8px;height:8px;border-radius:50%;background:var(--accent);border:2px solid var(--surface)}
.tl-item .time{font-family:var(--mono);font-size:10.5px;color:var(--text-4);margin-right:6px}

/* debug */
.debug-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.debug-card{background:var(--surface);border-radius:var(--r-card);box-shadow:var(--sh-card);padding:18px}
.debug-card h4{font-size:13px;font-weight:650;color:var(--text);margin-bottom:13px;display:flex;align-items:center;gap:8px}
.field{margin-bottom:12px}
.field label{display:block;font-size:11.5px;color:var(--text-2);margin-bottom:5px}
.field select,.field input{width:100%;min-height:38px;background:var(--bg);border:1px solid var(--hairline);border-radius:10px;padding:8px 11px;font-size:12.5px}
.field select:focus,.field input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,113,227,.12)}
.checkbox{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-2);min-height:24px}
.checkbox input{width:16px;height:16px;accent-color:var(--accent)}
.hint{font-size:11px;color:var(--text-3);line-height:1.7;margin-top:10px}
.log{background:#1d1d1f;color:#d2d2d7;border-radius:12px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:1.75;max-height:280px;overflow:auto}
.log .ok,.log .info,.log .warn,.log .err{display:block}
.log .ok{color:#30d158}.log .info{color:#5ac8fa}.log .warn{color:#ff9f0a}.log .err{color:#ff453a}

.kv{display:grid;grid-template-columns:104px 1fr;gap:9px 14px;font-size:12.5px;align-items:center}
.kv .k{color:var(--text-3)}
.divider{height:1px;background:var(--hairline);margin:16px 0}
.empty{padding:48px;text-align:center;color:var(--text-3)}

/* ══════════ 弹层（玻璃 + 双层阴影）══════════ */
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .25s ease;z-index:60}
.scrim.show{opacity:1;pointer-events:auto}
.modal{position:fixed;inset:0;z-index:61;display:flex;align-items:center;justify-content:center;pointer-events:none}
.modal-box{
  pointer-events:auto;width:min(540px,calc(100vw - 32px));max-height:84vh;display:flex;flex-direction:column;
  background:rgba(255,255,255,.86);
  backdrop-filter:saturate(180%) blur(24px);-webkit-backdrop-filter:saturate(180%) blur(24px);
  border:1px solid rgba(255,255,255,.6);border-radius:var(--r-hero);
  box-shadow:var(--sh-overlay);
  opacity:0;transform:translateY(12px) scale(.97);
  transition:opacity .4s var(--ease-spring),transform .4s var(--ease-spring),backdrop-filter .4s var(--ease-spring);
  overflow:hidden;
}
.modal.show .modal-box{opacity:1;transform:none}
.grab{display:none}
.modal-head{padding:20px 24px 12px;display:flex;align-items:center;justify-content:space-between}
.modal-head h3{font-size:17px;font-weight:650;letter-spacing:-.015em}
.icon-btn{width:32px;height:32px;border:none;border-radius:50%;background:rgba(0,0,0,.05);color:var(--text-2);cursor:pointer;font-size:14px;transition:background .18s}
.icon-btn:hover{background:rgba(0,0,0,.09)}
.modal-body{padding:6px 24px 18px;overflow:auto}
.modal-foot{padding:14px 24px 20px;border-top:1px solid var(--hairline);display:flex;justify-content:flex-end;gap:9px}

.toast{position:fixed;left:50%;bottom:32px;transform:translate(-50%,20px);z-index:80;
  background:rgba(29,29,31,.92);color:#fff;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-radius:var(--r-pill);padding:11px 20px;font-size:12.5px;font-weight:500;
  opacity:0;pointer-events:none;transition:opacity .3s var(--ease-out-quart),transform .3s var(--ease-out-quart);box-shadow:var(--sh-overlay);max-width:90vw;text-align:center}
.toast.show{opacity:1;transform:translate(-50%,0)}
.toast.err{background:rgba(215,0,21,.92)}

.tabbar{display:none}
.hide-desktop{display:none}   /* “更多模块”入口只在触摸版出现 */

/* 桌面：卡片轻抬升（触摸版不依赖 hover） */
.card{transition:transform .2s var(--ease-out-quart),box-shadow .2s var(--ease-out-quart)}
.card:hover{transform:translateY(-3px);box-shadow:var(--sh-lift)}

@media(max-width:1180px){.g4{grid-template-columns:repeat(2,1fr)}}

/* ══════════════════════════════════════════════════════════════════
   触摸版 —— 仅 ≤820px 分辨率切换（无 UA 检测）
   ══════════════════════════════════════════════════════════════════ */
@media (max-width:820px){
  body{font-size:14px}
  .sidebar{display:none}

  .main{padding-bottom:calc(72px + env(safe-area-inset-bottom))}

  /* 顶部玻璃导航：紧凑标题 + 实时状态 */
  .topbar-inner{height:56px;padding:0 18px}
  .topbar-title h1{font-size:17px}
  .topbar-title p{display:none}
  .clock{display:none}
  .status-pill{font-size:10.5px;padding:5px 10px}

  .content{padding:20px 16px 36px;max-width:100%}

  /* 单列 */
  .g4,.g3,.g2{grid-template-columns:1fr}
  .grid{gap:12px}
  .hide-desktop{display:block}   /* 触摸版显示“更多模块”入口 */
  .card:hover{transform:none;box-shadow:var(--sh-card)}

  /* 大触控目标 */
  .btn{min-height:44px;padding:0 18px;font-size:13.5px}
  .btn.sm{min-height:36px;padding:0 13px;font-size:12px}
  .nav-item,.btn{transition:transform .12s ease-out}

  /* 表格保留横向滚动，行高加大 */
  table{min-width:520px}
  th,td{padding:13px 14px}

  /* 底部玻璃 Tab Bar */
  .tabbar{
    display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;
    height:calc(62px + env(safe-area-inset-bottom));padding:7px 6px calc(7px + env(safe-area-inset-bottom));
    align-items:flex-start;justify-content:space-around;
    background:rgba(245,245,247,.82);
    backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);
    border-top:1px solid var(--hairline);
  }
  .tab{
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
    width:60px;height:48px;border:none;background:transparent;cursor:pointer;
    color:var(--text-3);font-size:10px;font-weight:500;transition:color .18s,transform .12s;
  }
  .tab .ic{width:25px;height:25px;color:currentColor;stroke-width:1.75}
  .tab:active{transform:scale(.92)}
  .tab.active{color:var(--accent)}
  .tab.active .ic{color:var(--accent)}

  /* 弹层 → 底部 sheet（从底部进入，顶部圆角，锚定底部边缘） */
  .modal{align-items:flex-end}
  .modal-box{
    width:100%;max-height:88vh;border-radius:var(--r-panel) var(--r-panel) 0 0;
    border-bottom:none;padding-bottom:env(safe-area-inset-bottom);
    transform:translateY(100%);
  }
  .modal.show .modal-box{transform:none}
  .grab{display:block;width:38px;height:5px;border-radius:var(--r-pill);background:var(--faint);margin:10px auto 2px}
  .modal-head{padding:12px 22px 10px}
  .modal-body{padding:4px 22px 16px}
  .modal-foot{padding:12px 22px calc(18px + env(safe-area-inset-bottom))}
  .modal-foot .btn{flex:1}

  .toast{bottom:calc(78px + env(safe-area-inset-bottom))}
}

/* ══════════ 减弱动态 / 透明度 / 对比度 ══════════ */
@media (prefers-reduced-motion:reduce){
  .modal-box{transition:opacity .2s ease;transform:none!important}
  .scrim,.toast{transition:opacity .2s ease}
  .live-dot{animation:none}
  .card:hover{transform:none}
}
@media (prefers-reduced-transparency:reduce){
  .glass,.topbar,.sidebar,.tabbar,.modal-box{
    background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none
  }
}
@media (prefers-contrast:more){
  .glass,.topbar,.sidebar,.tabbar,.modal-box{border:1px solid rgba(0,0,0,.35)}
  .badge{border:1px solid rgba(0,0,0,.18)}
}
` },
  "/js/actions.js": { contentType: "application/javascript; charset=UTF-8", body: `/* ========== 核心业务动作（全部基于内存状态，操作后自动持久化） ========== */

// 合法状态流转表（受控状态机，禁止跨态跳变）
// 状态机流转表来自唯一种子真源，避免与推演脚本重复定义
const TRANSITIONS = Seed.TRANSITIONS;
const EVENT_FOR = {
  PAID:'PAY_SUCCESS', ACCEPTED:'ACCEPT', SHIPPED:'SHIP', COMPLETED:'CONFIRM_RECEIPT',
  SETTLED:'SETTLE', AFTER_SALE_PENDING:'DISPUTE_OPEN', REFUNDING:'REFUND_APPLY',
  CLOSED:'REFUND_SUCCESS', CANCELLED:'TIMEOUT_CANCEL'
};

function setOrderStatus(orderId, target, opts = {}) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  if (o.status === target) return { ok:false, msg:'状态未变化' };
  const force = opts.force === true; // 调试面板可强制跳变
  if (!force && !(TRANSITIONS[o.status] || []).includes(target))
    return { ok:false, msg:\`非法流转：\${o.status} → \${target}（调试模式可强制）\` };
  const old = o.status;
  o.status = target;
  o.version++;

  // 支付状态联动
  if (target === 'PAID' || (TRANSITIONS.PAID.includes(target) && old === 'CREATED')) o.payStatus = Seed.PAY_SUCCESS;
  if (target === 'CANCELLED') o.payStatus = 'CLOSED';
  if (target === 'REFUNDING') o.refundStatus = 'REFUNDING';
  if (target === 'CLOSED') o.refundStatus = 'REFUNDED';
  // 子订单状态联动
  o.items.forEach(it => { it.status = target; });

  log(target === 'CANCELLED' || target === 'CLOSED' ? 'WARN' : 'OK',
      \`订单 \${shortId(orderId)} 状态 \${old} → \${target}\${force ? ' [调试强制]' : ''}\`);
  save();
  return { ok:true, msg:\`状态已更新：\${old} → \${target}\` };
}

// 子订单独立流转（与主单状态机解耦），主单状态随后按子单聚合
function setItemStatus(orderId, itemIndex, target, opts = {}) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  const it = o.items[itemIndex];
  if (!it) return { ok:false, msg:'子订单不存在' };
  if (it.status === target) return { ok:false, msg:'子单状态未变化' };
  const ITEM_TRANSITIONS = Seed.ITEM_TRANSITIONS;
  const force = opts.force === true;
  if (!force && !(ITEM_TRANSITIONS[it.status] || []).includes(target))
    return { ok:false, msg:\`子单非法流转：\${it.status} → \${target}（调试模式可强制）\` };
  const old = it.status;
  it.status = target;
  o.version++;
  const before = o.status;
  o.status = Seed.aggregateOrderStatus(o); // 主单状态由子单聚合，禁止直接写
  log(old === 'SHIPPED' && target === 'COMPLETED' ? 'OK' : 'INFO',
    \`子单 \${it.productId} \${old} → \${target}；主单 \${before} → \${o.status}\${o.status!==before?'（聚合）':''}\`);
  save();
  return { ok:true, msg:\`子单 \${it.productId}：\${old} → \${target}\` +
    (o.status !== before ? \`；主单聚合为 \${o.status}\` : '') };
}

// 拆单：按供应商 + 最大余额法分摊（金额守恒）
function splitOrder(parentId) {
  const o = S.orders.find(x => x.id === parentId);
  if (!o) return { ok:false, msg:'订单不存在' };
  if (o.items.length < 2) return { ok:false, msg:'该订单无需拆单（仅一个子订单）' };
  let allocated = 0;
  o.items.forEach((it, i) => {
    if (i === o.items.length - 1) it.amount = o.amount - allocated; // 最大余额法：末项兜底守恒
    else { it.amount = Math.floor(o.amount / o.items.length); allocated += it.amount; }
  });
  o.splits = o.items.length;
  log('OK', \`订单 \${shortId(parentId)} 按最大余额法拆为 \${o.items.length} 个子订单，金额守恒校验通过\`);
  save();
  return { ok:true, msg:\`已拆为 \${o.items.length} 个子订单，金额之和=\${formatMoney(o.amount)}\` };
}

// 生成分账指令（资金中台统一生成幂等键）
function createSplit(orderId) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  if (!['COMPLETED','SETTLED'].includes(o.status))
    return { ok:false, msg:'仅已完成订单可触发分账（当前：'+STATE_LABEL[o.status]+'）' };
  const activeSplit = S.splits.find(s => s.orderId === orderId && !['REVOKED','FAILED'].includes(s.status));
  if (activeSplit) return { ok:false, msg:'已存在进行中的分账指令：'+activeSplit.id };

  const rules = [
    { receiver:'VA_S1001', role:'SUPPLIER', r:0.60, memo:'供货货款 60%' },
    { receiver:'VA_D2031', role:'DISTRIBUTOR', r:0.20, memo:'一级分销佣金 20%' },
    { receiver:'VA_P0001', role:'PLATFORM', r:0.10, memo:'平台服务费 10%' },
    { receiver:'VA_RESERVE', role:'RESERVATION', r:0.10, memo:'逆向售后保证金 10%' },
  ];
  let sum = 0;
  rules.forEach((r, i) => {
    const amt = i === rules.length - 1 ? o.amount - sum : Math.round(o.amount * r.r);
    sum += amt;
    const id = nextId('sp');
    const key = \`SPLIT_\${orderId}_\${r.receiver}_0001\`;
    S.splits.unshift({ id, orderId, receiver:r.receiver, role:r.role, amount:amt,
      status:'INIT', key, time:nowStr() });
    addLedger(orderId, r.receiver, 'SPLIT_ACCOUNT', amt, 0, key);
    log('INFO', \`生成分账指令 \${id} → \${r.receiver} \${formatMoney(amt)}（\${r.memo}）\`);
  });
  o.splits = rules.length;
  save();
  return { ok:true, msg:\`已生成 \${rules.length} 条分账指令，合计 \${formatMoney(sum)}（金额守恒）\` };
}

// 推送分账（INIT → PUSHING → ACCEPTED）
function pushSplit(splitId) {
  const s = S.splits.find(x => x.id === splitId);
  if (!s) return { ok:false, msg:'指令不存在' };
  if (s.status !== 'INIT') return { ok:false, msg:'仅 INIT 状态可推送（当前：'+s.status+'）' };
  s.status = 'PUSHING'; log('INFO', \`分账 \${s.id} 推送渠道中... [PUSHING]\`);
  setTimeout(() => {
    s.status = 'ACCEPTED'; s.time = nowStr();
    const l = S.ledger.find(x => x.key === s.key); if (l) l.status = 1;
    log('OK', \`分账 \${s.id} 渠道受理成功 [ACCEPTED]\`); save();
    if (typeof render === 'function') render();
  }, 700);
  save();
  return { ok:true, msg:'已推送，模拟渠道受理中...' };
}

// 模拟分账到账回调（ACCEPTED → SUCCESS）
function settleSplit(splitId) {
  const s = S.splits.find(x => x.id === splitId);
  if (!s) return { ok:false, msg:'指令不存在' };
  if (!['ACCEPTED','PROCESSING'].includes(s.status)) return { ok:false, msg:'当前状态不可确认到账：'+s.status };
  s.status = 'SUCCESS'; s.time = nowStr();
  const o = S.orders.find(x => x.id === s.orderId);
  if (o && S.splits.filter(x => x.orderId === s.orderId).every(x => x.status === 'SUCCESS')) {
    o.status = 'SETTLED'; o.version++; log('OK', \`订单 \${shortId(o.id)} 全部分账到账，状态 → SETTLED\`);
  }
  log('OK', \`分账 \${s.id} 资金到账 [SUCCESS]\`); save();
  return { ok:true, msg:'分账到账成功' };
}

// 退款冲正铁律：先回退已分资金（REVOKED），再退款给买家
function refundOrder(orderId, full = true) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  const related = S.splits.filter(s => s.orderId === orderId && ['SUCCESS','ACCEPTED','PROCESSING','PART_SUCCESS'].includes(s.status));
  let msg = '';
  if (related.length) {
    related.forEach(s => {
      s.status = 'REVOKED';
      // 冲正同步回退资金账本，避免 allocated 虚高破坏 GMV=冻结+已划拨
      S.ledger.filter(l => l.key === s.key).forEach(l => { l.status = 0; });
      log('WARN', \`分账回退 \${s.id} → REVOKED（资金收回监管户，账本同步回退）\`);
    });
    msg = \`已回退 \${related.length} 笔分账 → \`;
  }
  o.status = 'REFUNDING'; o.refundStatus = 'REFUNDING'; o.version++;
  setTimeout(() => {
    o.status = 'CLOSED'; o.refundStatus = 'REFUNDED'; o.version++;
    log('OK', \`订单 \${shortId(orderId)} 退款成功，状态 → CLOSED\`);
    save(); if (typeof render === 'function') render();
  }, 900);
  log('WARN', \`订单 \${shortId(orderId)} 发起退款（\${full ? '全额' : '部分'}），先冲正后退款\`);
  save();
  return { ok:true, msg: msg + '退款处理中，完成后订单关闭' };
}

// 资金挂起/解冻（争议冻结）
function toggleFreeze(splitId) {
  const s = S.splits.find(x => x.id === splitId);
  if (!s) return { ok:false, msg:'指令不存在' };
  if (s.status === 'FREEZE') {
    s.status = 'ACCEPTED'; log('INFO', \`分账 \${s.id} 解冻，恢复 [ACCEPTED]\`);
    save(); return { ok:true, msg:'已解冻' };
  }
  s.status = 'FREEZE'; log('WARN', \`分账 \${s.id} 争议冻结 [FREEZE]\`);
  save(); return { ok:true, msg:'已冻结，暂停放行与分账' };
}

// 提现
function withdraw(accountNo, amount) {
  if (!amount || amount <= 0) return { ok:false, msg:'请输入有效金额' };
  const id = nextId('wd');
  addLedger('-', accountNo, 'WITHDRAW', -amount, 1, \`WD_\${accountNo}_0001\`);
  log('OK', \`提现 \${formatMoney(amount)} 从 \${accountNo} → 绑定银行卡，流水 \${id}\`);
  save();
  return { ok:true, msg:\`提现申请已受理：\${formatMoney(amount)}\` };
}

function addLedger(biz, account, type, amount, status, key) {
  S.ledger.unshift({ id:nextId('ledger'), biz, account, type, amount, status, key, time:nowStr() });
}

// 对账差异处理
function handleReconcile(id, action) {
  const r = S.reconciles.find(x => x.id === id);
  if (!r) return { ok:false, msg:'差异记录不存在' };
  if (action === 'fix') {
    if (r.risk === 'P0') { log('WARN', \`差异 \${id} 为 P0，禁止自动处理，已转人工\`);
      save(); return { ok:false, msg:'P0 级差异严禁自动处理，已转人工财务介入' }; }
    r.status = 'AUTO_FIXED'; log('OK', \`差异 \${id} 自动修复完成\`);
  } else if (action === 'manual') {
    r.status = 'MANUAL_FIXED'; log('OK', \`差异 \${id} 人工调账完成（已留痕）\`);
  } else if (action === 'ignore') {
    r.status = 'IGNORED'; log('INFO', \`差异 \${id} 标记忽略\`);
  }
  save(); return { ok:true, msg:'处理成功' };
}

// 佣金结算 / 负向扣回
function settleCommission(id) {
  const c = S.commissions.find(x => x.id === id);
  if (!c) return { ok:false, msg:'佣金记录不存在' };
  c.status = 'SETTLED'; log('OK', \`佣金 \${id} 结算完成 \${formatMoney(c.amount)} → \${c.user}\`);
  save(); return { ok:true, msg:'佣金已结算' };
}
function reverseCommission(id) {
  const c = S.commissions.find(x => x.id === id);
  if (!c) return { ok:false, msg:'佣金记录不存在' };
  S.commissions.unshift({ id:nextId('cm'), order:c.order, user:c.user, level:c.level,
    base:c.base, rate:-c.rate, amount:-c.amount, status:'SETTLED', time:nowStr() });
  log('WARN', \`订单 \${c.order} 退款，生成负向佣金单扣回 \${formatMoney(c.amount)}\`);
  save(); return { ok:true, msg:\`已生成负向佣金单，扣回 \${formatMoney(c.amount)}\` };
}

// 下单（创建新订单，模拟支付）
function createOrder(productId, qty) {
  const p = S.products.find(x => x.id === productId);
  if (!p) return { ok:false, msg:'商品不存在' };
  if (p.stock < qty) return { ok:false, msg:'库存不足，防超卖拦截' };
  p.stock -= qty;
  const id = 'DSO20261124' + String(++S.seq.order).padStart(5,'0');
  const o = mkOrder(id, 'u_demo_' + (100 + S.seq.order), p.price * qty, 'CREATED', 'INIT', nowStr(), [
    mkItem(p.id, p.supplier, p.price * qty, 'CREATED')
  ]);
  S.orders.unshift(o);
  log('OK', \`新订单 \${shortId(id)} 创建，Redis 预扣库存 \${qty} 件（\${p.name}）\`);
  save(); return { ok:true, msg:\`下单成功：\${id}\` };
}

// 模拟支付（CREATED → PAID）
function payOrder(orderId) {
  const r = setOrderStatus(orderId, 'PAID');
  if (r.ok) log('OK', \`订单 \${shortId(orderId)} 支付回调验签通过，货款进入监管户冻结\`);
  return r;
}

function nowStr() { return new Date().toISOString().slice(0,19).replace('T',' '); }
function shortId(id) { return id.length > 16 ? id.slice(0,10)+'…'+id.slice(-4) : id; }
function formatMoney(cents) { return '¥' + (cents/100).toFixed(2); }
` },
  "/js/app.js": { contentType: "application/javascript; charset=UTF-8", body: `/* ========== 应用入口：路由 + 初始化（双布局按分辨率切换） ========== */
const PAGE_RENDER = {
  dashboard:renderDashboard, products:renderProducts, orders:renderOrders,
  funds:renderFunds, reconcile:renderReconcile, commission:renderCommission, debug:renderDebug,
};
let currentPage = 'dashboard';

function switchPage(page) {
  if (!PAGE_RENDER[page]) page = 'dashboard';
  currentPage = page;
  // 两套导航同步高亮（同一 data-page）
  $$('[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  const meta = PAGE_META[page] || PAGE_META.dashboard;
  $('#pageTitle').textContent = meta.title;
  $('#pageDesc').textContent = meta.desc;
  render();
  window.scrollTo({top:0, behavior:'smooth'});
}
function render() {
  const r = PAGE_RENDER[currentPage];
  $('#content').innerHTML = r ? r() : '<div class="empty">页面不存在</div>';
}

function tickClock() {
  const el = $('#clock'); if (el) el.textContent = new Date().toLocaleString('zh-CN', {hour12:false});
}

function bindNav() {
  $$('[data-page]').forEach(b => b.addEventListener('click', () => switchPage(b.dataset.page)));
}

function init() {
  bindNav();

  $('#resetBtn').addEventListener('click', () => {
    openModal('重置演示数据', '<p style="color:var(--text-2);line-height:1.7">确认恢复全部演示数据？当前所有修改（订单状态、分账、对账处理等）将被清除。</p>',
      [{label:'取消', cls:''},{label:'确认重置', cls:'primary', onClick:()=>{ resetState(); render(); toast('演示数据已重置'); }}]);
  });

  $('#modalClose').addEventListener('click', closeModal);
  $('#scrim').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // 滚动边线：仅当内容真的滚到顶栏下面才出现发丝线
  const topbar = $('#topbar');
  addEventListener('scroll', () => topbar.classList.toggle('scrolled', scrollY > 8), {passive:true});

  setInterval(tickClock, 1000); tickClock();
  render();
  log('INFO', 'Demo 初始化完成，Apple 视觉系统已加载');
  save();
}
document.addEventListener('DOMContentLoaded', init);
` },
  "/js/pages.js": { contentType: "application/javascript; charset=UTF-8", body: `/* ========== 页面渲染：总览 / 商品 / 订单（Apple 视觉） ========== */
const PAGE_META = {
  dashboard:{title:'总览看板', desc:'全链路业务与资金流实时概览'},
  products:{title:'商品与库存', desc:'代销商品池、供应商与防超卖库存管理'},
  orders:{title:'订单中心', desc:'拆单合单、双层状态机、资金操作联动'},
  funds:{title:'资金中台', desc:'监管户资金流、分账指令、资金流水账本'},
  reconcile:{title:'对账中心', desc:'订单-数量-金额-资金四层对账与差错处理'},
  commission:{title:'分销佣金', desc:'级差佣金、快照机制与负向扣回'},
  debug:{title:'调试控制台', desc:'强制调整订单/分账状态、模拟异常、注入事件'},
};

/* 触摸版顶部「更多」入口（商品 / 佣金在 tabbar 无独立位，放进总览） */
function moreEntries() {
  return \`<div class="section-label hide-desktop">更多模块</div>
  <div class="grid g2 hide-desktop">
    <button class="card stat" style="text-align:left;cursor:pointer" onclick="switchPage('products')">
      <span class="label">▦ 商品与库存</span><span class="value" style="font-size:17px">SKU 管理 →</span>
    </button>
    <button class="card stat" style="text-align:left;cursor:pointer" onclick="switchPage('commission')">
      <span class="label">◇ 分销佣金</span><span class="value" style="font-size:17px">级差佣金 →</span>
    </button>
  </div>\`;
}

function renderDashboard() {
  // 所有资金指标来自唯一种子真源 metrics()，杜绝同一指标多算法（G1/G2/G3）
  const M = Seed.metrics(S);
  const inv = Seed.assertInvariant(S);
  const totalGmv = M.gmv;
  const paid = M.paidCount;
  const splitSuccess = M.splitSuccess;
  const pendingRecon = M.pendingRecon;
  const lowStock = S.products.filter(p => p.stock < 50).length;

  let h = \`<section>
    <div class="section-label">实时概览 · LIVE</div>
    <div class="grid g4">
      <div class="card stat"><div class="label">◈ GMV（已支付）</div><div class="value blue">\${money(totalGmv)}</div><div class="foot">\${paid} 笔已支付订单</div></div>
      <div class="card stat"><div class="label">▤ 订单总数</div><div class="value">\${S.orders.length}</div><div class="foot">\${S.orders.filter(o=>o.status==='CREATED').length} 笔待付款</div></div>
      <div class="card stat"><div class="label">✓ 分账成功率</div><div class="value green">\${S.splits.length ? Math.round(splitSuccess/S.splits.length*100)+'%' : '—'}</div><div class="foot">\${splitSuccess}/\${S.splits.length} 笔到账</div></div>
      <div class="card stat"><div class="label">☷ 待处理差异</div><div class="value \${pendingRecon?'heat':'green'}">\${pendingRecon}</div><div class="foot">\${S.reconciles.filter(r=>r.risk==='P0').length} 条 P0 高危</div></div>
    </div>
  </section>\`;

  h += \`<div class="grid g2 mt">\`;
  // 订单状态分布
  const dist = {}; S.orders.forEach(o => dist[o.status] = (dist[o.status]||0)+1);
  const max = Math.max(1, ...Object.values(dist));
  h += \`<div class="panel"><div class="panel-head"><h3>订单状态分布</h3><span class="sub">共 \${S.orders.length} 单</span></div>
    <div style="padding:18px clamp(17px,2.5vw,24px)">\`;
  h += Object.entries(dist).map(([s,n]) => \`<div style="margin-bottom:11px">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px">
      <span>\${badge(s)}</span><span class="mono" style="color:var(--text-2)">\${n} 单</span></div>
    <div class="bar"><i style="width:\${n/max*100}%"></i></div></div>\`).join('') + \`</div></div>\`;

  // 资金健康：冻结 = GMV − 已划拨（差额法），两页同源同值
  const frozen = M.frozen;
  const splitTotal = M.allocated;
  h += \`<div class="panel"><div class="panel-head"><h3>资金流健康</h3><span class="sub">监管户一清架构</span></div>
    <div style="padding:18px clamp(17px,2.5vw,24px)">
      <div class="kv">
        <div class="k">合规架构</div><div style="color:#248a3d">✓ 资金不经过平台账户</div>
        <div class="k">监管户冻结</div><div class="mono">\${money(frozen)}</div>
        <div class="k">已划拨资金</div><div class="mono">\${money(splitTotal)}</div>
        <div class="k">守恒校验</div><div class="mono" style="color:\${inv.ok?'#248a3d':'#d70015'}">\${inv.ok?'✓ PASS':'✗ FAIL'} \${esc(inv.detail)}</div>
        <div class="k">库存预警</div><div>\${lowStock ? \`<span style="color:var(--heat)">\${lowStock} 个 SKU 低于 50</span>\` : '<span style="color:#248a3d">正常</span>'}</div>
      </div>
      <div class="divider"></div>
      <p style="font-size:12px;color:var(--text-2);line-height:1.85">
        <b style="color:var(--accent)">端到端链路：</b>消费者支付 → 资金直入监管户 → 订单按供应商拆单 → 发货 → 确认收货 → 分账指令 → 资金划拨各方子户。
      </p>
    </div></div></div>\`;

  h += moreEntries();

  h += \`<div class="section-label">最近事件</div>
  <div class="panel"><div style="padding:18px clamp(17px,2.5vw,24px)"><div class="timeline">\`;
  h += S.logs.slice(0,7).map(l => \`<div class="tl-item"><span class="time">\${esc(l.time)}</span>\${esc(l.msg)}</div>\`).join('');
  h += \`</div></div></div>\`;
  return h;
}

function renderProducts() {
  let h = \`<div class="section-label">代销商品池</div>
  <div class="panel"><div class="panel-head"><h3>商品与库存</h3><span class="sub">\${S.products.length} 个 SKU · 实时同步</span></div>
  <div class="scroll"><table><thead><tr><th>SKU</th><th>商品名称</th><th>供应商</th><th>代销价</th><th>库存</th><th>状态</th></tr></thead><tbody>\`;
  h += S.products.map(p => \`<tr>
    <td class="mono">\${esc(p.id)}</td><td style="color:var(--text)">\${esc(p.name)}</td><td>\${esc(p.supplier)}</td>
    <td class="mono">\${money(p.price)}</td>
    <td class="mono" style="color:\${p.stock===0?'#d70015':p.stock<50?'var(--heat)':''}">\${p.stock}</td>
    <td>\${p.stock===0?'<span class="badge red">缺货</span>':p.stock<50?'<span class="badge heat">低库存</span>':'<span class="badge green">正常</span>'}</td>
  </tr>\`).join('');
  h += \`</tbody></table></div>
  <div style="padding:16px 20px" class="btn-row">
    <button class="btn primary" onclick="showCreateOrder()">＋ 模拟下单</button>
    <button class="btn" onclick="syncStock()">↻ 同步供应商库存</button>
  </div></div>
  <p class="hint">防超卖策略：Redis Lua 原子预扣减 → MQ 异步落库 → DB 条件更新失败则回滚 Redis 并取消订单。</p>\`;
  return h;
}

function showCreateOrder() {
  const opts = S.products.filter(p=>p.stock>0).map(p => \`<option value="\${p.id}">\${esc(p.name)} · \${money(p.price)} · 库存\${p.stock}</option>\`).join('');
  openModal('模拟下单', \`
    <div class="field"><label>选择商品</label><select id="moProduct">\${opts}</select></div>
    <div class="field"><label>数量</label><input id="moQty" type="number" value="1" min="1"></div>
    <p class="hint">将触发 Redis 库存预扣减并创建待付款订单。</p>\`,
    [{label:'取消', cls:''},{label:'确认下单', cls:'primary', onClick:()=>{
      const r = createOrder($('#moProduct').value, parseInt($('#moQty').value)||1);
      toast(r.msg, !r.ok); render(); return r.ok;
    }}]);
}
function syncStock() {
  S.products.forEach(p => { p.stock += Math.floor(Math.random()*20)-5; if (p.stock<0) p.stock=0; });
  log('INFO', '供应商库存同步完成，5 个 SKU 库存已更新');
  save(); render(); toast('库存同步完成');
}

function renderOrders() {
  let h = \`<div class="section-label">订单列表</div>
  <div class="panel"><div class="panel-head"><h3>全部订单</h3><span class="sub">双层状态机 · 乐观锁 v</span></div>
  <div class="scroll"><table><thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>履约状态</th><th>支付状态</th><th>子单</th><th>操作</th></tr></thead><tbody>\`;
  h += S.orders.map(o => \`<tr>
    <td class="mono">\${esc(o.id)}</td><td class="mono">\${esc(o.userId)}</td>
    <td class="mono">\${money(o.amount)}</td><td>\${badge(o.status)}</td>
    <td><span class="badge \${o.payStatus==='SUCCESS'?'blue':'grey'}">\${o.payStatus}</span></td>
    <td class="mono">\${o.items.length}</td>
    <td><button class="btn sm" onclick="showOrderDetail('\${o.id}')">详情</button></td>
  </tr>\`).join('');
  h += \`</tbody></table></div></div>\`;
  return h;
}

function showOrderDetail(id) {
  const o = S.orders.find(x=>x.id===id); if (!o) return;
  const agg = Seed.aggregateOrderStatus(o);
  const items = o.items.map((it, i) => \`<tr style="cursor:pointer" onclick="showItemDetail('\${id}',\${i})" title="点击查看子单独立状态机">
    <td class="mono">\${esc(it.productId)}</td><td>\${esc(it.supplier)}</td>
    <td class="mono">\${money(it.amount)}</td><td>\${badge(it.status)}</td><td style="color:var(--accent)">›</td></tr>\`).join('');
  const buttons = [];
  if (o.status === 'CREATED') buttons.push({label:'模拟支付', cls:'primary', onClick:()=>{ const r=payOrder(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  if (['COMPLETED','SETTLED'].includes(o.status)) buttons.push({label:'生成分账指令', cls:'primary', onClick:()=>{ const r=createSplit(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  if (!['CLOSED','CANCELLED'].includes(o.status)) buttons.push({label:'发起退款', cls:'danger', onClick:()=>{ const r=refundOrder(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  buttons.push({label:'调试状态', cls:'', onClick:()=>{ closeModal(); setTimeout(()=>{ switchPage('debug'); const s=$('#dbgOrder'); if(s) s.value=id; },120); return true; }});
  buttons.push({label:'关闭', cls:''});
  openModal('订单详情 · ' + short(id), \`
    <div class="kv">
      <div class="k">订单号</div><div class="mono">\${esc(o.id)}</div>
      <div class="k">买家</div><div class="mono">\${esc(o.userId)}</div>
      <div class="k">实付金额</div><div class="mono" style="color:var(--accent);font-weight:600">\${money(o.amount)}</div>
      <div class="k">履约状态</div><div>\${badge(o.status)} <span style="font-size:10.5px;color:var(--text-3)">（子单聚合：\${STATE_LABEL[agg]||agg}\${agg!==o.status?' · 建议同步':''}）</span></div>
      <div class="k">支付状态</div><div class="mono">\${o.payStatus}</div>
      <div class="k">退款状态</div><div class="mono">\${o.refundStatus}</div>
      <div class="k">乐观锁版本</div><div class="mono">v\${o.version}</div>
      <div class="k">下单时间</div><div class="mono">\${esc(o.time)}</div>
    </div>
    <div class="section-label">状态机流转</div>
    \${orderFlow(o.status)}
    <div class="section-label">子订单 · 点击任意行查看独立状态机</div>
    <div class="scroll"><table><thead><tr><th>商品</th><th>供应商</th><th>分摊金额</th><th>状态</th><th></th></tr></thead><tbody>\${items}</tbody></table></div>
    \${o.items.length>1?\`<div class="btn-row" style="margin-top:14px"><button class="btn" onclick="doSplit('\${id}')">执行拆单校验</button></div>\`:''}\`, buttons);
}
function doSplit(id) { const r = splitOrder(id); toast(r.msg, !r.ok); render(); }

/** A2：子单独立状态机查看与流转，主单状态由子单聚合自动回写 */
function showItemDetail(orderId, index) {
  const o = S.orders.find(x=>x.id===orderId); if (!o) return;
  const it = o.items[index]; if (!it) return;
  const targets = Seed.ITEM_TRANSITIONS[it.status] || [];
  const opts = targets.length
    ? targets.map(t => \`<option value="\${t}">\${t} · \${STATE_LABEL[t]||t}</option>\`).join('')
    : '<option value="">（终态，无后继）</option>';
  const buttons = targets.length
    ? [{label:'推进子单状态', cls:'primary', onClick:()=>{
        const t = $('#itemTarget').value; if (!t) return false;
        const r = setItemStatus(orderId, index, t); toast(r.msg, !r.ok); render(); return r.ok;
      }}]
    : [];
  buttons.push({label:'关闭', cls:''});
  openModal(\`子订单 · \${esc(it.productId)}\`, \`
    <div class="kv">
      <div class="k">所属主单</div><div class="mono">\${esc(orderId)}</div>
      <div class="k">供应商</div><div>\${esc(it.supplier)}</div>
      <div class="k">分摊金额</div><div class="mono" style="color:var(--accent)">\${money(it.amount)}</div>
      <div class="k">当前状态</div><div>\${badge(it.status)}</div>
      <div class="k">主单状态</div><div>\${badge(o.status)}</div>
    </div>
    <div class="section-label">子单独立状态机</div>
    \${flowFor(it.status, ['CREATED','PAID','ACCEPTED','SHIPPED','COMPLETED','SETTLED'], ['待付款','已付款','已接单','已发货','已完成','已结算'])}
    <div class="field" style="margin-top:16px"><label>流转目标（合法后继）</label><select id="itemTarget">\${opts}</select></div>
    <p class="hint">子单独立流转；每次变更会增加主单乐观锁版本，并按「主订单状态聚合规则」自动回写主单状态（禁止直接修改主单）。</p>\`, buttons);
}
` },
  "/js/pages2.js": { contentType: "application/javascript; charset=UTF-8", body: `/* ========== 页面渲染：资金 / 对账 / 佣金 / 调试（Apple 视觉） ========== */

function renderFunds() {
  // 与首页同源：一律走 Seed.metrics()，已划拨取资金账本成功流水
  const M = Seed.metrics(S);
  const frozen = M.frozen;
  const splitTotal = M.allocated;
  let h = \`<div class="grid g4">
    <div class="card stat"><div class="label">◈ 监管户冻结</div><div class="value blue">\${money(frozen)}</div><div class="foot">货款直入，平台不经手</div></div>
    <div class="card stat"><div class="label">✓ 已划拨资金</div><div class="value green">\${money(splitTotal)}</div><div class="foot">分账至各方虚拟子户</div></div>
    <div class="card stat"><div class="label">◇ 分账指令</div><div class="value">\${S.splits.length}</div><div class="foot">\${S.splits.filter(s=>s.status==='FREEZE').length} 冻结 · \${S.splits.filter(s=>s.status==='REVOKED').length} 冲正</div></div>
    <div class="card stat"><div class="label">▤ 资金流水</div><div class="value purple">\${S.ledger.length}</div><div class="foot">唯一真理来源 · 幂等唯一索引</div></div>
  </div>\`;

  h += \`<div class="section-label">分账指令 · 状态机</div>
  <div class="panel"><div class="panel-head"><h3>分账指令</h3><span class="sub">事件驱动 · 禁止跨态 · 乐观锁</span></div>
  <div class="scroll"><table><thead><tr><th>指令号</th><th>订单</th><th>接收方</th><th>金额</th><th>状态</th><th>操作</th></tr></thead><tbody>\`;
  h += S.splits.map(s => \`<tr>
    <td class="mono">\${esc(s.id)}</td><td class="mono">\${esc(short(s.orderId))}</td>
    <td class="mono">\${esc(s.receiver)}</td><td class="mono">\${money(s.amount)}</td><td>\${badge(s.status,'split')}</td>
    <td><div class="btn-row">
      \${s.status==='INIT'?\`<button class="btn sm primary" onclick="doPushSplit('\${s.id}')">推送</button>\`:''}
      \${['ACCEPTED','PROCESSING'].includes(s.status)?\`<button class="btn sm green" onclick="doSettleSplit('\${s.id}')">确认到账</button>\`:''}
      <button class="btn sm" onclick="doFreeze('\${s.id}')">\${s.status==='FREEZE'?'解冻':'冻结'}</button>
    </div></td></tr>\`).join('');
  h += \`</tbody></table></div>
  <div style="padding:14px 20px"><p class="hint">铁律：已分账退款必须先回退（冲正）再退款；UNKNOWN 保持 PUSHING 不臆断终态，原号重发 + 查询兜底。</p></div></div>\`;

  h += \`<div class="section-label">资金流水账本 · fund_ledger</div>
  <div class="panel"><div class="panel-head"><h3>资金流水</h3><span class="sub">财务对账唯一真理来源</span></div>
  <div class="scroll"><table><thead><tr><th>流水号</th><th>业务订单</th><th>账户</th><th>类型</th><th>金额</th><th>状态</th></tr></thead><tbody>\`;
  h += S.ledger.slice(0,20).map(l => \`<tr>
    <td class="mono">\${esc(l.id)}</td><td class="mono">\${esc(l.biz==='-'?'-':short(l.biz))}</td>
    <td class="mono">\${esc(l.account)}</td><td><span class="badge">\${esc(l.type)}</span></td>
    <td class="mono" style="color:\${l.amount<0?'#d70015':'#248a3d'}">\${l.amount>0?'+':''}\${money(l.amount)}</td>
    <td>\${l.status===1?'<span class="badge green">成功</span>':'<span class="badge heat">处理中</span>'}</td>
  </tr>\`).join('');
  h += \`</tbody></table></div>
  <div style="padding:14px 20px" class="btn-row"><button class="btn primary" onclick="showWithdraw()">↗ 模拟提现</button></div></div>\`;
  return h;
}
function doPushSplit(id){const r=pushSplit(id);toast(r.msg,!r.ok);render();}
function doSettleSplit(id){const r=settleSplit(id);toast(r.msg,!r.ok);render();}
function doFreeze(id){const r=toggleFreeze(id);toast(r.msg,!r.ok);render();}
function showWithdraw(){
  openModal('模拟提现',\`
    <div class="field"><label>虚拟子户</label><select id="wdAcct">
      <option value="VA_S1001">VA_S1001（供应商）</option>
      <option value="VA_D2031">VA_D2031（分销商）</option>
      <option value="VA_P0001">VA_P0001（平台）</option>
    </select></div>
    <div class="field"><label>提现金额（元）</label><input id="wdAmt" type="number" value="1000" min="1"></div>
    <p class="hint">资金从虚拟子户划付至绑定银行卡，平台仅推送指令不触碰资金。</p>\`,
    [{label:'取消',cls:''},{label:'确认提现',cls:'primary',onClick:()=>{
      const r=withdraw($('#wdAcct').value, Math.round(parseFloat($('#wdAmt').value)*100));
      toast(r.msg,!r.ok); render(); return r.ok;
    }}]);
}

// A4：四象限筛选状态（点击卡片切换，null=全部）
let reconFilter = null;
const RECON_TYPES = ['短款', '长款', '金额不一致', '状态不一致'];
function filterReconcile(t) {
  reconFilter = (reconFilter === t) ? null : t;
  render();
}

function renderReconcile() {
  const pending = S.reconciles.filter(r=>r.status==='PENDING').length;
  const fixed = S.reconciles.filter(r=>r.status.includes('FIXED')).length;
  let h = \`<div class="grid g3">
    <div class="card stat"><div class="label">☷ 对账差异</div><div class="value">\${S.reconciles.length}</div><div class="foot">订单/数量/金额/资金四层</div></div>
    <div class="card stat"><div class="label">⚠ 待处理</div><div class="value \${pending?'heat':'green'}">\${pending}</div><div class="foot">\${S.reconciles.filter(r=>r.risk==='P0').length} 条 P0 高危</div></div>
    <div class="card stat"><div class="label">✓ 自动化处理率</div><div class="value green">\${S.reconciles.length?Math.round(fixed/S.reconciles.length*100):0}%</div><div class="foot">目标 ≥ 95%</div></div>
  </div>\`;
  h += \`<div class="section-label">差错四象限 · SQL 比对</div>
  <div class="panel"><div class="panel-head"><h3>差异记录</h3><span class="sub">自动分类 · 异常池</span></div>
  <div style="padding:16px 20px" class="grid g4">
    \${RECON_TYPES.map((t,i)=>\`
    <button class="btn" style="height:auto;min-height:56px;flex-direction:column;align-items:flex-start;padding:10px 12px;\${reconFilter===t?'border-color:var(--accent);background:rgba(0,113,227,.08)':''}" onclick="filterReconcile('\${t}')">
      <span style="font-size:10.5px;color:var(--text-4)">场景 \${i+1} · 点击筛选</span>
      <span style="font-size:12px;margin-top:3px;color:\${i===2?'#d70015':'var(--text-body)'}">\${t}</span>
      <span style="font-size:10.5px;color:var(--text-3)">\${S.reconciles.filter(r=>r.type===t).length} 条</span>
    </button>\`).join('')}
  </div>
  \${reconFilter?\`<div style="padding:0 20px 12px"><button class="btn sm" onclick="filterReconcile('\${reconFilter}')">✕ 清除筛选：\${esc(reconFilter)}</button></div>\`:''}
  <div class="scroll"><table><thead><tr><th>差异号</th><th>日期</th><th>层级</th><th>类型</th><th>差额</th><th>风险</th><th>状态</th><th>操作</th></tr></thead><tbody>\`;
  h += S.reconciles.filter(r => !reconFilter || r.type === reconFilter).map(r => \`<tr>
    <td class="mono">\${esc(r.id)}</td><td class="mono">\${esc(r.date)}</td>
    <td><span class="badge blue">\${esc(r.layer)}</span></td><td>\${esc(r.type)}</td>
    <td class="mono" style="color:\${r.diff>0?'#d70015':''}">\${r.diff?money(r.diff):'—'}</td>
    <td>\${r.risk==='P0'?'<span class="badge red">P0</span>':\`<span class="badge heat">\${r.risk}</span>\`}</td>
    <td>\${r.status==='PENDING'?'<span class="badge heat">待处理</span>':r.status.includes('FIXED')?'<span class="badge green">已修复</span>':\`<span class="badge">\${r.status}</span>\`}</td>
    <td>\${r.status==='PENDING'?\`<div class="btn-row">
      <button class="btn sm green" onclick="doRecon('\${r.id}','fix')">自动修复</button>
      <button class="btn sm" onclick="doRecon('\${r.id}','manual')">人工调账</button>
    </div>\`:'—'}</td></tr>\`).join('');
  h += \`</tbody></table></div>
  <div style="padding:14px 20px" class="btn-row"><button class="btn" onclick="runReconcile()">▶ 执行 T+1 对账任务</button></div>
  <div style="padding:0 20px 16px"><p class="hint">P0 级差异严禁自动处理，直接生成告警冻结结算并转人工财务介入。</p></div></div>\`;
  return h;
}
function doRecon(id,act){const r=handleReconcile(id,act);toast(r.msg,!r.ok);render();}
function runReconcile(){
  const p=S.products[Math.floor(Math.random()*S.products.length)];
  S.reconciles.unshift({id:nextId('rc'),date:'2026-11-24',layer:['订单层','数量层','金额层','资金层'][Math.floor(Math.random()*4)],
    type:'金额不一致',order:p.id,diff:Math.round(Math.random()*50000),status:'PENDING',risk:'P1',time:nowStr()});
  log('INFO','T+1 对账任务执行完成，发现 1 条新差异，已进入异常池');
  save();render();toast('对账任务执行完成');
}

function renderCommission() {
  const pending = S.commissions.filter(c=>c.status==='PENDING').reduce((a,c)=>a+c.amount,0);
  const settled = S.commissions.filter(c=>c.status==='SETTLED'&&c.amount>0).reduce((a,c)=>a+c.amount,0);
  let h = \`<div class="grid g3">
    <div class="card stat"><div class="label">◇ 待结算佣金</div><div class="value heat">\${money(pending)}</div><div class="foot">订单完成后正式计算</div></div>
    <div class="card stat"><div class="label">✓ 已结算佣金</div><div class="value green">\${money(settled)}</div><div class="foot">级差 + 固定比例</div></div>
    <div class="card stat"><div class="label">▤ 佣金记录</div><div class="value purple">\${S.commissions.length}</div><div class="foot">含负向扣回</div></div>
  </div>\`;
  h += \`<div class="section-label">佣金计算 · 规则快照</div>
  <div class="panel"><div class="panel-head"><h3>佣金明细</h3><span class="sub">退款负向回溯</span></div>
  <div class="scroll"><table><thead><tr><th>佣金单</th><th>订单</th><th>分销商</th><th>层级</th><th>比例</th><th>佣金</th><th>状态</th><th>操作</th></tr></thead><tbody>\`;
  h += S.commissions.map(c => \`<tr>
    <td class="mono">\${esc(c.id)}</td><td class="mono">\${esc(short(c.order))}</td>
    <td class="mono">\${esc(c.user)}</td><td>\${esc(c.level)}</td>
    <td class="mono">\${(c.rate*100).toFixed(0)}%</td>
    <td class="mono" style="color:\${c.amount<0?'#d70015':'#248a3d'}">\${c.amount>0?'+':''}\${money(c.amount)}</td>
    <td>\${c.status==='PENDING'?'<span class="badge heat">待结算</span>':'<span class="badge green">已结算</span>'}</td>
    <td>\${c.status==='PENDING'?\`<button class="btn sm green" onclick="doSettleCm('\${c.id}')">结算</button>\`:''}
        \${c.amount>0?\`<button class="btn sm danger" onclick="doReverseCm('\${c.id}')">退款扣回</button>\`:''}</td>
  </tr>\`).join('');
  h += \`</tbody></table></div>
  <div style="padding:14px 20px 18px"><p class="hint">级差佣金：一级 20%、二级 15%、三级 10% → 三级卖单 100 元，二级得 (15%-10%)=5 元，一级得 (20%-15%)=5 元。快照机制保证规则变更不影响历史订单。</p></div></div>\`;

  // A5：级差试算器（与 CommissionTier.java / 03_commission_tier.sql 输出同构）
  h += \`<div class="section-label">级差试算器</div>
  <div class="panel"><div class="panel-head"><h3>试算：输入卖单，算各级佣金</h3><span class="sub">结果单位：分</span></div>
  <div style="padding:18px 20px">
    <div class="grid g2">
      <div class="field"><label>卖单金额（元）</label><input id="ctAmount" type="number" value="100" min="0" step="0.01"></div>
      <div class="field"><label>层级比例（%，从高到低，逗号分隔）</label><input id="ctRates" type="text" value="20,15,10"></div>
    </div>
    <div class="btn-row"><button class="btn primary" onclick="calcTier()">试算</button></div>
    <div id="ctResult" style="margin-top:14px">\${tierResultHtml(10000, [2000,1500,1000])}</div>
  </div></div>\`;
  return h;
}
/** 级差核心：rate 用 basis points（2000=20%），金额用整数分，整数除法无浮点。 */
function tierLines(saleAmountCents, ratesBps) {
  const lines = [];
  for (let i = 0; i < ratesBps.length; i++) {
    const childRate = i + 1 < ratesBps.length ? ratesBps[i + 1] : 0;
    const diff = ratesBps[i] - childRate;
    lines.push({ level: i + 1, diffBps: diff, amountCents: Math.floor(saleAmountCents * diff / 10000) });
  }
  return lines;
}
function tierResultHtml(saleAmountCents, ratesBps) {
  const lines = tierLines(saleAmountCents, ratesBps);
  const total = lines.reduce((a, l) => a + l.amountCents, 0);
  const expected = Math.floor(saleAmountCents * ratesBps[0] / 10000);
  const ok = total === expected;
  return \`<div class="kv">
    \${lines.map(l => \`<div class="k">第\${['一','二','三','四','五'][l.level-1]||l.level}级（差 \${(l.diffBps/100).toFixed(0)}%）</div><div class="mono">\${money(l.amountCents)} · \${l.amountCents} 分</div>\`).join('')}
    <div class="k">合计</div><div class="mono" style="color:\${ok?'#248a3d':'#d70015'}">\${money(total)} · \${total} 分 \${ok?'✓':'✗'}</div>
  </div><p class="hint">断言：Σ各级 = 卖单金额 × 最高级比例 = \${expected} 分 \${ok?'（PASS）':'（FAIL）'}</p>\`;
}
function calcTier() {
  const yuan = parseFloat($('#ctAmount').value) || 0;
  const cents = Math.round(yuan * 100);
  const rates = ($('#ctRates').value || '').split(',').map(s => Math.round((parseFloat(s) || 0) * 100));
  if (!rates.length || rates.some(r => r < 0)) { toast('请输入有效的层级比例', true); return; }
  $('#ctResult').innerHTML = tierResultHtml(cents, rates);
  toast('试算完成');
}
function doSettleCm(id){const r=settleCommission(id);toast(r.msg,!r.ok);render();}
function doReverseCm(id){const r=reverseCommission(id);toast(r.msg,!r.ok);render();}

function renderDebug() {
  const orderOpts = S.orders.map(o=>\`<option value="\${o.id}">\${short(o.id)} · \${STATE_LABEL[o.status]} · \${money(o.amount)}</option>\`).join('');
  const splitOpts = S.splits.map(s=>\`<option value="\${s.id}">\${s.id} · \${s.status} · \${money(s.amount)}</option>\`).join('');
  let h = \`<div class="section-label">状态调试</div><div class="grid g2">\`;
  h += \`<div class="debug-card"><h4>⚙ 订单状态</h4>
    <div class="field"><label>选择订单</label><select id="dbgOrder">\${orderOpts}</select></div>
    <div class="field"><label>目标状态（可强制跨态）</label><select id="dbgTarget">\${ORDER_STATES.map(s=>\`<option value="\${s}">\${s} · \${STATE_LABEL[s]}</option>\`).join('')}</select></div>
    <label class="checkbox"><input type="checkbox" id="dbgForce"> 强制跨态（跳过状态机校验）</label>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn primary" onclick="dbgSetOrder()">应用状态</button>
      <button class="btn" onclick="dbgPay()">模拟支付</button>
      <button class="btn danger" onclick="dbgRefund()">模拟退款</button>
    </div>
    <p class="hint">正常模式遵循 TRANSITIONS 流转表并校验合法性；勾选强制可任意跳转。每次变更 version+1 并写状态日志。</p>
  </div>\`;
  h += \`<div class="debug-card"><h4>◈ 分账指令</h4>
    <div class="field"><label>选择分账指令</label><select id="dbgSplit">\${splitOpts}</select></div>
    <div class="field"><label>目标状态</label><select id="dbgSplitTarget">\${SPLIT_STATES.map(s=>\`<option value="\${s}">\${s}</option>\`).join('')}</select></div>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn primary" onclick="dbgSetSplit()">设置状态</button>
      <button class="btn" onclick="dbgInjectUnknown()">注入 UNKNOWN</button>
    </div>
    <p class="hint">UNKNOWN 保持 PUSHING 在途，验证"不臆断终态"契约。FREEZE 争议冻结，REVOKED 冲正作废。</p>
  </div></div>\`;

  // A6：三道防线可视化（异常默认挂起 → 兜底 → 恢复）
  const inv = Seed.assertInvariant(S);
  h += \`<div class="section-label">三道防线 · 资金安全</div>
  <div class="grid g3">
    <div class="card stat" style="\${defenseState===1?'border-color:var(--accent)':''}">
      <div class="label">① 预防</div><div class="value" style="font-size:14px">幂等键 + 乐观锁</div><div class="foot">order_id 粒度分布式锁串行</div></div>
    <div class="card stat" style="\${defenseState===2?'border-color:var(--accent)':''}">
      <div class="label">② 兜底</div><div class="value" style="font-size:14px">UNKNOWN 不臆断</div><div class="foot">原幂等键重发 + 查询兜底</div></div>
    <div class="card stat" style="\${defenseState===3?'border-color:var(--accent)':''}">
      <div class="label">③ 恢复</div><div class="value" style="font-size:14px">对账 + 冲正退款</div><div class="foot">T+1 差异入异常池自动纠偏</div></div>
  </div>\`;

  h += \`<div class="section-label">异常注入 · 守恒 \${inv.ok?'<span style="color:#248a3d">✓ PASS</span>':'<span style="color:#d70015">✗ FAIL</span>'}</div>
  <div class="debug-card"><div class="btn-row">
    <button class="btn danger" onclick="dbgStockFail()">库存扣减失败</button>
    <button class="btn danger" onclick="dbgTimeout()">分账接口超时</button>
    <button class="btn danger" onclick="dbgBalanceLow()">退款余额不足</button>
    <button class="btn" onclick="dbgDuplicate()">重复幂等键</button>
  </div><p class="hint">注入后观察三道防线高亮与下方日志；顶部守恒标记实时校验 GMV = 冻结 + 已划拨。</p></div>\`;

  h += \`<div class="section-label">实时日志 · TRACE</div>
  <div class="log" id="debugLog">\`;
  h += S.logs.slice(0,30).map(l=>\`<span class="\${l.level.toLowerCase()}">[\${esc(l.time)}] \${esc(l.level)} \${esc(l.msg)}</span>\`).join('');
  h += \`</div>\`;
  return h;
}
function dbgSetOrder(){
  const id=$('#dbgOrder').value, target=$('#dbgTarget').value, force=$('#dbgForce').checked;
  const r=setOrderStatus(id,target,{force});toast(r.msg,!r.ok);render();
}
function dbgPay(){const r=payOrder($('#dbgOrder').value);toast(r.msg,!r.ok);render();}
function dbgRefund(){const r=refundOrder($('#dbgOrder').value);toast(r.msg,!r.ok);render();}
function dbgSetSplit(){
  const id=$('#dbgSplit').value, target=$('#dbgSplitTarget').value;
  const s=S.splits.find(x=>x.id===id);if(!s)return;
  s.status=target;log('WARN',\`分账 \${id} 调试强制设为 \${target}\`);save();render();toast('分账状态已设置');
}
let defenseState = 0; // 0=未注入异常；1/2/3=最近激活的防线
function dbgInjectUnknown(){
  const id=$('#dbgSplit').value;const s=S.splits.find(x=>x.id===id);if(!s)return;
  s.status='PUSHING'; defenseState=2;
  log('WARN',\`[防线②] 分账 \${id} 收到 UNKNOWN/TIMEOUT，保持 PUSHING 在途，原号重发+查询兜底\`);save();render();toast('UNKNOWN 已注入，防线②兜底生效');
}
function dbgStockFail(){defenseState=1;log('ERR','[防线①] 库存扣减失败：Redis 扣减成功但 DB 条件更新失败 → 回滚 Redis + 取消订单');save();render();toast('已注入：库存扣减失败');}
function dbgTimeout(){defenseState=2;log('ERR','[防线②] 分账接口 30s 超时 → UNKNOWN，启动退避重试（原幂等键重发）');save();render();toast('已注入：分账接口超时');}
function dbgBalanceLow(){defenseState=3;log('ERR','[防线③] 退款失败：供应商虚拟户余额不足冲正 → 挂起退款，冻结提现，触发财务告警');save();render();toast('已注入：退款余额不足');}
function dbgDuplicate(){
  defenseState=1;
  const g=new IdempotentKeyGenerator();
  try{g.generate('SPLIT','DUPLICATE_TEST',1);g.generate('SPLIT','DUPLICATE_TEST',1);}
  catch(e){log('OK','[防线①] 幂等键唯一索引生效：重复分账请求被拦截（'+e.message+'）');}
  save();render();toast('已测试：防线①幂等拦截');
}
function renderDebugLog(){
  const el=$('#debugLog');if(!el)return;
  el.innerHTML=S.logs.slice(0,30).map(l=>\`<span class="\${l.level.toLowerCase()}">[\${esc(l.time)}] \${esc(l.level)} \${esc(l.msg)}</span>\`).join('');
}
` },
  "/js/seed.js": { contentType: "application/javascript; charset=UTF-8", body: `/**
 * 电商代销平台 · 唯一种子真源（UMD：浏览器 + Node 共用）
 * ------------------------------------------------------------------
 * 所有看板数字、Worker /api/stats、全链路推演脚本一律通过 metrics(state) 计算，
 * 杜绝"同一指标多算法"（G2）与冻结额重复计算（G3）。
 *
 * 不变量：gmv = frozen + allocated
 *   gmv       = Σ 已支付且未 CLOSED/CANCELLED 的订单金额
 *   allocated = Σ ledger 中 status=1 且 type=SPLIT_ACCOUNT 的金额（资金账本唯一真源）
 *   frozen    = gmv - allocated （差额法）
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Seed = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PAY_SUCCESS = 'SUCCESS'; // 唯一支付成功常量：消灭 PAY_SUCCESS/SUCCESS 口径分裂
  const BASE_TIME = Date.UTC(2026, 10, 24, 2, 0, 0); // 固定基准，Node 推演可复现

  const TRANSITIONS = {
    CREATED: ['PAID', 'CANCELLED'],
    PAID: ['ACCEPTED', 'AFTER_SALE_PENDING', 'CANCELLED'],
    ACCEPTED: ['SHIPPED', 'AFTER_SALE_PENDING'],
    SHIPPED: ['COMPLETED', 'AFTER_SALE_PENDING'],
    COMPLETED: ['SETTLED', 'AFTER_SALE_PENDING'],
    SETTLED: ['AFTER_SALE_PENDING'],
    AFTER_SALE_PENDING: ['REFUNDING', 'SHIPPED', 'COMPLETED', 'SETTLED'],
    REFUNDING: ['CLOSED', 'COMPLETED', 'SETTLED'],
    CLOSED: [], CANCELLED: [],
  };

  // 子订单状态机（按供应商独立流转，与主单解耦）
  const ITEM_TRANSITIONS = {
    CREATED: ['PAID', 'CANCELLED'],
    PAID: ['ACCEPTED', 'AFTER_SALE_PENDING'],
    ACCEPTED: ['SHIPPED', 'AFTER_SALE_PENDING'],
    SHIPPED: ['COMPLETED', 'AFTER_SALE_PENDING'],
    COMPLETED: ['SETTLED', 'AFTER_SALE_PENDING'],
    SETTLED: ['AFTER_SALE_PENDING'],
    AFTER_SALE_PENDING: ['REFUNDING', 'SHIPPED', 'COMPLETED', 'SETTLED'],
    REFUNDING: ['CLOSED'],
    CLOSED: [], CANCELLED: [],
  };

  /**
   * 主订单状态聚合：禁止直接修改主单状态，由子单状态按规则计算。
   * 规则源自 D3 文档「主订单状态聚合规则表」。
   */
  function aggregateOrderStatus(order) {
    const ss = order.items.map(i => i.status);
    const all = (pred) => ss.length > 0 && ss.every(pred);
    if (all(s => s === 'CLOSED' || s === 'CANCELLED')) return 'CLOSED';
    if (all(s => s === 'CREATED')) return 'CREATED';
    if (all(s => s === 'SETTLED' || s === 'COMPLETED')) return 'COMPLETED';
    if (all(s => ['SHIPPED', 'COMPLETED', 'SETTLED'].includes(s))) return 'SHIPPED';
    if (ss.some(s => s === 'SHIPPED' || s === 'COMPLETED' || s === 'SETTLED')) return 'PART_SHIPPED';
    if (all(s => ['PAID', 'ACCEPTED'].includes(s))) return 'PAID';
    return order.status; // 无明确规则时保持原值（兼容演示种子）
  }

  // 60/20/10/10 分账规则；末条用最大余额法兜底，保证 Σ = 订单金额
  const SPLIT_RULES = [
    { receiver: 'VA_S1001', role: 'SUPPLIER', bps: 6000, memo: '供货货款 60%' },
    { receiver: 'VA_D2031', role: 'DISTRIBUTOR', bps: 2000, memo: '一级分销佣金 20%' },
    { receiver: 'VA_P0001', role: 'PLATFORM', bps: 1000, memo: '平台服务费 10%' },
    { receiver: 'VA_RESERVE', role: 'RESERVATION', bps: 1000, memo: '逆向售后保证金 10%' },
  ];

  function mkOrder(id, userId, amount, status, payStatus, time, items) {
    return { id, userId, amount, status, payStatus, refundStatus: 'NONE', version: 0, time, items, splits: 0 };
  }
  function mkItem(productId, supplier, amount, status) {
    return { productId, supplier, amount, status };
  }

  /** 生成自洽种子；baseTime 可注入以便推演脚本得到确定性时间。 */
  function createSeedState(baseTime) {
    const now = baseTime == null ? BASE_TIME : baseTime;
    const t = (m) => new Date(now - m * 60000).toISOString().slice(0, 19).replace('T', ' ');

    const orders = [
      mkOrder('DSO20261124000121', 'u_1001', 29900, 'SHIPPED', PAY_SUCCESS, t(180), [
        mkItem('SKU1001', 'S1001 深圳智造', 29900, 'SHIPPED')]),
      mkOrder('DSO20261124000122', 'u_1002', 65800, 'COMPLETED', PAY_SUCCESS, t(120), [
        mkItem('SKU1002', 'S1002 杭州家居', 45900, 'COMPLETED'),
        mkItem('SKU1001', 'S1001 深圳智造', 19900, 'COMPLETED')]),
      mkOrder('DSO20261124000123', 'u_1003', 49750, 'PAID', PAY_SUCCESS, t(60), [
        mkItem('SKU1003', 'S1003 南通纺织', 19900, 'PAID'),
        mkItem('SKU1002', 'S1002 杭州家居', 29850, 'PAID')]),
      mkOrder('DSO20261124000124', 'u_1004', 8900, 'CREATED', 'INIT', t(12), [
        mkItem('SKU1005', 'S1002 杭州家居', 8900, 'CREATED')]),
      mkOrder('DSO20261124000120', 'u_1005', 19900, 'REFUNDING', PAY_SUCCESS, t(300), [
        mkItem('SKU1003', 'S1003 南通纺织', 19900, 'REFUNDING')]),
    ];
    orders[0].splits = 4; orders[1].splits = 4;

    // 已划拨：121(29900) + 122(65800) = 95700，分账明细与流水严格配平
    const splits = [];
    const ledger = [];
    const makeSplitSet = (order, prefix, time) => {
      let allocated = 0;
      SPLIT_RULES.forEach((r, i) => {
        const amt = i === SPLIT_RULES.length - 1 ? order.amount - allocated : Math.round(order.amount * r.bps / 10000);
        allocated += amt;
        const key = \`SPLIT_\${order.id}_\${r.receiver}_0001\`;
        splits.push({ id: \`\${prefix}\${i + 1}\`, orderId: order.id, receiver: r.receiver, role: r.role,
          amount: amt, status: 'SUCCESS', key, time });
        ledger.push({ id: \`LG\${prefix.slice(2)}\${i + 1}\`, biz: order.id, account: r.receiver,
          type: 'SPLIT_ACCOUNT', amount: amt, status: 1, key, time });
      });
      return allocated;
    };
    makeSplitSet(orders[0], 'SP000005', t(100)); // 29900
    makeSplitSet(orders[1], 'SP000009', t(90));  // 65800

    return {
      version: 2,
      seq: { order: 124, product: 12, split: 13, ledger: 30, reconcile: 6, commission: 6, log: 30 },
      products: [
        { id: 'SKU1001', name: '无线蓝牙耳机 Pro', supplier: 'S1001 深圳智造', price: 29900, stock: 168, cat: '数码' },
        { id: 'SKU1002', name: '便携咖啡机', supplier: 'S1002 杭州家居', price: 45900, stock: 42, cat: '家电' },
        { id: 'SKU1003', name: '纯棉四件套', supplier: 'S1003 南通纺织', price: 19900, stock: 305, cat: '家居' },
        { id: 'SKU1004', name: '智能体脂秤', supplier: 'S1001 深圳智造', price: 12900, stock: 0, cat: '数码' },
        { id: 'SKU1005', name: '户外保温杯', supplier: 'S1002 杭州家居', price: 8900, stock: 520, cat: '家居' },
      ],
      orders, splits, ledger,
      reconciles: [
        { id: 'RC0001', date: '2026-11-23', layer: '金额层', type: '金额不一致', order: 'DSO20261123000088', diff: 200, status: 'PENDING', risk: 'P0', time: t(1440) },
        { id: 'RC0002', date: '2026-11-23', layer: '订单层', type: '短款', order: 'DSO20261123000091', diff: 12900, status: 'AUTO_FIXED', risk: 'P1', time: t(1440) },
        { id: 'RC0003', date: '2026-11-23', layer: '资金层', type: '状态不一致', order: 'DSO20261123000095', diff: 0, status: 'PENDING', risk: 'P1', time: t(1440) },
        { id: 'RC0004', date: '2026-11-23', layer: '订单层', type: '长款', order: 'DSO20261123000097', diff: 8900, status: 'PENDING', risk: 'P1', time: t(1440) },
      ],
      commissions: [
        { id: 'CM0001', order: 'DSO20261124000122', user: 'u_1002', level: '一级', base: 65800, rate: 0.20, amount: 13160, status: 'PENDING', time: t(120) },
        { id: 'CM0002', order: 'DSO20261124000121', user: 'u_1001', level: '一级', base: 29900, rate: 0.20, amount: 5980, status: 'SETTLED', time: t(180) },
        { id: 'CM0003', order: 'DSO20261123000088', user: 'u_1009', level: '二级', base: 19900, rate: 0.05, amount: 995, status: 'PENDING', time: t(1500) },
      ],
      logs: [
        { id: 1, time: t(60), level: 'INFO', msg: '订单 DSO...123 支付成功，货款进入监管户冻结' },
        { id: 2, time: t(90), level: 'OK', msg: '订单 DSO...122 确认收货 → 分账 4 笔全部到账 [SUCCESS]' },
        { id: 3, time: t(100), level: 'OK', msg: '订单 DSO...121 发货 → 分账 4 笔到账，资金划拨完成' },
        { id: 4, time: t(180), level: 'INFO', msg: '供应商发货，物流单号已回传' },
        { id: 5, time: t(300), level: 'WARN', msg: '订单 DSO...120 发起退款，先冲正后退款' },
      ],
    };
  }

  /** 统一口径：所有指标的唯一计算入口（G1/G2/G3 的根治点）。 */
  function metrics(state) {
    const paidOrders = state.orders.filter(o =>
      o.payStatus === PAY_SUCCESS && o.status !== 'CLOSED' && o.status !== 'CANCELLED');
    const gmv = paidOrders.reduce((a, o) => a + o.amount, 0);
    const allocated = state.ledger
      .filter(l => l.status === 1 && l.type === 'SPLIT_ACCOUNT')
      .reduce((a, l) => a + l.amount, 0);
    const frozen = gmv - allocated;
    return {
      gmv, allocated, frozen,
      paidCount: paidOrders.length,
      orderCount: state.orders.length,
      splitSuccess: state.splits.filter(s => s.status === 'SUCCESS').length,
      splitCount: state.splits.length,
      pendingRecon: state.reconciles.filter(r => r.status === 'PENDING').length,
    };
  }

  /** 守恒断言：gmv === frozen + allocated（差额法下恒成立，同时检查非负数）。 */
  function assertInvariant(state) {
    const m = metrics(state);
    const ok = m.gmv === m.frozen + m.allocated && m.frozen >= 0 && m.allocated >= 0;
    return { ok, gmv: m.gmv, frozen: m.frozen, allocated: m.allocated,
      detail: \`GMV(\${m.gmv}) = 冻结(\${m.frozen}) + 已划拨(\${m.allocated})\` };
  }

  return { PAY_SUCCESS, BASE_TIME, TRANSITIONS, ITEM_TRANSITIONS, SPLIT_RULES,
    createSeedState, mkOrder, mkItem, metrics, assertInvariant, aggregateOrderStatus };
});
` },
  "/js/state.js": { contentType: "application/javascript; charset=UTF-8", body: `/* ========== 全局状态层：种子数据 + 持久化 + 核心业务动作 ========== */
const STORAGE_KEY = 'dsx_demo_state_v1';

const ORDER_STATES = ['CREATED','PAID','ACCEPTED','SHIPPED','COMPLETED','SETTLED','AFTER_SALE_PENDING','REFUNDING','CLOSED','CANCELLED'];
const SPLIT_STATES = ['INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS','PART_SUCCESS','FREEZE','REVOKED','FAILED'];
const STATE_LABEL = {
  CREATED:'待付款', PAID:'已付款/待发货', ACCEPTED:'已接单', SHIPPED:'已发货',
  PART_SHIPPED:'部分发货', COMPLETED:'已完成', SETTLED:'已结算', AFTER_SALE_PENDING:'售后中', REFUNDING:'退款中',
  CLOSED:'已关闭', CANCELLED:'已取消'
};
const STATE_CLASS = {
  CREATED:'b-creat', PAID:'b-paid', ACCEPTED:'b-cyan', SHIPPED:'b-ship', COMPLETED:'b-done',
  SETTLED:'b-done', AFTER_SALE_PENDING:'b-warn', REFUNDING:'b-warn', CLOSED:'b-refund', CANCELLED:'b-refund'
};
const SPLIT_CLASS = {
  INIT:'b-creat', PUSHING:'b-paid', ACCEPTED:'b-cyan', PROCESSING:'b-ship', SUCCESS:'b-done',
  PART_SUCCESS:'b-warn', FREEZE:'b-warn', REVOKED:'b-refund', FAILED:'b-refund'
};

// 种子数据唯一来源：demo/js/seed.js（state.js 只负责持久化、日志、ID 生成）
function seedState() { return Seed.createSeedState(); }
// 兼容别名：actions.js 的 createOrder 仍使用 mkOrder/mkItem
function mkOrder(id, userId, amount, status, payStatus, time, items) {
  return Seed.mkOrder(id, userId, amount, status, payStatus, time, items);
}
function mkItem(productId, supplier, amount, status) {
  return Seed.mkItem(productId, supplier, amount, status);
}

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      // 版本迁移：v1 种子含 PAY_SUCCESS 旧口径，且资金指标不自洽；统一重置为 v2
      if (d && d.version === 2) return d;
      if (d && d.version === 1) {
        const fresh = seedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
    }
  } catch (e) { console.warn('状态读取失败', e); }
  return seedState();
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
  catch (e) { console.warn('状态保存失败', e); }
}
function resetState() { S = seedState(); save(); }

function log(level, msg) {
  S.logs.unshift({ id: ++S.seq.log, time: new Date().toISOString().slice(0,19).replace('T',' '), level, msg });
  if (S.logs.length > 80) S.logs.length = 80;
}
function nextId(prefix) { return prefix + String(++S.seq[prefix.toLowerCase()] || 1).padStart(6,'0'); }
` },
  "/js/utils.js": { contentType: "application/javascript; charset=UTF-8", body: `/* ========== UI 辅助函数（Apple Liquid Glass 版） ========== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (c) => '¥' + (Number(c)/100).toFixed(2);

/* 状态 → 语义色：一般灰 / 进行中蓝 / 完成绿 / 警示橙 / 危险红 */
const STATE_BADGE = {
  CREATED:'grey', PAID:'blue', ACCEPTED:'blue', SHIPPED:'indigo', COMPLETED:'green',
  SETTLED:'green', AFTER_SALE_PENDING:'heat', REFUNDING:'heat', CLOSED:'red', CANCELLED:'red'
};
const SPLIT_BADGE = {
  INIT:'grey', PUSHING:'blue', ACCEPTED:'blue', PROCESSING:'indigo', SUCCESS:'green',
  PART_SUCCESS:'heat', FREEZE:'heat', REVOKED:'red', FAILED:'red'
};
function badge(state, kind='order') {
  const tone = kind === 'split' ? (SPLIT_BADGE[state]||'grey') : (STATE_BADGE[state]||'grey');
  const label = kind === 'split' ? state : (STATE_LABEL[state]||state);
  return \`<span class="badge \${tone}">\${esc(label)}</span>\`;
}
function short(id) { return id.length > 18 ? id.slice(0,12)+'…'+id.slice(-4) : id; }

let toastTimer = null;
function toast(msg, err=false) {
  const el = $('#toast');
  el.textContent = msg; el.classList.toggle('err', !!err); el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function openModal(title, bodyHtml, buttons=[]) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  const foot = $('#modalFoot'); foot.innerHTML = '';
  (buttons.length ? buttons : [{label:'关闭', cls:''}]).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls||'');
    btn.textContent = b.label;
    btn.onclick = () => { if (b.onClick && b.onClick() === false) return; closeModal(); };
    foot.appendChild(btn);
  });
  // 同一帧触发布局，再开启过渡（materialize: 模糊+缩放+透明度一起）
  requestAnimationFrame(() => { $('#scrim').classList.add('show'); $('#modal').classList.add('show'); });
}
function closeModal() {
  $('#modal').classList.remove('show');
  $('#scrim').classList.remove('show');
}

/* 状态机流转可视化：当前节点实心强调蓝，已完成节点淡蓝 */
function flowFor(current, states, labels) {
  const idxCur = states.indexOf(current);
  return \`<div class="flow">\` + states.map((s,i) => {
    let cls = '';
    if (current === s) cls = 'on';
    else if (idxCur >= 0 && i < idxCur && current !== 'CLOSED' && current !== 'CANCELLED') cls = 'done';
    return \`<span class="node \${cls}">\${esc(labels ? labels[i] : s)}</span>\` +
      (i < states.length-1 ? '<span class="arr">→</span>' : '');
  }).join('') + \`</div>\`;
}
function orderFlow(status) {
  return flowFor(status,
    ['CREATED','PAID','ACCEPTED','SHIPPED','COMPLETED','SETTLED'],
    ['待付款','已付款','已接单','已发货','已完成','已结算']);
}
function splitFlow(status) {
  return flowFor(status,
    ['INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS'],
    ['INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS']);
}
` },
};
