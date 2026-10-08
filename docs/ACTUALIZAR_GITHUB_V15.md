# Actualizar PARKIA V15

1. Respaldar repositorio, datos persistidos y configuración privada. Ejecutar `git status` y verificar rama/remoto.
2. Descomprimir V15 y copiar el **contenido** sobre la raíz del repositorio, conservando `.git` y `.env` privado. No compartir secretos.
3. Ejecutar `docker compose up --build -d` (NO usar `down -v`). La migración `05_auditoria_v15.sql` se aplica al inicio de la app incluso con volúmenes existentes.
4. Revisar `docker compose logs --tail=80 app` y abrir `http://localhost:4000/sistema`. Refrescar caché si es necesario.
5. En Auditoría revisar filtros de fechas, usuario, acción, dispositivos. En Respaldos registrar solicitud, luego transiciones con evidencia de trabajo real.
6. Verificar estudiante y guardia sin permisos de auditoría (respuesta prohibida) y administrador autorizado.
7. Tras pruebas `git add -A`, `git commit -m "PARKIA V15 auditoria y continuidad"`, `git push origin main` (ajustar rama).

**Precaución**: El archivo `docker-compose.yml` original tiene credenciales de desarrollo embebidas; cambiarlas antes de despliegue institucional. No exponer el puerto de base de datos públicamente.
