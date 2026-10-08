# Módulo 11 — Reportes y estadísticas (V14)

| Código | Implementación | Criterio de prueba |
|---|---|---|
| RF-43 | Flujo diario de ingresos y salidas por fecha | Comparar totales con eventos del periodo |
| RF-44 | Disponibilidad actual, ocupación y cambios por zona | Cambiar zona y verificar cifras |
| RF-45 | Validaciones autorizadas y resultados agrupados | Contrastar con historial de accesos |
| RNF-24 | SELECT de solo lectura, sin modificar registros | Confirmar integridad antes y después de exportar |
| RNF-25 | Periodo, zona y fecha de emisión, exportación CSV con cabecera | Verificar títulos, filtros y archivo |

**Alcance**: disponibilidad es instantánea; flujo, validaciones y cambios son históricos. Los eventos de acceso sin relación a zona se cuentan solamente en filtro de todas las zonas. No se certifica rendimiento sin ensayos de carga.

**Acceso de parqueo**: estudiantes únicamente en sector trasero asignado; otros roles con zona asignada y permisos de consulta pueden ver esa zona; guardia y administración usan el panel general para consultar todas las zonas sin requerir asignación.
