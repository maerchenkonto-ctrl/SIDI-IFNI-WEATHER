const C="sidi-ifni-v42";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","manifest.json","icons/icon-192.png","icons/icon-512.png"])).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const sig=r=>r.headers.get("etag")||r.headers.get("last-modified")||r.headers.get("content-length")||"";
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 if(e.request.mode==="navigate"){
  // فتح التطبيق: الصفحة من الكاش فوراً، والتحديث يتحمّل فالخلفية
  e.respondWith((async()=>{
   const cached=await caches.match(e.request,{ignoreSearch:true})||await caches.match("index.html");
   const net=fetch(e.request).then(async r=>{
    if(r&&r.ok){
     const c=await caches.open(C);await c.put(e.request,r.clone());
     if(cached&&sig(cached)&&sig(cached)!==sig(r)){const cl=await self.clients.matchAll();cl.forEach(x=>x.postMessage("sidi-updated"))}
    }
    return r}).catch(()=>null);
   if(cached){e.waitUntil(net);return cached}
   return (await net)||new Response("offline",{status:503});
  })());
  return;
 }
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
