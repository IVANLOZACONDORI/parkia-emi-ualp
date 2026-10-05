import jwt from 'jsonwebtoken';
import { query } from '../../config/db.js';
import { env } from '../../config/env.js';
import { verifyPassword } from '../../utils/security.js';
import { registrarAuditoria } from '../../middleware/audit.js';
import { verifyCaptcha } from './captcha.service.js';
async function obtenerPermisos(rolId){const r=await query(`SELECT p.codigo FROM permisos p JOIN roles_permisos rp ON rp.permiso_id=p.id WHERE rp.rol_id=$1 ORDER BY p.codigo`,[rolId]);return r.rows.map(x=>x.codigo)}
export async function iniciarSesion({nombreUsuario,contrasena,captchaToken,captchaRespuesta,req}){
 if(!nombreUsuario||!contrasena||!captchaToken||captchaRespuesta===undefined){const e=new Error('Usuario, contraseña y CAPTCHA son obligatorios.');e.status=400;throw e}
 if(!verifyCaptcha(captchaToken,captchaRespuesta)){await registrarAuditoria({accion:'LOGIN_CAPTCHA_FALLIDO',entidad:'autenticacion',detalle:{nombreUsuario},req});const e=new Error('CAPTCHA inválido o vencido.');e.status=401;throw e}
 const r=await query(`SELECT u.*,r.codigo rol_codigo,r.nombre rol_nombre,z.codigo zona_codigo,z.nombre zona_nombre FROM usuarios u JOIN roles r ON r.id=u.rol_id LEFT JOIN zonas_parqueo z ON z.id=u.zona_asignada_id WHERE LOWER(u.nombre_usuario)=LOWER($1)`,[nombreUsuario]);
 if(!r.rowCount){await registrarAuditoria({accion:'LOGIN_FALLIDO',entidad:'autenticacion',detalle:{nombreUsuario,motivo:'USUARIO_DESCONOCIDO'},req});const e=new Error('Credenciales incorrectas.');e.status=401;throw e}
 const u=r.rows[0]; if(u.estado!=='ACTIVO'){const e=new Error('Cuenta deshabilitada o bloqueada.');e.status=403;throw e}
 if(u.bloqueado_hasta&&new Date(u.bloqueado_hasta)>new Date()){const e=new Error('Cuenta temporalmente bloqueada.');e.status=423;throw e}
 if(!verifyPassword(contrasena,u.hash_contrasena)){const intentos=Number(u.intentos_fallidos||0)+1;const bloqueo=intentos>=5?new Date(Date.now()+15*60*1000):null;await query('UPDATE usuarios SET intentos_fallidos=$2,bloqueado_hasta=$3 WHERE id=$1',[u.id,intentos>=5?0:intentos,bloqueo]);await registrarAuditoria({usuarioId:u.id,accion:'LOGIN_FALLIDO',entidad:'autenticacion',detalle:{motivo:'CONTRASENA_INCORRECTA'},req});const e=new Error(bloqueo?'Cuenta bloqueada por 15 minutos.':'Credenciales incorrectas.');e.status=401;throw e}
 const permisos=await obtenerPermisos(u.rol_id);await query('UPDATE usuarios SET intentos_fallidos=0,bloqueado_hasta=NULL,ultimo_ingreso_en=NOW() WHERE id=$1',[u.id]);
 const payload={sub:u.id,nombreUsuario:u.nombre_usuario,nombreCompleto:u.nombre_completo,rol:u.rol_codigo,nombreRol:u.rol_nombre,permisos,zonaAsignadaId:u.zona_asignada_id,zonaCodigo:u.zona_codigo,zonaNombre:u.zona_nombre};
 const token=jwt.sign(payload,env.jwtSecret,{expiresIn:env.jwtExpiresIn}); await registrarAuditoria({usuarioId:u.id,accion:'LOGIN_EXITOSO',entidad:'autenticacion',detalle:{rol:u.rol_codigo},req});
 return {token,usuario:payload};
}
