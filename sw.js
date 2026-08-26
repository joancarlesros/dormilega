/* Dormilega — service worker
   Estratègia:
   - App shell (HTML i manifest): NETWORK-FIRST → sempre la versió nova quan hi ha
     connexió, amb la còpia en memòria cau com a suport offline. Així ja NO cal
     apujar el número de versió cada cop que es canvia index.html: el canvi es veu
     de seguida en obrir l'app.
   - Llibreries CDN (URL versionades) i icones: CACHE-FIRST → ràpid i estable.
   - Dades de Supabase: mai es desen a la memòria cau. */
const CACHE = 'dormilega-v37';
const SHELL = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.3/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* És l'esquelet de l'app (document HTML o manifest)? → network-first */
function isShell(req, url) {
  return req.mode === 'navigate'
      || url.pathname === '/'
      || url.pathname.endsWith('/index.html')
      || url.pathname.endsWith('/manifest.webmanifest');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.hostname.endsWith('.supabase.co')) return;   // dades: mai a la memòria cau
  if (req.method !== 'GET') return;

  // App shell → network-first: agafa la versió nova si hi ha xarxa; si no, la cau
  if (isShell(req, url)) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // Resta (CDN versionat, icones) → cache-first amb actualització en segon pla
  e.respondWith(
    caches.match(req).then(hit => {
      const fetched = fetch(req).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => hit);
      return hit || fetched;
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow('./index.html');
  }));
});
