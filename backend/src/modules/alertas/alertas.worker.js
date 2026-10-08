import {query,transaction} from '../../config/db.js';
// Una ejecución simultánea se serializa con advisory lock de sesión; no abre dos incidentes iguales.
const key=(tipo,id)=>`${tipo}:${id}`;
async function reconciliar(c,{tipo,severidad,titulo,descripcion,zonaId=null,dispositivoId=null,clave},activa){
 const abierta=await c.query(`SELECT id,estado FROM alertas WHERE clave_incidente=$1 AND estado<>'CERRADA' ORDER BY abierta_en LIMIT 1 FOR UPDATE`,[clave]);
 if(!activa)return {nueva:false,pendiente:abierta.rowCount>0};
 if(abierta.rowCount)return {nueva:false,pendiente:true};
 const r=await c.query(`INSERT INTO alertas(tipo_alerta,severidad,titulo,descripcion,zona_id,dispositivo_id,clave_incidente) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING RETURNING id`,[tipo,severidad,titulo,descripcion,zonaId,dispositivoId,clave]);
 if(r.rowCount)await c.query(`INSERT INTO acciones_alerta(alerta_id,accion,comentario) VALUES($1,'GENERADA','Detectada automáticamente por el sistema.')`,[r.rows[0].id]);
 return {nueva:r.rowCount>0,pendiente:true};
}
export async function ejecutarInspeccionAlertas(){
 return transaction(async c=>{
  const lock=await c.query('SELECT pg_try_advisory_xact_lock(76510911) AS ok');if(!lock.rows[0].ok)return {omitida:true,motivo:'Ya existe una inspección en proceso.'};
  const umbral=Number(process.env.ALERTA_CAPACIDAD_UMBRAL||90);const limite=Number.isFinite(umbral)&&umbral>=50&&umbral<=100?umbral:90;
  const demora=Number(process.env.ALERTA_CAMARA_MINUTOS||5);const minutos=Number.isFinite(demora)&&demora>=1&&demora<=1440?demora:5;
  let nuevas=0,revisadas=0;
  const zonas=await c.query(`SELECT z.id,z.nombre,COALESCE(v.total_plazas,0)::int total,COALESCE(v.plazas_ocupadas,0)::int ocupadas,COALESCE(v.plazas_fuera_servicio,0)::int fuera,COALESCE(v.plazas_sin_datos,0)::int sin_datos FROM zonas_parqueo z LEFT JOIN vista_disponibilidad_zonas v ON z.id=v.zona_id`);
  for(const z of zonas.rows){
   const capacidad=z.total-z.fuera-z.sin_datos;const porcentaje=capacidad>0?100*z.ocupadas/capacidad:0;
   const a=await reconciliar(c,{tipo:'CAPACIDAD_ALTA',severidad:'ALTA',titulo:`Capacidad elevada: ${z.nombre}`,descripcion:`Ocupación de ${porcentaje.toFixed(1)}% (${z.ocupadas} de ${capacidad} plazas evaluables).`,zonaId:z.id,clave:key('CAPACIDAD_ALTA',z.id)},capacidad>0&&porcentaje>=limite);nuevas+=Number(a.nueva);revisadas++;
   const b=await reconciliar(c,{tipo:'INCONSISTENCIA_OCUPACION',severidad:'MEDIA',titulo:`Datos de ocupación incompletos: ${z.nombre}`,descripcion:`Existen ${z.sin_datos} plazas sin información actualizada.`,zonaId:z.id,clave:key('INCONSISTENCIA_OCUPACION',z.id)},z.sin_datos>0);nuevas+=Number(b.nueva);revisadas++;
  }
  const cams=await c.query(`SELECT id,nombre,estado,zona_id,ultima_comunicacion_en FROM dispositivos WHERE tipo_dispositivo LIKE 'CAMARA%' AND estado<>'DESHABILITADO'`);
  for(const d of cams.rows){
   const antigua=!d.ultima_comunicacion_en||Date.now()-new Date(d.ultima_comunicacion_en).getTime()>minutos*60000;
   const falla=['FUERA_LINEA','ERROR'].includes(d.estado)||(d.estado==='EN_LINEA'&&antigua);
   const a=await reconciliar(c,{tipo:'CAMARA_FUERA_LINEA',severidad:'CRITICA',titulo:`Cámara sin comunicación: ${d.nombre}`,descripcion:`Estado: ${d.estado}. Última comunicación: ${d.ultima_comunicacion_en||'no registrada'}.`,zonaId:d.zona_id,dispositivoId:d.id,clave:key('CAMARA_FUERA_LINEA',d.id)},falla);nuevas+=Number(a.nueva);revisadas++;
  }
  return {nuevas,revisadas,fecha:new Date().toISOString(),umbralCapacidad:limite,minutosSinCamara:minutos};
 });
}
let ejecutando=false;
export function iniciarVerificadorAlertas(){
 const ejecutar=async()=>{if(ejecutando)return;ejecutando=true;try{await ejecutarInspeccionAlertas()}catch(e){console.error('[ALERTAS] Inspección fallida:',e.message)}finally{ejecutando=false}};
 void ejecutar();const timer=setInterval(ejecutar,30000);timer.unref?.();return timer;
}
