INSERT INTO roles(codigo,nombre,descripcion) VALUES
('ADMINISTRADOR_SISTEMA','Administrador del sistema','Administración integral, seguridad y configuración.'),
('DIRECCION_GRADO','Dirección de Grado','Consulta ejecutiva del estado general y reportes.'),
('JEFE_OPERACIONES','Jefe de Operaciones','Gestión operativa de parqueos, vehículos, acceso y alertas.'),
('PERSONAL_GUARDIA','Personal de Guardia','Control del ingreso vehicular, validaciones excepcionales y eventos recientes.'),
('SOPORTE_TIC','Soporte TIC','Usuarios, dispositivos, auditoría, respaldo y continuidad.'),
('INFRAESTRUCTURA','Unidad de Infraestructura','Zonas, plazas, cámaras de ocupación y mantenimiento.'),
('RECURSOS_HUMANOS','Recursos Humanos','Consulta de vehículos, historial y reportes autorizados.'),
('ESTUDIANTE','Estudiante','Consulta exclusiva de disponibilidad de parqueos en su zona asignada.')
ON CONFLICT(codigo) DO NOTHING;

INSERT INTO permisos(codigo,modulo,descripcion) VALUES
('panel.ver','Panel','Ver panel general institucional.'),
('usuarios.gestionar','Usuarios','Administrar usuarios, roles y estados.'),
('vehiculos.ver','Vehículos','Consultar vehículos y autorizaciones.'),
('vehiculos.gestionar','Vehículos','Registrar y modificar vehículos y autorizaciones.'),
('acceso.ver','Acceso','Consultar eventos de ingreso y salida.'),
('acceso.validar','Acceso','Realizar validación manual excepcional de placa.'),
('parqueo.ver','Parqueos','Consultar zonas, plazas y dispositivos.'),
('parqueo.gestionar','Parqueos','Administrar zonas, plazas y dispositivos.'),
('ocupacion.ver','Ocupación','Consultar estados libre/ocupado determinados por visión artificial.'),
('ocupacion.actualizar','Ocupación','Registrar o simular cambios de ocupación.'),
('alertas.ver','Alertas','Consultar alertas operativas.'),
('alertas.gestionar','Alertas','Atender y cerrar alertas.'),
('historial.ver','Historial','Consultar trazabilidad histórica.'),
('reportes.generar','Reportes','Consultar y generar reportes.'),
('auditoria.ver','Auditoría','Consultar acciones registradas en auditoría.'),
('respaldos.gestionar','Respaldos','Solicitar y consultar respaldos.'),
('dispositivos.gestionar','Dispositivos','Administrar cámaras y dispositivos.'),
('configuracion.gestionar','Configuración','Administrar configuración técnica.'),
('estudiante.mi_parqueo','Estudiante','Ver únicamente disponibilidad y mapa de la zona asignada.')
ON CONFLICT(codigo) DO NOTHING;

-- Administrador: todos los permisos.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permisos p WHERE r.codigo='ADMINISTRADOR_SISTEMA' ON CONFLICT DO NOTHING;

-- Dirección: lectura ejecutiva.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo = ANY(ARRAY['panel.ver','parqueo.ver','ocupacion.ver','alertas.ver','historial.ver','reportes.generar'])
WHERE r.codigo='DIRECCION_GRADO' ON CONFLICT DO NOTHING;

-- Operaciones.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo = ANY(ARRAY['panel.ver','vehiculos.ver','vehiculos.gestionar','acceso.ver','acceso.validar','parqueo.ver','ocupacion.ver','alertas.ver','alertas.gestionar','historial.ver','reportes.generar'])
WHERE r.codigo='JEFE_OPERACIONES' ON CONFLICT DO NOTHING;

-- Guardia.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo = ANY(ARRAY['acceso.ver','acceso.validar','vehiculos.ver','alertas.ver','historial.ver'])
WHERE r.codigo='PERSONAL_GUARDIA' ON CONFLICT DO NOTHING;

