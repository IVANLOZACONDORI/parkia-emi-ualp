# Actualización PARKIA V13

1. Haga copia de seguridad de archivos, configuraciones y datos.
2. Verifique `git status` y rama activa en el repositorio existente.
3. Copie todo el contenido de este paquete sobre el repositorio, sin reemplazar `.git` ni secretos `.env`.
4. Para eliminar archivos del paquete anterior que ya no existen, revise `git status` y elimínelos de forma selectiva.
5. Ejecute `docker compose up --build -d` (NO use `down -v`).
6. Pruebe con administrador los módulos Panel principal, Vehículos, Historial; luego con guardia y estudiante.
7. Actualice el service worker en Chrome (DevTools > Application > Service Workers > Unregister), recargue con Ctrl+Shift+R si persiste una versión anterior.
8. Publique `git add -A`, `git commit -m "PARKIA V13 correccion panel historial trazabilidad"` y `git push origin main` según su rama.

No se puede verificar la operación en su instalación sin ejecutar Docker y las cuentas reales.
