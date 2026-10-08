# Manual de instalación - PARKIA EMI UALP V4

## 1. Requisitos
- Windows 10/11, Linux o macOS.
- Docker Desktop o Docker Engine con Docker Compose.
- Navegador web moderno.

## 2. Puesta en marcha
1. Descomprimir el proyecto.
2. Abrir CMD/PowerShell/Terminal dentro de la carpeta `PARKIA_EMI_UALP_V4_RF01_RF04`.
3. Si existe una versión local anterior y se desea reiniciar los datos de prueba, ejecutar `docker compose down -v`.
4. Ejecutar `docker compose up --build`.
5. Esperar a que los contenedores de aplicación y PostgreSQL estén activos.

## 3. Flujo de navegación correcto
1. Abrir `http://localhost:4000`.
2. Debe aparecer el **portal EMI**, con el logo institucional. No debe aparecer PARKIA en esta pantalla.
3. Presionar **Infraestructura**.
4. En `http://localhost:4000/infraestructura` seleccionar **Sistema inteligente de parqueos**.
5. Recién en `http://localhost:4000/parqueos` debe aparecer el logo **PARKIA** y la descripción del subsistema.
6. Presionar **Ingresar al sistema** para abrir `http://localhost:4000/login`.
7. Ingresar usuario, contraseña y resolver CAPTCHA.
8. El sistema carga únicamente los módulos autorizados para el rol.

## 4. Verificación rápida
- Portal EMI: `http://localhost:4000`
- Infraestructura EMI: `http://localhost:4000/infraestructura`
- PARKIA: `http://localhost:4000/parqueos`
- Login: `http://localhost:4000/login`
- API: `http://localhost:4000/api/salud`

## 5. Detener el sistema
Presionar `Ctrl+C` y luego ejecutar `docker compose down`.

> La opción `-v` elimina la base local de demostración. No utilizarla sobre una base real con información que deba conservarse.
