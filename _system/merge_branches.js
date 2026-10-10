// 아직 반영되지 않은 claude/* 브랜치 결과를 모두 main 작업본에 합친다 (오래된 브랜치부터).
// - 빌드가 중간에 취소돼도 다음 빌드가 남은 브랜치를 전부 처리하므로 결과가 사라지지 않는다.
// - 전망·뉴스·분석처럼 'updated' 시각이 있는 파일은 지금 것보다 새로울 때만 덮어쓴다.
// - 기록 파일(history.tsv, knowledge/log.jsonl)은 새 줄만 덧붙인다.
// - .github 은 절대 건드리지 않는다.
// 처리한 브랜치 이름은 .merged-branches 에 적는다(삭제는 main 에 반영한 뒤 워크플로가 한다).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const APPEND = new Set(['_system/history.tsv', 'knowledge/log.jsonl']);
const TIMED = /^(outlook\/fx\.json|news\/feed\.json|analysis\/[^/]+\.json)$/;
const ALLOWED = /^(content\/|outlook\/|analysis\/|news\/|knowledge\/log\.jsonl$|_system\/|index\.html$|sw\.js$|manifest\.webmanifest$|icons\/)/;

git('fetch', '-q', '--prune', 'origin', '+refs/heads/claude/*:refs/remotes/origin/claude/*');
const branches = git('for-each-ref', '--sort=committerdate', '--format=%(refname:short)', 'refs/remotes/origin/claude/').split('\n').filter(Boolean);
const done = [];
const updatedOf = (txt) => { try { return JSON.parse(txt).updated || ''; } catch { return ''; } };

for (const br of branches) {
  const base = git('rev-list', '--max-parents=0', br).trim().split('\n').pop();
  const files = git('diff', '--name-only', '--diff-filter=AM', base, br).split('\n').filter(Boolean);
  for (const f of files) {
    if (f.startsWith('.github/') || f === 'analysis/index.json' || !ALLOWED.test(f)) continue;
    const dest = path.join(ROOT, f);
    if (APPEND.has(f)) {
      const have = new Set(fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8').split('\n') : []);
      const added = git('diff', base, br, '--', f).split('\n').filter((l) => /^\+[^+]/.test(l)).map((l) => l.slice(1)).filter((l) => l.trim() && !have.has(l));
      if (added.length) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.appendFileSync(dest, added.join('\n') + '\n', 'utf8'); }
      console.log(`덧붙임 ${added.length}줄: ${f} (${br})`);
      continue;
    }
    // 이미지 같은 바이너리도 깨지지 않게 Buffer 로 받는다
    const incoming = execFileSync('git', ['show', `${br}:${f}`], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
    if (TIMED.test(f) && fs.existsSync(dest)) {
      const cur = updatedOf(fs.readFileSync(dest, 'utf8')), inc = updatedOf(incoming.toString('utf8'));
      if (cur && inc && inc <= cur) { console.log(`건너뜀(더 오래됨): ${f} (${br})`); continue; }
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, incoming);
    console.log(`가져옴: ${f} (${br})`);
  }
  done.push(br.replace(/^origin\//, ''));
}
fs.writeFileSync(path.join(ROOT, '.merged-branches'), done.join('\n'), 'utf8');
console.log(`처리한 브랜치 ${done.length}개`);
