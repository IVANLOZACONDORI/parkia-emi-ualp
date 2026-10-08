import { query } from '../../config/db.js';
import { hashPassword } from '../../utils/security.js';

const usuariosDemo = [
  ['admin','PARKIA2026!Admin','Administrador PARKIA','admin@emi.edu.bo','TIC','ADMINISTRADOR_SISTEMA',null],
  ['director','PARKIA2026!Dir','Director de Grado','director@emi.edu.bo','Dirección de Grado','DIRECCION_GRADO',null],
  ['operaciones','PARKIA2026!Ops','Jefe de Operaciones','operaciones@emi.edu.bo','Operaciones','JEFE_OPERACIONES',null],
  ['guardia','PARKIA2026!Seg','Personal de Guardia','guardia@emi.edu.bo','Seguridad','PERSONAL_GUARDIA',null],
  ['soporte','PARKIA2026!Tic','Soporte TIC','tic@emi.edu.bo','TIC','SOPORTE_TIC',null],
  ['infraestructura','PARKIA2026!Infra','Unidad de Infraestructura','infra@emi.edu.bo','Infraestructura','INFRAESTRUCTURA',null],
  ['rrhh','PARKIA2026!RRHH','Consulta RRHH','rrhh@emi.edu.bo','Recursos Humanos','RECURSOS_HUMANOS',null],
  ['estudiante','PARKIA2026!Est','Estudiante de demostración','estudiante@est.emi.edu.bo','Estudiantes','ESTUDIANTE','Z-EST-TRASERA']
];

export async function asegurarEstructuraAutenticacion() {
  await query(`INSERT INTO permisos(codigo,modulo,descripcion) VALUES('usuarios.permisos','Usuarios','Administrar privilegios asignados a roles.') ON CONFLICT(codigo) DO NOTHING`);
  await query(`INSERT INTO roles_permisos(rol_id,permiso_id) SELECT r.id,p.id FROM roles r CROSS JOIN permisos p WHERE r.codigo='ADMINISTRADOR_SISTEMA' AND p.codigo='usuarios.permisos' ON CONFLICT DO NOTHING`);
  // El guardia dispone de consulta global de plazas, sin permisos de administración.
  await query(`INSERT INTO roles_permisos(rol_id,permiso_id) SELECT r.id,p.id FROM roles r CROSS JOIN permisos p WHERE r.codigo='PERSONAL_GUARDIA' AND p.codigo IN ('panel.ver','parqueo.ver') ON CONFLICT DO NOTHING`);
  await query('CREATE INDEX IF NOT EXISTS ix_usuarios_nombre_usuario_ci ON usuarios(LOWER(nombre_usuario))');
  await query('CREATE INDEX IF NOT EXISTS ix_usuarios_bloqueado_hasta ON usuarios(bloqueado_hasta) WHERE bloqueado_hasta IS NOT NULL');
  await query(`
    CREATE TABLE IF NOT EXISTS sesiones_autenticacion (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      jti UUID UNIQUE NOT NULL,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expira_en TIMESTAMPTZ NOT NULL,
      revocado_en TIMESTAMPTZ,
      direccion_ip VARCHAR(80),
      agente_usuario VARCHAR(500)
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS ix_sesiones_auth_usuario ON sesiones_autenticacion(usuario_id)');
  await query('CREATE INDEX IF NOT EXISTS ix_sesiones_auth_validas ON sesiones_autenticacion(jti,usuario_id,expira_en) WHERE revocado_en IS NULL');
}

export async function asegurarUsuariosDemo() {
  for (const [nombreUsuario,contrasena,nombreCompleto,correo,area,codigoRol,codigoZona] of usuariosDemo) {
    const existe = await query('SELECT 1 FROM usuarios WHERE nombre_usuario=$1', [nombreUsuario]);
    if (existe.rowCount) continue;
    const rol = await query('SELECT id FROM roles WHERE codigo=$1', [codigoRol]);
    if (!rol.rowCount) continue;
    let zonaId = null;
    if (codigoZona) {
      const z = await query('SELECT id FROM zonas_parqueo WHERE codigo=$1', [codigoZona]);
      zonaId = z.rows[0]?.id || null;
    }
    await query(
      `INSERT INTO usuarios(nombre_usuario,hash_contrasena,nombre_completo,correo,area_institucional,rol_id,zona_asignada_id)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [nombreUsuario, hashPassword(contrasena), nombreCompleto, correo, area, rol.rows[0].id, zonaId]
    );
  }
}
