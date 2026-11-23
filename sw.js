/* Service Worker — Averías Alisios */
const CACHE = 'alisios-v4';
const ASSETS = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './catalogo.json',
  './meta.json',
  './t0.json',
  './t1.json',
  './t2.json',
  './t3.json',
  './t4.json',
  './t5.json',
  './t6.json',
  './t7.json',
  './t8.json',
  './t9.json',
  './t10.json',
  './t11.json',
  './t12.json',
  './t13.json',
  './t14.json',
  './t15.json',
  './t16.json',
  './t17.json',
  './t18.json',
  './t19.json',
  './t20.json',
  './t21.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      const chunks = [];
      for (let i = 0; i < ASSETS.length; i += 5) chunks.push(ASSETS.slice(i, i + 5));
      return chunks.reduce((p, chunk) =>
        p.then(() => Promise.all(chunk.map(url => c.add(url).catch(() => {})))), Promise.resolve());
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./');
        return new Response('', { status: 503 });
      });
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
