import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Sesión no válida o ausente.' });

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'La sesión expiró o dejó de ser válida.' });
  }

  if (!payload.jti || !payload.sub) return res.status(401).json({ message: 'La sesión dejó de ser válida. Inicie sesión nuevamente.' });

  try {
    const r = await query(`
      SELECT
        s.jti,s.expira_en,s.revocado_en,
        u.id usuario_id,u.nombre_usuario,u.nombre_completo,u.estado,u.zona_asignada_id,
        r.codigo rol_codigo,r.nombre rol_nombre,r.activo rol_activo,
        z.codigo zona_codigo,z.nombre zona_nombre,
        COALESCE(array_agg(p.codigo ORDER BY p.codigo) FILTER (WHERE p.codigo IS NOT NULL),'{}') permisos
      FROM sesiones_autenticacion s
      JOIN usuarios u ON u.id=s.usuario_id
      JOIN roles r ON r.id=u.rol_id
      LEFT JOIN zonas_parqueo z ON z.id=u.zona_asignada_id
      LEFT JOIN roles_permisos rp ON rp.rol_id=r.id
      LEFT JOIN permisos p ON p.id=rp.permiso_id
      WHERE s.jti=$1 AND s.usuario_id=$2
      GROUP BY s.id,u.id,r.id,z.id
      LIMIT 1
    `, [payload.jti, payload.sub]);

    if (!r.rowCount) return res.status(401).json({ message: 'La sesión ya no está disponible.' });
    const s = r.rows[0];
    if (s.revocado_en || new Date(s.expira_en) <= new Date()) return res.status(401).json({ message: 'La sesión expiró o fue cerrada.' });
    if (s.estado !== 'ACTIVO' || !s.rol_activo) return res.status(401).json({ message: 'La cuenta ya no está habilitada para continuar.' });

    req.user = {
      sub: s.usuario_id,
      jti: s.jti,
      nombreUsuario: s.nombre_usuario,
      nombreCompleto: s.nombre_completo,
      rol: s.rol_codigo,
      nombreRol: s.rol_nombre,
      // Aislamiento defensivo: el estudiante no hereda accesos administrativos por error de configuración.
      permisos: s.rol_codigo === 'ESTUDIANTE' ? ['estudiante.mi_parqueo'] : (Array.isArray(s.permisos) ? s.permisos : []),
      zonaAsignadaId: s.zona_asignada_id,
      zonaCodigo: s.zona_codigo,
      zonaNombre: s.zona_nombre
    };
    next();
  } catch (error) {
    next(error);
  }
}

export const requirePermission = (...requeridos) => (req, res, next) => {
  const permisos = new Set(req.user?.permisos || []);
  if (permisos.has('*') || requeridos.some(p => permisos.has(p))) return next();
  return res.status(403).json({ message: 'No tiene permisos para realizar esta acción.' });
};
