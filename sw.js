// 앱 화면은 캐시해 두고(오프라인에서도 열림), 목록(data.json)은 항상 최신을 먼저 받아옴
const SHELL = 'shell-v12', IMG = 'cards-v2';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png']))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![SHELL, IMG].includes(k)).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/cards/')) {
    e.respondWith(caches.open(IMG).then(async (c) => (await c.match(e.request)) || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })));
    return;
  }
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(SHELL).then((c) => c.put(url.pathname.endsWith('data.json') ? 'data.json' : e.request, copy)); }
    return r;
  }).catch(() => caches.match(url.pathname.endsWith('data.json') ? 'data.json' : e.request).then((r) => r || caches.match('index.html'))));
});
