import { api, fecha } from '../api.js';

let teardown = null;
const etiquetas={LIBRE:'Libre',OCUPADA:'Ocupada',FUERA_SERVICIO:'Fuera de servicio',SIN_DATOS:'Sin datos'};
const estilos={LIBRE:'libre',OCUPADA:'ocupada',FUERA_SERVICIO:'fuera-servicio',SIN_DATOS:'sin-datos'};
function elemento(tag,cls,texto){const el=document.createElement(tag);if(cls)el.className=cls;if(texto!==undefined)el.textContent=String(texto);return el;}
function contenido(c,d){
  const r=d.resumen;const libre=r.libres>0;
  const root=elemento('section','student-page student-v9');
  const head=elemento('header','page-head');
  const title=elemento('div');title.append(elemento('p','student-eyebrow','CONSULTA DEL ESTUDIANTE'),elemento('h1','','Mi parqueo'),elemento('p','student-zone',d.zona.nombre+' · '+(d.zona.ubicacion||'Sector trasero')));
  head.append(title,elemento('span','student-live','● Actualización automática'));root.append(head);
  const banner=elemento('section','student-availability '+(libre?'available':'full'));
  const bannerTxt=elemento('div');bannerTxt.append(elemento('small','','ESTADO DE DISPONIBILIDAD'),elemento('h2','',d.mensaje),elemento('p','','Última actualización: '+fecha(d.actualizadoEn)));
  banner.append(bannerTxt,elemento('div','availability-number',r.libres));root.append(banner);
  const stats=elemento('section','student-stats');
  for(const [cl,n,v] of [['total','Plazas registradas',r.total],['libre','Libres',r.libres],['ocupada','Ocupadas',r.ocupadas],['fuera-servicio','Fuera de servicio',r.fueraServicio],['sin-datos','Sin datos',r.sinDatos]]){
    const card=elemento('article','student-stat '+cl);card.append(elemento('strong','',v),elemento('span','',n));stats.append(card);
  }root.append(stats);
  const panel=elemento('section','card panel student-panel');panel.append(elemento('h3','','Mapa de plazas · Sector Trasero'));
  const legend=elemento('div','student-legend');
  for(const [s,n] of Object.entries(etiquetas)){const chip=elemento('span','student-legend-item');chip.append(elemento('i','student-dot '+estilos[s]),elemento('span','',n));legend.append(chip)}panel.append(legend);
  const mapa=elemento('div','student-map student-map-v9');mapa.setAttribute('role','list');mapa.setAttribute('aria-label','Estado actual de las plazas');
  if(d.plazas.length===0) mapa.append(elemento('p','student-empty','No existen plazas habilitadas en esta zona.'));
  else for(const plaza of d.plazas){const estado=etiquetas[plaza.estado]||etiquetas.SIN_DATOS;
    const tarjeta=elemento('article','student-slot '+(estilos[plaza.estado]||'sin-datos'));tarjeta.setAttribute('role','listitem');tarjeta.setAttribute('aria-label','Plaza '+plaza.codigo+': '+estado);
    tarjeta.append(elemento('b','',plaza.codigo),elemento('span','',estado));mapa.append(tarjeta);
  }panel.append(mapa);root.append(panel);
  root.append(elemento('p','student-note','Información exclusiva de la Zona Estudiantes – Sector Trasero. Los estados reflejan el último registro disponible.'));
  c.replaceChildren(root);
}
export function detenerConsultaEstudiante(){
  if (teardown) { teardown(); teardown=null; }
}
export async function renderEstudiante(c){
  detenerConsultaEstudiante();
  let activo=true,trabajando=false,timer;
  const titulo=elemento('div','card panel student-loading','Consultando disponibilidad de tu zona...');c.replaceChildren(titulo);
  async function cargar(){
    if(!activo||trabajando||document.hidden)return;
    trabajando=true;
    try {const data=await api('/estudiante/mi-parqueo');if(activo&&c.isConnected&&c.dataset.moduloActivo==='mi-parqueo')contenido(c,data);}
    catch(e){if(activo&&c.isConnected&&c.dataset.moduloActivo==='mi-parqueo'){
      // No comunicar 'espacios disponibles' ante pérdida de conexión.
      const error=elemento('div','card panel student-error');error.append(elemento('h2','','Disponibilidad no confirmada'),elemento('p','',e.message||'No se pudo actualizar la información.'));
      c.replaceChildren(error);
    }}finally{trabajando=false;}
  }
  await cargar();if(!activo || c.dataset.moduloActivo!=='mi-parqueo')return;timer=setInterval(cargar,5000);
  const onVisible=()=>{if(!document.hidden)cargar();};document.addEventListener('visibilitychange',onVisible);
  teardown=()=>{activo=false;clearInterval(timer);document.removeEventListener('visibilitychange',onVisible);};
}
