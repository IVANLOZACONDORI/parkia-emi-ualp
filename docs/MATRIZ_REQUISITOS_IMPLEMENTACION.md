# Matriz de requisitos e implementación PARKIA V3

> Versión actualizada: portal inicial con identidad EMI, acceso jerárquico Infraestructura → Parqueos → PARKIA, base de datos en castellano, cámara LPR/OCR para acceso, cámaras de ocupación separadas y rol ESTUDIANTE restringido al sector trasero.

## 1. Inicio de sesión y autenticación
**Responsable:** Tte. Ing. Iván Loza Condori

### Requisitos funcionales
- **RF-01** Permitir iniciar sesión con usuario, contraseña y CAPTCHA.
- **RF-02** Identificar el rol del usuario y mostrar sólo las páginas que le corresponden.
- **RF-03** Permitir cerrar sesión de forma segura.
- **RF-04** Bloquear temporalmente la cuenta después de varios intentos fallidos.

### Requisitos no funcionales
- **RNF-01** Las contraseñas se almacenan protegidas y nunca en texto plano.
- **RNF-02** El login debe funcionar en computadora, tablet y celular.
- **RNF-03** La validación debe responder de forma ágil en la red institucional.

## 2. Usuarios, roles y permisos
**Responsable:** Tte. Ing. Iván Loza Condori

### Requisitos funcionales
- **RF-05** Registrar, modificar, habilitar y deshabilitar usuarios.
- **RF-06** Asignar un rol a cada usuario.
- **RF-07** Asignar una zona de parqueo cuando el rol lo requiera, especialmente al estudiante.
- **RF-08** Administrar permisos de consulta, operación, administración y soporte.

### Requisitos no funcionales
- **RNF-04** Sólo usuarios autorizados pueden administrar cuentas y roles.
- **RNF-05** Los cambios de rol y estado deben quedar registrados en auditoría.

## 3. Vehículos y autorizaciones
**Responsable:** Tte. Ing. Iván Loza Condori

### Requisitos funcionales
- **RF-09** Registrar vehículos mediante placa, tipo, referencia y categoría.
- **RF-10** Registrar autorizaciones permanentes, temporales o excepcionales.
- **RF-11** Suspender o retirar una autorización.
- **RF-12** Buscar vehículos por placa, categoría o estado.
- **RF-13** Evitar duplicar una placa activa.

### Requisitos no funcionales
- **RNF-06** Los datos vehiculares deben limitarse a los necesarios para la operación.
- **RNF-07** Sólo roles habilitados pueden modificar autorizaciones.

## 4. Control de ingreso y salida por placa
**Responsable:** Est. Carlos Javier Alanoca Siles

### Requisitos funcionales
- **RF-14** Capturar el vehículo en el ingreso mediante una cámara de visión artificial para lectura de placa.
- **RF-15** Reconocer automáticamente la placa mediante LPR/OCR cuando la imagen lo permita.
- **RF-16** Comparar la placa reconocida con las autorizaciones vigentes.
- **RF-17** Registrar fecha, hora, placa, cámara, evidencia, confianza y resultado de la validación.
- **RF-18** Marcar el ingreso como autorizado, denegado, incierto o manual.
- **RF-19** Permitir validación manual excepcional a personal autorizado.

### Requisitos no funcionales
- **RNF-08** La precisión del reconocimiento de placas debe validarse con pruebas reales.
- **RNF-09** Una lectura incierta no debe convertirse automáticamente en autorización.
- **RNF-10** El sistema no utiliza reconocimiento facial ni biometría del conductor.

## 5. Zonas, plazas y cámaras
**Responsable:** Est. Carlos Javier Alanoca Siles

### Requisitos funcionales
- **RF-20** Registrar zonas de parqueo.
- **RF-21** Registrar cada plaza con código, tipo y ubicación en el mapa.
- **RF-22** Registrar la cámara que supervisa cada conjunto de plazas.
- **RF-23** Diferenciar la cámara de acceso LPR de las cámaras de ocupación.
- **RF-24** Habilitar o poner en mantenimiento zonas, plazas y cámaras.

### Requisitos no funcionales
- **RNF-11** Se deben poder agregar nuevas zonas, plazas y cámaras sin rediseñar el sistema.
- **RNF-12** Cada plaza debe pertenecer a una única zona válida.

## 6. Detección de ocupación por visión artificial
**Responsable:** Est. Miguel Fernandez Oporto

### Requisitos funcionales
- **RF-25** Procesar imágenes de las cámaras de parqueo para determinar si una plaza está libre u ocupada.
- **RF-26** Actualizar automáticamente el estado de cada plaza.
- **RF-27** Registrar el nivel de confianza de la clasificación.
- **RF-28** Permitir recalibrar la región de interés de cada plaza.
- **RF-29** Guardar el historial de cambios de ocupación con fecha y hora.

### Requisitos no funcionales
- **RNF-13** La clasificación libre/ocupada debe validarse con pruebas de campo.
- **RNF-14** La actualización debe mostrarse sin recargar manualmente toda la página.
- **RNF-15** Debe considerarse iluminación, sombras, lluvia y oclusiones.

