# PARKIA V9 — Módulo 7: consulta del estudiante

**Responsable:** Tte. Ing. Iván Loza Condori.

| Código | Evidencia implementada | Prueba de aceptación |
|---|---|---|
| RF-30 | Acceso mediante autenticación institucional existente (V4), sesión validada | Iniciar sesión como ESTUDIANTE; verificar acceso sin repetir contraseña en la vista |
| RF-31 | El servidor obtiene la zona a partir de la cuenta y solo admite Z-EST-TRASERA | Asignar otra zona y comprobar HTTP 403; intentar `?zona_id=...` |
| RF-32 | Conteos de libre, ocupada, fuera de servicio, sin datos; mapa por plaza | Modificar cada estado y verificar el tablero |
| RF-33 | Aviso literal `NO HAY ESPACIOS DISPONIBLES` con 0 libres | Poner todas las plazas no libres; verificar mensaje |
| RNF-16 | Respuesta de API limitada a zona y estados; permiso y rol en servidor; rol estudiante no hereda más permisos | Acceder a `/api/vehiculos`, `/api/usuarios`, `/api/parqueos` con estudiante: HTTP 403 |
| RNF-17 | Sondeo cada 5 segundos sin recarga; presentación responsive | Cambiar ocupación desde cuenta autorizada y verificar actualización en celular |

## Protección y comportamiento
- No se incluyen placas, propietarios, otras zonas, cámaras ni datos administrativos.
- Error de red: mensaje «Disponibilidad no confirmada», nunca disponibilidad inventada.
- La información muestra la última ocupación registrada y no constituye reserva de plaza.
- Si la cuenta no está asignada a la zona trasera, no se sustituyen datos de otra zona.
- Se debe probar el módulo en navegador y Docker antes de declarar cumplimiento integral.
