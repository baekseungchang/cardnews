// 앱 '환율' 탭에 쓰는 시세 수집: node _system/fetch_live.js → live/fx.json
// 배포 워크플로가 30분마다 실행한다. 실패해도 배포는 계속되도록 항상 exit 0.
const fs = require('fs');
const path = require('path');

const ITEMS = [
  { code: 'USDKRW', name: '달러', unit: '원', symbol: 'KRW=X', mult: 1, digits: 1, label: '1달러' },
  { code: 'JPYKRW', name: '엔화', unit: '원', symbol: 'JPYKRW=X', mult: 100, digits: 2, label: '100엔' },
  { code: 'EURKRW', name: '유로', unit: '원', symbol: 'EURKRW=X', mult: 1, digits: 1, label: '1유로' },
  { code: 'USDJPY', name: '엔/달러', unit: '엔', symbol: 'JPY=X', mult: 1, digits: 2, label: '1달러' },
  { code: 'DXY', name: '달러인덱스', unit: '', symbol: 'DX-Y.NYB', mult: 1, digits: 2, label: '지수' },
];

const get = async (symbol, range, interval) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${symbol} ${r.status}`);
  return (await r.json()).chart.result[0];
};
const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
const pct = (a, b) => (b ? round(((a - b) / b) * 100, 2) : null);

(async () => {
  const out = { updated: new Date().toISOString(), items: [] };
  for (const it of ITEMS) {
    try {
      const day = await get(it.symbol, '3mo', '1d');
      const intra = await get(it.symbol, '1d', '5m');
      const m = it.mult;
      const closes = day.timestamp.map((t, i) => [t, day.indicators.quote[0].close[i]]).filter((p) => p[1] != null);
      const last = (intra.meta.regularMarketPrice ?? closes.at(-1)[1]) * m;
      // 전일 종가: 오늘 봉을 뺀 마지막 일봉
      const todayKey = new Date(intra.meta.regularMarketTime * 1000).toISOString().slice(0, 10);
      const prior = closes.filter((p) => new Date(p[0] * 1000).toISOString().slice(0, 10) < todayKey);
      const prev = (prior.at(-1)?.[1] ?? closes.at(-2)?.[1]) * m;
      const ago = (n) => (prior.length > n ? prior.at(-1 - n)[1] * m : null);
      // 하루가 막 바뀐 직후에는 오늘 5분봉이 비어 있을 수 있어 최근 일봉으로 대신한다
      const raw = (intra.timestamp || []).map((t, i) => intra.indicators?.quote?.[0]?.close?.[i]).filter((v) => v != null);
      const series = (raw.length >= 6 ? raw : closes.slice(-20).map((p) => p[1])).map((v) => round(v * m, it.digits));
      const step = Math.max(1, Math.ceil(series.length / 80));
      out.items.push({
        ...it,
        last: round(last, it.digits),
        prev: round(prev, it.digits),
        chg: round(last - prev, it.digits),
        chgPct: pct(last, prev),
        chg1w: pct(last, ago(4)),
        chg1m: pct(last, ago(20)),
        high1m: round(Math.max(...prior.slice(-21).map((p) => p[1])) * m, it.digits),
        low1m: round(Math.min(...prior.slice(-21).map((p) => p[1])) * m, it.digits),
        asOf: new Date(intra.meta.regularMarketTime * 1000).toISOString(),
        intraday: series.filter((_, i) => i % step === 0 || i === series.length - 1),
        daily: closes.slice(-66).map((p) => round(p[1] * m, it.digits)),
      });
    } catch (e) {
      console.warn('시세 실패:', it.symbol, e.message);
    }
  }
  if (!out.items.length) { console.warn('시세를 하나도 받지 못해 기존 파일을 유지합니다'); return; }
  const dir = path.join(__dirname, '..', 'live');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'fx.json'), JSON.stringify(out), 'utf8');
  console.log(`live/fx.json: ${out.items.length}개 통화`);
})().catch((e) => console.warn(e.message));
