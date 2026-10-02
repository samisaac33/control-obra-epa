# Guion v2 — Video: interpretación del mapa Desasolve

**Duración objetivo:** 4–6 minutos  
**Público:** técnicos de la empresa contratante (vista visitante)  
**Grabación:** producción `https://control-obra-epa.vercel.app/desasolve-canales/mapa` (ingreso visitante con PIN; no documentar PIN en repo)  
**Formato:** escritorio ≥1280×720, zoom navegador 100 %

---

## Leyenda (mensaje al técnico)

| Estado | Color |
|--------|--------|
| Pendiente | **Violeta** |
| En ejecución | **Naranja**, con **parpadeo** en leyenda y en frente de mapa |
| Terminado | **Verde** |

**Nota:** el trazo **violeta consolidado** (vista por defecto) es simplificación del recorrido; no confundir con «pendiente» hasta activar **«No consolidado»**.

---

## Checklist pre-grabación

- [ ] KPI **Tramos = 31**, **Km totales ≈ 65,33**
- [ ] Filtro **Tramos** en **Todos los tramos** (mostrar desplegable en video)
- [ ] «Vista tramos 1–24» **desactivada** para red completa
- [ ] Mapa cargado (tiles Leaflet)

Pausar **2–3 s** tras cada acción.

---

## A. KPIs y rol residente (0:00–0:45)

**Pantalla:** [`MapaTramosKpisBar`](../../src/components/mapa/MapaTramosKpisBar.tsx) — Avance global %, km ejecutados / km totales, chips Km totales, Tramos, Terminados, En ejecución.

**Narración:**

> Bienvenidos. Este mapa muestra el avance del **Desasolve de canales**.  
> Arriba ven el **avance global** en porcentaje y los **kilómetros ejecutados** respecto al total; el cálculo es por **longitud de canal**, no por cantar tramos.  
> Los indicadores resumen kilómetros totales, cantidad de tramos, cuántos están terminados y cuántos en ejecución.  
> Ustedes ingresan como **visitantes**: solo **consultan**. El **residente de obra** controla todo el registro: avance GPS, estados, **horas y jornadas de maquinaria**, y la actualización del **frente de trabajo** en el mapa.

---

## B. Filtro Tramos — «Todos los tramos» (0:45–1:05)

**Pantalla:** abrir select **Tramos** → opción **«Todos los tramos»** visible → cerrar con esa opción seleccionada.

**Narración:**

> En el filtro **Tramos**, la opción **«Todos los tramos»** permite ver **toda la red** del proyecto en un solo mapa.  
> Más adelante pueden elegir un tramo puntual para revisar detalle.

---

## C. Vista tramos 1–24 vs 31 tramos (1:05–1:55)

**Pantalla:**

1. Activar **«Vista tramos 1–24»** — mapa acotado al primer levantamiento.
2. Desactivar — red completa; señalar KPI **31 tramos** y **65,33 km** (aprox.).

**Narración:**

> La casilla **«Vista tramos 1–24»** muestra solo el **primer levantamiento topográfico** realizado por el topógrafo.  
> Al **desactivarla**, aparecen **todos los tramos de los canales ya conectados**: en total **31 tramos** y alrededor de **65,33 kilómetros** de longitud en el proyecto.

---

## D. Leyenda y colores (1:55–2:35)

**Pantalla:** leyenda completa; luego activar **«No consolidado»** para ver colores en el trazo.

**Narración:**

> La leyenda define tres estados: **Pendiente**, en **violeta**; **En ejecución**, en **naranja** con icono **parpadeante**; y **Terminado**, en **verde**.  
> Por defecto muchos trazos se ven en **violeta consolidado**: es una vista simplificada.  
> Marque **«No consolidado»** para ver el **violeta, naranja y verde** según el avance real de cada segmento.

---

## E. Zoom — longitud del minitramo (avance diario) (2:35–3:25)

**Pantalla:** «No consolidado» + «Mostrar puntos A, B, C…»; **zoom fuerte** (≥14) hasta etiquetas tipo **«XXX m»** sobre minitramos.

**Narración:**

> Cada tramo se divide en **minitramos** con GPS.  
> **Acercando el mapa** aparece la **longitud en metros** sobre cada minitramo: ahí se ve la **distancia de avance** registrada en ese tramo de obra, en la práctica el avance de la **jornada** o del tramo desasolvado que el residente confirmó.

---

## F. Punto naranja parpadeante — máquina en tiempo real (3:25–4:05)

**Pantalla:** zoom al marcador **naranja pulsante**; comparar con leyenda «En ejecución».

**Narración:**

> El **punto que parpadea en naranja** indica **dónde está trabajando la máquina en este momento**.  
> Es información que el **residente actualiza** en campo: refleja el frente de desasolve en **tiempo casi real**, no es un dato automático del visitante.  
> Ese marcador sigue visible aunque se oculten otros puntos A, B o C.

---

## G. Interacción y cierre (4:05–4:35)

**Pantalla:** hover en tramo; clic → modal resumen → cerrar; opcional pantalla completa del mapa.

**Narración:**

> Pueden pasar el cursor para ver minitramos y hacer **clic** para un resumen del tramo.  
> Recapitulando: KPIs al inicio; **31 tramos** y **65,33 km** con todos los canales conectados; **1–24** para el primer levantamiento; **violeta / naranja parpadeante / verde** en la leyenda; **zoom** para longitudes; **parpadeo naranja** = máquina trabajando; el **residente** registra y ustedes **supervisan** desde este mapa. Gracias.
