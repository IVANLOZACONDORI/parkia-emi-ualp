
# Actualizar a PARKIA V19

1. Descargue y descomprima la versión V19.
2. Copie el contenido al repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise los módulos **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para refrescar la caché del navegador.
7. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V19 sectores limpios y ocupacion mejorada"
git push origin main
```
