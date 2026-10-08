import {Router} from 'express';
import {query} from '../../config/db.js';
import {authenticate,requirePermission} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
export const auditoriaRouter=Router();
auditoriaRouter.use(authenticate,requirePermission('auditoria.ver'));
const day=s=>!s||/^\d{4}-\d{2}-\d{2}$/.test(s);
const bounded=(x,d,max)=>{let n=Number(x??d);return Number.isInteger(n)&&n>0&&n<=max?n:null};
auditoriaRouter.get('/',asyncHandler(async(req,res)=>{
 const {desde='',hasta='',accion='',usuario='',tipo='TODOS'}=req.query;
 const pagina=bounded(req.query.pagina,1,100000),limite=bounded(req.query.limite,25,100);
 if(!pagina||!limite||!day(desde)||!day(hasta)||accion.length>90||usuario.length>100||!['TODOS','SEGURIDAD','ADMINISTRATIVA'].includes(tipo)||desde&&hasta&&desde>hasta)return res.status(400).json({message:'Filtros de auditoría inválidos.'});
 const clauses=[],p=[];const where=(v,sql)=>{p.push(v);clauses.push(sql.replace('?',`$${p.length}`))};
 if(desde)where(desde,'a.creado_en >= ?::date');if(hasta)where(hasta,"a.creado_en < (?::date + interval '1 day')");
 if(accion)where(`%${accion}%`,'a.accion ILIKE ?');
 if(usuario)where(`%${usuario}%`,"(u.nombre_usuario ILIKE ? OR u.nombre_completo ILIKE ?)");
 // Si usuario se pasa como texto, usar un solo parámetro en ambos términos.
 if(usuario)clauses[clauses.length-1]=`(u.nombre_usuario ILIKE $${p.length} OR u.nombre_completo ILIKE $${p.length})`;
 if(tipo==='SEGURIDAD')clauses.push("(a.entidad='autenticacion' OR a.accion LIKE 'LOGIN_%' OR a.accion LIKE 'SEGURIDAD_%' OR a.accion LIKE 'ACCESO_DENEGADO%')");
 if(tipo==='ADMINISTRATIVA')clauses.push("(a.entidad<>'autenticacion' AND a.accion NOT LIKE 'LOGIN_%')");
 const w=clauses.length?'WHERE '+clauses.join(' AND '):'';
 const count=await query(`SELECT COUNT(*)::int total FROM auditoria a LEFT JOIN usuarios u ON u.id=a.usuario_id ${w}`,p);
 const r=await query(`SELECT a.id,a.creado_en,a.accion,a.entidad,a.entidad_id,a.detalle,a.direccion_ip,u.nombre_usuario,u.nombre_completo FROM auditoria a LEFT JOIN usuarios u ON u.id=a.usuario_id ${w} ORDER BY a.creado_en DESC,a.id DESC LIMIT $${p.length+1} OFFSET $${p.length+2}`,[...p,limite,(pagina-1)*limite]);
 res.set('Cache-Control','no-store');res.json({total:count.rows[0].total,pagina,limite,registros:r.rows});
}));
auditoriaRouter.get('/dispositivos',asyncHandler(async(req,res)=>{
 const limite=bounded(req.query.limite,40,100);if(!limite)return res.status(400).json({message:'Límite inválido.'});
 const r=await query(`SELECT b.id,b.creado_en,b.tipo_evento,b.estado_anterior,b.estado_nuevo,b.detalle,d.codigo,d.nombre FROM bitacora_dispositivos b JOIN dispositivos d ON d.id=b.dispositivo_id ORDER BY b.creado_en DESC,b.id DESC LIMIT $1`,[limite]);res.json(r.rows);
}));
