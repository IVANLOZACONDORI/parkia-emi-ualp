
import {api} from '../api.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const zoneMeta={
 'Z-EST-TRASERA':{key:'est',short:'Estudiantes',title:'Zona Estudiantes · Sector trasero',color:'students',img:'/assets/maps/emi_estudiantes_sector_trasero.png',desc:'Sector real destinado a estudiantes, ubicado en la parte trasera del campus.'},
 'Z-AUTORIDADES':{key:'aut',short:'Autoridades',title:'Zona Autoridades · Frente izquierdo',color:'authorities',img:'/assets/maps/emi_autoridades_frente_izquierdo.png',desc:'Sector frontal izquierdo reservado para autoridades.'},
 'Z-ADMIN':{key:'adm',short:'Administrativo',title:'Zona Administrativa · Frente derecho',color:'admin',img:'/assets/maps/emi_administrativo_frente_derecho.png',desc:'Sector frontal derecho destinado a personal administrativo.'},
 'Zona Estudiantes - Sector Trasero':{key:'est',short:'Estudiantes',title:'Sector trasero',color:'students',img:'/assets/maps/emi_estudiantes_sector_trasero.png',desc:'Sector real destinado a estudiantes, ubicado en la parte trasera del campus.'},
 'Zona Autoridades - Frente Izquierdo':{key:'aut',short:'Autoridades',title:'Frente izquierdo',color:'authorities',img:'/assets/maps/emi_autoridades_frente_izquierdo.png',desc:'Sector frontal izquierdo reservado para autoridades.'},
 'Zona Administrativa - Frente Derecho':{key:'adm',short:'Administrativo',title:'Frente derecho',color:'admin',img:'/assets/maps/emi_administrativo_frente_derecho.png',desc:'Sector frontal derecho destinado a personal administrativo.'}
};
const stateClass=s=>({LIBRE:'libre',OCUPADA:'ocupada',FUERA_SERVICIO:'fuera-servicio',SIN_DATOS:'sin-datos'}[s]||'sin-datos');
const stateLabel=s=>({LIBRE:'Disponible',OCUPADA:'Ocupada',FUERA_SERVICIO:'Fuera de servicio',SIN_DATOS:'Sin datos'}[s]||s||'Sin datos');
const overlayPos={
 est:{EM01:[18,14],EM02:[32,18],EM03:[46,22],EM04:[60,26],EM05:[74,30],EM06:[84,34],EM07:[18,32],EM08:[32,36],EM09:[46,40],EM10:[60,44],EM11:[74,48],EM12:[84,52],EM13:[18,50],EM14:[32,54],EM15:[46,58],EM16:[60,62],EM17:[74,66],EM18:[84,70],EM19:[18,68],EM20:[32,72],EM21:[46,76],EM22:[60,80],EM23:[74,84],EM24:[84,88]},
 aut:{AU01:[70,14],AU02:[73,24],AU03:[76,34],AU04:[79,44],AU05:[82,54],AU06:[85,64],AU07:[88,74],AU08:[91,84]},
 adm:{AD01:[72,16],AD02:[78,26],AD03:[84,36],AD04:[72,50],AD05:[78,60],AD06:[84,70],AD07:[72,82],AD08:[78,88],AD09:[84,94]}
};
function overlayCard(p, key, extra=''){
  const pos=(overlayPos[key]||{})[p.codigo];
  if(!pos) return '';
  return `<div class="overlay-slot ${stateClass(p.estado_actual)} ${extra}" style="left:${pos[0]}%;top:${pos[1]}%"><strong>${p.codigo}</strong><span>${stateLabel(p.estado_actual)}</span></div>`;
}

