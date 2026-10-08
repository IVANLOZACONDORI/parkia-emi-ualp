# Actualización a PARKIA V14

1. Respaldar repositorio y datos. Comprobar `git status` y `git remote -v`.
2. Copiar el contenido de V14 a la raíz del repositorio conservando `.git` y secretos privados fuera de Git.
3. Ejecutar `docker compose up --build -d`.
4. Iniciar sesión y abrir Panel, Reportes, Mi parqueo según rol. Comprobar periodos y CSV.
5. Ejecutar `git add -A`, `git commit -m "PARKIA V14 reportes y permisos por zona"`, `git push origin main` (o rama real).
6. Si aparece una versión antigua, limpiar service worker y hacer recarga forzada. No ejecutar `docker compose down -v`.
