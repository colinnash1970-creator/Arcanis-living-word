const CACHE='arcanus-world-v1110';
const FILES=['./world-screen.js','./world-screen.css','./Kaddinghall/index.html','./Kaddinghall/app.js?v=1100','./Calendar/world-bridge.js','./','./index.html','./app.js?v=1100','./manifest.webmanifest',
 './Calendar/index.html','./Calendar/style.css','./Calendar/town-calendar.css','./Calendar/canon.js','./Calendar/astronomy.js','./Calendar/engine.js','./Calendar/app.js','./Calendar/town-calendar.js',
 './Arcanus-Stage-5/index.html','./Arcanus-Stage-5/world-overview.css','./Arcanus-Stage-5/canon-data.js','./Arcanus-Stage-5/canon-engine.js','./Arcanus-Stage-5/canon-reference.js','./Arcanus-Stage-5/canon-explorer.js','./Arcanus-Stage-5/canon-panel.js','./Arcanus-Stage-5/Kaddinghall/index.html','./Arcanus-Stage-5/Kaddinghall/app.js?v=1100'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('arcanus-')&&key!==CACHE).map(key=>caches.delete(key))))])));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response;}).catch(async()=>{
  const cache=await caches.open(CACHE),hit=await cache.match(event.request);
  if(hit)return hit;
  const url=new URL(event.request.url);
  if(url.pathname.endsWith('/Calendar/index.html')){url.search='';const fallback=await cache.match(url.href);if(fallback)return fallback;}
  return new Response('This page is not available offline yet.',{status:503,headers:{'Content-Type':'text/plain'}});
 }));
});
