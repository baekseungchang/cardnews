// 카드뉴스 렌더러 v2: node render.js <card.json>
// - 실제 시세(야후 파이낸스)로 차트를 그리고, change:"auto"면 등락률도 자동 계산
// - 표지/요약 배경은 브랜드 컬러 + 등락 방향(상승=빨강, 하락=파랑)으로 결정
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BROWSERS = [
  process.env.CHROME_PATH || '',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

const jsonPath = path.resolve(process.argv[2] || '');
if (!fs.existsSync(jsonPath)) {
  console.error('사용법: node render.js <card.json>');
  process.exit(1);
}
const card = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
// 두 번째 인자로 출력 폴더 지정 가능 (기본: card.json 옆)
const outDir = path.resolve(process.argv[3] || path.dirname(jsonPath));
fs.mkdirSync(outDir, { recursive: true });
const htmlDir = path.join(outDir, '_html');
fs.mkdirSync(htmlDir, { recursive: true });

// ---------- 색 유틸 ----------
const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hex = (r) => '#' + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => rgb2hex(hex2rgb(a).map((v, i) => v + (hex2rgb(b)[i] - v) * t));
const lum = (h) => { const [r, g, b] = hex2rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const alpha = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };

const MOOD = { up: '#E8382F', down: '#2D6BF0', neutral: '#F0A30A' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>').replace(/\n/g, '<br>');

// ---------- 시세 ----------
async function fetchSeries(symbol, range) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  const q = (await r.json()).chart.result[0];
  const pts = q.timestamp.map((t, i) => [t, q.indicators.quote[0].close[i]]);
  // 마지막 봉 종가가 비어 있으면 현재가로 채움
  if (pts.length && pts[pts.length - 1][1] == null) pts[pts.length - 1][1] = q.meta.regularMarketPrice;
  let clean = pts.filter((p) => p[1] != null);
  // 카드 날짜(CARD_DATE)가 있으면 그 날짜 전까지의 봉만 쓴다 → 늦게 렌더링해도 카드 내용과 차트가 같은 시점
  const until = process.env.CARD_DATE;
  if (until) {
    const cut = clean.filter((p) => new Date(p[0] * 1000).toISOString().slice(0, 10) < until);
    if (cut.length > 1) return { closes: cut.map((p) => p[1]), last: cut.at(-1)[1], currency: q.meta.currency };
  }
  return { closes: clean.map((p) => p[1]), last: q.meta.regularMarketPrice ?? clean.at(-1)[1], currency: q.meta.currency };
}

function chartSVG(closes, { w, h, stroke, fill, dot, label, halo = 'none', rpad = 0 }) {
  const min = Math.min(...closes), max = Math.max(...closes), pad = (max - min) * 0.12 || 1;
  const x = (i) => (i / (closes.length - 1)) * (w - rpad);
  const y = (v) => h - ((v - (min - pad)) / (max - min + pad * 2)) * h;
  const line = closes.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const lx = x(closes.length - 1), ly = y(closes.at(-1));
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible">
<path d="${line}L${w - rpad},${h}L0,${h}Z" fill="${fill}"/>
<path d="${line}" fill="none" stroke="${stroke}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="${lx}" cy="${ly}" r="16" fill="${dot}" stroke="${stroke}" stroke-width="5"/>
${label ? `<text x="${lx + 20}" y="${ly < 70 ? ly + 70 : ly - 36}" text-anchor="end" stroke="${halo}" stroke-width="14" paint-order="stroke" stroke-linejoin="round" font-size="34" font-weight="800" fill="${stroke}" font-family="Pretendard">${esc(label)}</text>` : ''}
</svg>`;
}

// 차트 끝 가격 라벨: 금리는 %, 지수는 숫자만, 원·엔은 단위, 나머지는 달러
const fmtPrice = (v, cur, symbol = '') => {
  const n = (d) => v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
  if (/^\^(TNX|TYX|FVX|IRX)$/i.test(symbol)) return `${n(2)}%`;
  if (cur === 'KRW') return `${v.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}원`;
  if (cur === 'JPY') return `${v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}엔`;
  if (symbol.startsWith('^') || /^DX-Y/i.test(symbol)) return n(2);
  return `$${n(2)}`;
};

(async () => {
  let series = null;
  if (card.chartSymbol) {
    try { series = await fetchSeries(card.chartSymbol, card.chartRange || '3mo'); } catch (e) { console.warn('시세 조회 실패:', e.message); }
  }

  // 등락률 자동 계산 (직전 종가 대비)
  let change = card.change || '';
  if (change === 'auto' && series && series.closes.length > 1) {
    const c = series.closes, pct = ((c.at(-1) - c.at(-2)) / c.at(-2)) * 100;
    change = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    console.log(`  자동 등락률: ${change}`);
  } else if (change === 'auto') change = '';

  const dir = card.direction || 'neutral';
  const mood = MOOD[dir];
  const brand = card.brand || '#1b1f2a';
  // 표지 배경: 브랜드 컬러를 충분히 어둡게 + 등락 방향 색을 살짝 섞음
  let coverBg = mix(brand, '#000000', lum(brand) > 0.3 ? 0.6 : 0.25);
  
  const paper = '#F3EFE7', ink = '#161616';
  const accentOnPaper = lum(brand) > 0.35 || lum(brand) < 0.01 ? mix(mood, '#000', 0.15) : brand;
  const summaryBg = card.direction === 'neutral' ? mix(brand, '#000', 0.2) : mix(mood, '#000', 0.08);

  const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

  const css = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;900&display=block');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Pretendard','Malgun Gothic',sans-serif;letter-spacing:-0.025em;word-break:keep-all;position:relative;padding:92px 90px}
body:after{content:'';position:absolute;inset:0;background-image:${grain};opacity:.22;mix-blend-mode:overlay;pointer-events:none}
.serif{font-family:'Noto Serif KR',serif;letter-spacing:-0.04em}
.label{display:flex;align-items:center;gap:20px;font-size:28px;font-weight:700;letter-spacing:0.02em}
.label .bar{width:56px;height:6px;background:currentColor}

/* 표지 */
.cover{background:${coverBg};color:#fff}
.cover .ticker{font-size:150px;font-weight:900;line-height:1;margin-top:64px;letter-spacing:-0.05em}
.cover .co{font-size:38px;font-weight:600;opacity:.7;margin-top:14px}
.cover .stamp{display:inline-block;background:${mood};color:${lum(mood) > 0.4 ? ink : '#fff'};font-size:88px;font-weight:900;padding:6px 26px 10px;margin-top:40px;transform:rotate(-2deg);letter-spacing:-0.04em}
.cover .note{font-size:28px;font-weight:700;opacity:.7;margin-left:28px;vertical-align:middle}
.cover h1{font-size:76px;font-weight:900;line-height:1.2;margin-top:48px}
.cover h1 mark{background:none;color:#fff;box-shadow:inset 0 -22px 0 ${alpha(mood, 0.75)}}
.cover .sub{font-size:36px;line-height:1.5;margin-top:28px;opacity:.82;font-weight:500}
.cover .sub mark{background:none;color:#fff;font-weight:800}
.cover .chart{position:absolute;left:0;right:0;bottom:84px;height:280px;opacity:.95}
.cover .range{position:absolute;left:90px;bottom:34px;font-size:24px;opacity:.55;font-weight:600}

/* 본문 (종이) */
.paper{background:${paper};color:${ink}}
.paper .label{color:${accentOnPaper}}
.paper .no{font-size:120px;font-weight:900;line-height:1;color:${alpha(accentOnPaper, 0.28)};margin-top:64px}
.paper h2{font-size:70px;font-weight:900;line-height:1.24;margin-top:28px}
.paper .body{font-size:40px;line-height:1.7;margin-top:44px;color:#2b2b2b}
.paper mark{background:linear-gradient(transparent 58%, ${alpha(mood, 0.35)} 58%);color:inherit;font-weight:800}
.paper ul{list-style:none;margin-top:44px;border-top:4px solid ${ink}}
.paper li{font-size:38px;line-height:1.5;padding:28px 0;border-bottom:1.5px solid ${alpha(ink, 0.18)};display:flex;gap:28px}
.paper li .k{font-weight:900;color:${accentOnPaper};min-width:42px;font-size:32px;padding-top:4px}
.paper .big{font-size:150px;font-weight:900;line-height:1;margin-top:60px;color:${accentOnPaper};letter-spacing:-0.05em}
.paper .bigsub{font-size:44px;font-weight:700;margin-top:24px;line-height:1.45}
.paper .phase{font-size:34px;font-weight:800;color:${accentOnPaper};margin-top:72px;letter-spacing:0.02em;display:flex;align-items:center;gap:14px}
.paper .phase:before{content:'';width:14px;height:14px;border-radius:50%;background:currentColor}
.tl{list-style:none;margin-top:44px;border-top:4px solid ${ink};padding:0}
.tl li{display:grid;grid-template-columns:150px 1fr;gap:24px;font-size:36px;line-height:1.45;padding:24px 0;border-bottom:1.5px solid ${alpha(ink, 0.15)}}
.tl .d{font-weight:900;color:${accentOnPaper};font-variant-numeric:tabular-nums}
.tl li.now .d{color:${mood}}
table{width:100%;border-collapse:collapse;margin-top:44px;border-top:4px solid ${ink}}
th{font-size:28px;text-align:left;padding:22px 10px;color:#6a6a6a;font-weight:700;border-bottom:1.5px solid ${alpha(ink, 0.3)}}
td{font-size:36px;padding:26px 10px;border-bottom:1.5px solid ${alpha(ink, 0.15)};font-weight:600}
td:first-child{font-weight:900}

/* 숫자 (먹색) */
.ink{background:#141414;color:#f3efe7}
.ink .label{color:${mix(mood, '#fff', 0.15)}}
.ink h2{font-size:64px;font-weight:900;margin-top:70px;line-height:1.25}
.ink .grid{display:grid;grid-template-columns:1fr 1fr;margin-top:60px;border-top:2px solid #ffffff40}
.ink .kv{padding:44px 0 44px;border-bottom:2px solid #ffffff22}
.ink .kv:nth-child(odd){padding-right:30px;border-right:2px solid #ffffff22}
.ink .kv:nth-child(even){padding-left:40px}
.ink .v{font-size:84px;font-weight:900;letter-spacing:-0.05em}
.ink .l{font-size:28px;opacity:.6;margin-top:10px;font-weight:600}
.ink .mini{position:absolute;left:90px;right:90px;bottom:90px;height:200px}

/* 요약 */
.sum{background:${summaryBg};color:${lum(summaryBg) > 0.45 ? ink : '#fff'}}
.sum .quote{font-size:200px;line-height:.6;margin-top:110px;opacity:.35}
.sum .text{font-size:62px;font-weight:900;line-height:1.45;margin-top:30px}
.sum mark{background:none;color:inherit;text-decoration:underline;text-decoration-thickness:6px;text-underline-offset:12px}
.sum .cta{position:absolute;left:90px;right:90px;bottom:92px;border-top:3px solid currentColor;padding-top:30px;font-size:36px;font-weight:800;display:flex;justify-content:space-between}
`;

  const head = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head>`;
  const labelHTML = `<div class="label"><span class="bar"></span>${esc(card.tag)}${card.ticker ? ' · ' + esc(card.ticker) : ''}</div>`;
  const slides = [];

  // 1) 표지
  const chartW = 1080, chartH = 280;
  const coverChart = series ? `<div class="chart">${chartSVG(series.closes, { w: chartW, h: chartH, stroke: '#ffffff', fill: alpha('#ffffff', 0.08), dot: mood, label: fmtPrice(series.last, series.currency, card.chartSymbol), halo: coverBg, rpad: 110 })}</div><div class="range">${esc(card.chartCaption || '최근 3개월 종가')}</div>` : '';
  slides.push(['cover', `${labelHTML}
<div class="ticker">${esc(card.ticker)}</div>
${card.company && card.company !== card.ticker ? `<div class="co">${esc(card.company)}</div>` : ''}
${change ? `<div class="stamp">${esc(change)}</div>${card.changeNote ? `<span class="note">${esc(card.changeNote)}</span>` : ''}` : ''}
<h1>${rich(card.headline)}</h1>
<div class="sub">${rich(card.subhead)}</div>
${coverChart}`]);

  // 2) 본문 슬라이드
  (card.slides || []).forEach((s, idx) => {
    const no = String(idx + 1).padStart(2, '0');
    // phase(과거·현재·미래)가 있으면 번호 대신 시점을 표시
    let inner = `${labelHTML}${s.phase ? `<div class="phase">${esc(s.phase)}</div>` : `<div class="no serif">${no}</div>`}<h2 class="serif">${rich(s.title)}</h2>`;
    if (s.big) inner += `<div class="big">${esc(s.big)}</div>${s.bigSub ? `<div class="bigsub">${rich(s.bigSub)}</div>` : ''}`;
    if (s.body) inner += `<div class="body">${rich(s.body)}</div>`;
    if (s.bullets?.length) inner += `<ul>${s.bullets.map((b, i) => `<li><span class="k">${String.fromCharCode(65 + i)}</span><span>${rich(b)}</span></li>`).join('')}</ul>`;
    if (s.timeline?.length) inner += `<ol class="tl">${s.timeline.map((t) => `<li class="${t.now ? 'now' : ''}"><span class="d">${esc(t.date)}</span><span>${rich(t.text)}</span></li>`).join('')}</ol>`;
    if (s.table) inner += `<table><tr>${s.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${s.table.rows.map((r) => `<tr>${r.map((c) => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    slides.push(['paper', inner]);
  });

  // 3) 숫자 슬라이드
  if (card.keyNumbers?.length) {
    const mini = series ? `<div class="mini">${chartSVG(series.closes, { w: 900, h: 200, stroke: '#f3efe7', fill: alpha('#f3efe7', 0.06), dot: mood, rpad: 20 })}</div>` : '';
    slides.push(['ink', `${labelHTML}<h2 class="serif">숫자로 보는<br>${esc(card.company || card.ticker)}</h2>
<div class="grid">${card.keyNumbers.slice(0, 4).map((k) => `<div class="kv"><div class="v">${esc(k.value)}</div><div class="l">${esc(k.label)}</div></div>`).join('')}</div>${mini}`]);
  }

  // 4) 요약
  slides.push(['sum', `${labelHTML}<div class="quote serif">“</div><div class="text serif">${rich(card.summary)}</div>
<div class="cta"><span>도움됐다면 좋아요 · 팔로우</span><span>❤️</span></div>`]);

  const browser = BROWSERS.find((b) => b && fs.existsSync(b));
  if (!browser) { console.error('Edge/Chrome을 찾을 수 없습니다.'); process.exit(1); }

  slides.forEach(([cls, inner], i) => {
    const n = String(i + 1).padStart(2, '0');
    const html = path.join(htmlDir, `${n}.html`);
    fs.writeFileSync(html, `${head}<body class="${cls}">${inner}</body></html>`, 'utf8');
    const png = path.join(outDir, `${n}.png`);
    execFileSync(browser, [...(process.platform === 'linux' ? ['--no-sandbox'] : []), '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1080,1350', '--virtual-time-budget=6000', `--screenshot=${png}`, require('url').pathToFileURL(html).href], { stdio: 'ignore', timeout: 90000 });
    console.log('✔', png);
  });

  const caption = `${card.caption || ''}\n\n${(card.hashtags || []).map((h) => (h.startsWith('#') ? h : '#' + h)).join(' ')}\n\n※ 투자 권유 아님. 투자 판단의 책임은 본인에게 있습니다.\n\n[출처]\n${(card.sources || []).map((s) => `- ${s.name || ''} ${s.url || s}`).join('\n')}\n`;
  fs.writeFileSync(path.join(outDir, 'caption.txt'), caption, 'utf8');
  console.log('✔ caption.txt');
})();
