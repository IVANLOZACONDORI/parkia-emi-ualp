
# Actualizar a PARKIA V23

1. Descargue y descomprima la versión V23.
2. Copie el contenido al repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Verifique que las imágenes estén más claras y que las plazas sigan mejor la referencia dibujada por sectores.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V23 imagen clara y plazas referenciadas"
git push origin main
```
