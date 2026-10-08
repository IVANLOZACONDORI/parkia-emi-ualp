
import {api} from '../api.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ZONE_META={
  'Z-EST-TRASERA':{tag:'Estudiantes',ubicacion:'Parte trasera',descripcion:'Distribución real validada para estudiantes, correspondiente al sector trasero del campus.',map:'/assets/maps/emi_estudiantes_sector_trasero.png',color:'students'},
  'Z-AUTORIDADES':{tag:'Autoridades',ubicacion:'Frente izquierdo',descripcion:'Distribución real del parqueo destinado a autoridades en el frente izquierdo.',map:'/assets/maps/emi_autoridades_frente_izquierdo.png',color:'authorities'},
  'Z-ADMIN':{tag:'Administrativo',ubicacion:'Frente derecho',descripcion:'Distribución real del parqueo del personal administrativo en el frente derecho.',map:'/assets/maps/emi_administrativo_frente_derecho.png',color:'admin'}
};
function cardZona(z,plazas,disps){
  const meta=ZONE_META[z.codigo]||{};
  const cams=disps.filter(d=>d.zona_id===z.id && d.tipo_dispositivo==='CAMARA_OCUPACION');
  const tipos=[...new Set(plazas.filter(p=>p.zona_id===z.id).map(p=>p.tipo_plaza))].join(', ') || 'No definido';
  return `<article class="zone-real-card ${meta.color||''}"><div class="zone-real-head"><span class="zone-chip">${esc(meta.tag||z.nombre)}</span><h3>${esc(z.nombre)}</h3><p>${esc(meta.descripcion||z.descripcion||'')}</p></div><div class="zone-real-kpis"><div><b>${Number(z.total_plazas||0)}</b><span>plazas</span></div><div><b>${Number(z.plazas_libres||0)}</b><span>libres</span></div><div><b>${cams.length}</b><span>cámaras IA</span></div></div><ul class="zone-real-list"><li><strong>Ubicación real:</strong> ${esc(meta.ubicacion||z.referencia_ubicacion||'')}</li><li><strong>Tipos de plaza:</strong> ${esc(tipos)}</li><li><strong>Visión artificial:</strong> ${cams.map(c=>esc(c.codigo)).join(', ')||'Sin cámara asignada'}</li></ul>${meta.map?`<img class="zone-real-image" src="${meta.map}" alt="${esc(z.nombre)}">`:''}</article>`;
}
export async function renderParqueos(c){
 const [zonas,plazas,dispositivos]=await Promise.all([api('/parqueos/zonas'),api('/parqueos/plazas'),api('/parqueos/dispositivos')]);
 const camOcup=dispositivos.filter(x=>x.tipo_dispositivo==='CAMARA_OCUPACION').length;
 const camLpr=dispositivos.filter(x=>x.tipo_dispositivo==='CAMARA_ACCESO_LPR').length;
 c.innerHTML=`<div class="page-head"><div><h1>Mapeo real de zonas, plazas y cámaras</h1><p>Configuración física institucional basada en la distribución validada del campus: estudiantes en la parte trasera, autoridades al frente izquierdo y administrativos al frente derecho.</p></div></div>
 <section class="campus-real-map card panel"><div class="campus-map-copy"><h3>Mapa institucional validado</h3><p>El siguiente croquis aéreo se utiliza como referencia funcional para el mapeo del sistema. Cada zona está asociada a plazas registradas y a cámaras de visión artificial para verificación de ocupación.</p><div class="campus-legend"><span class="lg students">Estudiantes · Sector trasero</span><span class="lg authorities">Autoridades · Frente izquierdo</span><span class="lg admin">Administrativo · Frente derecho</span><span class="lg camera">Cámaras IA de ocupación</span></div></div><img class="campus-map-image" src="/assets/maps/emi_mapa_general_validado.png" alt="Mapa validado del campus EMI UALP"></section>
 <div class="kpis"><div class="card kpi"><div class="label">Zonas reales</div><div class="value">${zonas.length}</div></div><div class="card kpi"><div class="label">Plazas registradas</div><div class="value">${plazas.length}</div></div><div class="card kpi"><div class="label">Cámaras IA de ocupación</div><div class="value">${camOcup}</div></div><div class="card kpi"><div class="label">Cámara LPR/OCR</div><div class="value">${camLpr}</div></div></div>
 <section class="zone-real-grid">${zonas.map(z=>cardZona(z,plazas,dispositivos)).join('')}</section>
 <div class="card panel"><h3>Dispositivos y vínculo con visión artificial</h3><div class="table-wrap"><table><thead><tr><th>Código</th><th>Tipo</th><th>Nombre</th><th>Zona</th><th>Ubicación lógica</th><th>Estado</th></tr></thead><tbody>${dispositivos.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.tipo_dispositivo)}</td><td>${esc(x.nombre)}</td><td>${esc(x.zona_nombre||'Acceso general')}</td><td>${esc(x.ubicacion_logica||x.punto_acceso||'—')}</td><td>${esc(x.estado)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
