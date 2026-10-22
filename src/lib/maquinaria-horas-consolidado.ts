import type { CanalTramo } from "@/src/data/tramos/types"
import {
  idsRegistrosMaquinariaCanonicosPorMinitramo,
  tramoTienePuntosGpsConfirmados,
} from "@/src/lib/mapa-jornada-minitramo"
import {
  horasEfectivasJornada,
  type JornadaMaquinariaProyecto,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import { mapaMinitramoTerminadoPorPuntoFin } from "@/src/lib/mapa-jornada-minitramo"
import { kpisMaquinariaDesasolve } from "@/src/lib/maquinaria-desasolve-resumen"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import type { TramoRegistroMaquinaria } from "@/src/lib/tramo-maquinaria-historial"

function sumaHorasOperativas(registros: readonly Pick<TramoRegistroMaquinaria, "es_incidencia" | "duracion_horas">[]): number {
  let total = 0
  for (const r of registros) {
    if (r.es_incidencia) continue
    if (r.duracion_horas != null) total += r.duracion_horas
  }
  return total
}

/** Horas que suma /maquinaria (`duracion_horas` ya normalizada: solo minitramos terminados con GPS). */
export function totalHorasOperativasConsolidadas(
  jornadas: JornadaMaquinariaProyecto[]
): number {
  return kpisMaquinariaDesasolve(jornadas).totalHoras
}

/**
 * Horas canónicas con regla de minitramo terminado (comparación contra BD cruda en auditoría).
 */
export function totalHorasRegistrosCanonicosMapa(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[],
  registros: readonly TramoRegistroMaquinaria[]
): number {
  const ids = idsRegistrosMaquinariaCanonicosPorMinitramo(tramos, puntos, [...registros])
  const terminadoPorPuntoFin = mapaMinitramoTerminadoPorPuntoFin(tramos, puntos)
  let total = 0
  for (const r of registros) {
    if (r.es_incidencia || !ids.has(r.id)) continue
    const horas = horasEfectivasJornada(r, terminadoPorPuntoFin)
    if (horas != null) total += horas
  }
  return total
}

export type AuditoriaHorasMaquinaria = {
  horasConsolidado: number
  horasCanonicasMapa: number
  horasManualesTramosSinGps: number
  horasExcluidasEnTramosConGps: number
  /** En obras con GPS, consolidado = canónicas + manual sin GPS (habitualmente 0). */
  coherente: boolean
}

/**
 * Comprueba que las horas del consolidado coinciden con mapa + manual permitido.
 * `registrosCrudos`: filas de BD antes de filtrar; `jornadasConsolidadas`: salida de cargarJornadasMaquinariaProyecto.
 */
export function auditarHorasMaquinaria(params: {
  tramos: CanalTramo[]
  puntos: TramoPuntoAvance[]
  registrosCrudos: readonly TramoRegistroMaquinaria[]
  jornadasConsolidadas: JornadaMaquinariaProyecto[]
}): AuditoriaHorasMaquinaria {
  const { tramos, puntos, registrosCrudos, jornadasConsolidadas } = params

  const horasConsolidado = totalHorasOperativasConsolidadas(jornadasConsolidadas)
  const horasCanonicasMapa = totalHorasRegistrosCanonicosMapa(tramos, puntos, registrosCrudos)
  const idsCanonicos = idsRegistrosMaquinariaCanonicosPorMinitramo(tramos, puntos, [...registrosCrudos])
  const idsConsolidados = new Set(jornadasConsolidadas.map((j) => j.id))

  let horasManualesTramosSinGps = 0
  let horasExcluidasEnTramosConGps = 0

  const terminadoPorPuntoFin = mapaMinitramoTerminadoPorPuntoFin(tramos, puntos)

  for (const r of registrosCrudos) {
    if (r.es_incidencia) continue
    if (idsConsolidados.has(r.id)) {
      if (!idsCanonicos.has(r.id) && !tramoTienePuntosGpsConfirmados(r.tramo_id, puntos)) {
        const horas = horasEfectivasJornada(r, terminadoPorPuntoFin)
        if (horas != null) horasManualesTramosSinGps += horas
      }
      continue
    }
    if (tramoTienePuntosGpsConfirmados(r.tramo_id, puntos) && r.duracion_horas != null) {
      horasExcluidasEnTramosConGps += r.duracion_horas
    }
  }

  const coherente =
    Math.abs(horasConsolidado - (horasCanonicasMapa + horasManualesTramosSinGps)) < 1e-6

  return {
    horasConsolidado,
    horasCanonicasMapa,
    horasManualesTramosSinGps,
    horasExcluidasEnTramosConGps,
    coherente,
  }
}

/** Suma directa de horas operativas (útil en tests). */
export { sumaHorasOperativas }
