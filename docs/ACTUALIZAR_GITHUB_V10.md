# Actualizar GitHub a PARKIA V10

1. Copia de seguridad del repositorio y de los datos persistentes.
2. Copiar los contenidos del ZIP en la raíz del repositorio, conservando `.git` y los secretos locales `.env` (no publicarlos).
3. Verificar con `git status` los archivos obsoletos; borrar los que corresponda, nunca datos de producción.
4. `docker compose up --build -d` (no usar `down -v`).
5. Verificar los casos de aceptación en `REQUISITOS_MODULO_8_V10.md`.
6. `git add -A` y `git commit -m "PARKIA V10 panel supervisión y mapa guardia"`.
7. `git push origin main` (o rama activa correspondiente).
