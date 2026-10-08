-- PARKIA V15: ejecutar idempotentemente sobre instalaciones existentes.
CREATE INDEX IF NOT EXISTS ix_auditoria_accion_fecha ON auditoria(accion, creado_en DESC);
CREATE INDEX IF NOT EXISTS ix_auditoria_usuario_fecha ON auditoria(usuario_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS ix_bitacora_dispositivos_fecha ON bitacora_dispositivos(creado_en DESC);
CREATE INDEX IF NOT EXISTS ix_respaldos_fecha ON respaldos(creado_en DESC);
CREATE OR REPLACE FUNCTION parkia_bitacora_dispositivo_estado() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.estado IS DISTINCT FROM NEW.estado THEN
   INSERT INTO bitacora_dispositivos(dispositivo_id,tipo_evento,estado_anterior,estado_nuevo,detalle)
   VALUES(NEW.id,'CAMBIO_ESTADO',OLD.estado,NEW.estado,
     jsonb_build_object('codigo', NEW.codigo, 'nombre', NEW.nombre, 'origen','CAMBIO_DISPOSITIVO'));
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_parkia_dispositivo_estado ON dispositivos;
CREATE TRIGGER trg_parkia_dispositivo_estado AFTER UPDATE OF estado ON dispositivos
FOR EACH ROW EXECUTE FUNCTION parkia_bitacora_dispositivo_estado();
