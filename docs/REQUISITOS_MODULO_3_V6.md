# PARKIA V6 — Vehículos y autorizaciones

| Código | Implementación | Prueba manual |
|---|---|---|
| RF-09 | Alta y edición con placa normalizada, tipo, marca/modelo, referencia y categoría | Registrar un vehículo y editarlo |
| RF-10 | Autorizaciones permanentes, temporales y excepcionales con período y motivo | Crear cada tipo y verificar fechas |
| RF-11 | Suspensión y revocación con motivo obligatorio y auditoría | Cambiar el estado y comprobar el historial |
| RF-12 | Búsqueda por placa, categoría y estado, combinables | Buscar con distintos filtros |
| RF-13 | Índice parcial único por placa activa (ya existente en V5) | Duplicar una placa activa; debe devolver 409 |
| RNF-06 | Datos operativos mínimos; sin DNI ni direcciones personales obligatorias | Verificar campos requeridos y tabla |
| RNF-07 | Comprobación de permiso en servidor para crear, editar y cambiar autorizaciones | Iniciar sesión sin vehiculos.gestionar; API debe devolver 403 |

## Pruebas adicionales
- Rechazar autorización temporal/excepcional sin vencimiento o con fechas invertidas.
- Rechazar una autorización que se solape con otra activa del mismo vehículo.
- Rechazar autorización de vehículo suspendido o retirado.
- Conservar el historial y la auditoría de suspensiones y revocaciones.
- Confirmar que las sesiones y roles de V5 continúan funcionando.

**Alcance de verificación:** análisis estático y sintaxis; el funcionamiento extremo a extremo requiere ejecución de Docker y las pruebas manuales indicadas.
