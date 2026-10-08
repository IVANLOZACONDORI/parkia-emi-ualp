-- Migración idempotente V11, compatible con la tabla existente.
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS clave_incidente VARCHAR(160);
CREATE UNIQUE INDEX IF NOT EXISTS ux_alertas_incidente_activo ON alertas(clave_incidente) WHERE clave_incidente IS NOT NULL AND estado <> 'CERRADA';
CREATE INDEX IF NOT EXISTS ix_acciones_alerta_fecha ON acciones_alerta(alerta_id,creado_en);
