
# Actualizar a PARKIA V25

1. Descargue y descomprima la versión V25.
2. Copie el contenido a su repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Revise **Zonas, plazas y cámaras** y **Ocupación por visión artificial**.
6. Presione `Ctrl + F5` para recargar la caché.
7. Valide el nuevo mapa general con plazas posicionadas según metodología referenciada.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V25 posicionamiento metodologico"
git push origin main
```
