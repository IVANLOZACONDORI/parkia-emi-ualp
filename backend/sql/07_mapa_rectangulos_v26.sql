
-- PARKIA V26 · Implantación basada en croquis oficial con rectángulos
-- Refuerza la distribución real del campus, incorpora el parqueo de motocicletas estudiantiles
-- y amplía el número de plazas para aproximarse a la geometría mostrada en el croquis validado.

INSERT INTO zonas_parqueo(codigo,nombre,descripcion,referencia_ubicacion,tipo_zona)
VALUES
('Z-EST-TRASERA','Zona Estudiantes - Sector Trasero','Parqueo principal de estudiantes, de acuerdo con la distribución de rectángulos del croquis oficial.','Sector posterior y central del campus EMI UALP','ESTUDIANTES'),
('Z-EST-MOTO','Zona Estudiantes - Motos','Parqueo lateral de motocicletas estudiantiles, ubicado en el costado oeste del campus.','Lateral oeste del campus EMI UALP','ESTUDIANTES'),
('Z-AUTORIDADES','Zona Autoridades - Frente Izquierdo','Parqueo institucional reservado para autoridades, según croquis oficial.','Frente derecho-oriental del campus EMI UALP','AUTORIDADES'),
('Z-ADMIN','Zona Administrativa - Frente Derecho','Parqueo operativo para personal administrativo, según croquis oficial.','Frente sur-oriental del campus EMI UALP','ADMINISTRATIVO')
ON CONFLICT(codigo) DO NOTHING;

UPDATE zonas_parqueo SET
  nombre=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'Zona Estudiantes - Sector Trasero'
    WHEN 'Z-EST-MOTO' THEN 'Zona Estudiantes - Motos'
    WHEN 'Z-AUTORIDADES' THEN 'Zona Autoridades - Frente Izquierdo'
    WHEN 'Z-ADMIN' THEN 'Zona Administrativa - Frente Derecho'
    ELSE nombre END,
  descripcion=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'Parqueo principal de estudiantes, de acuerdo con la distribución de rectángulos del croquis oficial.'
    WHEN 'Z-EST-MOTO' THEN 'Parqueo lateral de motocicletas estudiantiles, ubicado en el costado oeste del campus.'
    WHEN 'Z-AUTORIDADES' THEN 'Parqueo institucional reservado para autoridades, según croquis oficial.'
    WHEN 'Z-ADMIN' THEN 'Parqueo operativo para personal administrativo, según croquis oficial.'
    ELSE descripcion END,
  referencia_ubicacion=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'Sector posterior y central del campus EMI UALP'
    WHEN 'Z-EST-MOTO' THEN 'Lateral oeste del campus EMI UALP'
    WHEN 'Z-AUTORIDADES' THEN 'Frente derecho-oriental del campus EMI UALP'
    WHEN 'Z-ADMIN' THEN 'Frente sur-oriental del campus EMI UALP'
    ELSE referencia_ubicacion END,
  tipo_zona=CASE codigo
    WHEN 'Z-EST-TRASERA' THEN 'ESTUDIANTES'
    WHEN 'Z-EST-MOTO' THEN 'ESTUDIANTES'
    WHEN 'Z-AUTORIDADES' THEN 'AUTORIDADES'
    WHEN 'Z-ADMIN' THEN 'ADMINISTRATIVO'
    ELSE tipo_zona END
WHERE codigo IN ('Z-EST-TRASERA','Z-EST-MOTO','Z-AUTORIDADES','Z-ADMIN');

INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-OCP-MOTO-01','CAMARA_OCUPACION','Cámara IA ocupación - Estudiantes moto',z.id,'Cobertura del lateral oeste para motocicletas estudiantiles','EN_LINEA',NOW()
FROM zonas_parqueo z WHERE z.codigo='Z-EST-MOTO'
AND NOT EXISTS (SELECT 1 FROM dispositivos WHERE codigo='CAM-OCP-MOTO-01');

UPDATE dispositivos SET nombre='Cámara IA ocupación - Estudiantes sector trasero', ubicacion_logica='Cobertura del parqueo principal de estudiantes' WHERE codigo='CAM-OCP-EST-01';
UPDATE dispositivos SET nombre='Cámara IA ocupación - Autoridades', ubicacion_logica='Cobertura del parqueo de autoridades según croquis oficial' WHERE codigo='CAM-OCP-AUT-01';
UPDATE dispositivos SET nombre='Cámara IA ocupación - Administrativo', ubicacion_logica='Cobertura del parqueo administrativo según croquis oficial' WHERE codigo='CAM-OCP-ADM-01';

UPDATE plazas_parqueo p SET tipo_plaza='ESTANDAR'
FROM zonas_parqueo z WHERE p.zona_id=z.id AND z.codigo='Z-EST-TRASERA';
UPDATE plazas_parqueo p SET tipo_plaza='MOTOCICLETA'
FROM zonas_parqueo z WHERE p.zona_id=z.id AND z.codigo='Z-EST-MOTO';
UPDATE plazas_parqueo p SET tipo_plaza='OFICIAL'
FROM zonas_parqueo z WHERE p.zona_id=z.id AND z.codigo='Z-AUTORIDADES';
UPDATE plazas_parqueo p SET tipo_plaza='ESTANDAR'
FROM zonas_parqueo z WHERE p.zona_id=z.id AND z.codigo='Z-ADMIN';

