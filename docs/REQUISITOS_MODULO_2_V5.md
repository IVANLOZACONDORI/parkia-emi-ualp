# Módulo 2: usuarios, roles y permisos (PARKIA V5)

- RF-05: formulario para registrar, editar, habilitar y deshabilitar usuarios. API `POST /api/usuarios` y `PATCH /api/usuarios/:id`.
- RF-06: rol individual obligatorio por usuario; se refleja en la autorización de cada petición.
- RF-07: zona asignable y requerida para ESTUDIANTE; su consulta `GET /api/estudiante/mi-parqueo` filtra estrictamente la zona asignada.
- RF-08: tabla de permisos por rol; el administrador puede actualizarlos con `PUT /api/usuarios/roles/:codigo/permisos`; cierre automático de sesiones afectadas.
- RNF-04: las APIs de cuentas están protegidas por `usuarios.gestionar`; la modificación de privilegios requiere adicionalmente `usuarios.permisos`, concedido solamente al administrador principal. Se impide a los administradores cambiar su propio rol o deshabilitar su cuenta.
- RNF-05: se registran estados anterior y nuevo de cada modificación en auditoría dentro de la misma transacción. No se registran contraseñas.

## Pruebas manuales necesarias
1. Iniciar la aplicación y entrar como `admin` con la contraseña de la guía de demostración.
2. Abrir Usuarios y registrar una cuenta. Confirmar que figura en la tabla y que puede iniciar sesión.
3. Editar nombre, rol y estado. Verificar que deshabilitarla impide iniciar sesión.
4. Crear estudiante sin zona (debe rechazarse); asignar zona válida y comprobar que solamente ve su parqueo.
5. Cambiar permisos de un rol y verificar el cierre de sus sesiones y la nueva navegación al ingresar.
6. Entrar como `soporte`: gestiona cuentas pero no modifica permisos.
7. Consultar auditoría y verificar entradas `USUARIO_CREAR`, `USUARIO_MODIFICAR`, `ROL_PERMISOS_MODIFICAR`.

Las verificaciones finales con Docker y la interfaz deben ejecutarse en el equipo de despliegue.
