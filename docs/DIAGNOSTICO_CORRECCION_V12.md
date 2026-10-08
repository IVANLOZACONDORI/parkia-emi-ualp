# V12: corrección de navegación, roles y panel

## Defecto identificado
La vista de estudiante instalaba `setInterval` cada 5 segundos sin desactivarse al cambiar a vehículos, panel o cualquier otro módulo. La respuesta posterior a `GET /api/estudiante/mi-parqueo` reemplazaba el contenido de la vista activa, incluso si el usuario era administrador. El servidor correctamente respondía 403 para cuentas distintas de estudiante, pero el antiguo temporizador lo mostraba en la sección equivocada.

## Correcciones
1. `detenerConsultaEstudiante()` detiene el temporizador y anula las peticiones pendientes a nivel de presentación al abandonar la vista.
2. Cada actualización del estudiante comprueba que `data-modulo-activo` siga siendo `mi-parqueo`.
3. La navegación marca siempre el módulo actual, limpia tareas anteriores y valida su versión antes de presentar errores.
4. Si el hash del navegador no está permitido al rol, abre un módulo inicial autorizado: panel para personal administrativo, consulta para estudiantes.
5. El cambio de fragmento `hashchange` permite navegación por historial de forma segura.
6. Renovación de la versión de caché de la aplicación, evitando JavaScript antiguo.
7. El módulo de ocupación deja de actualizarse al salir de su vista.

## Pruebas manuales obligatorias
- Administrador: entrar, navegar por Panel, Vehículos, Usuarios, Alertas; esperar 15 segundos en cada vista: no debe aparecer «Disponibilidad no confirmada».
- Guardia: abrir panel general, seleccionar parqueo trasero y otros sectores; verificar mapa separado por zona.
- Estudiante: abrir sólo Mi parqueo; intentar cambiar hash a #vehiculos o #panel: no debe mostrarse contenido privado.
- Administrador: cambiar a #mi-parqueo: debe mostrar el panel autorizado, no el error de estudiante.
- Abrir y cerrar sesión, luego repetir con cuentas de roles distintos sin reutilizar la sesión anterior.
- Comprobar respuestas de la API (403) para operaciones sin permiso; no quitar las verificaciones del servidor.
- Confirmar que las actualizaciones automáticas no destruyen la vista seleccionada.

## Limitación de pruebas
La comprobación sintáctica y empaquetado no sustituyen pruebas reales con contenedores y sesiones.