-- TIC.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo = ANY(ARRAY['panel.ver','usuarios.gestionar','parqueo.ver','alertas.ver','auditoria.ver','respaldos.gestionar','dispositivos.gestionar','configuracion.gestionar'])
WHERE r.codigo='SOPORTE_TIC' ON CONFLICT DO NOTHING;

-- Infraestructura.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo = ANY(ARRAY['parqueo.ver','parqueo.gestionar','ocupacion.ver','ocupacion.actualizar','alertas.ver','alertas.gestionar','dispositivos.gestionar'])
WHERE r.codigo='INFRAESTRUCTURA' ON CONFLICT DO NOTHING;

-- RRHH.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo = ANY(ARRAY['vehiculos.ver','historial.ver','reportes.generar'])
WHERE r.codigo='RECURSOS_HUMANOS' ON CONFLICT DO NOTHING;

-- Estudiante: SOLO su parqueo asignado.
INSERT INTO roles_permisos(rol_id,permiso_id)
SELECT r.id,p.id FROM roles r JOIN permisos p ON p.codigo='estudiante.mi_parqueo'
WHERE r.codigo='ESTUDIANTE' ON CONFLICT DO NOTHING;

INSERT INTO zonas_parqueo(codigo,nombre,descripcion,referencia_ubicacion,tipo_zona) VALUES
('Z-EST-TRASERA','Zona Estudiantes - Sector Trasero','Área de parqueo destinada a estudiantes. Es la única zona visible para el rol ESTUDIANTE.','Parte trasera de la EMI UALP','ESTUDIANTES'),
('Z-AUTORIDADES','Zona Autoridades','Área de parqueo institucional para autoridades y vehículos oficiales.','Sector administrativo','AUTORIDADES'),
('Z-ADMIN','Zona Administrativa','Área de parqueo para personal administrativo autorizado.','Sector administrativo','ADMINISTRATIVO')
ON CONFLICT(codigo) DO NOTHING;

-- Una cámara de acceso LPR/OCR valida placas; cámaras independientes observan la ocupación.
INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,punto_acceso,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-LPR-ING-01','CAMARA_ACCESO_LPR','Cámara IA de control de placas - ingreso',NULL,'INGRESO PRINCIPAL','Carril de ingreso vehicular','EN_LINEA',NOW()
ON CONFLICT(codigo) DO NOTHING;
INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-OCP-TR-01','CAMARA_OCUPACION','Cámara IA ocupación - Trasera 1',z.id,'Cobertura plazas E01-E10','EN_LINEA',NOW() FROM zonas_parqueo z WHERE z.codigo='Z-EST-TRASERA'
ON CONFLICT(codigo) DO NOTHING;
INSERT INTO dispositivos(codigo,tipo_dispositivo,nombre,zona_id,ubicacion_logica,estado,ultima_comunicacion_en)
SELECT 'CAM-OCP-TR-02','CAMARA_OCUPACION','Cámara IA ocupación - Trasera 2',z.id,'Cobertura plazas E11-E20','EN_LINEA',NOW() FROM zonas_parqueo z WHERE z.codigo='Z-EST-TRASERA'
ON CONFLICT(codigo) DO NOTHING;

