# PARKIA V7 — Control por placa y registro vehicular

## Módulo 3 mejorado
- Propietario: usuario institucional activo, ligado por clave foránea.
- Registro exige fotografía del vehículo y fotografía legible de la placa (JPG/PNG/WebP); límite de 1,3 MB por imagen; las fotos antiguas deben completarse al editar.
- Fotografías y datos solamente se consultan con permisos; las fotografías no aparecen públicamente.

## Módulo 4
| Requisito | Implementación y verificación |
|---|---|
| RF-14 | Formulario de captura con cámara del dispositivo (en navegadores compatibles) o imagen real; probar carga JPG y guardado. |
| RF-15 | Motor OCR Tesseract incorporado al contenedor; probar con fotos legibles, no asumir 100% de precisión. |
| RF-16 | Compara texto reconocido (si confianza >=85%) contra autorizaciones vigentes y vehículo activo. |
| RF-17 | Guarda fecha/hora del servidor, placa, dispositivo disponible, imagen de evidencia, confianza y resultado. |
| RF-18 | AUTORIZADO, DENEGADO, INCIERTO o MANUAL; el estado MANUAL exige intervención. |
| RF-19 | Revisión manual exclusiva de `acceso.validar`, con motivo, usuario, fecha y auditoría, sin eludir autorización. |
| RNF-08 | Probar reconocimiento con mínimo 30 fotografías reales y registrar exactitud; no se garantiza porcentaje previo. |
| RNF-09 | Confianza <85% o placa inválida produce INCIERTO y nunca AUTORIZADO automático. |
| RNF-10 | No se usa reconocimiento facial ni biométrico; se procesan únicamente fotografías de placas. |

**Alcance:** la pantalla admite fotografías desde cámara de teléfono/tableta o archivos. Para conectar cámaras IP RTSP/ONVIF de vigilancia de forma continua se necesita un adaptador específico a cada equipo, no incluido. `simular-camara` es exclusivamente para pruebas y no acredita imágenes reales.

**Seguridad operativa:** controles de usuario y permisos exigidos por la API. Se recomienda implantar política de retención/borrado de evidencias; los datos fotográficos están almacenados en los registros del sistema. Las credenciales de ejemplo y secretos del `docker-compose.yml` se deben cambiar antes de desplegar en la red institucional.

## Pruebas manuales recomendadas
1. Ingresar como administrador y crear dos usuarios; registrar un auto con propietario y ambas fotos.
2. Intentar guardar sin foto de placa, sin foto del auto, sin propietario o con formato inválido: debe fallar.
3. Intentar registrar segunda placa activa idéntica: debe fallar.
4. Crear autorización temporal válida, cargar imagen real de placa y registrar ingreso; cotejar resultado y evidencia.
5. Cargar imagen borrosa: debe registrar INCIERTO y solicitar revisión.
6. Revisar manualmente evento incierto con cuenta de guardia autorizada: debe auditar; usuario sin permiso no debe poder hacerlo.
7. Revocar autorización y volver a registrar placa: debe indicar DENEGADO.
8. Cerrar sesión y verificar que las APIs protegidas rechacen peticiones anónimas.
