/* Service Conect+ — service worker
   Guarda o aplicativo inteiro no aparelho. Depois da primeira abertura com internet,
   ele abre e funciona dentro da refinaria mesmo sem sinal nenhum.
   Ao publicar uma versão nova, troque o número do CACHE abaixo. */
const CACHE = 'conect-v2';
const ARQUIVOS = [
  './',
  './index.html',
  './painel.html',
  './manifest.webmanifest',
  './painel.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      ARQUIVOS.map(u => c.add(u).catch(() => null))   // um arquivo ausente não derruba a instalação
    ))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Estratégia: responde do cache na hora (abre rápido e offline) e,
   em paralelo, busca a versão nova na rede para a próxima abertura. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    caches.match(req).then(hit => {
      const rede = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || rede;
    })
  );
});
