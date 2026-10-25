/**
 * Modelo operativo acordado en campo: la mayor parte del material excavado
 * se reconforma in situ (muros/taludes); desalojo = solo excedente.
 */

/** Referencia para antiglosa: fracción máxima “normal” de V₁ que va a botadero sin observación. */
export const FRACCION_DESALOJO_SOBRE_V1_REFERENCIA = 0.35

export const FLUJO_MATERIAL_DESASOLVE = {
  titulo: "Flujo de material en desasolve",
  pasos: [
    "Excavadora retira asolve del cauce (rub. 2 / 6 — incluye reconformación de taludes).",
    "Material apto se coloca y compacta/reconforma muros y taludes del mismo canal (misma partida).",
    "Solo el excedente (no reutilizable in situ, acumulaciones, material fuera de especificación) va a volqueta → botadero (rub. 3 / 7).",
    "Rub. 4 / 8 (tendido): aplicar según tramo cuando el presupuesto exija tendido de material desalojado (no confundir con reconformación in situ del rub. 2/6).",
  ],
  balancePorTramo:
    "Por tramo o abscisa documentar: V_excavado ≈ V_reconformado_in_situ + V_desalojado_botadero (+ V_tendido si aplica).",
  volqueta:
    "Con reconformación mayoritaria, **1 volqueta del equipo mínimo suele ser suficiente** para picos de excedente; refuerzo o subcontrato solo si el excedente diario supera la capacidad de viajes (botadero ≤ 5 km).",
  medicion:
    "Medición rub. 3/7 = m³ **efectivamente transportados** (tickets TK). No igualar automáticamente al volumen topográfico V₁ del desazolve.",
  antiglosa:
    "V₁ >> V₂ es **esperado**. Alerta si V₂ > V₁ o si hay tickets sin respaldo de excedente en libro de obra / fotos.",
} as const
