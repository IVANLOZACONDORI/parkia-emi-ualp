import {Router} from 'express';
import {query} from '../../config/db.js';
import {authenticate,requirePermission} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
import {registrarAuditoria} from '../../middleware/audit.js';
export const respaldosRouter=Router();respaldosRouter.use(authenticate,requirePermission('respaldos.gestionar'));
respaldosRouter.get('/',asyncHandler(async(req,res)=>{const r=await query(`SELECT r.id,r.tipo_respaldo,r.estado,r.mensaje,r.nombre_archivo,r.creado_en,r.finalizado_en,u.nombre_completo solicitado_por_nombre FROM respaldos r LEFT JOIN usuarios u ON u.id=r.solicitado_por ORDER BY r.creado_en DESC LIMIT 200`);res.set('Cache-Control','no-store');res.json(r.rows)}));
respaldosRouter.post('/',asyncHandler(async(req,res)=>{
 const tipo=req.body?.tipo==='RESTAURACION'?'RESTAURACION':'MANUAL';
 const motivo=String(req.body?.motivo||'').trim().slice(0,300);
 if(motivo.length<12)return res.status(400).json({message:'Indique un motivo de al menos 12 caracteres.'});
 const mensaje=`${motivo} | Solicitud registrada. Requiere procedimiento de ejecución y verificación por personal autorizado.`;
 const r=await query(`INSERT INTO respaldos(solicitado_por,tipo_respaldo,estado,mensaje) VALUES($1,$2,'SOLICITADO',$3) RETURNING *`,[req.user.sub,tipo,mensaje]);
 await registrarAuditoria({usuarioId:req.user.sub,accion:tipo==='RESTAURACION'?'RESTAURACION_SOLICITADA':'RESPALDO_SOLICITADO',entidad:'respaldos',entidadId:r.rows[0].id,detalle:{tipo,motivo},req});res.status(201).json(r.rows[0]);
}));
// No se ejecutan comandos privilegiados desde la web. El técnico registra una evidencia de ejecución externa.
respaldosRouter.patch('/:id/resultado',asyncHandler(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({message:'Identificador inválido.'});
 const estado=String(req.body?.estado||'');if(!['EJECUTANDO','EXITOSO','FALLIDO'].includes(estado))return res.status(400).json({message:'Estado inválido.'});
 const evidencia=String(req.body?.evidencia||'').trim().slice(0,500);
 if(evidencia.length<20)return res.status(400).json({message:'Especifique evidencia técnica (mínimo 20 caracteres).'});
 const r=await query(`UPDATE respaldos SET estado=$2,mensaje=CONCAT(COALESCE(mensaje,''),' | ', $3),finalizado_en=CASE WHEN $2 IN ('EXITOSO','FALLIDO') THEN NOW() ELSE NULL END WHERE id=$1 AND (estado='SOLICITADO' AND $2='EJECUTANDO' OR estado='EJECUTANDO' AND $2 IN ('EXITOSO','FALLIDO')) RETURNING *`,[req.params.id,estado,evidencia]);
 if(!r.rowCount)return res.status(409).json({message:'No existe la solicitud o la transición no está permitida.'});
 await registrarAuditoria({usuarioId:req.user.sub,accion:'RESPALDO_CAMBIO_ESTADO',entidad:'respaldos',entidadId:req.params.id,detalle:{estado,evidencia},req});res.json(r.rows[0]);
}));
