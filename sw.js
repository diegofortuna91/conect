/* Service Conect+ — service worker
   Guarda o aplicativo inteiro no aparelho: depois da primeira abertura com internet,
   ele funciona dentro da refinaria mesmo sem sinal nenhum.

   Estratégia:
   • páginas (index.html / painel.html) → REDE PRIMEIRO, com 5 s de paciência.
     Com sinal, o auditor sempre abre a versão mais nova; sem sinal, cai no cache.
   • ícones e manifests → cache primeiro, que não mudam.
   Ao publicar uma versão nova, troque o número do CACHE abaixo. */
const CACHE = 'conect-v4';
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

function ehPagina(req) {
  return req.mode === 'navigate'
      || (req.headers.get('accept') || '').includes('text/html');
}

function comPrazo(promessa, ms) {
  return new Promise(resolve => {
    let pronto = false;
    const t = setTimeout(() => { if (!pronto) resolve(null); }, ms);
    promessa.then(r => { pronto = true; clearTimeout(t); resolve(r); })
            .catch(() => { pronto = true; clearTimeout(t); resolve(null); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (ehPagina(req)) {
    e.respondWith((async () => {
      const daRede = await comPrazo(fetch(req, { cache: 'no-store' }), 5000);
      if (daRede && daRede.status === 200) {
        const copia = daRede.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return daRede;
      }
      return (await caches.match(req)) || (await caches.match('./index.html'));
    })());
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      const rede = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => hit);
      return hit || rede;
    })
  );
});