-- Estudiantes
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'ESTANDAR', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-EST-01'
JOIN (VALUES
('EM01','OCUPADA',1,1,95.4),
('EM02','LIBRE',2,1,98.6),
('EM03','LIBRE',3,1,98.6),
('EM04','OCUPADA',4,1,95.4),
('EM05','LIBRE',5,1,98.6),
('EM06','OCUPADA',6,1,95.4),
('EM07','LIBRE',7,1,98.6),
('EM08','LIBRE',8,1,98.6),
('EM09','OCUPADA',9,1,95.4),
('EM10','LIBRE',10,1,98.6),
('EM11','OCUPADA',1,2,95.4),
('EM12','LIBRE',2,2,98.6),
('EM13','LIBRE',3,2,98.6),
('EM14','OCUPADA',4,2,95.4),
('EM15','LIBRE',5,2,98.6),
('EM16','OCUPADA',6,2,95.4),
('EM17','LIBRE',7,2,98.6),
('EM18','LIBRE',8,2,98.6),
('EM19','OCUPADA',9,2,95.4),
('EM20','LIBRE',10,2,98.6),
('EM21','OCUPADA',1,3,95.4),
('EM22','LIBRE',2,3,98.6),
('EM23','LIBRE',3,3,98.6),
('EM24','OCUPADA',4,3,95.4),
('EM25','LIBRE',5,3,98.6),
('EM26','OCUPADA',6,3,95.4),
('EM27','LIBRE',7,3,98.6),
('EM28','LIBRE',8,3,98.6),
('EM29','OCUPADA',9,3,95.4),
('EM30','LIBRE',10,3,98.6),
('EM31','OCUPADA',1,4,95.4),
('EM32','LIBRE',2,4,98.6),
('EM33','LIBRE',3,4,98.6),
('EM34','OCUPADA',4,4,95.4),
('EM35','LIBRE',5,4,98.6),
('EM36','OCUPADA',6,4,95.4),
('EM37','LIBRE',7,4,98.6),
('EM38','LIBRE',8,4,98.6),
('EM39','OCUPADA',9,4,95.4),
('EM40','LIBRE',10,4,98.6),
('EM41','OCUPADA',1,5,95.4),
('EM42','LIBRE',2,5,98.6),
('EM43','LIBRE',3,5,98.6),
('EM44','OCUPADA',4,5,95.4),
('EM45','LIBRE',5,5,98.6),
('EM46','OCUPADA',6,5,95.4),
('EM47','LIBRE',7,5,98.6),
('EM48','LIBRE',8,5,98.6),
('EM49','OCUPADA',9,5,95.4),
('EM50','LIBRE',10,5,98.6),
('EM51','OCUPADA',1,6,95.4),
('EM52','LIBRE',2,6,98.6),
('EM53','LIBRE',3,6,98.6),
('EM54','OCUPADA',4,6,95.4),
('EM55','LIBRE',5,6,98.6),
('EM56','OCUPADA',6,6,95.4),
('EM57','LIBRE',7,6,98.6),
('EM58','LIBRE',8,6,98.6),
('EM59','OCUPADA',9,6,95.4),
('EM60','LIBRE',10,6,98.6),
('EM61','OCUPADA',1,7,95.4),
('EM62','LIBRE',2,7,98.6)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-EST-TRASERA'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);

-- Estudiantes moto
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'MOTOCICLETA', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-MOTO-01'
JOIN (VALUES
('MT01','LIBRE',1,1,98.6),
('MT02','OCUPADA',2,1,95.4),
('MT03','LIBRE',3,1,98.6),
('MT04','LIBRE',4,1,98.6)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-EST-MOTO'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);

-- Autoridades
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'OFICIAL', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-AUT-01'
JOIN (VALUES
('AU01','OCUPADA',1,1,95.4),
('AU02','LIBRE',2,1,98.6),
('AU03','LIBRE',3,1,98.6),
('AU04','LIBRE',4,1,98.6),
('AU05','OCUPADA',5,1,95.4),
('AU06','LIBRE',6,1,98.6),
('AU07','LIBRE',7,1,98.6),
('AU08','LIBRE',8,1,98.6),
('AU09','OCUPADA',9,1,95.4),
('AU10','LIBRE',10,1,98.6),
('AU11','LIBRE',1,2,98.6),
('AU12','LIBRE',2,2,98.6),
('AU13','OCUPADA',3,2,95.4),
('AU14','LIBRE',4,2,98.6)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-AUTORIDADES'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);

-- Administrativo
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id, v.codigo, 'ESTANDAR', v.estado, v.confianza, d.id, v.x, v.y
FROM zonas_parqueo z
JOIN dispositivos d ON d.codigo='CAM-OCP-ADM-01'
JOIN (VALUES
('AD01','OCUPADA',1,1,95.4),
('AD02','LIBRE',2,1,98.6),
('AD03','LIBRE',3,1,98.6),
('AD04','LIBRE',4,1,98.6),
('AD05','OCUPADA',5,1,95.4),
('AD06','LIBRE',6,1,98.6),
('AD07','LIBRE',7,1,98.6),
('AD08','LIBRE',8,1,98.6),
('AD09','OCUPADA',9,1,95.4),
('AD10','LIBRE',10,1,98.6),
('AD11','LIBRE',1,2,98.6),
('AD12','LIBRE',2,2,98.6),
('AD13','OCUPADA',3,2,95.4),
('AD14','LIBRE',4,2,98.6)
) AS v(codigo,estado,x,y,confianza) ON TRUE
WHERE z.codigo='Z-ADMIN'
AND NOT EXISTS (SELECT 1 FROM plazas_parqueo p WHERE p.zona_id=z.id AND p.codigo=v.codigo);
