CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PARKIA EMI UALP - Modelo físico PostgreSQL en castellano.
CREATE TABLE IF NOT EXISTS zonas_parqueo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  referencia_ubicacion VARCHAR(220),
  tipo_zona VARCHAR(30) NOT NULL DEFAULT 'GENERAL' CHECK(tipo_zona IN ('GENERAL','ESTUDIANTES','AUTORIDADES','ADMINISTRATIVO','VISITANTES')),
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK(estado IN ('ACTIVA','MANTENIMIENTO','INACTIVA')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(90) UNIQUE NOT NULL,
  modulo VARCHAR(70) NOT NULL,
  descripcion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_permisos (
  rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_usuario VARCHAR(60) UNIQUE NOT NULL,
  hash_contrasena TEXT NOT NULL,
  nombre_completo VARCHAR(170) NOT NULL,
  correo VARCHAR(170),
  area_institucional VARCHAR(120),
  rol_id UUID NOT NULL REFERENCES roles(id),
  zona_asignada_id UUID REFERENCES zonas_parqueo(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO','DESHABILITADO','BLOQUEADO')),
  intentos_fallidos INT NOT NULL DEFAULT 0,
  bloqueado_hasta TIMESTAMPTZ,
  ultimo_ingreso_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS ix_usuarios_nombre_usuario_ci ON usuarios(LOWER(nombre_usuario));
CREATE INDEX IF NOT EXISTS ix_usuarios_bloqueado_hasta ON usuarios(bloqueado_hasta) WHERE bloqueado_hasta IS NOT NULL;

CREATE TABLE IF NOT EXISTS sesiones_autenticacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  jti UUID UNIQUE NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL,
  revocado_en TIMESTAMPTZ,
  direccion_ip VARCHAR(80),
  agente_usuario VARCHAR(500)
);
CREATE INDEX IF NOT EXISTS ix_sesiones_auth_usuario ON sesiones_autenticacion(usuario_id);
CREATE INDEX IF NOT EXISTS ix_sesiones_auth_validas ON sesiones_autenticacion(jti,usuario_id,expira_en) WHERE revocado_en IS NULL;

CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(20) NOT NULL,
  tipo_vehiculo VARCHAR(40) NOT NULL DEFAULT 'AUTOMOVIL',
  marca VARCHAR(80),
  modelo VARCHAR(80),
  color VARCHAR(60),
  referencia_propietario VARCHAR(170),
  categoria_usuario VARCHAR(40) NOT NULL DEFAULT 'INSTITUCIONAL' CHECK(categoria_usuario IN ('MILITAR','CIVIL','ADMINISTRATIVO','ESTUDIANTE','VISITANTE','PROVEEDOR','INSTITUCIONAL')),
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO','SUSPENDIDO','RETIRADO')),
  creado_por UUID REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_vehiculo_placa_activa ON vehiculos(UPPER(placa)) WHERE estado='ACTIVO';

CREATE TABLE IF NOT EXISTS autorizaciones_vehiculares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
  tipo_autorizacion VARCHAR(30) NOT NULL DEFAULT 'PERMANENTE' CHECK(tipo_autorizacion IN ('PERMANENTE','TEMPORAL','EXCEPCIONAL')),
  valido_desde TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valido_hasta TIMESTAMPTZ,
  motivo TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK(estado IN ('ACTIVA','SUSPENDIDA','VENCIDA','REVOCADA')),
  autorizado_por UUID REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(40) UNIQUE NOT NULL,
  tipo_dispositivo VARCHAR(35) NOT NULL CHECK(tipo_dispositivo IN ('CAMARA_ACCESO_LPR','CAMARA_OCUPACION','BARRERA','NODO_PROCESAMIENTO','RED','OTRO')),
  nombre VARCHAR(130) NOT NULL,
  zona_id UUID REFERENCES zonas_parqueo(id),
  punto_acceso VARCHAR(120),
  direccion_ip INET,
  ubicacion_logica VARCHAR(220),
  estado VARCHAR(20) NOT NULL DEFAULT 'EN_LINEA' CHECK(estado IN ('EN_LINEA','FUERA_LINEA','MANTENIMIENTO','ERROR','DESHABILITADO')),
  parametros JSONB NOT NULL DEFAULT '{}'::jsonb,
  ultima_comunicacion_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plazas_parqueo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id UUID NOT NULL REFERENCES zonas_parqueo(id),
  codigo VARCHAR(30) NOT NULL,
  tipo_plaza VARCHAR(30) NOT NULL DEFAULT 'ESTANDAR' CHECK(tipo_plaza IN ('ESTANDAR','MOTOCICLETA','ACCESIBLE','OFICIAL','VISITANTE')),
  estado_actual VARCHAR(25) NOT NULL DEFAULT 'SIN_DATOS' CHECK(estado_actual IN ('LIBRE','OCUPADA','FUERA_SERVICIO','SIN_DATOS')),
  confianza NUMERIC(5,2),
  region_interes JSONB,
  camara_id UUID REFERENCES dispositivos(id) DEFERRABLE INITIALLY DEFERRED,
  coordenada_x INT NOT NULL DEFAULT 1,
  coordenada_y INT NOT NULL DEFAULT 1,
  habilitada BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(zona_id, codigo)
);

CREATE TABLE IF NOT EXISTS eventos_acceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_evento VARCHAR(20) NOT NULL CHECK(tipo_evento IN ('INGRESO','SALIDA')),
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  punto_acceso VARCHAR(120) NOT NULL,
  camara_acceso_id UUID REFERENCES dispositivos(id),
  placa_detectada VARCHAR(20),
  vehiculo_id UUID REFERENCES vehiculos(id),
  imagen_url TEXT,
  confianza_reconocimiento NUMERIC(5,2),
  resultado_validacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK(resultado_validacion IN ('AUTORIZADO','DENEGADO','PENDIENTE','MANUAL','INCIERTO')),
  autorizado_manual BOOLEAN NOT NULL DEFAULT FALSE,
  autorizado_por UUID REFERENCES usuarios(id),
  observaciones TEXT,
  origen VARCHAR(30) NOT NULL DEFAULT 'CAMARA_IA' CHECK(origen IN ('CAMARA_IA','MANUAL','API','SIMULADOR')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_eventos_acceso_fecha ON eventos_acceso(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS ix_eventos_acceso_placa ON eventos_acceso(UPPER(placa_detectada));

CREATE TABLE IF NOT EXISTS resultados_reconocimiento_placa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_acceso_id UUID NOT NULL REFERENCES eventos_acceso(id) ON DELETE CASCADE,
  placa_detectada VARCHAR(20),
  confianza NUMERIC(5,2),
  resultado_crudo JSONB,
  estado_validacion VARCHAR(30) NOT NULL DEFAULT 'AUTOMATICO' CHECK(estado_validacion IN ('AUTOMATICO','MANUAL_CONFIRMADO','MANUAL_CORREGIDO','RECHAZADO')),
  placa_corregida VARCHAR(20),
  validado_por UUID REFERENCES usuarios(id),
  validado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos_ocupacion (
  id BIGSERIAL PRIMARY KEY,
  plaza_id UUID NOT NULL REFERENCES plazas_parqueo(id),
  estado_anterior VARCHAR(25),
  estado_nuevo VARCHAR(25) NOT NULL CHECK(estado_nuevo IN ('LIBRE','OCUPADA','FUERA_SERVICIO','SIN_DATOS')),
  confianza NUMERIC(5,2),
  camara_id UUID REFERENCES dispositivos(id),
  origen VARCHAR(30) NOT NULL DEFAULT 'VISION_IA' CHECK(origen IN ('VISION_IA','MANUAL','SIMULADOR','DISPOSITIVO')),
  imagen_url TEXT,
  cambiado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_eventos_ocupacion_plaza_fecha ON eventos_ocupacion(plaza_id,cambiado_en DESC);

CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_alerta VARCHAR(50) NOT NULL,
  severidad VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK(severidad IN ('INFO','BAJA','MEDIA','ALTA','CRITICA')),
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NOT NULL,
  estado VARCHAR(25) NOT NULL DEFAULT 'ABIERTA' CHECK(estado IN ('ABIERTA','ATENDIDA','CERRADA')),
  zona_id UUID REFERENCES zonas_parqueo(id),
  dispositivo_id UUID REFERENCES dispositivos(id),
  plaza_id UUID REFERENCES plazas_parqueo(id),
  evento_origen_id VARCHAR(80),
  asignado_a UUID REFERENCES usuarios(id),
  abierta_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendida_en TIMESTAMPTZ,
  cerrada_en TIMESTAMPTZ,
  cerrada_por UUID REFERENCES usuarios(id)
);
CREATE INDEX IF NOT EXISTS ix_alertas_estado_severidad ON alertas(estado,severidad,abierta_en DESC);

CREATE TABLE IF NOT EXISTS acciones_alerta (
  id BIGSERIAL PRIMARY KEY,
  alerta_id UUID NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  accion VARCHAR(30) NOT NULL,
  comentario TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bitacora_dispositivos (
  id BIGSERIAL PRIMARY KEY,
  dispositivo_id UUID NOT NULL REFERENCES dispositivos(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL,
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20),
  detalle JSONB,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditoria (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  accion VARCHAR(90) NOT NULL,
  entidad VARCHAR(90) NOT NULL,
  entidad_id VARCHAR(90),
  detalle JSONB NOT NULL DEFAULT '{}'::jsonb,
  direccion_ip INET,
  agente_usuario TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_auditoria_fecha ON auditoria(creado_en DESC);

CREATE TABLE IF NOT EXISTS respaldos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitado_por UUID REFERENCES usuarios(id),
  tipo_respaldo VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK(tipo_respaldo IN ('MANUAL','PROGRAMADO','RESTAURACION')),
  nombre_archivo TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO' CHECK(estado IN ('SOLICITADO','EJECUTANDO','EXITOSO','FALLIDO','DESHABILITADO')),
  mensaje TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalizado_en TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave VARCHAR(100) PRIMARY KEY,
  valor JSONB NOT NULL,
  descripcion TEXT,
  actualizado_por UUID REFERENCES usuarios(id),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion() RETURNS TRIGGER AS $$
BEGIN NEW.actualizado_en=NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_actualizado ON usuarios;
CREATE TRIGGER trg_usuarios_actualizado BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
DROP TRIGGER IF EXISTS trg_vehiculos_actualizado ON vehiculos;
CREATE TRIGGER trg_vehiculos_actualizado BEFORE UPDATE ON vehiculos FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
DROP TRIGGER IF EXISTS trg_zonas_actualizado ON zonas_parqueo;
CREATE TRIGGER trg_zonas_actualizado BEFORE UPDATE ON zonas_parqueo FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
DROP TRIGGER IF EXISTS trg_dispositivos_actualizado ON dispositivos;
CREATE TRIGGER trg_dispositivos_actualizado BEFORE UPDATE ON dispositivos FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
