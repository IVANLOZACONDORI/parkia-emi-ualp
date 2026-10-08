import {api} from '../api.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const n=v=>Number(v||0);
const stat=(label,value)=>`<div class="card kpi"><div class="label">${esc(label)}</div><div class="value">${n(value)}</div></div>`;
const estadoTexto={LIBRE:'Libre',OCUPADA:'Ocupada',FUERA_SERVICIO:'Fuera de servicio',SIN_DATOS:'Sin datos'};
let generation=0;
export async function renderPanel(c,u){
 const gen=++generation;let zonaId=null;let busy=false;
 c.innerHTML=`<div class="page-head"><div><h1>Supervisión de parqueos</h1><p>Disponibilidad general y seguimiento de sectores · ${esc(u.nombreRol)}</p></div><button class="btn" id="super-refresh">Actualizar</button></div><div id="super-status" class="role-banner" role="status">Consultando disponibilidad...</div><div id="super-metrics" class="kpis"></div><div class="grid-2"><section class="card panel"><h3>Parqueos separados por zona</h3><div id="super-zones"></div></section><section class="card panel"><h3>Cámaras y alertas relevantes</h3><div id="super-alerts"></div></section></div><section class="card panel"><h3 id="super-zone-title">Detalle de un parqueo</h3><div id="super-details" class="empty">Seleccione un sector para consultar sus plazas, cámaras y alertas.</div></section>`;
 const $=id=>c.querySelector(id.startsWith('#')?id:'#'+id);
 const alive=()=>gen===generation && c.isConnected && !!$('#super-status');
 async function showZone(id){
  zonaId=id;
  if(!alive())return;
  try{
   const d=await api('/panel/zonas/'+encodeURIComponent(id));if(!alive()||id!==zonaId)return;
   $('super-zone-title').textContent='Mapa de plazas · '+d.zona.nombre;
   $('super-details').innerHTML=`<div class="super-key"><span>🟢 Libre</span><span>🔴 Ocupada</span><span>🟠 Fuera de servicio</span><span>⚪ Sin datos</span></div><div class="super-map">${d.plazas.map(p=>`<div class="super-space ${esc((p.estado_actual||'SIN_DATOS').toLowerCase().replaceAll('_','-'))}" title="${esc(p.codigo)} · ${esc(estadoTexto[p.estado_actual]||'Sin datos')}"><b>${esc(p.codigo)}</b><small>${esc(estadoTexto[p.estado_actual]||'Sin datos')}</small></div>`).join('')||'<p>No hay plazas registradas.</p>'}</div><h4>Cámaras de la zona</h4>${d.camaras.length?`<div class="table-wrap"><table><thead><tr><th>Código</th><th>Cámara</th><th>Estado</th></tr></thead><tbody>${d.camaras.map(k=>`<tr><td>${esc(k.codigo)}</td><td>${esc(k.nombre)}</td><td>${esc(k.estado)}</td></tr>`).join('')}</tbody></table></div>`:'<p>No existen cámaras registradas en esta zona.</p>'}<h4>Alertas abiertas del sector</h4>${d.alertas.length?d.alertas.map(a=>`<div class="super-alert"><b>${esc(a.severidad)}</b> · ${esc(a.titulo)} ${a.plaza_codigo?'— Plaza '+esc(a.plaza_codigo):''}</div>`).join(''):'<p>Sin alertas abiertas para esta zona.</p>'}`;
  }catch(e){if(alive())$('super-details').textContent='No se pudo consultar el sector: '+e.message;}
 }
 async function refresh(){
  if(busy||!alive())return;busy=true;
  try{
   const d=await api('/panel/resumen');if(!alive())return;
   const sum=key=>d.zonas.reduce((a,z)=>a+n(z[key]),0);
   $('super-metrics').innerHTML=stat('Plazas totales',sum('total_plazas'))+stat('Libres',sum('plazas_libres'))+stat('Ocupadas',sum('plazas_ocupadas'))+stat('Fuera de servicio',sum('plazas_fuera_servicio'))+stat('Sin datos',sum('plazas_sin_datos'));
   $('super-zones').innerHTML=`<div class="super-zones">${d.zonas.map(z=>`<button type="button" class="super-zone ${zonaId===z.id?'chosen':''}" data-zone="${esc(z.id)}"><strong>${esc(z.nombre)}</strong><span>${n(z.plazas_libres)} libres · ${n(z.plazas_ocupadas)} ocupadas · ${n(z.plazas_fuera_servicio)} fuera de servicio · ${n(z.plazas_sin_datos)} sin datos</span><small>Ver mapa y detalles →</small></button>`).join('')||'<p>No hay zonas configuradas.</p>'}</div>`;
   $('super-zones').querySelectorAll('[data-zone]').forEach(btn=>btn.addEventListener('click',()=>showZone(btn.dataset.zone)));
   $('super-alerts').innerHTML=`<div class="super-status-grid"><div><b>Cámaras en línea</b><strong>${n(d.dispositivos.en_linea)}/${n(d.dispositivos.total)}</strong></div><div><b>Con incidencia</b><strong>${n(d.dispositivos.con_incidencia)}</strong></div><div><b>Alertas abiertas</b><strong>${n(d.alertas.abiertas)}</strong></div><div><b>Críticas/altas</b><strong>${n(d.alertas.criticas)}</strong></div></div>${(d.alertas_recientes||[]).map(a=>`<div class="super-alert"><b>${esc(a.severidad)}</b> · ${esc(a.titulo)} <small>${esc(a.zona_nombre||'General')}</small></div>`).join('')||'<p>No hay alertas abiertas.</p>'}`;
   $('super-status').textContent='Datos actualizados: '+new Date(d.actualizado_en).toLocaleTimeString('es-BO')+' · Actualización automática cada 10 segundos.';
   if(zonaId)await showZone(zonaId);
  }catch(e){if(alive())$('super-status').textContent='Sin conexión actualizada: '+e.message;}
  finally{busy=false;}
 }
 $('super-refresh').onclick=refresh;
 await refresh();
 const timer=setInterval(()=>{if(!alive()){clearInterval(timer);return;}refresh();},10000);
}
