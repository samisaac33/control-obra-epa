import type { Rubro } from "@/data/presupuesto"
import type { BloqueLibroObraSeverinoEpa } from "@/src/data/libro-obra-formato-epa"
import { PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION } from "@/src/data/contrato-emergencia-severino-trasvase"
import {
  nombreCompletoPersonal,
  residenteObraElectrica,
} from "@/src/data/planilla/personal-tecnico-contratista"
import type { PlanillaNumero, PlanillaPeriodo } from "@/src/data/planilla/types"
import { fechasCalendarioInclusive } from "@/src/lib/libro-obra"

/** Hito Severino en una fecha concreta (no producción diaria continua). */
export type HitoSeverinoLibroObra = {
  rubros: number[]
  /** Narrativa operativa (plan maestro / secuencia eléctrica). */
  lineas: string[]
}

const TITULO_SEVERINO = "Subestación Eléctrica Severino"

/**
 * Días representativos dentro del periodo de planilla (offset 0 = primer día).
 * Planilla 1: cadena 9–16 al ~60 %; rub. 17–18 reservados a planilla 2.
 */
const HITOS_OFFSET_PLANILLA_1: Array<{ offset: number } & HitoSeverinoLibroObra> = [
  {
    offset: 0,
    rubros: [],
    lineas: [
      "Inspección visual, permisos de ingreso EPA y plan de pruebas eléctricas.",
      "Verificación de arribo de equipos de prueba (TTR / Megger).",
    ],
  },
  {
    offset: 3,
    rubros: [9],
    lineas: ["Pruebas eléctricas iniciales del transformador (TTR, resistencias, IP)."],
  },
  {
    offset: 6,
    rubros: [10, 11],
    lineas: [
      "Muestreo y análisis inicial de aceite dieléctrico.",
      "Análisis DGA y compuestos furánicos según ventana de laboratorio.",
    ],
  },
  {
    offset: 11,
    rubros: [12],
    lineas: ["Trasvase, filtrado y tratamiento de aceite (sistema termovacío)."],
  },
  {
    offset: 15,
    rubros: [13],
    lineas: ["Apertura, levantamiento de tapa y preparación para inspección interna."],
  },
  {
    offset: 19,
    rubros: [14],
    lineas: ["Inspección interna de núcleo, devanados, conexiones y accesorios."],
  },
  {
    offset: 23,
    rubros: [15],
    lineas: ["Ajustes y mantenimiento mecánico interno (aprietes, limpieza, empaques)."],
  },
  {
    offset: 27,
    rubros: [16],
    lineas: [
      "Avance de cierre y sellado del transformador (hito parcial al cierre Planilla 1).",
      `Meta de avance acumulado cadena Severino: ${PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION} %.`,
    ],
  },
]

const HITOS_OFFSET_PLANILLA_2: Array<{ offset: number } & HitoSeverinoLibroObra> = [
  {
    offset: 2,
    rubros: [16],
    lineas: ["Continuación cierre, estanqueidad, llenado y tratamiento final del aceite."],
  },
  {
    offset: 8,
    rubros: [17],
    lineas: ["Pruebas eléctricas finales del transformador."],
  },
  {
    offset: 14,
    rubros: [18],
    lineas: [
      "Análisis final de aceite, comparación de resultados y protocolo de aceptación para energización.",
    ],
  },
]

function hitosPorPlanilla(planillaNumero: PlanillaNumero): Array<{ offset: number } & HitoSeverinoLibroObra> {
  return planillaNumero === 1 ? HITOS_OFFSET_PLANILLA_1 : HITOS_OFFSET_PLANILLA_2
}

function detalleRubro(rubros: Rubro[], rubroId: number): string {
  const r = rubros.find((x) => x.id === rubroId)
  if (!r) return `Rubro ${rubroId}`
  return r.detalle.charAt(0).toUpperCase() + r.detalle.slice(1).toLowerCase()
}

export function textoTrabajosSeverinoProgramatico(
  hito: HitoSeverinoLibroObra,
  rubros: Rubro[],
  planillaNumero: PlanillaNumero
): string {
  const bullets: string[] = []
  for (const linea of hito.lineas) {
    bullets.push(`- ${linea}`)
  }
  for (const id of hito.rubros) {
    bullets.push(`- Rub. ${id}: ${detalleRubro(rubros, id)}.`)
  }
  if (hito.rubros.length > 0) {
    bullets.push(
      `- Medición planilla ${planillaNumero}: rubros ${hito.rubros.join(", ")} (ítems globales glb, hito de obra — no actividad civil diaria).`
    )
  }
  return bullets.join("\n")
}

/** Mapa fecha ISO → hito Severino (solo fechas seleccionadas del periodo). */
export function hitosSeverinoPorFechaPlanilla(
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero
): Map<string, HitoSeverinoLibroObra> {
  const dias = fechasCalendarioInclusive(periodo.fecha_inicio, periodo.fecha_fin)
  const map = new Map<string, HitoSeverinoLibroObra>()
  for (const h of hitosPorPlanilla(planillaNumero)) {
    const fecha = dias[h.offset]
    if (!fecha) continue
    map.set(fecha, { rubros: h.rubros, lineas: h.lineas })
  }
  return map
}

export function bloqueSeverinoProgramaticoDia(
  fecha: string,
  hitosPorFecha: Map<string, HitoSeverinoLibroObra>,
  proyectoId: string,
  rubros: Rubro[],
  planillaNumero: PlanillaNumero
): BloqueLibroObraSeverinoEpa | null {
  const hito = hitosPorFecha.get(fecha)
  if (!hito) return null
  const residente = residenteObraElectrica(proyectoId)
  if (!residente) return null

  return {
    titulo: TITULO_SEVERINO,
    residente: nombreCompletoPersonal(residente),
    trabajosRealizados: textoTrabajosSeverinoProgramatico(hito, rubros, planillaNumero),
  }
}
