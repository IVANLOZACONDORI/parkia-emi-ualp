
# METODOLOGÍA DE POSICIONAMIENTO DE PLAZAS · PARKIA V25

## 1. Base de referencia
Se utilizó el croquis aéreo proporcionado por el usuario como referencia operativa. En dicha imagen se trazaron líneas de color para indicar el patrón real de implantación de las plazas:

- **Rojo**: plazas de estudiantes.
- **Morado**: plazas de autoridades.
- **Naranja**: plazas administrativas.

## 2. Criterio aplicado
La referencia dibujada por el usuario **no se muestra** en la interfaz final. En su lugar, cada línea fue interpretada como un **eje de ubicación** para posicionar las plazas del sistema.

## 3. Procedimiento técnico
1. Se identificó la orientación y ubicación de cada eje dibujado.
2. Se tomaron puntos representativos sobre dichos ejes.
3. Los puntos fueron convertidos a **coordenadas normalizadas porcentuales** (`x%`, `y%`) respecto al tamaño total del mapa.
4. Cada plaza fue asignada a una posición concreta sobre esos ejes, siguiendo un orden lógico de lectura.
5. Las líneas fueron eliminadas visualmente y sustituidas por **targets/tarjetas de estado**.

## 4. Distribución usada
### 4.1 Estudiantes
Se identificaron 8 ejes principales, sobre los cuales se distribuyeron las 24 plazas de estudiantes (3 por eje, de arriba hacia abajo).

### 4.2 Autoridades
Se identificaron 2 ejes principales, sobre los cuales se distribuyeron 8 plazas de autoridades (4 por eje, de arriba hacia abajo).

### 4.3 Administrativo
Se definieron 3 columnas de implantación derivadas de la referencia naranja, para distribuir 9 plazas administrativas (3 por columna).

## 5. Objetivo de diseño
El objetivo fue lograr una visualización:
- fiel a la referencia del usuario,
- limpia (sin mostrar líneas auxiliares),
- profesional,
- y técnicamente mantenible.

## 6. Observación
Este posicionamiento puede reajustarse posteriormente si se realiza una medición topográfica, levantamiento en campo o confirmación institucional más precisa.
