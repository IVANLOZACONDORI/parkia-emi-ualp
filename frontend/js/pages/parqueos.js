
import {api} from '../api.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ZONE_META={
  'Z-EST-TRASERA':{tag:'Estudiantes',ubicacion:'Parte trasera',descripcion:'Parqueo real de estudiantes ubicado en la parte trasera del campus. En este mapeo se representan las plazas sobre la imagen del predio.',map:'/assets/maps/emi_estudiantes_sector_trasero.png',color:'students'},
  'Z-AUTORIDADES':{tag:'Autoridades',ubicacion:'Frente institucional',descripcion:'Parqueo de autoridades en el sector frontal del campus, mostrado con plazas delimitadas sobre la imagen.',map:'/assets/maps/emi_autoridades_frente_izquierdo.png',color:'authorities'},
  'Z-ADMIN':{tag:'Administrativo',ubicacion:'Frente derecho',descripcion:'Parqueo de personal administrativo en el frente derecho, con plazas visibles y estado operativo.',map:'/assets/maps/emi_administrativo_frente_derecho.png',color:'admin'}
};
const statusClass = s => ({LIBRE:'libre',OCUPADA:'ocupada',FUERA_SERVICIO:'fuera-servicio',SIN_DATOS:'sin-datos'}[s]||'sin-datos');
const statusLabel = s => ({LIBRE:'Disponible',OCUPADA:'Ocupada',FUERA_SERVICIO:'Fuera de servicio',SIN_DATOS:'Sin datos'}[s]||s||'Sin datos');
const imageLayout = {
  EM01:[0.25,0.20], EM02:[0.36,0.23], EM03:[0.48,0.26], EM04:[0.30,0.34], EM05:[0.42,0.37], EM06:[0.54,0.40],
  EM07:[0.25,0.45], EM08:[0.36,0.48], EM09:[0.48,0.51], EM10:[0.30,0.58], EM11:[0.42,0.61], EM12:[0.54,0.64],
  EM13:[0.24,0.66], EM14:[0.35,0.69], EM15:[0.47,0.72], EM16:[0.28,0.78], EM17:[0.40,0.81], EM18:[0.52,0.84],
  EM19:[0.22,0.29], EM20:[0.34,0.55], EM21:[0.46,0.31], EM22:[0.27,0.72], EM23:[0.39,0.43], EM24:[0.51,0.54],
  AU01:[0.77,0.25], AU02:[0.79,0.34], AU03:[0.81,0.43], AU04:[0.83,0.52], AU05:[0.75,0.61], AU06:[0.77,0.70], AU07:[0.79,0.79], AU08:[0.81,0.88],
  AD01:[0.68,0.67], AD02:[0.70,0.76], AD03:[0.72,0.85], AD04:[0.74,0.66], AD05:[0.76,0.75], AD06:[0.78,0.84], AD07:[0.80,0.65], AD08:[0.82,0.74], AD09:[0.84,0.83]
};
const zoneAnchors = {
  'Z-EST-TRASERA':{x:'16%',y:'8%',label:'P. Est. · Trasero'},
  'Z-AUTORIDADES':{x:'73%',y:'8%',label:'P. Aut. · Frente'},
  'Z-ADMIN':{x:'69%',y:'91%',label:'P. Adm. · Frente derecho'}
};
function zonaResumen(z,plazas,disps){
  const meta=ZONE_META[z.codigo]||{};
  const cams=disps.filter(d=>d.zona_id===z.id && d.tipo_dispositivo==='CAMARA_OCUPACION');
  const items=plazas.filter(p=>p.zona_id===z.id);
  return `<article class="zone-real-card ${meta.color||''}"><div class="zone-real-head"><span class="zone-chip">${esc(meta.tag||z.nombre)}</span><h3>${esc(z.nombre)}</h3><p>${esc(meta.descripcion||z.descripcion||'')}</p></div><div class="zone-real-kpis"><div><b>${items.length}</b><span>plazas</span></div><div><b>${items.filter(p=>p.estado_actual==='LIBRE').length}</b><span>disponibles</span></div><div><b>${cams.length}</b><span>cámaras IA</span></div></div><ul class="zone-real-list"><li><strong>Ubicación real:</strong> ${esc(meta.ubicacion||z.referencia_ubicacion||'')}</li><li><strong>Verificación:</strong> cámara de visión artificial y control de estado por plaza</li><li><strong>Estados:</strong> disponible, ocupada, fuera de servicio o sin datos</li></ul></article>`;
}
function renderInteractiveMap(zonas,plazas){
  const zoneById=Object.fromEntries(zonas.map(z=>[z.id,z]));
  const slots = plazas.filter(p=>imageLayout[p.codigo]).map(p=>{
    const [x,y]=imageLayout[p.codigo];
    const z=zoneById[p.zona_id]||{};
    const cls=statusClass(p.estado_actual);
    return `<button type="button" class="map-slot ${cls}" style="left:${(x*100).toFixed(2)}%;top:${(y*100).toFixed(2)}%" title="${esc(p.codigo)} · ${esc(statusLabel(p.estado_actual))} · ${esc(z.nombre||'')}"><span class="slot-code">${esc(p.codigo)}</span><span class="slot-state">${esc(statusLabel(p.estado_actual))}</span></button>`;
  }).join('');
  const labels = zonas.map(z=>{
    const a=zoneAnchors[z.codigo]; if(!a) return '';
    return `<div class="map-zone-label ${ZONE_META[z.codigo]?.color||''}" style="left:${a.x};top:${a.y}">${esc(a.label)}</div>`;
  }).join('');
  return `<section class="card panel interactive-campus-panel"><div class="interactive-campus-head"><div><h3>Mapa visual con plazas sobre la imagen real</h3><p>Las plazas se muestran directamente sobre la imagen referencial del campus. Cada bloque cuadrado indica el estado actual de la plaza en tiempo real.</p></div><div class="campus-legend"><span class="lg status libre">Disponible</span><span class="lg status ocupada">Ocupada</span><span class="lg status fuera-servicio">Fuera de servicio</span><span class="lg status sin-datos">Sin datos</span></div></div><div class="interactive-campus-wrap"><div class="interactive-campus-canvas"><img class="campus-map-image overlay-base" src="/assets/maps/emi_mapa_interactivo_v18.png" alt="Mapa interactivo del campus EMI UALP">${labels}${slots}</div></div></section>`;
}
export async function renderParqueos(c){
  const [zonas,plazas,dispositivos]=await Promise.all([api('/parqueos/zonas'),api('/parqueos/plazas'),api('/parqueos/dispositivos')]);
  const camOcup=dispositivos.filter(x=>x.tipo_dispositivo==='CAMARA_OCUPACION').length;
  const camLpr=dispositivos.filter(x=>x.tipo_dispositivo==='CAMARA_ACCESO_LPR').length;
  c.innerHTML=`<div class="page-head"><div><h1>Mapeo real de zonas, plazas y cámaras</h1><p>Vista institucional mejorada del predio: las plazas ahora se observan directamente sobre la imagen del campus con su estado operativo y vínculo con visión artificial.</p></div></div>
  ${renderInteractiveMap(zonas,plazas)}
  <div class="kpis"><div class="card kpi"><div class="label">Zonas reales</div><div class="value">${zonas.length}</div></div><div class="card kpi"><div class="label">Plazas registradas</div><div class="value">${plazas.length}</div></div><div class="card kpi"><div class="label">Disponibles</div><div class="value">${plazas.filter(p=>p.estado_actual==='LIBRE').length}</div></div><div class="card kpi"><div class="label">Cámaras IA de ocupación</div><div class="value">${camOcup}</div></div><div class="card kpi"><div class="label">Cámara LPR/OCR</div><div class="value">${camLpr}</div></div></div>
  <section class="zone-real-grid">${zonas.map(z=>zonaResumen(z,plazas,dispositivos)).join('')}</section>
  <div class="card panel"><h3>Dispositivos y vínculo con visión artificial</h3><div class="table-wrap"><table><thead><tr><th>Código</th><th>Tipo</th><th>Nombre</th><th>Zona</th><th>Ubicación lógica</th><th>Estado</th></tr></thead><tbody>${dispositivos.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.tipo_dispositivo)}</td><td>${esc(x.nombre)}</td><td>${esc(x.zona_nombre||'Acceso general')}</td><td>${esc(x.ubicacion_logica||x.punto_acceso||'—')}</td><td>${esc(x.estado)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
