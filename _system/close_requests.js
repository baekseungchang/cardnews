// 분석이 끝난 요청 이슈에 완료 댓글을 달고 닫는다 (GitHub Actions에서 GITHUB_TOKEN으로 실행)
const fs = require('fs');
const path = require('path');

const REPO = process.env.GITHUB_REPOSITORY || 'baekseungchang/cardnews';
const TOKEN = process.env.GITHUB_TOKEN;
const APP = 'https://baekseungchang.github.io/cardnews/';
const idx = path.join(__dirname, '..', 'analysis', 'index.json');

(async () => {
  if (!TOKEN || !fs.existsSync(idx)) return;
  const api = (p, opt = {}) => fetch(`https://api.github.com/repos/${REPO}${p}`, { signal: AbortSignal.timeout(20000),
    ...opt, headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
  });
  const { items } = JSON.parse(fs.readFileSync(idx, 'utf8'));
  for (const it of items.filter((i) => i.issue)) {
    const r = await api(`/issues/${it.issue}`);
    if (!r.ok) continue;
    const issue = await r.json();
    if (issue.state !== 'open') continue;
    const link = `${APP}#/an/${encodeURIComponent(it.file.replace(/\.json$/, ''))}`;
    const body = it.notFound
      ? `종목을 찾지 못했어요. 앱의 분석 탭에서 이유를 확인하고, 티커(예: TSLA, 005930)로 다시 요청해 주세요.\n${link}`
      : `분석이 끝났어요: ${it.name} (${it.symbol}) · 종합 ${it.score}점 ${it.stanceText}\n앱에서 보기: ${link}`;
    await api(`/issues/${it.issue}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
    await api(`/issues/${it.issue}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
    console.log(`이슈 #${it.issue} 완료 처리`);
  }
})().catch((e) => console.warn('이슈 정리 실패:', e.message));
