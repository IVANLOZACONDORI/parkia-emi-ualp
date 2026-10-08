
# Actualizar a PARKIA V18

1. Descargue y descomprima la versión V18.
2. Copie el contenido al repositorio local, manteniendo `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Ingrese a **Zonas, plazas y cámaras**.
6. Presione `Ctrl + F5` para recargar la caché del navegador.
7. Verifique que el mapa ahora muestre las plazas directamente sobre la imagen y el color de estado de cada una.
8. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V18 mapa interactivo con plazas sobre imagen"
git push origin main
```
