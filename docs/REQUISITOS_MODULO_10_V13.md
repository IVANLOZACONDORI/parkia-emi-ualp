# PARKIA V13 — Historial y trazabilidad

## RF-40 Conservación cronológica
- API `/api/historial/accesos`: ingresos y salidas registrados.
- API `/api/historial/ocupacion`: cambios de plaza con antes y después, hora y origen.
- Histórico consultable sin editar registros. Orden descendente por fecha y desempate por ID.

## RF-41 Búsqueda de eventos
- Placa parcial, fecha inicial, fecha final, tipo de movimiento y resultado.
- Filtros validados en servidor, parámetros SQL preparados, máximo 100 resultados por página.
- Para cambios de ocupación: intervalo temporal y filtro de estado disponible en API.

## RF-42 Reconstrucción
- Cada acceso dispone de detalle de ID, momento, origen, cámara, punto, resultado, usuario revisor, confianza, estado de evidencia y lecturas OCR/correcciones asociadas.
- No se muestra una fotografía si no está disponible; el sistema identifica su disponibilidad sin inventarla.

## RNF-22 Integridad
- Los endpoints son de consulta. Sin endpoints de modificación de historiales.
- Restricciones y claves existentes se mantienen; para garantía contra manipulación directa de la base de datos se requiere separar privilegios y habilitar política de retención/copia inmutable.

## RNF-23 Rendimiento
- Consultas paginadas y parámetros limitados. Índices de fecha y placa ya presentes en el esquema.
- Los tiempos de respuesta deben medirse con datos reales y concurrencia objetivo, no se garantiza un SLA sin pruebas.

## Pruebas de aceptación pendientes en equipo
1. Ingresar como administrador y visitar Panel principal, Vehículos e Historial sin errores de selectores.
2. Generar ingreso y salida de una placa, comprobar orden y filtrado.
3. Abrir Reconstruir y verificar el mismo ID, OCR, fecha y resultado.
4. Cambiar estado de una plaza y observar el evento en la pestaña de ocupación.
5. Probar fechas inválidas, 101 registros por página y acceso como estudiante: deben rechazarse.
6. Probar con registros abundantes y medir p95 de consultas.
