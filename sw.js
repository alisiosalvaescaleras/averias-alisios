/* Service Worker — Averías Alisios */
const CACHE = 'alisios-v3';
const ASSETS = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './data/catalogo.json',
  './data/meta.json',
  './data/t0.json',
  './data/t1.json',
  './data/t2.json',
  './data/t3.json',
  './data/t4.json',
  './data/t5.json',
  './data/t6.json',
  './data/t7.json',
  './data/t8.json',
  './data/t9.json',
  './data/t10.json',
  './data/t11.json',
  './data/t12.json',
  './data/t13.json',
  './data/t14.json',
  './data/t15.json',
  './data/t16.json',
  './data/t17.json',
  './data/t18.json',
  './data/t19.json',
  './data/t20.json',
  './data/t21.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Cachear en lotes para no saturar
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
  // Solo cachear peticiones GET al mismo origen
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
        // Si es la raíz y no hay red, devolver el index cacheado
        if (e.request.mode === 'navigate') return caches.match('./');
        return new Response('', { status: 503 });
      });
    })
  );
});

// Mensaje para forzar actualización desde la app
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
