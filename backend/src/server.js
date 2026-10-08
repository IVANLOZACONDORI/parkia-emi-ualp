import { app } from './app.js';
import { env } from './config/env.js';
import { query } from './config/db.js';
import { asegurarEstructuraAutenticacion, asegurarUsuariosDemo } from './modules/autenticacion/bootstrap.service.js';

async function iniciar() {
  try {
    await query('SELECT 1');
    await asegurarEstructuraAutenticacion();
    await asegurarUsuariosDemo();
    await query(`ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS propietario_usuario_id UUID REFERENCES usuarios(id), ADD COLUMN IF NOT EXISTS foto_vehiculo TEXT, ADD COLUMN IF NOT EXISTS foto_placa TEXT`);
    await query(`ALTER TABLE eventos_acceso ADD COLUMN IF NOT EXISTS evidencia_tipo VARCHAR(30) DEFAULT 'SIN_EVIDENCIA'`);
    app.listen(env.port, () => console.log(`PARKIA EMI UALP disponible en http://localhost:${env.port}`));
  } catch (error) {
    console.error('No se pudo iniciar PARKIA:', error);
    process.exit(1);
  }
}

iniciar();
