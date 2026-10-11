# Informe semanal en video — 5–11 oct 2026

**Formato:** 16:9, ~57 s, narración `es-MX-JorgeNeural` (`--rate=-2%`).

## Publicación

- Página: `/capacitacion/informe-semanal/2026-10-05/video`
- MP4: `/capacitacion/informe-semanal-desasolve-2026-10-05.mp4`

## Datos (corte producción)

| Métrica semana | Valor |
|----------------|-------|
| Jornadas | 52 |
| Metros registrados | ~20,03 km |
| Horas equipo | 364 |
| Días con actividad | 7 |
| Tramos con jornada | 6 |
| Destacado | tramo 19 · Brazo Corto |

| Acumulado al 11-oct | Valor |
|---------------------|-------|
| Avance global | 21,2 % |
| Km ejecutados / totales | 14,1 / 66,68 km |
| Terminados / en ejecución | 3 / 2 |

## Regenerar

```bash
CAPACITACION_PIN=… node scripts/informe-semanal-extraer-produccion.mjs
# Actualizar bundle / narración si cambian cifras
/home/ubuntu/.local/bin/edge-tts --voice es-MX-JorgeNeural --rate=-2% \
  -f docs/capacitacion/informe-semanal-2026-10-05.txt \
  --write-media informe-semanal-2026-10-05.mp3 --write-subtitles informe-semanal-2026-10-05.vtt
DISPLAY=:1 INFORME_NARRATION_MS=57000 node scripts/informe-semanal-grabar.mjs
# Mux raw + mp3 (syncStart del log)
```
