
-- PARKIA V17 · Mapeo real del campus EMI UALP
-- Actualiza la nomenclatura y registra plazas/cámaras de acuerdo con la distribución validada en campo.

INSERT INTO zonas_parqueo(codigo,nombre,descripcion,referencia_ubicacion,tipo_zona)
VALUES
('Z-EST-TRASERA','Zona Estudiantes - Sector Trasero','Parqueo de estudiantes (motos) ubicado en la parte trasera del campus.','Parte trasera del campus EMI UALP','ESTUDIANTES'),
('Z-AUTORIDADES','Zona Autoridades - Frente Izquierdo','Parqueo institucional de autoridades ubicado en el frente izquierdo del campus.','Frente izquierdo del campus EMI UALP','AUTORIDADES'),
('Z-ADMIN','Zona Administrativa - Frente Derecho','Parqueo para personal administrativo ubicado en el frente derecho del campus.','Frente derecho del campus EMI UALP','ADMINISTRATIVO')
ON CONFLICT(codigo) DO NOTHING;

UPDATE zonas_parqueo SET
  nombre=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'Zona Estudiantes - Sector Trasero'
    WHEN 'Z-AUTORIDADES' THEN 'Zona Autoridades - Frente Izquierdo'
    WHEN 'Z-ADMIN' THEN 'Zona Administrativa - Frente Derecho'
    ELSE nombre END,
  descripcion=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'Parqueo de estudiantes (motos) ubicado en la parte trasera del campus.'
    WHEN 'Z-AUTORIDADES' THEN 'Parqueo institucional de autoridades ubicado en el frente izquierdo del campus.'
    WHEN 'Z-ADMIN' THEN 'Parqueo para personal administrativo ubicado en el frente derecho del campus.'
    ELSE descripcion END,
  referencia_ubicacion=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'Parte trasera del campus EMI UALP'
    WHEN 'Z-AUTORIDADES' THEN 'Frente izquierdo del campus EMI UALP'
    WHEN 'Z-ADMIN' THEN 'Frente derecho del campus EMI UALP'
    ELSE referencia_ubicacion END,
  tipo_zona=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'ESTUDIANTES'
    WHEN 'Z-AUTORIDADES' THEN 'AUTORIDADES'
    WHEN 'Z-ADMIN' THEN 'ADMINISTRATIVO'
    ELSE tipo_zona END
WHERE codigo IN ('Z-EST-TRASERA','Z-AUTORIDADES','Z-ADMIN');

INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,punto_acceso,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-LPR-ING-01','CAMARA_ACCESO_LPR','Cámara IA de control de placas - acceso principal',NULL,'INGRESO PRINCIPAL','Control general de ingreso vehicular','EN_LINEA',NOW()
WHERE NOT EXISTS (SELECT 1 FROM dispositivos WHERE codigo='CAM-LPR-ING-01');

INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-OCP-EST-01','CAMARA_OCUPACION','Cámara IA ocupación - Estudiantes trasero',z.id,'Cobertura general del parqueo de estudiantes (motos)','EN_LINEA',NOW()
FROM zonas_parqueo z WHERE z.codigo='Z-EST-TRASERA'
AND NOT EXISTS (SELECT 1 FROM dispositivos WHERE codigo='CAM-OCP-EST-01');

INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-OCP-AUT-01','CAMARA_OCUPACION','Cámara IA ocupación - Autoridades frente izquierdo',z.id,'Cobertura del frente izquierdo para autoridades','EN_LINEA',NOW()
FROM zonas_parqueo z WHERE z.codigo='Z-AUTORIDADES'
AND NOT EXISTS (SELECT 1 FROM dispositivos WHERE codigo='CAM-OCP-AUT-01');

INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-OCP-ADM-01','CAMARA_OCUPACION','Cámara IA ocupación - Administrativo frente derecho',z.id,'Cobertura del frente derecho para administrativos','EN_LINEA',NOW()
FROM zonas_parqueo z WHERE z.codigo='Z-ADMIN'
AND NOT EXISTS (SELECT 1 FROM dispositivos WHERE codigo='CAM-OCP-ADM-01');

-- Plazas de estudiantes (motos) · sector trasero
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'MOTOCICLETA', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-EST-01'
JOIN (VALUES
('EM01','LIBRE',1,1,97.4),('EM02','OCUPADA',2,1,95.8),('EM03','LIBRE',3,1,98.1),('EM04','LIBRE',4,1,97.9),('EM05','OCUPADA',5,1,95.7),('EM06','LIBRE',6,1,98.0),
('EM07','LIBRE',1,2,97.6),('EM08','OCUPADA',2,2,96.1),('EM09','LIBRE',3,2,98.4),('EM10','LIBRE',4,2,97.8),('EM11','OCUPADA',5,2,95.9),('EM12','LIBRE',6,2,98.2),
('EM13','LIBRE',1,3,97.7),('EM14','LIBRE',2,3,98.0),('EM15','OCUPADA',3,3,95.5),('EM16','LIBRE',4,3,97.5),('EM17','LIBRE',5,3,98.6),('EM18','OCUPADA',6,3,95.3),
('EM19','LIBRE',1,4,97.8),('EM20','LIBRE',2,4,98.2),('EM21','OCUPADA',3,4,95.0),('EM22','LIBRE',4,4,97.6),('EM23','LIBRE',5,4,98.3),('EM24','OCUPADA',6,4,95.4)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-EST-TRASERA'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);

-- Plazas para autoridades · frente izquierdo
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'OFICIAL', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-AUT-01'
JOIN (VALUES
('AU01','LIBRE',1,1,97.8),('AU02','OCUPADA',2,1,96.2),('AU03','LIBRE',3,1,98.0),('AU04','LIBRE',4,1,97.4),
('AU05','OCUPADA',1,2,95.9),('AU06','LIBRE',2,2,98.3),('AU07','LIBRE',3,2,97.7),('AU08','OCUPADA',4,2,95.6)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-AUTORIDADES'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);

-- Plazas administrativas · frente derecho
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'ESTANDAR', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-ADM-01'
JOIN (VALUES
('AD01','LIBRE',1,1,98.4),('AD02','OCUPADA',2,1,95.2),('AD03','LIBRE',3,1,98.1),
('AD04','LIBRE',1,2,97.9),('AD05','OCUPADA',2,2,95.7),('AD06','LIBRE',3,2,98.2),
('AD07','LIBRE',1,3,97.6),('AD08','OCUPADA',2,3,95.9),('AD09','LIBRE',3,3,98.0)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-ADMIN'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);
