
# Actualizar a PARKIA V26

1. Descargue y descomprima la versión V26.
2. Copie el contenido al repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise los módulos **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Verifique el nuevo mapa maestro basado en el croquis oficial con rectángulos.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V26 croquis oficial con rectangulos"
git push origin main
```
