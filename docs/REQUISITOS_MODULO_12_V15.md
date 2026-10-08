# PARKIA V15 — Auditoría, respaldo y continuidad

| Código | Evidencia de implementación | Verificación funcional |
|---|---|---|
| RF-46 | Middleware de auditoría para acciones administrativas, consulta filtrada y paginada | Cambiar rol/usuario y verificar evento asociado |
| RF-47 | Trigger de cambios de estado de dispositivos y bitácora cronológica | Modificar un dispositivo y comprobar anterior/nuevo |
| RF-48 | Solicitud de respaldo/restauración con motivo, responsable y transiciones | Crear solicitud y comprobar traza y estado |
| RF-49 | Inicio de sesión fallido y permisos denegados con evento auditable | Probar credencial incorrecta y acceso sin permiso |
| RNF-26 | Endpoints protegidos `auditoria.ver` y `respaldos.gestionar` | Con estudiante verificar HTTP 403 |
| RNF-27 | Guía de restauración con ensayo aislado y verificación | Ejecutar ensayo documentado; **no realizado aquí** |

**Importante:** las solicitudes web NO ejecutan `pg_dump` ni restauraciones en producción. La transición de estado es registro administrativo del resultado ejecutado fuera de la aplicación por TIC. No equivale a una prueba técnica.

## Limitaciones honestas
- La auditoría se almacena con persistencia e índices, pero no cuenta con almacenamiento WORM ni firma criptográfica inmutable.
- Registro de intentos con CAPTCHA incorrecto y contraseña incorrecta ya existía y se conserva.
- El registro de HTTP 403 requiere identidad autenticada; los intentos de token inválido no se identifican con una cuenta.
- La ejecución automática y calendario de respaldos reales no están implementados; se proporciona un procedimiento externo de operación segura.
