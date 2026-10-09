
# Actualizar a PARKIA V21

1. Descargue y descomprima la versión V21.
2. Copie el contenido a su repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Verifique que los marcadores sobre la imagen ahora sean más pequeños, elegantes y estéticos.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V21 overlays elegantes sobre imagen"
git push origin main
```