-- 20 plazas del sector trasero de estudiantes, con posiciones para el mapa.
INSERT INTO plazas_parqueo(zona_id,codigo,tipo_plaza,estado_actual,confianza,camara_id,coordenada_x,coordenada_y)
SELECT z.id,x.codigo,x.tipo,x.estado,x.confianza,d.id,x.x,x.y
FROM zonas_parqueo z
JOIN (VALUES
(1,'E01','ESTANDAR','OCUPADA',97.2,1,1),(2,'E02','ESTANDAR','LIBRE',98.6,2,1),(3,'E03','ESTANDAR','LIBRE',97.9,3,1),(4,'E04','ESTANDAR','OCUPADA',96.8,4,1),(5,'E05','ACCESIBLE','LIBRE',99.1,5,1),
(6,'E06','ESTANDAR','OCUPADA',96.5,1,2),(7,'E07','ESTANDAR','LIBRE',98.2,2,2),(8,'E08','ESTANDAR','OCUPADA',97.4,3,2),(9,'E09','ESTANDAR','LIBRE',98.7,4,2),(10,'E10','ESTANDAR','LIBRE',98.9,5,2),
(11,'E11','ESTANDAR','LIBRE',97.8,1,3),(12,'E12','ESTANDAR','OCUPADA',96.9,2,3),(13,'E13','ESTANDAR','LIBRE',98.4,3,3),(14,'E14','ESTANDAR','LIBRE',98.0,4,3),(15,'E15','ESTANDAR','OCUPADA',96.2,5,3),
(16,'E16','ESTANDAR','LIBRE',99.0,1,4),(17,'E17','ESTANDAR','OCUPADA',95.8,2,4),(18,'E18','ESTANDAR','LIBRE',98.3,3,4),(19,'E19','ESTANDAR','LIBRE',97.7,4,4),(20,'E20','ESTANDAR','OCUPADA',96.6,5,4)
) AS x(n,codigo,tipo,estado,confianza,x,y) ON TRUE
JOIN dispositivos d ON d.codigo=CASE WHEN x.n<=10 THEN 'CAM-OCP-TR-01' ELSE 'CAM-OCP-TR-02' END
WHERE z.codigo='Z-EST-TRASERA'
ON CONFLICT(zona_id,codigo) DO NOTHING;

INSERT INTO configuracion_sistema(clave,valor,descripcion) VALUES
('umbral_alerta_capacidad','80'::jsonb,'Porcentaje de ocupación para alerta preventiva.'),
('minutos_inactividad_sesion','20'::jsonb,'Tiempo de inactividad antes de bloqueo de sesión.'),
('intervalo_actualizacion_estudiante_segundos','5'::jsonb,'Frecuencia de actualización automática del mapa del estudiante.'),
('metodo_control_ingreso','"CAMARA_LPR_VISION_IA"'::jsonb,'El ingreso se valida mediante cámara de visión artificial para lectura de placas.')
ON CONFLICT(clave) DO NOTHING;

INSERT INTO vehiculos(placa,tipo_vehiculo,marca,modelo,color,referencia_propietario,categoria_usuario,estado) VALUES
('1234ABC','AUTOMOVIL','Toyota','Corolla','Blanco','Vehículo institucional de demostración','INSTITUCIONAL','ACTIVO'),
('5678XYZ','CAMIONETA','Nissan','Frontier','Gris','Visitante autorizado','VISITANTE','ACTIVO'),
('EST2026','AUTOMOVIL','Suzuki','Swift','Azul','Estudiante de demostración','ESTUDIANTE','ACTIVO')
ON CONFLICT DO NOTHING;

INSERT INTO autorizaciones_vehiculares(vehiculo_id,tipo_autorizacion,valido_desde,valido_hasta,motivo,estado)
SELECT id,'PERMANENTE',NOW()-INTERVAL '30 days',NULL,'Registro institucional de demostración','ACTIVA' FROM vehiculos WHERE placa IN ('1234ABC','EST2026')
AND NOT EXISTS(SELECT 1 FROM autorizaciones_vehiculares a WHERE a.vehiculo_id=vehiculos.id);
INSERT INTO autorizaciones_vehiculares(vehiculo_id,tipo_autorizacion,valido_desde,valido_hasta,motivo,estado)
SELECT id,'TEMPORAL',NOW()-INTERVAL '1 day',NOW()+INTERVAL '7 days','Visita académica de demostración','ACTIVA' FROM vehiculos WHERE placa='5678XYZ'
AND NOT EXISTS(SELECT 1 FROM autorizaciones_vehiculares a WHERE a.vehiculo_id=vehiculos.id);
