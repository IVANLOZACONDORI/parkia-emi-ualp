# PARKIA V11 — Alertas y notificaciones

## Cobertura y criterios de aceptación

| Código | Implementación | Verificación en instalación real |
|---|---|---|
| RF-37 | Inspección periódica cada 30 s: ocupación >=90 % de plazas evaluables; cámaras en ERROR/FUERA_LINEA o sin comunicación reciente; plazas SIN_DATOS. | Ajustar estados, esperar inspección y comprobar la aparición de incidentes. |
| RF-38 | Ciclo ABIERTA → ATENDIDA → CERRADA, con responsable, comentario obligatorio, fechas, historial y auditoría. | Atender con usuario autorizado y cerrar; comprobar que no se puede cerrar directamente. |
| RF-39 | Lectura `alertas.ver`; gestión `alertas.gestionar`, verificadas en servidor; estudiante sin acceso. | Comprobar respuestas 403 para cuentas sin permisos. |
| RNF-20 | Clave de incidente única mientras no esté cerrado, índice parcial en servidor. | Ejecutar varias inspecciones y verificar una sola alerta activa por causa. |
| RNF-21 | Verificación cada 30 s en servidor; panel refresca cada 10 s. | Medir tiempo real de creación y visibilidad; no se garantiza latencia de cámaras sin telemetría. |

## Consideraciones
- La cámara requiere información confiable de `ultima_comunicacion_en` y estado. Los equipos nunca actualizados se consideran sin comunicación; una cámara sin integración no puede demostrar que realmente está activa.
- Las alertas abiertas y atendidas permanecen hasta su resolución formal. Se evita crear incidentes redundantes para la misma fuente; una vez cerrado, una condición persistente puede producir un nuevo incidente en inspecciones posteriores.
- La comprobación de capacidad excluye plazas fuera de servicio y sin datos del denominador; estas últimas producen una alerta separada.
- Se necesita un único proceso verificador lógico; PostgreSQL serializa las inspecciones concurrentes.
- Faltan pruebas de rendimiento y de integración en infraestructura real. No se afirma cumplimiento de latencias sin medir.
