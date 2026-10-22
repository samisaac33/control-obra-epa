import type { CanalTramo } from "@/src/data/tramos/types"
import {
  idsRegistrosMaquinariaCanonicosPorMinitramo,
  tramoTienePuntosGpsConfirmados,
} from "@/src/lib/mapa-jornada-minitramo"
import type { JornadaMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
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

/** Horas que suma /maquinaria (jornadas operativas del consolidado). */
export function totalHorasOperativasConsolidadas(
  jornadas: JornadaMaquinariaProyecto[]
): number {
  return kpisMaquinariaDesasolve(jornadas).totalHoras
}

/**
 * Horas ligadas a minitramos con la misma regla canónica que el mapa
 * (una jornada por minitramo, sin duplicados manuales legacy).
 */
export function totalHorasRegistrosCanonicosMapa(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[],
  registros: readonly TramoRegistroMaquinaria[]
): number {
  const ids = idsRegistrosMaquinariaCanonicosPorMinitramo(tramos, puntos, [...registros])
  let total = 0
  for (const r of registros) {
    if (r.es_incidencia || !ids.has(r.id)) continue
    if (r.duracion_horas != null) total += r.duracion_horas
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

  for (const r of registrosCrudos) {
    if (r.es_incidencia) continue
    if (idsConsolidados.has(r.id)) {
      if (!idsCanonicos.has(r.id) && !tramoTienePuntosGpsConfirmados(r.tramo_id, puntos)) {
        if (r.duracion_horas != null) horasManualesTramosSinGps += r.duracion_horas
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
