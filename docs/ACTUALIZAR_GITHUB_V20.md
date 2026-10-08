
# Actualizar a PARKIA V20

1. Descargue y descomprima la versión V20.
2. Copie el contenido al repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise los módulos **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché del navegador.
7. Confirme que ahora la imagen del parqueo aparece con las tarjetas de plazas encima.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V20 imagen del parqueo con tarjetas"
git push origin main
```
