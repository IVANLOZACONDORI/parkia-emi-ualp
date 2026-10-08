# Sustituir versión anterior en GitHub (Windows PowerShell)

1. Hacer copia de seguridad de sus datos y descargar el ZIP V5.
2. Abrir PowerShell en una copia local del repositorio original (`git status` y `git remote -v`).
3. Ejecutar `git rm -r --ignore-unmatch .` y `git clean -fd` para retirar ficheros de la versión anterior, sin borrar `.git`. **Cuidado: `git clean -fd` borra archivos no rastreados.**
4. Copiar **el contenido interior** de la carpeta V5 (no la carpeta contenedora) al repositorio.
5. Ejecutar `docker compose down` (SIN `-v`), luego `docker compose up --build -d`.
6. Abrir `http://localhost:4000/login`, iniciar sesión y probar cada caso de `REQUISITOS_MODULO_2_V5.md`.
7. Ejecutar `git add -A`, `git commit -m "PARKIA V5 modulo usuarios roles permisos"`, `git push origin main` (o `master` si esa es su rama).
8. Refrescar con Ctrl+F5 si aparece la versión anterior.

**Importante:** el contenido del ZIP reemplaza el código activo del repositorio, pero Git conserva su historial normal. Para borrar historial remoto habría que realizar operaciones destructivas aparte, no recomendadas.
