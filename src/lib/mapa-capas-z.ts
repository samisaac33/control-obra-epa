/** Capas z-index del mapa (Tailwind arbitrary values). */

/** Barra GPS / controles flotantes sobre el canvas del mapa (no portales). */
export const Z_MAPA_BARRA_CONTROLES = "z-[50]" as const

export const Z_MAPA_PANTALLA_COMPLETA = "z-[200]" as const
export const Z_MAPA_OVERLAY = "z-[210]" as const
export const Z_MAPA_DIALOG = "z-[220]" as const
export const Z_MAPA_SELECT_EN_DIALOG = "z-[230]" as const

/** SelectContent (Radix portal) por encima de bottom sheets del mapa (z 210). */
export const SELECT_CONTENT_POPPER_EN_MAPA = `${Z_MAPA_SELECT_EN_DIALOG} max-h-[min(16rem,50dvh)] w-(--radix-select-trigger-width)` as const

/** Leaflet Marker zIndexOffset — marcadores A/B/C normales. */
export const Z_MAPA_MARCADOR_PUNTO = 600
/** Leaflet Marker zIndexOffset — frente en ejecución (parpadeo), encima de otros puntos. */
export const Z_MAPA_MARCADOR_FRENTE_PARPADEO = 1500
