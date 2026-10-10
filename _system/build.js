// GitHub Actions에서 실행: node _system/build.js
// content/<날짜>/<세트>/card.json 중 새로 생겼거나 바뀐 것만 렌더링 → cards/<날짜>/<세트>/NN.jpg + caption.txt
// 그다음 data.json(앱 목록)을 갱신하고, 보관 기간이 지난 날짜는 지운다.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const CARDS = path.join(ROOT, 'cards');
const KEEP_DAYS = 30; // 평일 기준 약 6주
const strip = (s) => String(s || '').replace(/\*\*/g, '').replace(/\n/g, ' ');
const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

fs.mkdirSync(CONTENT, { recursive: true });
fs.mkdirSync(CARDS, { recursive: true });
const all = fs.readdirSync(CONTENT).filter(isDate).sort().reverse();
const keep = all.slice(0, KEEP_DAYS);
for (const d of all.slice(KEEP_DAYS)) fs.rmSync(path.join(CONTENT, d), { recursive: true, force: true });
for (const d of fs.readdirSync(CARDS)) if (!keep.includes(d)) fs.rmSync(path.join(CARDS, d), { recursive: true, force: true });

let rendered = 0;
const failed = [];
const days = keep.map((date) => {
  const sets = fs.readdirSync(path.join(CONTENT, date), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(CONTENT, date, e.name, 'card.json')))
    .map((e) => e.name).sort()
    .map((dir) => {
      const jsonPath = path.join(CONTENT, date, dir, 'card.json');
      const raw = fs.readFileSync(jsonPath);
      // 줄바꿈(CRLF/LF) 차이로 다시 렌더링되지 않도록 정규화해서 비교
      const hash = crypto.createHash('sha1').update(raw.toString('utf8').replace(/\r\n/g, '\n')).digest('hex');
      const out = path.join(CARDS, date, dir);
      const marker = path.join(out, '.built');
      let card;
      try { card = JSON.parse(raw.toString('utf8')); } catch (e) { failed.push(`${date}/${dir}: card.json 형식 오류`); return null; }

      if (!fs.existsSync(marker) || fs.readFileSync(marker, 'utf8') !== hash) {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'card-'));
        try {
          execFileSync('node', [path.join(__dirname, 'render.js'), jsonPath, tmp], { stdio: 'inherit', timeout: 600000, env: { ...process.env, CARD_DATE: date } });
          const pngs = fs.readdirSync(tmp).filter((f) => /^\d+\.png$/.test(f)).sort();
          if (!pngs.length) throw new Error('이미지가 만들어지지 않음');
          fs.rmSync(out, { recursive: true, force: true });
          fs.mkdirSync(out, { recursive: true });
          const jobs = pngs.map((f) => [path.join(tmp, f), path.join(out, f.replace('.png', '.jpg'))]);
          const list = path.join(tmp, 'jobs.json');
          fs.writeFileSync(list, JSON.stringify(jobs), 'utf8');
          execFileSync('python3', ['-c',
            "import json,sys\nfrom PIL import Image\nfor a,b in json.load(open(sys.argv[1],encoding='utf-8')):\n  Image.open(a).convert('RGB').save(b,'JPEG',quality=92,optimize=True,progressive=True)",
            list], { stdio: 'inherit' });
          fs.copyFileSync(path.join(tmp, 'caption.txt'), path.join(out, 'caption.txt'));
          fs.writeFileSync(marker, hash, 'utf8');
          rendered++;
        } catch (e) {
          failed.push(`${date}/${dir}: ${e.message}`);
        } finally {
          fs.rmSync(tmp, { recursive: true, force: true });
        }
      }

      if (!fs.existsSync(out)) return null;
      // 카드 내용이 바뀌면 주소(?v=)도 바뀌어서 휴대폰에 저장된 옛 이미지가 쓰이지 않게 함
      const ver = fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8').slice(0, 8) : '0';
      const images = fs.readdirSync(out).filter((f) => /^\d+\.jpg$/.test(f)).sort().map((f) => `cards/${date}/${dir}/${f}?v=${ver}`);
      if (!images.length) return null;
      const cap = path.join(out, 'caption.txt');
      const notesPath = path.join(CONTENT, date, dir, 'research.md');
      return {
        notes: fs.existsSync(notesPath) ? fs.readFileSync(notesPath, 'utf8').trim().slice(0, 12000) : '',
        dir, id: dir.replace(/^\d+_/, ''), tag: card.tag, ticker: card.ticker, company: card.company,
        direction: card.direction || 'neutral', headline: strip(card.headline),
        caption: fs.existsSync(cap) ? fs.readFileSync(cap, 'utf8').trim() : '', images,
      };
    })
    .filter(Boolean);
  return { date, sets };
}).filter((d) => d.sets.length);

