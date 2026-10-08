# Actualización V10 → V11

1. Respalde repositorio, archivos de configuración y base de datos.
2. Copie el **contenido** de la carpeta V11 en la raíz de su repositorio conservando `.git`, reemplazando los archivos existentes.
3. Si existen archivos antiguos que no deberían seguir versionados, revíselos con `git status` antes de eliminarlos.
4. Ejecute `docker compose up --build -d`. El inicio añade la columna e índice de deduplicación de forma idempotente. Si necesita una migración controlada, ejecute previamente `backend/sql/04_alertas_v11.sql`.
5. Pruebe cada caso de la matriz `REQUISITOS_MODULO_9_V11.md`.
6. Confirme con `git add -A`, `git commit -m "PARKIA V11 alertas y notificaciones"` y `git push origin main` (o la rama correspondiente).

Variables opcionales: `ALERTA_CAPACIDAD_UMBRAL=90`, `ALERTA_CAMARA_MINUTOS=5`.
No usar `docker compose down -v` si desea conservar datos.
