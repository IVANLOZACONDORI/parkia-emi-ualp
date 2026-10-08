# Actualizar a PARKIA V9 desde V8

1. Respaldar el proyecto, los datos persistentes y cambios no publicados.
2. Abrir PowerShell en el repositorio y confirmar destino: `git status` y `git remote -v`.
3. Sustituir los archivos del proyecto por **el contenido interior** de `PARKIA_EMI_UALP_V9_CONSULTA_ESTUDIANTE`, sin borrar `.git` ni archivos privados `.env`.
4. Revisar `git status`; retirar archivos antiguos sobrantes de la rama actual mediante `git add -A` (comprobar antes de confirmar).
5. Arrancar con `docker compose up --build -d`. No usar `docker compose down -v` porque elimina datos persistentes.
6. Probar `http://localhost:4000/login` con usuario ESTUDIANTE asignado a Zona Estudiantes - Sector Trasero; verificar mapa y seguridad.
7. Publicar: `git add -A`, `git commit -m "PARKIA V9 consulta estudiante sector trasero"`, `git push origin main` (o rama actual).
8. Si hay caché anterior, recargar con Ctrl+F5.

No se necesita migración de tablas en V9. El historial anterior del repositorio se conserva en Git.
