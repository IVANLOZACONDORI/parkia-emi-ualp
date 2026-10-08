import {Router} from 'express';
import {query} from '../../config/db.js';
import {authenticate,requirePermission} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
export const reportesRouter=Router();
reportesRouter.use(authenticate,requirePermission('reportes.generar'));
function filtros(req){
  const hoy=new Date(), inicio=new Date(hoy.getTime()-29*86400000).toISOString().slice(0,10), fin=hoy.toISOString().slice(0,10);
  const desde=String(req.query.desde||inicio), hasta=String(req.query.hasta||fin);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(desde)||!/^\d{4}-\d{2}-\d{2}$/.test(hasta))return null;
  const a=new Date(desde+'T00:00:00Z'),b=new Date(hasta+'T00:00:00Z');
  if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||a.toISOString().slice(0,10)!==desde||b.toISOString().slice(0,10)!==hasta||a>b||(b-a)>366*86400000)return null;
  const zona=String(req.query.zona||'');if(zona&&!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(zona))return null;
  return {desde,hasta,zona:zona||null};
}
reportesRouter.get('/resumen',asyncHandler(async(req,res)=>{
  const f=filtros(req);if(!f)return res.status(400).json({message:'Periodo o zona inválidos (máximo 366 días).'});
  const params=[f.desde,f.hasta,f.zona];
  const zonas=await query(`SELECT z.id,z.codigo,z.nombre, COUNT(p.id)::int total_plazas,COUNT(p.id) FILTER(WHERE p.estado_actual='LIBRE')::int plazas_libres,COUNT(p.id) FILTER(WHERE p.estado_actual='OCUPADA')::int plazas_ocupadas, COUNT(p.id) FILTER(WHERE p.estado_actual='FUERA_SERVICIO')::int fuera_servicio, COUNT(p.id) FILTER(WHERE p.estado_actual='SIN_DATOS')::int sin_datos FROM zonas_parqueo z LEFT JOIN plazas_parqueo p ON p.zona_id=z.id AND p.habilitada=true WHERE ($3::uuid IS NULL OR z.id=$3::uuid) GROUP BY z.id,z.codigo,z.nombre ORDER BY z.nombre`,params);
  const flujo=await query(`SELECT date_trunc('day',e.fecha_hora)::date fecha, COUNT(*) FILTER(WHERE e.tipo_evento='INGRESO')::int ingresos,COUNT(*) FILTER(WHERE e.tipo_evento='SALIDA')::int salidas FROM eventos_acceso e LEFT JOIN vehiculos v ON v.id=e.vehiculo_id LEFT JOIN usuarios u ON u.id=v.propietario_usuario_id WHERE e.fecha_hora >= $1::date AND e.fecha_hora < ($2::date+INTERVAL '1 day') AND ($3::uuid IS NULL OR u.zona_asignada_id=$3::uuid) GROUP BY 1 ORDER BY 1`,params);
  const valid=await query(`SELECT e.resultado_validacion,COUNT(*)::int cantidad FROM eventos_acceso e LEFT JOIN vehiculos v ON v.id=e.vehiculo_id LEFT JOIN usuarios u ON u.id=v.propietario_usuario_id WHERE e.fecha_hora >=$1::date AND e.fecha_hora<($2::date+INTERVAL '1 day') AND ($3::uuid IS NULL OR u.zona_asignada_id=$3::uuid) GROUP BY 1 ORDER BY cantidad DESC`,params);
  const ocup=await query(`SELECT z.id zona_id,z.nombre zona,eo.estado_nuevo estado,COUNT(*)::int cantidad FROM eventos_ocupacion eo JOIN plazas_parqueo p ON p.id=eo.plaza_id JOIN zonas_parqueo z ON z.id=p.zona_id WHERE eo.cambiado_en >=$1::date AND eo.cambiado_en<($2::date+INTERVAL '1 day') AND ($3::uuid IS NULL OR z.id=$3::uuid) GROUP BY z.id,z.nombre,eo.estado_nuevo ORDER BY z.nombre,eo.estado_nuevo`,params);
  res.set('Cache-Control','no-store, private');res.json({periodo:{desde:f.desde,hasta:f.hasta,zona:f.zona},zonas:zonas.rows,flujo:flujo.rows,validaciones:valid.rows,cambiosOcupacion:ocup.rows,emitidoEn:new Date().toISOString()});
}));
