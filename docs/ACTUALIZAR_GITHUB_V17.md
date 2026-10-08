
# Actualizar a PARKIA V17

1. Descargue y descomprima el ZIP de la V17.
2. Copie el contenido dentro de su repositorio local, conservando la carpeta `.git`.
3. Ejecute:

```powershell
docker compose up --build -d
```

4. Abra `http://localhost:4000/sistema`.
5. Ingrese a **Zonas, plazas y cámaras** y a **Ocupación por visión IA**.
6. Verifique que ya aparezcan:
   - Estudiantes · Sector trasero
   - Autoridades · Frente izquierdo
   - Administrativo · Frente derecho
7. Si todo está correcto:

```powershell
git add -A
git commit -m "PARKIA V17 mapeo real institucional y camaras IA"
git push origin main
```
