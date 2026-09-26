# Análisis técnico: topología de tramos, riesgo ENOS y Trasvase Manabí

Documento de referencia para el contrato de **desasolve de canales** (EPA EP, Sistema Trasvase Manabí, cantón Rocafuerte y zona de influencia). Complementa la capa **«Brechas de conexión (QA)»** en `/mapa`.

## 1. Marco: emergencia, EPA y reducción del riesgo

- **Gestión del riesgo de desastres (GRD):** no eliminar El Niño, sino **reducir vulnerabilidad** y **aumentar capacidad de respuesta** del sistema hídrico (continuidad de conducción, capacidad de drenaje, acceso para desazolve).
- **Contrato de emergencia:** prioriza **restablecer continuidad hidráulica** y **capacidad de sección** antes de perfeccionar la cartografía; el KMZ actual es **referencia operativa**, no diseño definitivo.
- **Competencia EPA:** mantenimiento de canales de riego y componentes del Trasvase; la EPA declaró emergencia del sistema (2025) por **riesgo de desbordamiento**, sedimentos y daños en taludes ([Primicias](https://www.primicias.ec/sociedad/riesgo-inminente-desbordamientos-emergencia-sistema-trasvase-agua-manabi-92546/)).
- **ENOS 2023–2024:** Manabí entre las provincias más afectadas (inundaciones ~47 % de eventos en cierre SGR); plan nacional incluye **Trasvase Manabí** en sistemas a intervenir ([SGR Plan ENOS](https://www.gestionderiesgos.gob.ec/wp-content/uploads/2023/06/PLAN-DE-ACCION-ANTE-EL-FENOMENO-EL-NINO-ECUADOR-23-24_compressed.pdf)).

### Histórico cuenca baja río Portoviejo (Rocafuerte)

| Evento | Efectos relevantes para canales / riego |
|--------|----------------------------------------|
| **El Niño 1982–83** | Saturación de suelos, quebradas activas, descarga Poza Honda, niveles altos en ríos y esteros ([AVSF](https://www.avsf.org/app/uploads/2025/02/inundaciones-rio-portoviejo.pdf)). |
| **El Niño 1997–98** | ~18 meses de lluvias anómalas; inundación **Rocafuerte** y Portoviejo; daño a conducciones, plantas, vías (incl. **Chone–Tosagua–Rocafuerte–El Ceibal**); brotes sanitarios ([Reclim cuenca Portoviejo](https://www.climatol.eu/reclim/reclim16c.pdf)). |
| **Registro 1982–2018** | ~185 inundaciones en cuenca; aumento de frecuencia post-2010 ([AVSF](https://www.avsf.org/app/uploads/2025/02/inundaciones-rio-portoviejo.pdf)). |
| **El Niño fuerte (escenario)** | Inundación prolongada de cuenca baja (>2 meses agua) — mismo documento AVSF. |

**Implicación para tramos:** en ENOS fuerte, un canal **fragmentado en el mapa** dificulta priorización de frentes, cómputo de km continuos y coherencia con **macrotramos** de riego; no sustituye estudio hidráulico, pero **sí afecta gestión de obra y auditoría**.

## 2. Diagnóstico del KMZ actual (`desasolve-canales.kmz`)

- **26 polilíneas** numeradas (falta **tramo 15** en archivos del repo; typo `tremo 16`).
- **Orden numérico ≠ red continua:** la cadena 1→2→3 está bien (~13–15 m entre extremos); **3→5 no** (~**632 m**).
- **Cortes en cruces:** patrón coherente con “un tramo nuevo por bifurcación” sin criterio de **macrotramo hidráulico**.
- **Duplicación lógica:** varios tramos comparten el mismo corredor **La California – El Guabital** (6, 7, 10, 13…) con micro-conexiones (<20 m) pero identidades distintas en obra.

Tolerancia de continuidad en app: **5 m** (`TOLERANCIA_CONTINUACION_M` en `tramo-geometria.ts`).

## 3. Brechas alineadas con revisión de campo (imágenes taller)

Distancias mínimas entre extremos de polilíneas (KMZ, sep 2025):

| Par | Distancia | Lectura técnica |
|-----|-----------|-----------------|
| **3 – 5** | ~631 m | Misma lógica que trazo rojo Rocafuerte norte (E39 / continuidad urbana). |
| **3 – 4** | ~463 m | Ramal **Sosote Adentro** aislado del eje 1-2-3. |
| **4 – 5** | ~444 m | Cierre alternativo hacia eje Tabacales–Horcón. |
| **13 – 21** | ~1863 m | **La California ↔ San Eloy** — discontinuidad mayor; coherente con enlace propuesto en imagen 2. |
| **14 – 9** | ~335 m | Sector **El Guabital / Río Bachillero**. |
| **8 – 9** | ~288 m | Ramal noreste. |
| **21 – 9** | ~1336 m | San Eloy ↔ Bachillero (validar con recorrido). |

**Conexiones ya continuas (<25 m)** útiles como control: 1→2, 2→3, 6↔7↔14, 7↔25, 25→13, 16→20, 24→17.

## 4. Riesgos si no se corrige la topología (matriz cualitativa)

| Riesgo | Causa (KMZ) | Consecuencia en emergencia ENOS |
|--------|-------------|----------------------------------|
| **R1 Priorización errónea** | Tramos “cortos” en mismo corredor | Doble conteo o km “fantasma”; frentes mal asignados. |
| **R2 Brecha hidráulica no gestionada** | 3–5, 13–21 sin enlace | Obra cree canal continuo; mapa/KPI no reflejan tramo real pendiente. |
| **R3 Nomenclatura** | Solo números 1–27 | Contratista no ubica frente; errores en radio (Ceibal, California, etc.). |
| **R4 ENOS + sedimento** | EPA: azolve y taludes | Tramos mal delimitados retrasan desazolve en tramos críticos pre-desborde. |
| **R5 Responsabilidad contractual** | Referencia vs definitivo | Necesidad de **versión** de geometría (KMZ v0 referencia, v1 validada EPA). |

**Mitigación (no sustitución de estudio):**

1. **Fase QA (actual):** capa de brechas + informe + taller con topografía EPA.
2. **Fase agrupación:** macrotramos (Ceibal→California, Sosote→Horcón…) sin cambiar GPS minitramos.
3. **Fase geometría validada:** nuevo KMZ, migración de puntos por abscisa, acta de aceptación.

## 5. Uso de la capa en `/mapa`

1. Activar **«Brechas de conexión (QA)»**.
2. Líneas **rojas/naranjas:** pares en `conexiones-propuestas-desasolve.ts`.
3. Opcional: **brechas automáticas** &lt;800 m (resto de discontinuidades locales).
4. Tocar la línea punteada: tooltip con distancia y nota.

**No** fusiona tramos en base de datos; es **control visual** hasta validación topográfica.

## 6. Referencias operativas EPA en Rocafuerte

EPA reportó desazolve **Sosote al Horcón** (Rocafuerte), alineado con tramos 4–5 y sector Tabacales ([Noti-América](https://noti-america.com/site/ecuador/2024/09/22/la-epa-ep-intensifica-trabajos-de-desazolve-y-limpieza-de-canales-en-manabi/)).

---

*Elaborado para control de obra EPA / JBS Consorcio. Validación hidráulica y definitiva de ejes: ingeniería EPA o fiscalizador.*
