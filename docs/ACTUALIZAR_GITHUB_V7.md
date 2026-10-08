# Instalación y actualización V7

1. Descargue un respaldo de la base de datos y conserve la carpeta `.git` de su repositorio.
2. Descomprima el ZIP; copie el contenido de la carpeta del proyecto en su clon local. Se recomienda usar una rama `v7-accesos` para pruebas.
3. Desde la raíz ejecute `docker compose up --build -d` (no ejecutar `down -v`: elimina los datos).
4. Visite `http://localhost:4000/login`, compruebe los permisos y realice los casos en `REQUISITOS_MODULO_4_V7.md`.
5. Revise `git status`, después `git add -A`, `git commit -m "PARKIA V7 control de accesos LPR y propietarios"`, y `git push origin main` (o su rama real).
6. **No publicar contraseñas de producción ni archivos `.env`**; antes de usar en producción personalizar la configuración de los secretos, seguridad de imágenes y acceso HTTPS.

Las nuevas columnas se agregan automáticamente al iniciar el backend. Para datos existentes, los vehículos previos pueden aparecer sin dueño o fotografías: complete estos datos antes de volver a editarlos. La captura de imágenes con el atributo `capture` depende del navegador y dispositivo.
