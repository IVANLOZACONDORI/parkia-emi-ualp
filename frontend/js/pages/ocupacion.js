
import {api,fecha} from '../api.js';
const encode=file=>new Promise((resolve,reject)=>{if(!file||file.size>6*1024*1024)return reject(new Error('Elija una imagen de hasta 6 MB.'));const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('No se pudo leer la fotografía.'));r.readAsDataURL(file)});
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const zoneLabel=(z)=>({
 'Zona Estudiantes - Sector Trasero':'Estudiantes · sector trasero',
 'Zona Autoridades - Frente Izquierdo':'Autoridades · frente izquierdo',
 'Zona Administrativa - Frente Derecho':'Administrativo · frente derecho'
}[z]||z);
export async function renderOcupacion(c){
 c.innerHTML=`<div class="page-head"><div><h1>Ocupación por visión artificial</h1><p>Las cámaras IA verifican la ocupación de las zonas reales del campus. El análisis se apoya en referencias calibradas y nunca autoriza cambios cuando la lectura es incierta.</p></div></div><div id="vision-msg" role="status"></div><div class="card panel"><h3>Procesamiento de fotografías</h3><p>Seleccione una plaza de la zona correspondiente. Las áreas reales del campus están mapeadas como estudiantes (trasero), autoridades (frente izquierdo) y administrativo (frente derecho).</p><label>Plaza <select id="vision-plaza"></select></label><div id="vision-zone-info" class="role-banner" style="margin-top:10px">La cámara asignada verificará la ocupación de la plaza seleccionada.</div><div class="grid" style="display:flex;flex-wrap:wrap;gap:12px"><label>X % <input id="vision-x" type="number" value="0" min="0" max="95"></label><label>Y % <input id="vision-y" type="number" value="0" min="0" max="95"></label><label>Ancho % <input id="vision-w" type="number" value="100" min="6" max="100"></label><label>Alto % <input id="vision-h" type="number" value="100" min="6" max="100"></label></div><label>Referencia libre <input id="vision-libre" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label><label>Referencia ocupada <input id="vision-ocupada" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label><button class="btn" id="vision-calibrar">Guardar recalibración</button><hr><label>Fotografía actual <input id="vision-actual" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label><button class="btn" id="vision-procesar">Analizar imagen y actualizar plaza</button></div><div class="card panel"><h3>Estado agrupado por zona</h3><div id="vision-tablero" class="space-board"></div></div><div class="card panel"><h3>Últimas evaluaciones</h3><div id="vision-historial" class="table-wrap"></div></div>`;
 const $=id=>c.querySelector(id.startsWith('#')?id:'#'+id),notice=(m,err=false)=>{$('vision-msg').textContent=m;$('vision-msg').style.color=err?'#b91c1c':'#087e70'};
 let plazas=[];
 function updateZoneInfo(){
   const p=plazas.find(x=>x.id===$('vision-plaza').value);
   if(!p) return;
   $('vision-zone-info').textContent=`Zona: ${zoneLabel(p.zona_nombre)} · Cámara: ${p.camara_nombre||'No asignada'} · Tipo: ${p.tipo_plaza}`;
 }
 async function refresh(){
  try{
    plazas=await api('/ocupacion/estado');
    const current=$('vision-plaza').value;
    $('vision-plaza').innerHTML=plazas.map(p=>`<option value="${escape(p.id)}">${escape(zoneLabel(p.zona_nombre))} · ${escape(p.codigo)}</option>`).join('');
    if(plazas.some(p=>p.id===current))$('vision-plaza').value=current;
    updateZoneInfo();
    const grouped=Object.values(plazas.reduce((acc,p)=>{(acc[p.zona_nombre]??=[]).push(p);return acc;},{}));
    $('vision-tablero').innerHTML=grouped.map(group=>{const zona=group[0].zona_nombre;return `<section class="vision-zone-block"><h4>${escape(zoneLabel(zona))}</h4><div class="vision-zone-grid">${group.map(p=>`<div class="space-card ${p.estado_actual==='OCUPADA'?'occupied':p.estado_actual==='FUERA_SERVICIO'?'out':p.estado_actual==='SIN_DATOS'?'unknown':''}"><div class="space-code">${escape(p.codigo)}</div><div class="space-meta">${escape(p.estado_actual)}<br>Confianza: ${p.confianza??'—'}%<br>${escape(p.camara_nombre||'Sin cámara')}</div></div>`).join('')}</div></section>`;}).join('');
    const logs=await api('/ocupacion/historial');
    $('vision-historial').innerHTML=`<table><thead><tr><th>Fecha</th><th>Plaza</th><th>Resultado</th><th>Confianza</th></tr></thead><tbody>${logs.map(v=>`<tr><td>${escape(fecha(v.creado_en))}</td><td>${escape(v.codigo)}</td><td>${escape(v.estado_predicho)}</td><td>${v.confianza??'—'}%</td></tr>`).join('')}</tbody></table>`;
  }catch(e){notice(e.message,true)}
 }
 const id=()=>$('vision-plaza').value,roi=()=>({x:+$('vision-x').value/100,y:+$('vision-y').value/100,w:+$('vision-w').value/100,h:+$('vision-h').value/100});
 $('vision-plaza').onchange=updateZoneInfo;
 $('vision-calibrar').onclick=async()=>{const btn=$('vision-calibrar');btn.disabled=true;try{const imagenLibre=await encode($('vision-libre').files[0]),imagenOcupada=await encode($('vision-ocupada').files[0]);const r=await api('/ocupacion/calibrar',{method:'POST',body:{plazaId:id(),roi:roi(),imagenLibre,imagenOcupada}});notice(r.message);await refresh()}catch(e){notice(e.message,true)}finally{btn.disabled=false}};
 $('vision-procesar').onclick=async()=>{const btn=$('vision-procesar');btn.disabled=true;try{const imagen=await encode($('vision-actual').files[0]);const r=await api('/ocupacion/procesar',{method:'POST',body:{plazaId:id(),imagen}});notice(`${r.plaza}: ${r.estado}. ${r.mensaje} Confianza: ${r.confianza??'no determinada'}%`);await refresh()}catch(e){notice(e.message,true)}finally{btn.disabled=false}};
 await refresh();const timer=setInterval(()=>{if(!c.isConnected || c.dataset.moduloActivo!=='ocupacion'){clearInterval(timer);return}refresh()},12000);
}