## 7. Consulta del estudiante - parqueo trasero
**Responsable:** Tte. Ing. Iván Loza Condori

### Requisitos funcionales
- **RF-30** Permitir al estudiante ingresar con su cuenta institucional del sistema.
- **RF-31** Mostrar únicamente la Zona Estudiantes - Sector Trasero asignada a su cuenta.
- **RF-32** Mostrar cantidad de plazas libres y un mapa con estados libre, ocupada, fuera de servicio o sin datos.
- **RF-33** Cuando no existan plazas libres, mostrar claramente el mensaje NO HAY ESPACIOS DISPONIBLES.

### Requisitos no funcionales
- **RNF-16** El estudiante no puede consultar placas, propietarios, otras zonas ni módulos administrativos.
- **RNF-17** La vista del estudiante debe actualizarse automáticamente y ser fácil de interpretar desde celular.

## 8. Panel de supervisión
**Responsable:** Est. Miguel Fernandez Oporto

### Requisitos funcionales
- **RF-34** Mostrar disponibilidad total y por zona a los roles de supervisión.
- **RF-35** Mostrar estado de cámaras y alertas relevantes.
- **RF-36** Permitir navegar al detalle de una zona, plaza o evento cuando el rol tenga permiso.

### Requisitos no funcionales
- **RNF-18** La información crítica debe ser visible sin navegación excesiva.
- **RNF-19** El panel debe ser responsive.

## 9. Alertas y notificaciones
**Responsable:** Est. Miguel Fernandez Oporto

### Requisitos funcionales
- **RF-37** Generar alertas por capacidad alta, cámara fuera de línea o inconsistencia.
- **RF-38** Permitir atender y cerrar una alerta con usuario responsable.
- **RF-39** Mostrar alertas sólo a los perfiles autorizados.

### Requisitos no funcionales
- **RNF-20** Evitar alertas duplicadas innecesarias para el mismo incidente.
- **RNF-21** Las alertas críticas deben generarse oportunamente.

## 10. Historial y trazabilidad
**Responsable:** Est. Hedd Jhon Gutierrez Vaca

### Requisitos funcionales
- **RF-40** Conservar historial de ingresos, salidas y cambios de ocupación.
- **RF-41** Buscar eventos por placa, fecha, tipo y estado cuando el rol tenga permiso.
- **RF-42** Reconstruir un evento con fecha, origen, resultado y evidencia disponible.

### Requisitos no funcionales
- **RNF-22** Los registros históricos deben conservar integridad y orden cronológico.
- **RNF-23** Las consultas habituales deben responder en tiempos razonables.

## 11. Reportes y estadísticas
**Responsable:** Est. Hedd Jhon Gutierrez Vaca

### Requisitos funcionales
- **RF-43** Generar reportes de flujo vehicular.
- **RF-44** Generar reportes de ocupación, disponibilidad y uso por zona.
- **RF-45** Generar reportes de validaciones y eventos para roles autorizados.

### Requisitos no funcionales
- **RNF-24** Los reportes deben reflejar los datos almacenados sin alterarlos.
- **RNF-25** Los títulos, periodos y filtros deben identificarse claramente.

## 12. Auditoría, respaldo y continuidad
**Responsable:** Est. Hedd Jhon Gutierrez Vaca

### Requisitos funcionales
- **RF-46** Registrar acciones administrativas relevantes en auditoría.
- **RF-47** Registrar fallas y cambios de estado de dispositivos.
- **RF-48** Registrar solicitudes de respaldo de la base de datos.
- **RF-49** Registrar intentos de acceso fallidos y eventos de seguridad.

### Requisitos no funcionales
- **RNF-26** La auditoría y los respaldos sólo pueden ser consultados o gestionados por perfiles autorizados.
- **RNF-27** Debe documentarse y probarse un procedimiento de restauración.

## 13. Componente web móvil / PWA
**Responsable:** Tte. Ing. Iván Loza Condori

### Requisitos funcionales
- **RF-50** Permitir acceso desde navegadores móviles modernos.
- **RF-51** Usar la misma API y la misma base de datos que la aplicación web.
- **RF-52** Mantener en móvil los mismos permisos definidos por rol.

### Requisitos no funcionales
- **RNF-28** Optimizar la interfaz para conexiones móviles.
- **RNF-29** La seguridad y autenticación móvil deben ser equivalentes a la versión de escritorio.

## 14. Portal institucional EMI y acceso al subsistema de parqueos
**Responsable:** Tte. Ing. Iván Loza Condori

### Requisitos funcionales
- **RF-53** Al abrir la dirección principal, mostrar el portal institucional con logo e identidad EMI, sin mostrar el logo PARKIA.
- **RF-54** Incluir dentro de Infraestructura una opción específica para acceder al sistema inteligente de parqueos.
- **RF-55** Mostrar la identidad PARKIA únicamente después de seleccionar la opción de parqueos y desde allí permitir el acceso al login.

### Requisitos no funcionales
- **RNF-30** El portal EMI, Infraestructura y PARKIA deben adaptarse a computadora, tablet y celular.
- **RNF-31** La navegación debe diferenciar claramente la identidad institucional EMI de la identidad del subsistema PARKIA.
