CREATE OR REPLACE VIEW vista_disponibilidad_zonas AS
SELECT z.id zona_id,z.codigo,z.nombre,z.tipo_zona,z.estado,
       COUNT(p.id) total_plazas,
       COUNT(p.id) FILTER (WHERE p.estado_actual='LIBRE' AND p.habilitada) plazas_libres,
       COUNT(p.id) FILTER (WHERE p.estado_actual='OCUPADA' AND p.habilitada) plazas_ocupadas,
       COUNT(p.id) FILTER (WHERE p.estado_actual='FUERA_SERVICIO' OR NOT p.habilitada) plazas_fuera_servicio,
       COUNT(p.id) FILTER (WHERE p.estado_actual='SIN_DATOS') plazas_sin_datos,
       ROUND(100.0 * COUNT(p.id) FILTER (WHERE p.estado_actual='OCUPADA') / NULLIF(COUNT(p.id),0),2) porcentaje_ocupacion
FROM zonas_parqueo z LEFT JOIN plazas_parqueo p ON p.zona_id=z.id
GROUP BY z.id,z.codigo,z.nombre,z.tipo_zona,z.estado;

CREATE OR REPLACE VIEW vista_ultimos_eventos_acceso AS
SELECT e.id,e.tipo_evento,e.fecha_hora,e.punto_acceso,e.placa_detectada,e.confianza_reconocimiento,e.resultado_validacion,
       v.referencia_propietario,v.categoria_usuario,d.nombre camara_acceso
FROM eventos_acceso e LEFT JOIN vehiculos v ON v.id=e.vehiculo_id LEFT JOIN dispositivos d ON d.id=e.camara_acceso_id;

CREATE OR REPLACE FUNCTION cambiar_estado_plaza(p_plaza UUID,p_estado VARCHAR,p_confianza NUMERIC,p_camara UUID,p_origen VARCHAR DEFAULT 'VISION_IA')
RETURNS plazas_parqueo AS $$
DECLARE anterior VARCHAR; fila plazas_parqueo;
BEGIN
 SELECT estado_actual INTO anterior FROM plazas_parqueo WHERE id=p_plaza FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Plaza no encontrada'; END IF;
 UPDATE plazas_parqueo SET estado_actual=p_estado,confianza=p_confianza,camara_id=COALESCE(p_camara,camara_id),actualizado_en=NOW() WHERE id=p_plaza RETURNING * INTO fila;
 INSERT INTO eventos_ocupacion(plaza_id,estado_anterior,estado_nuevo,confianza,camara_id,origen) VALUES(p_plaza,anterior,p_estado,p_confianza,p_camara,p_origen);
 RETURN fila;
END; $$ LANGUAGE plpgsql;
