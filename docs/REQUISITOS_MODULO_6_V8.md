# Módulo 6. Detección de ocupación por visión artificial (V8)

| Código | Implementación | Verificación |
|---|---|---|
| RF-25 | Procesamiento real de imágenes JPG/PNG/WebP por ROI y comparación con referencias libre/ocupada | Fotografiar 2 estados y una toma nueva |
| RF-26 | Actualización de plaza cuando el resultado supera umbrales conservadores | Consultar panel después de procesar |
| RF-27 | Índice de confianza heurístico junto a cada clasificación confirmada | Consultar historial |
| RF-28 | Recalibración de ROI X/Y/ancho/alto y muestras de ambos estados | Guardar referencias nuevamente |
| RF-29 | Historial persistido de evaluaciones, fecha/hora, resultado y métricas | Consultar últimas evaluaciones |
| RNF-13 | Requiere validación de exactitud con imágenes **de campo** | Registrar matriz de confusión |
| RNF-14 | El tablero se refresca cada 12 segundos mientras está abierto | Abrir página desde 2 navegadores |
| RNF-15 | Extracción de bordes/normalización de contraste; ante oclusiones, sombras o lluvia inciertas evita actualizar | Ensayar casos adversos reales |

## Limitaciones y pruebas pendientes
Este método es un **clasificador visual por referencias calibradas**, no un modelo entrenado de detección de automóviles. La confianza es una medida heurística de separación entre referencias, **no una probabilidad calibrada**. No garantiza precisión en lluvia, variaciones extremas de luz u oclusiones. No se integra por defecto una transmisión RTSP/IP continua: se procesan fotografías cargadas por el operador (incluidas capturas desde cámara móvil compatible). La base de pruebas de campo no se suministró y **RNF-13 y RNF-15 no pueden declararse validados hasta efectuar ensayos reales**.

## Procedimiento de aceptación recomendado
1. Calibrar todas las plazas con fotos claras libre/ocupada desde cámara y encuadre fijo.
2. Para cada plaza capturar como mínimo 20 casos libres y 20 ocupados, incluyendo sol, sombras, atardecer, lluvia y obstáculos cuando existan.
3. Contabilizar VP, VN, FP, FN e inciertos; medir sensibilidad, especificidad y tasa de indeterminados.
4. Revisar errores, recolocar la ROI y repetir las pruebas sin utilizar fotos de calibración como datos de ensayo.
5. Validar que el estado no se cambia ante resultado INCIERTO y que el historial persiste.
