# Módulo 8 — Panel de supervisión, PARKIA V10

- RF-34: Resumen de plazas totales, libres, ocupadas, fuera de servicio y sin datos, globalmente y por cada zona. La Zona Estudiantes – Sector Trasero aparece primero si existe.
- RF-35: Número de cámaras en línea/con incidencia y alertas abiertas de mayor gravedad. Detalle de cámaras y alertas por zona. No se presenta video en vivo si no hay integración de transmisión.
- RF-36: Desde el panel se navega al detalle de cada zona y su mapa de plazas; el servidor exige `panel.ver` en ambas rutas.
- RNF-18: Indicadores críticos en la cabecera del panel; errores y última actualización visibles.
- RNF-19: Tablero adaptable a móvil, tableta y escritorio con actualización cada diez segundos sin recarga completa.
- Guardia: permiso de solo lectura `panel.ver` + `parqueo.ver` provisionado al arrancar para `PERSONAL_GUARDIA`, pudiendo consultar todas las zonas, incluido el sector trasero, separadamente. Las acciones de escritura siguen sujetas a permisos distintos.

## Pruebas de aceptación pendientes de ejecutar en instalación real
1. Iniciar sesión como guardia; confirmar que se muestra «Panel principal».
2. Consultar la zona trasera y cada otro sector; contrastar las cifras con las plazas reales de cada zona.
3. Desconectar una cámara de prueba y generar una alerta para comprobar su reflejo en el panel.
4. Comprobar que guardia no puede crear o editar zonas, cámaras o plazas sin privilegios específicos.
5. Abrir el panel en móvil; verificar tarjetas, mapa, lectura de alertas y actualización a los 10 s.
6. Entrar como estudiante: únicamente debe mostrarse «Mi parqueo», nunca el panel global.

**Nota:** el estado de cámaras se basa en el último estado registrado del dispositivo, no garantiza conectividad física actual si no existe un servicio de monitoreo continuo.
