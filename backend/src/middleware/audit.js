import { query } from '../config/db.js';
export async function registrarAuditoria({usuarioId=null,accion,entidad,entidadId=null,detalle={},req=null}){
  try{await query(`INSERT INTO auditoria(usuario_id,accion,entidad,entidad_id,detalle,direccion_ip,agente_usuario) VALUES($1,$2,$3,$4,$5,$6,$7)`,[usuarioId,accion,entidad,entidadId,detalle,req?.ip||null,req?.headers?.['user-agent']||null]);}
  catch(e){console.error('[AUDITORIA] No se pudo registrar:',e.message)}
}
