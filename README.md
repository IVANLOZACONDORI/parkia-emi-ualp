# PARKIA EMI UALP — Versión 4

Sistema institucional de gestión de parqueos para la EMI UALP. Esta versión refuerza especialmente el módulo **Inicio de sesión y autenticación** para cumplir los requisitos RF-01 a RF-04 y RNF-01 a RNF-03.

## Mejoras principales V4

- Inicio de sesión obligatorio con **usuario + contraseña + CAPTCHA**.
- Identificación automática del rol; el usuario no elige manualmente su perfil.
- Menú construido según permisos vigentes y verificación de permisos también en el servidor.
- Cierre de sesión con revocación de la sesión activa.
- Bloqueo temporal configurable después de varios intentos fallidos.
- Contraseñas almacenadas mediante hash con sal aleatoria y comparación segura.
- CAPTCHA con expiración y renovación desde la pantalla de acceso.
- Validación de la sesión contra el estado actual de la cuenta, rol y permisos.
- Login responsive para computadora, tablet y celular.
- Índices de consulta para agilizar la validación del usuario y de sesiones.
- La interfaz pública ya no muestra nombres de motores, bases de datos ni detalles internos de implementación.
- Actualización del Service Worker a V4 para evitar que el navegador conserve la interfaz anterior en caché.

## Inicio rápido con Docker

```bash
docker compose up --build
```

Abrir:

- Portal institucional: `http://localhost:4000`
- PARKIA: `http://localhost:4000/parqueos`
- Login: `http://localhost:4000/login`

Si se reutiliza una instalación V3 existente, la aplicación crea automáticamente la estructura adicional de autenticación al iniciar. No es obligatorio borrar el volumen para actualizar el módulo de autenticación.

## Credenciales de demostración

Consulte `docs/CREDENCIALES_DEMO.txt`.

## Evidencia de cumplimiento

Consulte:

- `docs/VERIFICACION_AUTENTICACION_V4.md`
- `docs/ACTUALIZAR_GITHUB_PASO_A_PASO.md`
- `docs/CAMBIOS_V4.txt`

## Recomendación para producción

Antes de publicar en un servidor real, cambie los secretos definidos en las variables de entorno y utilice HTTPS. No publique archivos `.env` con claves reales.
