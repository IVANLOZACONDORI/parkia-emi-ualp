
# Actualizar a PARKIA V16

1. Descargue y descomprima la versión V16.
2. Sustituya el contenido de su repositorio local por la carpeta V16, conservando `.git` y sus variables privadas.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Presione `Ctrl + F5` para recargar la interfaz y el nuevo modo visual.
6. Pruebe el botón de tema en login y en el sistema.
7. Si todo está correcto, publique:

```powershell
git add -A
git commit -m "PARKIA V16 mejora UX UI y modo oscuro"
git push origin main
```
