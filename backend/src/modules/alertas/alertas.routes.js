import {Router} from 'express';
import {query,transaction} from '../../config/db.js';
import {authenticate,requirePermission} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {registrarAuditoria} from '../../middleware/audit.js';
import {ejecutarInspeccionAlertas} from './alertas.worker.js';
export const alertasRouter=Router();
alertasRouter.use(authenticate);
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const bad=(m,status=400)=>{const e=new Error(m);e.status=status;throw e;};
alertasRouter.get('/',requirePermission('alertas.ver'),asyncHandler(async(req,res)=>{
 const estados=['','ABIERTA','ATENDIDA','CERRADA']; const estado=String(req.query.estado||'').toUpperCase();if(!estados.includes(estado))bad('Filtro de estado inválido.');
 const r=await query(`SELECT a.*,z.nombre zona_nombre,d.nombre dispositivo_nombre,p.codigo plaza_codigo,u.nombre_completo asignado_nombre,uc.nombre_completo cerrado_nombre FROM alertas a LEFT JOIN zonas_parqueo z ON z.id=a.zona_id LEFT JOIN dispositivos d ON d.id=a.dispositivo_id LEFT JOIN plazas_parqueo p ON p.id=a.plaza_id LEFT JOIN usuarios u ON u.id=a.asignado_a LEFT JOIN usuarios uc ON uc.id=a.cerrada_por WHERE($1='' OR a.estado=$1) ORDER BY CASE a.estado WHEN 'ABIERTA' THEN 0 WHEN 'ATENDIDA' THEN 1 ELSE 2 END,CASE a.severidad WHEN 'CRITICA' THEN 0 WHEN 'ALTA' THEN 1 WHEN 'MEDIA' THEN 2 ELSE 3 END,a.abierta_en DESC LIMIT 300`,[estado]);res.json(r.rows);
}));
alertasRouter.get('/resumen',requirePermission('alertas.ver'),asyncHandler(async(req,res)=>{
 const r=await query(`SELECT COUNT(*) FILTER(WHERE estado='ABIERTA')::int abiertas,COUNT(*) FILTER(WHERE estado='ATENDIDA')::int atendidas,COUNT(*) FILTER(WHERE estado='CERRADA')::int cerradas,COUNT(*) FILTER(WHERE estado='ABIERTA' AND severidad IN ('CRITICA','ALTA'))::int prioritarias FROM alertas`);res.json(r.rows[0]);
}));
alertasRouter.get('/:id/historial',requirePermission('alertas.ver'),asyncHandler(async(req,res)=>{
 if(!uuid(req.params.id))bad('Identificador inválido.');const r=await query(`SELECT ac.accion,ac.comentario,ac.creado_en,u.nombre_completo responsable FROM acciones_alerta ac LEFT JOIN usuarios u ON ac.usuario_id=u.id WHERE ac.alerta_id=$1 ORDER BY ac.creado_en ASC`,[req.params.id]);res.json(r.rows);
}));
alertasRouter.post('/inspeccionar',requirePermission('alertas.gestionar'),asyncHandler(async(req,res)=>{const r=await ejecutarInspeccionAlertas();await registrarAuditoria({usuarioId:req.user.sub,accion:'ALERTAS_INSPECCION_MANUAL',entidad:'alertas',detalle:r,req});res.json(r)}));
async function cambiar(req,res,nuevo){
 if(!uuid(req.params.id))bad('Identificador inválido.');const comentario=String(req.body?.comentario||'').trim();if(comentario.length<8||comentario.length>1000)bad('Indique un comentario de 8 a 1000 caracteres.');
 const alerta=await transaction(async c=>{
  const q=await c.query('SELECT * FROM alertas WHERE id=$1 FOR UPDATE',[req.params.id]);if(!q.rowCount)bad('Alerta no encontrada.',404);const previa=q.rows[0];
  if(nuevo==='ATENDIDA'&&previa.estado!=='ABIERTA')bad('Sólo se puede atender una alerta abierta.',409);
  if(nuevo==='CERRADA'&&previa.estado!=='ATENDIDA')bad('La alerta debe atenderse antes de cerrarse.',409);
  const u=await c.query(nuevo==='ATENDIDA'?`UPDATE alertas SET estado='ATENDIDA',asignado_a=$2,atendida_en=NOW() WHERE id=$1 RETURNING *`:`UPDATE alertas SET estado='CERRADA',cerrada_por=$2,cerrada_en=NOW() WHERE id=$1 RETURNING *`,[req.params.id,req.user.sub]);
  await c.query('INSERT INTO acciones_alerta(alerta_id,usuario_id,accion,comentario) VALUES($1,$2,$3,$4)',[req.params.id,req.user.sub,nuevo,comentario]);return u.rows[0];
 });await registrarAuditoria({usuarioId:req.user.sub,accion:`ALERTA_${nuevo}`,entidad:'alertas',entidadId:req.params.id,detalle:{comentario},req});res.json(alerta);
}
alertasRouter.patch('/:id/atender',requirePermission('alertas.gestionar'),asyncHandler((req,res)=>cambiar(req,res,'ATENDIDA')));
alertasRouter.patch('/:id/cerrar',requirePermission('alertas.gestionar'),asyncHandler((req,res)=>cambiar(req,res,'CERRADA')));
