
# Actualizar a PARKIA V22

1. Descargue y descomprima la versión V22.
2. Copie el contenido a su repositorio local, conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise los módulos **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Verifique que la imagen del parqueo ahora se vea más pequeña, proporcionada y elegante, manteniendo las plazas encima.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V22 version pro final"
git push origin main
```
