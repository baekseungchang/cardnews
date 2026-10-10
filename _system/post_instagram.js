// 인스타그램 캐러셀 게시: node _system/post_instagram.js "<날짜>/<세트폴더>"
// 앱에서 '인스타에 올리기'를 누르면 '[게시] 날짜/세트' 요청이 생기고, GitHub Actions가 이 스크립트를 실행한다.
// 필요한 GitHub Secrets: IG_USER_ID, IG_ACCESS_TOKEN (Instagram API with Instagram Login 의 장기 토큰)
// 결과는 콘솔과 result.json 으로 남긴다(워크플로가 요청에 댓글로 알려줌).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://baekseungchang.github.io/cardnews/';
const HOST = process.env.IG_API_HOST || 'https://graph.instagram.com/v23.0';
const USER = process.env.IG_USER_ID, TOKEN = process.env.IG_ACCESS_TOKEN;
const target = (process.argv[2] || '').trim();
const out = (o) => { fs.writeFileSync(path.join(ROOT, 'result.json'), JSON.stringify(o), 'utf8'); console.log(JSON.stringify(o)); };

async function call(method, p, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const url = method === 'GET' ? `${HOST}${p}?${body}` : `${HOST}${p}`;
  const r = await fetch(url, { method, body: method === 'GET' ? undefined : body, signal: AbortSignal.timeout(30000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error?.message || `HTTP ${r.status}`);
  return j;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (!USER || !TOKEN) return out({ ok: false, message: '인스타 연결 정보(IG_USER_ID, IG_ACCESS_TOKEN)가 아직 GitHub에 등록되지 않았어요.' });
  const [date, dir] = target.split('/');
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8'));
  const set = data.days.find((d) => d.date === date)?.sets.find((s) => s.dir === dir);
  if (!set) return out({ ok: false, message: `카드를 찾지 못했어요: ${target}` });

  const images = set.images.slice(0, 10).map((p) => SITE + p.split('?')[0]); // 캐러셀은 최대 10장
  const caption = (set.caption || '').slice(0, 2200);
  try {
    const children = [];
    for (const image_url of images) children.push((await call('POST', `/${USER}/media`, { image_url, is_carousel_item: 'true' })).id);
    const container = (await call('POST', `/${USER}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption })).id;
    for (let i = 0; i < 30; i++) { // 처리 완료까지 최대 약 2분 대기
      const st = (await call('GET', `/${container}`, { fields: 'status_code' })).status_code;
      if (st === 'FINISHED') break;
      if (st === 'ERROR' || st === 'EXPIRED') throw new Error(`인스타 처리 실패 (${st})`);
      await wait(4000);
    }
    const media = (await call('POST', `/${USER}/media_publish`, { creation_id: container })).id;
    let link = '';
    try { link = (await call('GET', `/${media}`, { fields: 'permalink' })).permalink || ''; } catch {}
    out({ ok: true, message: `인스타에 올렸어요 (${images.length}장)`, link });
  } catch (e) {
    out({ ok: false, message: `게시 실패: ${e.message}` });
  }
})();
