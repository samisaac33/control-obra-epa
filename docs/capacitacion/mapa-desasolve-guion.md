# Guion — Video: interpretación del mapa Desasolve

**Duración objetivo:** 4–5 minutos  
**Público:** técnicos de la empresa contratante (vista visitante, solo lectura)  
**Ruta producción:** `/desasolve-canales/mapa`  
**Ruta demo (sin PIN, datos ficticios):** `/capacitacion/mapa-desasolve`  
**Formato grabación:** escritorio ≥1280×720, navegador al 100 %

---

## Notas para el operador de grabación

| Momento | Acción en pantalla |
|---------|-------------------|
| Tramo ejemplo violeta | Vista consolidada activa (checkbox «No consolidado» **desmarcado**); cualquier tramo visible en violeta `#7c3aed` |
| Tramo ejemplo detalle | Activar «No consolidado»; elegir tramo con mezcla verde (terminado) y ámbar/índigo |
| Zoom minitramos | Acercar con rueda o `+` hasta ver etiquetas de longitud (zoom ≥14) |
| Parpadeo | Buscar marcador circular ámbar con animación de pulso; si no hay en datos, mostrar leyenda «En ejecución» y explicar voz en off |
| Modal | Clic en un segmento coloreado → modal resumen → «Ver detalle del tramo» (opcional) → Cerrar |

Pausar **2–3 s** después de cada toggle o cambio de zoom para que el espectador asimile.

---

## 0:00–0:25 — Introducción

**Narración:**

> Este video explica cómo **interpretar** el mapa de avance del proyecto **Desasolve de canales**.  
> Ustedes verán la misma pantalla que un visitante autorizado: pueden consultar el avance, pero no registrar cambios; eso lo hace el residente de obra en campo.  
> Arriba del mapa aparecen indicadores: kilómetros totales del proyecto, kilómetros ya ejecutados según minitramos terminados con GPS, y el porcentaje de avance global calculado por **longitud**, no por cantidad de tramos.

**Pantalla:** KPIs visibles; vista general del mapa con trazos violeta (consolidado por defecto).

---

## 0:25–1:05 — Leyenda de estados

**Narración:**

> La leyenda resume tres **estados operativos** del desasolve en el trazo del canal.  
> **Pendiente**, en tono índigo: tramo o segmento sin avance operativo registrado.  
> **En ejecución**, en ámbar: hay trabajo activo en ese tramo o minitramo.  
> **Terminado**, en verde: el minitramo quedó completado y confirmado.  
> En los tramos numerados del **25 al 34** los colores son tonos más cálidos —naranjas y verdes— pero el **significado es el mismo**: pendiente, en ejecución o terminado.

**Pantalla:** Desplazar levemente para que la leyenda quede legible; señalar cada ítem con el cursor.

---

## 1:05–1:55 — Vista consolidada (tramos violeta)

**Narración:**

> Al abrir el mapa, por defecto verán muchos tramos en **color violeta**.  
> Eso **no** significa «pendiente» según la leyenda. Violeta es la **vista consolidada**: una imagen simplificada del recorrido del canal, para orientarse rápido en el conjunto de la obra.  
> Los tramos terminados que el sistema sigue resaltando pueden verse en verde aun en esta vista.  
> Para ver el **detalle por estado**, marquen la opción **«No consolidado»**. El trazo pasa a colorearse según pendiente, en ejecución o terminado, como en la leyenda.

**Pantalla:** Mostrar tramos violeta → marcar «No consolidado» → mostrar cambio de colores → volver a desmarcar (opcional) o dejar en no consolidado para la siguiente sección.

---

## 1:55–2:45 — Zoom y minitramos

**Narración:**

> Cada tramo largo se divide en **minitramos**: tramos cortos donde se registra el avance con GPS.  
> Al **acercar** el mapa, aparecen los **números de tramo** y, con más zoom, las **longitudes** sobre cada minitramo.  
> Así pueden ver qué tramo está en verde —terminado— y cuál sigue pendiente o en ejecución.  
> La opción **«Ocultar MTT»** quita el resaltado de minitramos ya terminados, útil para enfocarse solo en lo que falta o está activo.  
> **«Mostrar números de tramos»** ayuda a identificar cada canal por su código en pantalla.

**Pantalla:** Zoom progresivo a un tramo con varios segmentos; activar/desactivar «Ocultar MTT» brevemente; activar «Mostrar números de tramos» si hace falta.

---

## 2:45–3:35 — Puntos A, B, C y parpadeo (frente de trabajo)

**Narración:**

> Los **puntos A, B, C** son las esquinas del avance georreferenciado a lo largo del canal.  
> Con **«Mostrar puntos A, B, C…»** activado verán esas letras en el mapa.  
> El punto que **parpadea** en ámbar indica el **frente de trabajo actual**: dónde está la operación en este momento.  
> Ese marcador permanece visible aunque oculten otros puntos, para no perder de vista el frente.  
> En la leyenda, el círculo pulsante junto a «En ejecución» es la misma referencia visual.

**Pantalla:** Asegurar «Mostrar puntos A, B, C…» marcado; acercar a un punto parpadeante o mostrar leyenda si no hay parpadeo en vivo.

---

## 3:35–4:20 — Interacción: hover, clic y filtros

**Narración:**

> Pasando el cursor sobre un tramo coloreado verán información de los minitramos.  
> Con un **clic** se abre un **resumen** del tramo y del segmento seleccionado.  
> Pueden filtrar por **estado** o **semana programada**, y elegir un **tramo específico** en el selector.  
> **«Vista tramos 1–24»** limita la pantalla a esa zona si solo les interesa ese sector.  
> El botón de **pantalla completa** del mapa facilita la revisión en reuniones o en tablet.

**Pantalla:** Hover → clic → modal → Cerrar; mostrar filtros estado/semana; pantalla completa del mapa unos segundos.

---

## 4:20–4:40 — Cierre

**Narración:**

> Recapitulando: **violeta** es vista consolidada simplificada; **verde** minitramo terminado; **ámbar** en ejecución; **parpadeo** frente actual; **zoom** para ver minitramos y longitudes.  
> Para registrar o corregir avance se requiere el acceso de **residente**; este mapa es su herramienta de **consulta y seguimiento**.  
> Gracias por su atención.

**Pantalla:** Vista general del mapa o KPIs; fundido final.

---

## Subtítulos (archivo `.srt` opcional)

Generar desde los bloques de narración con tiempos ajustados tras el recorte del video en postproducción.

## Referencias técnicas en el código

- Consolidado violeta: `COLOR_TRAMO_CONSOLIDADO` en `src/lib/mapa-tramos-estilo.ts`
- Leyenda: `ESTADOS_OPERATIVOS_MAPA` en `src/data/tramos/types.ts`
- Parpadeo: clase `.mapa-punto-en-ejecucion` en `src/app/globals.css`
- Zoom etiquetas: `ZOOM_MIN_ETIQUETAS_TRAMO` / `ZOOM_MIN_ETIQUETAS_LONGITUD`
