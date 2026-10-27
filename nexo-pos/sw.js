/* NEXO POS offline cache. Change VERSION to push an update. */
const VERSION='nexo-2026-10-27-1';
const FILES=["./", "index.html", "manifest.webmanifest", "fonts/fonts.css", "vendor/jspdf.umd.min.js", "vendor/xlsx.full.min.js", "vendor/zxing.min.js", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2", "fonts/barlow-latin-700-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2", "fonts/inter-latin-400-normal.woff2", "fonts/inter-latin-500-normal.woff2", "fonts/inter-latin-600-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-180.png", "icons/favicon.svg"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})))});
