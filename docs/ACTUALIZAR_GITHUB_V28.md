
# Actualizar a PARKIA V28

1. Descargue y descomprima la versión V28.
2. Copie el contenido a su repositorio local conservando `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Presione `Ctrl + F5` para recargar la caché.
6. Verifique que ya no existan textos explicativos en la interfaz y que el mapa use solo los rectángulos de la imagen base.
7. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V28 interfaz limpia y rectangulos exactos"
git push origin main
```
