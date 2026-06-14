const CACHE = 'ytfree-v1';
const ASSETS = [
  '/free_yt_premium/',
  '/free_yt_premium/index.html',
  '/free_yt_premium/css/base.css',
  '/free_yt_premium/css/header.css',
  '/free_yt_premium/css/sidebar.css',
  '/free_yt_premium/css/feed.css',
  '/free_yt_premium/css/player.css',
  '/free_yt_premium/css/modal.css',
  '/free_yt_premium/js/storage.js',
  '/free_yt_premium/js/urlparser.js',
  '/free_yt_premium/js/api.js',
  '/free_yt_premium/js/auth.js',
  '/free_yt_premium/js/player.js',
  '/free_yt_premium/js/feed.js',
  '/free_yt_premium/js/search.js',
  '/free_yt_premium/js/watchlater.js',
  '/free_yt_premium/js/channel.js',
  '/free_yt_premium/js/playlist.js',
  '/free_yt_premium/js/account.js',
  '/free_yt_premium/js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
