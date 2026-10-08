# Verificación de requisitos — Inicio de sesión y autenticación V4

**Responsable:** Tte. Ing. Iván Loza Condori  
**Módulo:** Inicio de sesión y autenticación

| Código | Requisito | Implementación V4 | Verificación sugerida |
|---|---|---|---|
| RF-01 | Iniciar sesión con usuario, contraseña y CAPTCHA. | `frontend/login.html`, `frontend/js/auth.js`, `/api/autenticacion/login` y `/api/autenticacion/captcha`. Los tres datos son obligatorios. | Intentar enviar el formulario vacío; luego iniciar sesión con credenciales correctas y CAPTCHA correcto. |
| RF-02 | Identificar el rol y mostrar sólo páginas correspondientes. | El rol y permisos se obtienen después de autenticar. `frontend/js/app.js` valida `/autenticacion/yo` antes de construir el menú. Todos los módulos protegidos verifican permisos en el servidor. | Ingresar con `estudiante`, `guardia`, `operaciones` y `admin` y comparar los menús. Intentar acceder a un endpoint sin permiso y comprobar respuesta 403. |
| RF-03 | Cerrar sesión de forma segura. | `POST /api/autenticacion/logout` revoca la sesión activa. El navegador elimina token y perfil local. | Iniciar sesión, cerrar sesión y comprobar que el token anterior ya no permite consultar `/api/autenticacion/yo`. |
| RF-04 | Bloqueo temporal tras varios intentos fallidos. | Máximo configurable por `LOGIN_MAX_ATTEMPTS` (5 por defecto) y bloqueo por `LOGIN_LOCK_MINUTES` (15 por defecto). La interfaz muestra cuenta regresiva. | Introducir contraseña incorrecta 5 veces con CAPTCHA válido. Debe responder 423 y mostrar bloqueo temporal. |
| RNF-01 | Contraseñas protegidas, nunca almacenadas en texto plano. | `backend/src/utils/security.js` usa hash derivado con sal aleatoria; la tabla de usuarios guarda `hash_contrasena`. | Revisar un registro de usuario y comprobar que no contiene la contraseña original. |
| RNF-02 | Login en computadora, tablet y celular. | Diseño responsive con puntos de adaptación en `frontend/css/app.css`, campos táctiles y `viewport`. | Probar aproximadamente 1366 px, 768 px y 390 px de ancho. |
| RNF-03 | Validación ágil en red institucional. | CAPTCHA se valida sin consulta adicional; el usuario, rol y permisos se consultan conjuntamente; existe índice por nombre de usuario y por sesión activa. | Realizar varios inicios de sesión en red local y comprobar respuesta inmediata en condiciones normales. |

## Prueba funcional recomendada

1. Abrir `/login` desde computadora.
2. Comprobar que aparecen usuario, contraseña y CAPTCHA.
3. Recargar el CAPTCHA con el botón circular.
4. Ingresar como `estudiante` y comprobar que sólo aparece **Mi parqueo**.
5. Cerrar sesión con **Salir** y comprobar que vuelve al login.
6. Repetir con `admin` y verificar que aparecen los módulos administrativos.
7. Realizar cinco intentos de contraseña incorrecta con un usuario válido y CAPTCHA correcto; comprobar el bloqueo temporal.
8. Abrir el login desde un celular o desde el modo responsive del navegador y comprobar que no exista desplazamiento horizontal ni campos cortados.

## Observación de interfaz

Las páginas visibles al usuario no mencionan el motor de datos, tecnología del servidor ni detalles internos de implementación. La interfaz explica únicamente funciones de uso y seguridad necesarias para el usuario.