// 표시용 시각은 한국 시간
const kst = new Date(Date.now() + 9 * 3600 * 1000), pad = (n) => String(n).padStart(2, '0');
const updated = `${kst.getUTCMonth() + 1}/${kst.getUTCDate()} ${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`;
fs.writeFileSync(path.join(ROOT, 'data.json'), JSON.stringify({ updated, days }), 'utf8');
console.log(`렌더링 ${rendered}세트, 앱 목록 ${days.length}일 / ${days.reduce((a, d) => a + d.sets.length, 0)}세트`);
if (failed.length) { console.error('실패:\n' + failed.join('\n')); process.exitCode = 1; }

// ---------- 종목 분석: 실제 시세로 가격 보정 + 목록 (analysis/index.json) ----------
// 클라우드 분석 환경에서는 시세 서버가 막힐 수 있어서, 여기(GitHub)에서 가격·변화율·차트를 한 번 실제 시세로 채운다.
const AN = path.join(ROOT, 'analysis');
const r1 = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
async function verifyPrice(a) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(a.symbol)}?range=1y&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`시세 ${res.status}`);
  const q = (await res.json()).chart.result[0], Q = q.indicators.quote[0];
  const rows = q.timestamp.map((t, i) => ({ d: new Date((t + (q.meta.gmtoffset || 0)) * 1000).toISOString().slice(0, 10), c: Q.close[i], h: Q.high[i], l: Q.low[i] })).filter((x) => x.c != null);
  const last = rows.at(-1), ago = (days) => { const t = new Date(last.d); t.setDate(t.getDate() - days); const k = t.toISOString().slice(0, 10); return rows.filter((x) => x.d <= k).at(-1) || rows[0]; };
  const ye = rows.filter((x) => x.d < `${last.d.slice(0, 4)}-01-01`).at(-1);
  const pct = (b) => (b ? r1((last.c / b.c - 1) * 100, 1) : null);
  const before = a.price?.last;
  const listedRecently = (new Date(last.d) - new Date(rows[0].d)) / 86400000 < 350;
  a.price = {
    ...(a.price || {}), last: r1(last.c), asOf: `${Number(last.d.slice(5, 7))}/${Number(last.d.slice(8))} 종가`,
    // 상장한 지 1년이 안 된 종목은 1년 변화 대신 '상장 이후' 변화로 따로 표시
    chg1m: pct(ago(30)), chg3m: pct(ago(91)), chgYtd: pct(ye),
    chg1y: listedRecently ? null : pct(rows[0]), sinceListing: listedRecently ? pct(rows[0]) : null, listed: listedRecently ? rows[0].d : null,
    high52: r1(Math.max(...rows.map((x) => x.h ?? x.c))), low52: r1(Math.min(...rows.map((x) => x.l ?? x.c))), verified: true,
  };
  a.chart = rows.filter((_, i) => i % 5 === 0 || i === rows.length - 1).map((x) => r1(x.c));
  a.currency = a.currency || q.meta.currency;
  a.evidence = [...(a.evidence || []), { claim: '현재가·변화율·52주 범위·차트', source: '-', data: `빌드 시점 실제 시세로 자동 보정 (${last.d} 종가)${before && Math.abs(before / last.c - 1) > 0.03 ? `, 보고서 작성 때 값 ${before}과 차이 있음` : ''}`, verdict: '확인 (자동)' }];
}

