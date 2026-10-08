const CACHE='parkia-v16-ux-ui';
const ASSETS=[
  '/parqueos','/login','/sistema',
  '/css/base.css','/css/public.css','/css/app.css','/css/v15.css','/css/v16.css',
  '/js/api.js','/js/auth.js','/js/app.js',
  '/assets/logo/parkia-logo.svg'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||e.request.url.includes('/api/'))return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
