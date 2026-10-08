# Actualizar el repositorio con PARKIA V6

1. Respaldar el proyecto y los datos; verificar `git status` y `git remote -v`.
2. Abrir PowerShell en la raíz del repositorio antiguo y comprobar que no haya trabajo sin guardar.
3. Para sustituir los archivos controlados: `git rm -r --ignore-unmatch .` (no eliminar `.git`).
4. Copiar **el contenido** de `PARKIA_EMI_UALP_V6_VEHICULOS_AUTORIZACIONES` a la raíz del repositorio, sin incluir otra carpeta contenedora.
5. Evitar copiar `.env` con secretos a GitHub. Conservar configuración local válida.
6. `docker compose down` seguido de `docker compose up --build -d` (NO ejecutar `down -v`).
7. Visitar `http://localhost:4000/login` y comprobar los escenarios en `REQUISITOS_MODULO_3_V6.md`.
8. `git add -A`; `git commit -m "PARKIA V6 vehiculos y autorizaciones RF09-RF13 RNF06-RNF07"`; `git push origin main` (o master según tu rama).

**Nota:** se conserva el historial de Git; reemplazar archivos no elimina commits anteriores. El índice de placa activa de la versión anterior continúa vigente.