const analysisDone = (async () => {
if (fs.existsSync(AN)) {
  const list = [];
  for (const f of fs.readdirSync(AN)) {
    if (!f.endsWith('.json') || f === 'index.json') continue;
    try {
      const a = JSON.parse(fs.readFileSync(path.join(AN, f), 'utf8'));
      if (!a.notFound && a.symbol && !a.price?.verified) {
        try { await verifyPrice(a); fs.writeFileSync(path.join(AN, f), JSON.stringify(a, null, 2) + '\n', 'utf8'); console.log(`가격 보정: ${a.symbol}`); }
        catch (e) { console.warn(`가격 보정 실패(${a.symbol}): ${e.message}`); }
      }
      list.push({
        file: f, symbol: a.symbol, name: a.name || a.query, query: a.query, issue: a.issue ?? null,
        updated: a.updated, notFound: !!a.notFound,
        score: a.assessment?.score ?? null, stance: a.assessment?.stance ?? null, stanceText: a.assessment?.stanceText ?? null,
        last: a.price?.last ?? null, currency: a.currency ?? null,
      });
    } catch (e) { console.error(`분석 파일 오류: ${f} ${e.message}`); }
  }
  list.sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  fs.writeFileSync(path.join(AN, 'index.json'), JSON.stringify({ items: list }), 'utf8');
  console.log(`분석 목록 ${list.length}개`);
}
})();

