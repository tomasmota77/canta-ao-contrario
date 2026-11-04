/* Guarda o jogo no telemóvel para funcionar sem internet. Muda VERSION a cada publicação. */
const VERSION = "cac-v13";
const SHELL = [
  "./", "index.html", "privacy.html", "manifest.webmanifest",
  "js/i18n.js", "js/score.js", "js/app.js",
  "fonts/poppins.css", "fonts/poppins-400-latin.woff2", "fonts/poppins-400-latin-ext.woff2", "fonts/poppins-500-latin.woff2", "fonts/poppins-500-latin-ext.woff2", "fonts/poppins-600-latin.woff2", "fonts/poppins-600-latin-ext.woff2", "fonts/poppins-700-latin.woff2", "fonts/poppins-700-latin-ext.woff2",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-48.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (para receber atualizações), cache se não houver internet.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
  );
});