function sectorCard(z,plazas,disps){
 const m=zoneMeta[z.codigo]||{title:z.nombre,color:'students',desc:z.descripcion||'',img:'',short:z.nombre,key:'est'};
 const items=plazas.filter(p=>p.zona_id===z.id).sort((a,b)=>String(a.codigo).localeCompare(String(b.codigo),undefined,{numeric:true}));
 const cams=disps.filter(d=>d.zona_id===z.id && d.tipo_dispositivo==='CAMARA_OCUPACION');
 const libres=items.filter(p=>p.estado_actual==='LIBRE').length;
 const ocupadas=items.filter(p=>p.estado_actual==='OCUPADA').length;
 return `<section class="sector-card overlay-style ${m.color}"><div class="sector-card-head"><div><span class="sector-badge">${esc(m.short)}</span><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p></div></div><div class="sector-kpis"><div><b>${items.length}</b><span>Plazas</span></div><div><b>${libres}</b><span>Disponibles</span></div><div><b>${ocupadas}</b><span>Ocupadas</span></div><div><b>${cams.length}</b><span>Cámaras IA</span></div></div><div class="sector-image-map"><img src="${m.img}" alt="${esc(m.title)}">${items.map(p=>overlayCard(p,m.key)).join('')}</div><div class="sector-footnote">Las plazas se muestran directamente sobre la imagen del parqueo. Verificación de ocupación mediante ${cams.map(c=>esc(c.codigo)).join(', ')||'cámara no asignada'}.</div></section>`;
}
export async function renderParqueos(c){
 const [zonas,plazas,disps]=await Promise.all([api('/parqueos/zonas'),api('/parqueos/plazas'),api('/parqueos/dispositivos')]);
 const ordered=['Z-AUTORIDADES','Z-ADMIN','Z-EST-TRASERA'];
 const orderedZones=ordered.map(code=>zonas.find(z=>z.codigo===code)).filter(Boolean);
 const totalLibres=plazas.filter(p=>p.estado_actual==='LIBRE').length;
 const totalOcupadas=plazas.filter(p=>p.estado_actual==='OCUPADA').length;
 c.innerHTML=`<div class="page-head"><div><h1>Mapeo institucional sobre imagen real</h1><p>Ahora cada sector del campus se visualiza con su imagen del parqueo y las plazas directamente sobrepuestas como tarjetas, mostrando si están disponibles, ocupadas, fuera de servicio o sin datos.</p></div></div>
 <section class="card panel campus-schema"><div class="schema-copy"><h3>Distribución real del campus</h3><p>Autoridades al frente izquierdo, administrativo al frente derecho y estudiantes en la parte trasera. La lectura se realiza directamente sobre la imagen del sector, con tarjetas de estado claras y ordenadas.</p><div class="campus-legend"><span class="lg students">Estudiantes</span><span class="lg authorities">Autoridades</span><span class="lg admin">Administrativo</span><span class="lg status libre">Disponible</span><span class="lg status ocupada">Ocupada</span><span class="lg status fuera-servicio">Fuera de servicio</span><span class="lg status sin-datos">Sin datos</span></div></div><div class="schema-layout"><div class="schema-box authorities">Frente izquierdo<br><strong>Autoridades</strong></div><div class="schema-box admin">Frente derecho<br><strong>Administrativo</strong></div><div class="schema-box students large">Parte trasera<br><strong>Estudiantes</strong></div></div></section>
 <div class="kpis"><div class="card kpi"><div class="label">Sectores mapeados</div><div class="value">${orderedZones.length}</div></div><div class="card kpi"><div class="label">Plazas registradas</div><div class="value">${plazas.length}</div></div><div class="card kpi"><div class="label">Disponibles</div><div class="value">${totalLibres}</div></div><div class="card kpi"><div class="label">Ocupadas</div><div class="value">${totalOcupadas}</div></div></div>
 <div class="sector-grid-layout one-col">${orderedZones.map(z=>sectorCard(z,plazas,disps)).join('')}</div>
 <div class="card panel"><h3>Dispositivos vinculados al mapeo</h3><div class="table-wrap"><table><thead><tr><th>Código</th><th>Tipo</th><th>Nombre</th><th>Zona</th><th>Estado</th></tr></thead><tbody>${disps.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.tipo_dispositivo)}</td><td>${esc(x.nombre)}</td><td>${esc(x.zona_nombre||'Acceso general')}</td><td>${esc(x.estado)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
