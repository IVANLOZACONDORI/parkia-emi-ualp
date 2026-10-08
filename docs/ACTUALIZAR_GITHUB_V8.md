# Actualización GitHub V8

1. Respalde la carpeta actual, su `.env`, volúmenes y datos.
2. Dentro del clon del repositorio, confirme `git status` y `git remote -v`.
3. Copie **el contenido** de esta carpeta V8 encima del repositorio, manteniendo `.git` y la configuración privada existente.
4. Ejecute `docker compose up --build -d`; no utilice `down -v`.
5. Inicie sesión y abra **Ocupación por visión IA**. La primera consulta creará las dos tablas adicionales (la cuenta debe tener permisos de creación de tablas).
6. Calibre y pruebe una plaza con fotografías reales.
7. `git add -A`, `git commit -m "PARKIA V8 vision ocupacion"`, `git push origin main` (o rama correspondiente).

**Aviso:** Se requiere una política de credenciales y secretos seguros antes de desplegar en producción; revise `docker-compose.yml`. La validación integral con Docker y cámaras reales debe realizarse en el equipo de destino.
