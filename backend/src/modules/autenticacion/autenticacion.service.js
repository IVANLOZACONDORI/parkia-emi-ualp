import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { query } from '../../config/db.js';
import { env } from '../../config/env.js';
import { verifyPassword } from '../../utils/security.js';
import { registrarAuditoria } from '../../middleware/audit.js';
import { verifyCaptcha } from './captcha.service.js';

function errorHttp(message, status, extra = {}) {
  const e = new Error(message);
  e.status = status;
  Object.assign(e, extra);
  return e;
}

function normalizarUsuario(v) {
  return String(v || '').trim().slice(0, 60);
}

function validarEntrada({ nombreUsuario, contrasena, captchaToken, captchaRespuesta }) {
  if (!nombreUsuario || !contrasena || !captchaToken || captchaRespuesta === undefined || captchaRespuesta === null || captchaRespuesta === '') {
    throw errorHttp('Usuario, contraseña y CAPTCHA son obligatorios.', 400);
  }
  if (String(nombreUsuario).length > 60 || String(contrasena).length > 256 || String(captchaRespuesta).length > 8) {
    throw errorHttp('Los datos ingresados no son válidos.', 400);
  }
}

function segundosHasta(fecha) {
  return Math.max(1, Math.ceil((new Date(fecha).getTime() - Date.now()) / 1000));
}

export async function iniciarSesion({ nombreUsuario, contrasena, captchaToken, captchaRespuesta, req }) {
  validarEntrada({ nombreUsuario, contrasena, captchaToken, captchaRespuesta });
  const usuarioNormalizado = normalizarUsuario(nombreUsuario);

  if (!verifyCaptcha(captchaToken, captchaRespuesta)) {
    await registrarAuditoria({ accion: 'LOGIN_CAPTCHA_FALLIDO', entidad: 'autenticacion', detalle: { nombreUsuario: usuarioNormalizado }, req });
    throw errorHttp('CAPTCHA inválido o vencido. Genere uno nuevo e intente otra vez.', 401);
  }

  const r = await query(`
    SELECT
      u.id,u.nombre_usuario,u.hash_contrasena,u.nombre_completo,u.estado,u.intentos_fallidos,u.bloqueado_hasta,
      u.rol_id,u.zona_asignada_id,
      r.codigo rol_codigo,r.nombre rol_nombre,r.activo rol_activo,
      z.codigo zona_codigo,z.nombre zona_nombre,
      COALESCE(array_agg(p.codigo ORDER BY p.codigo) FILTER (WHERE p.codigo IS NOT NULL),'{}') permisos
    FROM usuarios u
    JOIN roles r ON r.id=u.rol_id
    LEFT JOIN zonas_parqueo z ON z.id=u.zona_asignada_id
    LEFT JOIN roles_permisos rp ON rp.rol_id=r.id
    LEFT JOIN permisos p ON p.id=rp.permiso_id
    WHERE LOWER(u.nombre_usuario)=LOWER($1)
    GROUP BY u.id,r.id,z.id
    LIMIT 1
  `, [usuarioNormalizado]);

  if (!r.rowCount) {
    await registrarAuditoria({ accion: 'LOGIN_FALLIDO', entidad: 'autenticacion', detalle: { nombreUsuario: usuarioNormalizado, motivo: 'USUARIO_DESCONOCIDO' }, req });
    throw errorHttp('Credenciales incorrectas.', 401);
  }

  const u = r.rows[0];

  if (u.estado !== 'ACTIVO' || !u.rol_activo) {
    await registrarAuditoria({ usuarioId: u.id, accion: 'LOGIN_DENEGADO', entidad: 'autenticacion', detalle: { motivo: 'CUENTA_O_ROL_INACTIVO' }, req });
    throw errorHttp('La cuenta no se encuentra habilitada para ingresar.', 403);
  }

  if (u.bloqueado_hasta && new Date(u.bloqueado_hasta) > new Date()) {
    const retryAfterSeconds = segundosHasta(u.bloqueado_hasta);
    throw errorHttp('Cuenta temporalmente bloqueada.', 423, { retryAfterSeconds });
  }

  if (!verifyPassword(contrasena, u.hash_contrasena)) {
    const intentos = Number(u.intentos_fallidos || 0) + 1;
    const debeBloquear = intentos >= env.loginMaxAttempts;
    const bloqueadoHasta = debeBloquear ? new Date(Date.now() + env.loginLockMinutes * 60 * 1000) : null;

    await query(
      'UPDATE usuarios SET intentos_fallidos=$2,bloqueado_hasta=$3,actualizado_en=NOW() WHERE id=$1',
      [u.id, debeBloquear ? 0 : intentos, bloqueadoHasta]
    );
    await registrarAuditoria({
      usuarioId: u.id,
      accion: 'LOGIN_FALLIDO',
      entidad: 'autenticacion',
      detalle: { motivo: 'CONTRASENA_INCORRECTA', bloqueoTemporal: debeBloquear },
      req
    });

    if (debeBloquear) {
      throw errorHttp('Cuenta temporalmente bloqueada.', 423, { retryAfterSeconds: env.loginLockMinutes * 60 });
    }
    throw errorHttp('Credenciales incorrectas.', 401);
  }

  const permisos = Array.isArray(u.permisos) ? u.permisos : [];
  const usuario = {
    sub: u.id,
    nombreUsuario: u.nombre_usuario,
    nombreCompleto: u.nombre_completo,
    rol: u.rol_codigo,
    nombreRol: u.rol_nombre,
    permisos,
    zonaAsignadaId: u.zona_asignada_id,
    zonaCodigo: u.zona_codigo,
    zonaNombre: u.zona_nombre
  };

  const jti = crypto.randomUUID();
  const token = jwt.sign(usuario, env.jwtSecret, { expiresIn: env.jwtExpiresIn, jwtid: jti });
  const decoded = jwt.decode(token);
  const expiraEn = new Date(Number(decoded.exp) * 1000);

  await query('UPDATE usuarios SET intentos_fallidos=0,bloqueado_hasta=NULL,ultimo_ingreso_en=NOW(),actualizado_en=NOW() WHERE id=$1', [u.id]);
  await query(
    `INSERT INTO sesiones_autenticacion(usuario_id,jti,expira_en,direccion_ip,agente_usuario)
     VALUES($1,$2,$3,$4,$5)`,
    [u.id, jti, expiraEn, req?.ip || null, String(req?.get?.('user-agent') || '').slice(0, 500) || null]
  );
  await registrarAuditoria({ usuarioId: u.id, accion: 'LOGIN_EXITOSO', entidad: 'autenticacion', detalle: { rol: u.rol_codigo }, req });

  return { token, usuario };
}

export async function cerrarSesion({ req }) {
  if (!req?.user?.jti) return { ok: true };
  await query('UPDATE sesiones_autenticacion SET revocado_en=COALESCE(revocado_en,NOW()) WHERE jti=$1 AND usuario_id=$2', [req.user.jti, req.user.sub]);
  await registrarAuditoria({ usuarioId: req.user.sub, accion: 'LOGOUT', entidad: 'autenticacion', detalle: { sesion: req.user.jti }, req });
  return { ok: true };
}
