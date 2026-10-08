# Actualizar el repositorio GitHub reemplazando la versión anterior

Esta guía deja **solamente los archivos de PARKIA V4 en la versión actual del repositorio**. La carpeta `.git` no se elimina, por lo que el repositorio sigue conectado a GitHub y conserva el historial de commits. Los archivos viejos que ya no existen en V4 quedarán eliminados del commit nuevo.

## Opción recomendada: desde la carpeta local del repositorio

Suponga que su repositorio local está en:

```text
C:\Users\TU_USUARIO\Documents\PARKIA
```

y que descomprimió este ZIP en:

```text
C:\Users\TU_USUARIO\Downloads\PARKIA_EMI_UALP_V4_RF01_RF04
```

### 1. Abra PowerShell en la carpeta del repositorio

```powershell
cd "C:\Users\TU_USUARIO\Documents\PARKIA"
```

### 2. Compruebe que está conectado al repositorio correcto

```powershell
git status
git remote -v
```

### 3. Elimine de la versión de trabajo los archivos anteriores, sin borrar `.git`

```powershell
git rm -r --ignore-unmatch .
git clean -fd
```

> Si tiene un archivo `.env` con claves reales que necesita conservar, cópielo fuera de la carpeta antes de ejecutar `git clean -fd`.

### 4. Copie el contenido de V4 al repositorio

```powershell
Copy-Item -Path "C:\Users\TU_USUARIO\Downloads\PARKIA_EMI_UALP_V4_RF01_RF04\*" -Destination . -Recurse -Force
Copy-Item -Path "C:\Users\TU_USUARIO\Downloads\PARKIA_EMI_UALP_V4_RF01_RF04\.gitignore" -Destination . -Force
Copy-Item -Path "C:\Users\TU_USUARIO\Downloads\PARKIA_EMI_UALP_V4_RF01_RF04\.env.example" -Destination . -Force
```

No copie una carpeta `.git` desde ningún otro lugar.

### 5. Revise qué se reemplazará

```powershell
git status
```

Debe mostrar archivos modificados, nuevos y eliminados. Esto es correcto porque la V4 reemplaza la versión anterior.

### 6. Pruebe localmente antes de subir

Con Docker:

```powershell
docker compose up --build
```

Abra:

```text
http://localhost:4000/login
```

Pruebe al menos:

- inicio correcto con CAPTCHA;
- menú diferente por rol;
- botón Salir;
- bloqueo después de 5 contraseñas incorrectas;
- vista responsive de celular.

Cuando termine:

```powershell
docker compose down
```

### 7. Confirme todos los cambios

```powershell
git add -A
git commit -m "PARKIA V4: autenticacion completa RF01-RF04 y RNF01-RNF03"
```

### 8. Suba al mismo repositorio de GitHub

Si su rama principal es `main`:

```powershell
git push origin main
```

Si usa `master`, reemplace `main` por `master`.

### 9. Compruebe GitHub

Actualice la página del repositorio y verifique que aparezcan los archivos V4, especialmente:

```text
backend/src/modules/autenticacion/
backend/src/middleware/auth.js
frontend/login.html
frontend/js/auth.js
frontend/js/app.js
frontend/js/api.js
docs/VERIFICACION_AUTENTICACION_V4.md
```

## Si GitHub rechaza el push

Primero revise la rama:

```powershell
git branch --show-current
```

Luego use esa misma rama en el `git push`. Si otra persona subió cambios al repositorio, no use `--force` sin revisar primero esos cambios.

## Después de actualizar una instalación que ya estaba funcionando

La V4 crea automáticamente la estructura adicional de sesiones al arrancar. Puede usar:

```powershell
docker compose down
docker compose up --build
```

No necesita ejecutar `docker compose down -v` para esta actualización. Evitar `-v` permite conservar los datos que ya tenga cargados.

## Nota sobre caché del navegador

La V4 cambia el nombre del caché del Service Worker. Si un navegador todavía muestra una pantalla antigua, haga una recarga fuerte con `Ctrl + F5` una sola vez.
