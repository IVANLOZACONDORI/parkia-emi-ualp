
# Actualizar a PARKIA V24

1. Descargue y descomprima la versión V24.
2. Copie el contenido a su repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Verifique el nuevo mapa general del campus con las plazas ubicadas sobre la referencia marcada por el usuario.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V24 mapa general referenciado"
git push origin main
```
