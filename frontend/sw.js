const CACHE='parkia-v18-mapa-interactivo-plazas';
const ASSETS=[
  '/parqueos','/login','/sistema',
  '/css/base.css','/css/public.css','/css/app.css','/css/v15.css',
  '/js/api.js','/js/auth.js','/js/app.js','/js/pages/parqueos.js','/js/pages/ocupacion.js',
  '/assets/logo/parkia-logo.svg',
  '/assets/maps/emi_mapa_general_validado.png',
  '/assets/maps/emi_mapa_interactivo_v18.png',
  '/assets/maps/emi_autoridades_frente_izquierdo.png',
  '/assets/maps/emi_administrativo_frente_derecho.png',
  '/assets/maps/emi_estudiantes_sector_trasero.png'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.url.includes('/api/'))return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));});
