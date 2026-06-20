const CACHE_NAME = 'agrogestao-v2';

// Caching apenas arquivos locais para evitar erro de CORS
const ASSETS_TO_CACHE = [
    './index.html',
    './manifest.json'
];

// Instala o Service Worker e guarda os arquivos locais em Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Limpa caches antigos quando atualiza a versão (v1 para v2)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Intercepta as requisições para rodar offline
self.addEventListener('fetch', (event) => {
    // Não intercepta chamadas de API do Firebase
    if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retorna do cache se existir. Se não, busca na rede.
            return response || fetch(event.request).catch(() => {
                console.log("Falha de rede ao buscar: ", event.request.url);
            });
        })
    );
});