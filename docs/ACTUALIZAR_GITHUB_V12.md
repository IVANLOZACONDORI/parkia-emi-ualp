# Actualizar GitHub a V12

1. Detenga el sistema y respalde su repositorio, variables privadas y datos persistentes.
2. Descomprima el ZIP y copie **el contenido de la carpeta V12** dentro del repositorio local. Mantenga `.git`.
3. Antes de reemplazar o eliminar archivos, compruebe `git status` y respalde cambios no publicados.
4. `docker compose up --build -d` (no ejecutar `docker compose down -v`).
5. Abra `/sistema`, use Ctrl+Shift+R o Ctrl+F5; si aún aparece la versión previa, cierre pestañas y limpie datos de almacenamiento/caché del sitio desde el navegador.
6. Ejecute las pruebas de `DIAGNOSTICO_CORRECCION_V12.md`.
7. `git add -A`; `git commit -m "PARKIA V12 corregir navegacion y aislamiento de roles"`; `git push origin main` (cambie rama si aplica).

La eliminación de archivos anteriores puede hacerse mediante Git después de comprobar el respaldo. Conservar el historial Git no implica que queden archivos antiguos en la rama actual.
