import {Router} from 'express';
import {query} from '../../config/db.js';
import {authenticate,requirePermission} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

export const historialRouter=Router();
historialRouter.use(authenticate,requirePermission('historial.ver'));
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function filtros(req){
 const placa=String(req.query.placa||'').trim().toUpperCase();
 const tipo=String(req.query.tipo||'').trim().toUpperCase();
 const estado=String(req.query.estado||'').trim().toUpperCase();
 const desde=String(req.query.desde||'').trim(),hasta=String(req.query.hasta||'').trim();
 const origen=String(req.query.origen||'').trim().toUpperCase();
 const pagina=Number(req.query.pagina||1),limite=Number(req.query.limite||25);
 if(placa.length>20||!['','INGRESO','SALIDA'].includes(tipo)||!['','AUTORIZADO','DENEGADO','PENDIENTE','MANUAL','INCIERTO'].includes(estado)||!['','CAMARA_IA','MANUAL','API','SIMULADOR'].includes(origen)||!Number.isInteger(pagina)||pagina<1||pagina>10000||!Number.isInteger(limite)||limite<1||limite>100)return null;
 if((desde&&!/^\d{4}-\d{2}-\d{2}$/.test(desde))||(hasta&&!/^\d{4}-\d{2}-\d{2}$/.test(hasta)))return null;
 if((desde&&!Number.isFinite(Date.parse(desde)))||(hasta&&!Number.isFinite(Date.parse(hasta)))||(desde&&hasta&&desde>hasta))return null;
 return {placa,tipo,estado,desde,hasta,origen,pagina,limite};
}
const aWhere=`($1='' OR UPPER(COALESCE(e.placa_detectada,'')) LIKE '%'||$1||'%') AND ($2='' OR e.tipo_evento=$2) AND ($3='' OR e.resultado_validacion=$3) AND ($4='' OR e.fecha_hora >= $4::date) AND ($5='' OR e.fecha_hora < ($5::date + interval '1 day')) AND ($6='' OR e.origen=$6)`;
const accessFrom=`FROM eventos_acceso e LEFT JOIN dispositivos d ON d.id=e.camara_acceso_id LEFT JOIN vehiculos v ON v.id=e.vehiculo_id`;
historialRouter.get('/accesos',asyncHandler(async(req,res)=>{
 const f=filtros(req);if(!f)return res.status(400).json({message:'Filtros de historial no válidos.'});
 const args=[f.placa,f.tipo,f.estado,f.desde,f.hasta,f.origen];
 const [total,registros]=await Promise.all([
  query(`SELECT count(*)::int total ${accessFrom} WHERE ${aWhere}`,args),
  query(`SELECT e.id,e.fecha_hora,e.tipo_evento,e.placa_detectada,e.resultado_validacion,e.punto_acceso,e.origen,e.confianza_reconocimiento,e.evidencia_tipo,e.autorizado_manual,d.nombre camara_acceso ${accessFrom} WHERE ${aWhere} ORDER BY e.fecha_hora DESC,e.id DESC LIMIT $7 OFFSET $8`,[...args,f.limite,(f.pagina-1)*f.limite])
 ]);
 res.json({items:registros.rows,total:total.rows[0].total,pagina:f.pagina,limite:f.limite,paginas:Math.max(1,Math.ceil(total.rows[0].total/f.limite))});
}));
historialRouter.get('/accesos/:id',asyncHandler(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({message:'Identificador no válido.'});
 const r=await query(`SELECT e.id,e.tipo_evento,e.fecha_hora,e.punto_acceso,e.placa_detectada,e.confianza_reconocimiento,e.resultado_validacion,e.autorizado_manual,e.observaciones,e.origen,e.evidencia_tipo,e.imagen_url IS NOT NULL tiene_evidencia,d.codigo camara_codigo,d.nombre camara_nombre,v.placa placa_registrada,COALESCE(u.nombre_completo,'Sin revisión manual') revisor FROM eventos_acceso e LEFT JOIN dispositivos d ON d.id=e.camara_acceso_id LEFT JOIN vehiculos v ON v.id=e.vehiculo_id LEFT JOIN usuarios u ON u.id=e.autorizado_por WHERE e.id=$1`,[req.params.id]);
 if(!r.rowCount)return res.status(404).json({message:'Evento no encontrado.'});
 const lecturas=await query('SELECT placa_detectada,confianza,estado_validacion,placa_corregida,validado_en,creado_en FROM resultados_reconocimiento_placa WHERE evento_acceso_id=$1 ORDER BY creado_en ASC',[req.params.id]);
 res.json({evento:r.rows[0],lecturas:lecturas.rows});
}));
historialRouter.get('/ocupacion',asyncHandler(async(req,res)=>{
 const pagina=Number(req.query.pagina||1),limite=Number(req.query.limite||25),estado=String(req.query.estado||'').toUpperCase(),zona=String(req.query.zona||''),desde=String(req.query.desde||''),hasta=String(req.query.hasta||'');
 if(!Number.isInteger(pagina)||pagina<1||pagina>10000||!Number.isInteger(limite)||limite<1||limite>100||!['','LIBRE','OCUPADA','FUERA_SERVICIO','SIN_DATOS'].includes(estado)||(zona&&!uuid(zona))||(desde&&!/^\d{4}-\d{2}-\d{2}$/.test(desde))||(hasta&&!/^\d{4}-\d{2}-\d{2}$/.test(hasta))||(desde&&hasta&&desde>hasta))return res.status(400).json({message:'Filtros no válidos.'});
 const args=[estado,zona,desde,hasta];const from='FROM eventos_ocupacion e JOIN plazas_parqueo p ON p.id=e.plaza_id JOIN zonas_parqueo z ON z.id=p.zona_id LEFT JOIN dispositivos d ON d.id=e.camara_id';
 const where=`($1='' OR e.estado_nuevo=$1) AND ($2='' OR z.id::text=$2) AND ($3='' OR e.cambiado_en >= $3::date) AND ($4='' OR e.cambiado_en < ($4::date + interval '1 day'))`;
 const [total,items]=await Promise.all([query(`SELECT COUNT(*)::int total ${from} WHERE ${where}`,args),query(`SELECT e.id,e.cambiado_en,e.estado_anterior,e.estado_nuevo,e.confianza,e.origen,e.evidencia_tipo,p.codigo plaza_codigo,z.nombre zona_nombre,d.nombre camara_nombre ${from} WHERE ${where} ORDER BY e.cambiado_en DESC,e.id DESC LIMIT $5 OFFSET $6`,[...args,limite,(pagina-1)*limite])]);
 res.json({items:items.rows,total:total.rows[0].total,pagina,limite,paginas:Math.max(1,Math.ceil(total.rows[0].total/limite))});
}));
historialRouter.get('/zonas',asyncHandler(async(req,res)=>{const r=await query('SELECT id,nombre FROM zonas_parqueo ORDER BY nombre');res.json(r.rows);}));
