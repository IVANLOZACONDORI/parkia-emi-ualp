
# Actualizar a PARKIA V27

1. Descargue y descomprima la versión V27.
2. Copie el contenido al repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Verifique que el mapa maestro use la imagen exacta con rectángulos y que las plazas se activen sobre esos mismos lugares.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V27 rectangulos reales del usuario"
git push origin main
```
