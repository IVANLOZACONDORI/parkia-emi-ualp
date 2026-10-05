# PARKIA EMI UALP - Versión 2
Sistema de gestión de parqueos mediante visión artificial e Internet de las Cosas, caso EMI UALP.

## Cambios principales de esta versión
- Base de datos PostgreSQL con tablas y campos en castellano.
- Ingreso vehicular controlado por **una cámara de visión artificial LPR/OCR** que lee placas y valida autorizaciones.
- Cámaras de parqueo dedicadas exclusivamente a determinar plaza **LIBRE/OCUPADA**.
- Nuevo rol **ESTUDIANTE**, limitado a la **Zona Estudiantes - Sector Trasero EMI UALP**.
- El estudiante sólo ve disponibilidad, cantidad de espacios libres y mapa de su zona. No ve placas, vehículos, usuarios, otras zonas, alertas internas ni administración.
- Interfaces por rol: cada actor visualiza únicamente los módulos que le corresponden.

## Inicio rápido
> Si ejecutaste una versión anterior, elimina primero el volumen para recrear la BD con el esquema en castellano:

```bash
docker compose down -v
docker compose up --build
```

Abrir: http://localhost:4000
Login: http://localhost:4000/login
Salud API: http://localhost:4000/api/salud

## Usuario estudiante de demostración
- Usuario: `estudiante`
- Contraseña: `PARKIA2026!Est`
- Zona: `Zona Estudiantes - Sector Trasero`

Las demás credenciales se encuentran en `docs/CREDENCIALES_DEMO.txt`.
