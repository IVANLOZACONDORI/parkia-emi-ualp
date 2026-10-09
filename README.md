# PARKIA EMI UALP — V15 Auditoría, respaldo y continuidad

Versión acumulativa sobre V14. Refuerza auditoría, seguridad y continuidad institucional.

- RF-46: Auditoría de acciones con filtros por fecha, usuario y acción.
- RF-47: Seguimiento automático de cambios en estado de dispositivos.
- RF-48: Solicitudes de respaldo y restauración, transiciones y evidencia documental.
- RF-49: Historial de intentos fallidos y denegaciones por permiso.
- RNF-26: Acceso controlado por permisos en backend.
- RNF-27: Procedimiento documentado de restauración en laboratorio; pendiente de validación en ambiente real.

Lea `docs/REQUISITOS_MODULO_12_V15.md`, `docs/PLAN_RESTAURACION_Y_PRUEBAS_V15.md` y `docs/ACTUALIZAR_GITHUB_V15.md`.

**No confundir solicitud registrada o cierre administrativo con ejecución de una copia/recuperación real.**


## V17 · Mapeo real del campus
- Estudiantes: parte trasera.
- Autoridades: frente izquierdo.
- Administrativo: frente derecho.
- Cámaras IA de ocupación asociadas por zona y cámara LPR en el ingreso.


## V18 · Mapa interactivo sobre imagen
- Las plazas se muestran sobre la imagen del campus.
- Cada plaza indica si está disponible, ocupada, fuera de servicio o sin datos.
- Se reforzó el valor visual del módulo de zonas, plazas y cámaras.


## V19 · Presentación limpia por sectores
- Eliminado el amontonamiento visual del estado agrupado.
- Presentación ordenada por sectores institucionales.
- Sin usar la imagen con líneas de referencia.
- Vista más estética y profesional para parqueos y ocupación.


## V20 · Imagen del parqueo con tarjetas superpuestas
- Cada sector muestra la imagen real del parqueo.
- Las plazas aparecen encima de la imagen como tarjetas/cuadrados.
- Cada tarjeta indica el estado de la plaza.


## V21 · Overlays elegantes
- La imagen del parqueo se mantiene visible.
- Las plazas continúan sobre la imagen, pero con marcadores más pequeños y elegantes.
- Mejor equilibrio visual y presentación más premium.


## V22 · Pro final
- La imagen del parqueo se redujo visualmente para un resultado más elegante.
- Se mantiene la superposición de plazas con un tamaño equilibrado.
- Mejor composición general de la interfaz.


## V23 · Imagen clara y plazas referenciadas
- Se aclararon las imágenes de parqueo.
- Se reposicionaron las plazas tomando como referencia las líneas indicadas por el usuario.
- Se mantiene una presentación profesional y equilibrada.


## V24 · Mapa general referenciado
- Se añadió un mapa general del campus.
- Las plazas se ubicaron sobre el mapa en reemplazo de las líneas de referencia.
- Se mantiene el detalle por sector con imagen clara.


## V25 · Posicionamiento metodológico de plazas
- Las líneas de referencia ya no se muestran.
- Los targets fueron reubicados sobre el mapa siguiendo la geometría de los ejes marcados por el usuario.
- Se documentó la metodología de implantación para dar trazabilidad técnica al diseño.


## V26 · Croquis oficial con rectángulos
- Se utiliza como base la imagen oficial con rectángulos enviada por el usuario.
- Se incorporó el parqueo de estudiantes motocicleta como zona independiente.
- El mapa maestro ahora refleja la distribución del croquis y amplía la cantidad de plazas para aproximarse mejor al terreno.


## V27 · Rectángulos reales del usuario
- El mapa maestro usa la imagen exacta con rectángulos enviada por el usuario.
- Las plazas se proyectan sobre esos mismos rectángulos, sin sustituirlos por targets distintos.
- Se mantiene el detalle por sectores y el control de ocupación.


## V28 · Interfaz limpia
- Se eliminaron los comentarios y textos explicativos dentro del sistema.
- El mapa usa la misma imagen con rectángulos ya dibujados.
- El estado se aplica como realce suave, sin crear otros targets visuales.
