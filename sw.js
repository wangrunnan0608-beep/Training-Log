const CACHE='training-log-shell-v4-20261103-v4.3.3';
const ASSETS=['./','./index.html','./app.js?v=4.3.3','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('training-log-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;if(r.mode==='navigate'){event.respondWith(caches.open(CACHE).then(c=>c.match('./index.html')).then(c=>c||fetch(r)));return}event.respondWith(caches.match(r).then(c=>c||fetch(r)))});