// ---------- 학습 루프: 환율 전망 채점 (knowledge/fx-track.json) + 사실 메모 정리 ----------
// 전망을 낼 때마다 기록해 두고, 1주가 지나면 실제 시세로 '범위 적중'과 '방향 적중'을 채점한다.
const KN = path.join(ROOT, 'knowledge');
const FX_SYM = { USDKRW: ['KRW=X', 1], JPYKRW: ['JPYKRW=X', 100], EURKRW: ['EURKRW=X', 1] };
const dayKey = (d) => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 한국 날짜
async function closes(sym, mult) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=3mo&interval=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`시세 ${r.status}`);
  const q = (await r.json()).chart.result[0];
  return q.timestamp.map((t, i) => [dayKey(new Date(t * 1000)), q.indicators.quote[0].close[i]]).filter((x) => x[1] != null).map(([d, c]) => [d, c * mult]);
}
(async () => {
  await analysisDone; // 분석 가격 보정이 끝난 뒤에 이력을 기록
  fs.mkdirSync(KN, { recursive: true });
  // 사실 메모: 최근 30일은 log.jsonl, 그 이전은 지우지 않고 knowledge/archive/YYYY-MM.jsonl 로 옮겨 영구 보관
  const logPath = path.join(KN, 'log.jsonl');
  if (fs.existsSync(logPath)) {
    const cut = dayKey(new Date(Date.now() - 30 * 86400000));
    const keep = [], seen = new Set();
    for (const l of fs.readFileSync(logPath, 'utf8').split('\n')) {
      if (!l.trim() || seen.has(l)) continue;
      seen.add(l);
      let o; try { o = JSON.parse(l); } catch { continue; }
      if (o.date >= cut) { keep.push(l); continue; }
      const arch = path.join(KN, 'archive', `${String(o.date).slice(0, 7)}.jsonl`);
      fs.mkdirSync(path.dirname(arch), { recursive: true });
      fs.appendFileSync(arch, l + '\n', 'utf8');
    }
    fs.writeFileSync(logPath, keep.join('\n') + (keep.length ? '\n' : ''), 'utf8');
  }

  // 종목 분석 이력 + 성적표: 새 분석이 나올 때마다 요약을 영구 보관하고, 30일 뒤 실제 주가로 채점
  const ahPath = path.join(KN, 'analysis-history.jsonl');
  const ah = fs.existsSync(ahPath) ? fs.readFileSync(ahPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
  if (fs.existsSync(AN)) {
    for (const f of fs.readdirSync(AN)) {
      if (!f.endsWith('.json') || f === 'index.json') continue;
      try {
        const a = JSON.parse(fs.readFileSync(path.join(AN, f), 'utf8'));
        if (a.notFound || !a.assessment || !a.price?.verified) continue;
        if (ah.some((h) => h.symbol === a.symbol && h.updated === a.updated)) continue;
        ah.push({ symbol: a.symbol, name: a.name, updated: a.updated, score: a.assessment.score, stance: a.assessment.stance, thesis: a.assessment.thesis, price: a.price.last, priceDate: a.price.asOf, due: dayKey(new Date(new Date(a.updated).getTime() + 30 * 86400000)), result: null });
      } catch {}
    }
  }
  const todayA = dayKey(new Date());
  for (const h of ah.filter((x) => !x.result && x.due < todayA)) {
    try {
      const bench = /\.(KS|KQ)$/.test(h.symbol) ? '^KS11' : '^GSPC';
      const [s, b] = await Promise.all([closes(h.symbol, 1), closes(bench, 1)]);
      const at = (rows, d) => rows.filter((r) => r[0] <= d).at(-1);
      const made = dayKey(new Date(h.updated));
      const s0 = at(s, made), s1 = at(s, h.due), b0 = at(b, made), b1 = at(b, h.due);
      if (!s0 || !s1 || !b0 || !b1) continue;
      const ret = (s1[1] / s0[1] - 1) * 100, bret = (b1[1] / b0[1] - 1) * 100, rel = ret - bret;
      // 긍정 → 시장보다 좋았으면 적중, 부정 → 시장보다 나빴으면 적중, 중립 → 시장 대비 ±5% 안이면 적중
      const hit = h.stance === 'positive' ? rel > 0 : h.stance === 'negative' ? rel < 0 : Math.abs(rel) <= 5;
      h.result = { ret: r1(ret, 1), bench: bench === '^GSPC' ? 'S&P500' : '코스피', benchRet: r1(bret, 1), rel: r1(rel, 1), hit, date: s1[0] };
    } catch (err) { console.warn('분석 채점 실패:', h.symbol, err.message); }
  }
  fs.writeFileSync(ahPath, ah.map((h) => JSON.stringify(h)).join('\n') + (ah.length ? '\n' : ''), 'utf8');
  const graded = ah.filter((h) => h.result);
  fs.writeFileSync(path.join(KN, 'analysis-track.json'), JSON.stringify({
    stats: { n: graded.length, hit: graded.filter((h) => h.result.hit).length, pending: ah.length - graded.length, nextDue: ah.filter((h) => !h.result).map((h) => h.due).sort()[0] || null },
    recent: graded.slice(-10).reverse(),
  }), 'utf8');
  const olPath = path.join(ROOT, 'outlook', 'fx.json');
  const trPath = path.join(KN, 'fx-track.json');
  let tr = { entries: [], stats: {} };
  try { tr = JSON.parse(fs.readFileSync(trPath, 'utf8')); } catch {}
  try {
    const ol = JSON.parse(fs.readFileSync(olPath, 'utf8'));
    if (ol.updated && !tr.entries.some((e) => e.made === ol.updated)) {
      const due = dayKey(new Date(new Date(ol.updated).getTime() + 7 * 86400000));
      for (const p of ol.pairs || []) if (FX_SYM[p.code]) tr.entries.push({ made: ol.updated, code: p.code, view: p.view, range: p.range, due, result: null });
    }
  } catch {}
  const today = dayKey(new Date());
  const cache = {};
  for (const e of tr.entries.filter((x) => !x.result && x.due < today)) {
    try {
      const [sym, mult] = FX_SYM[e.code];
      cache[sym] = cache[sym] || await closes(sym, mult);
      const rows = cache[sym], madeDay = dayKey(new Date(e.made));
      const base = rows.filter((r) => r[0] <= madeDay).at(-1), end = rows.filter((r) => r[0] <= e.due).at(-1);
      if (!base || !end) continue;
      const chg = ((end[1] - base[1]) / base[1]) * 100;
      const actualDir = chg > 0.3 ? 'up' : chg < -0.3 ? 'down' : 'neutral';
      e.result = { base: r1(base[1]), actual: r1(end[1]), date: end[0], chg: r1(chg), inRange: end[1] >= e.range[0] && end[1] <= e.range[1], dirHit: e.view === actualDir, actualDir };
    } catch (err) { console.warn('전망 채점 실패:', err.message); }
  }
  const cut90 = dayKey(new Date(Date.now() - 90 * 86400000));
  tr.entries = tr.entries.filter((e) => dayKey(new Date(e.made)) >= cut90);
  const done = tr.entries.filter((e) => e.result);
  const by = (list) => ({ n: list.length, range: list.filter((e) => e.result.inRange).length, dir: list.filter((e) => e.result.dirHit).length });
  tr.stats = { all: by(done), byCode: Object.fromEntries(Object.keys(FX_SYM).map((c) => [c, by(done.filter((e) => e.code === c))])), nextDue: tr.entries.filter((e) => !e.result).map((e) => e.due).sort()[0] || null, updated: new Date().toISOString() };
  tr.recentMisses = done.filter((e) => !e.result.inRange || !e.result.dirHit).slice(-6).map((e) => ({ made: e.made, code: e.code, view: e.view, range: e.range, ...e.result }));
  fs.writeFileSync(trPath, JSON.stringify(tr, null, 1), 'utf8');
  console.log(`전망 채점: 완료 ${done.length}건, 대기 ${tr.entries.length - done.length}건`);
})();
