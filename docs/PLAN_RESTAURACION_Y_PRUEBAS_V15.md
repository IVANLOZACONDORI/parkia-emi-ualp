# Plan operativo de respaldo y restauración — PARKIA EMI UALP

## 1. Seguridad previa
Nombrar responsable TIC y aprobador. Registrar ticket, ventana de mantenimiento, fecha, alcance, identificación del entorno y autorización. **Nunca probar restauraciones directamente sobre la base productiva.** Respaldar archivos/imágenes y secretos por medios separados y protegidos. No publicar copias ni credenciales en GitHub.

## 2. Generar copia lógica
Desde un equipo autorizado, con el contenedor en ejecución y una ubicación cifrada y restringida:

```powershell
$fecha = Get-Date -Format 'yyyyMMdd_HHmmss'
docker compose exec -T db pg_dump -U parkia -d parkia_emi -Fc -f /tmp/parkia_backup.dump
docker compose cp db:/tmp/parkia_backup.dump "./parkia_backup_$fecha.dump"
Get-FileHash "./parkia_backup_$fecha.dump" -Algorithm SHA256
```

Revisar el código de salida de los comandos, existencia y tamaño del archivo, registrar suma SHA-256 y proteger/cifrar la copia. Sustituir los nombres y credenciales con los del entorno real. El respaldo lógico no incluye fotografías almacenadas fuera de la base ni configuraciones de infraestructura.

## 3. Ensayo de restauración en entorno aislado
Crear una base de pruebas separada, nunca la productiva. **Ajustar nombres antes de ejecutarlo**:

```powershell
# Ejemplo; ejecutar sólo sobre una instancia AISLADA de prueba
createdb -h HOST_PRUEBAS -U USUARIO_PRUEBAS parkia_restauracion_prueba
pg_restore -h HOST_PRUEBAS -U USUARIO_PRUEBAS -d parkia_restauracion_prueba --exit-on-error "RUTA_ARCHIVO.dump"
```

Verificar que las tablas de usuarios, roles, zonas, eventos y bitácoras coinciden en conteos esperados; ejecutar pruebas de ingreso y consultas sin acceso a servicios externos; documentar los resultados, duración (RTO observado), pérdida estimada (RPO observado), incidencias, firmas del ejecutor y supervisor.

## 4. Cierre del proceso
Anotar hash, fecha, ubicación protegida, evidencia de lectura/restauración, responsable y decisión. Marcar el ticket EXITOSO **solo** cuando el ensayo haya pasado; de otro modo FALLIDO y plan correctivo. Definir política de retención y copias fuera del servidor según normas institucionales.
