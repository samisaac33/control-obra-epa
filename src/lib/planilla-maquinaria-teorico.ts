import type { Rubro } from "@/data/presupuesto"
import type { EquipoMinimoArrendamiento } from "@/src/data/planilla/equipo-minimo-arrendamiento"
import { EQUIPO_MINIMO_ARRENDAMIENTO } from "@/src/data/planilla/equipo-minimo-arrendamiento"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import {
  calcularRequerimientoPago,
  type MedicionRubroGuardada,
} from "@/src/lib/planilla-requerimiento-pago"

/**
 * Rendimientos APU oferta adjudicada (m³ efectivos por hora-máquina).
 * Trasvase menores vs San Antonio mayores según pliego.
 */
export const RENDIMIENTO_APU_M3_H = {
  desazolve_trasvase: 0.0115,
  desazolve_san_antonio: 0.013,
  desalojo: 0.008,
  tendido: 0.00392,
} as const

const RUBROS_DESAZOLVE_TRASVASE = [2] as const
const RUBROS_DESAZOLVE_SAN_ANTONIO = [6] as const
const RUBROS_DESALOJO = [3, 7] as const
const RUBROS_TENDIDO = [4, 8] as const

function cantidadPeriodoRubro(
  lineas: ReturnType<typeof calcularRequerimientoPago>["lineas"],
  rubroId: number
): number {
  return lineas.find((l) => l.rubroId === rubroId)?.cantidadPeriodo ?? 0
}

function sumCantidadPeriodo(lineas: ReturnType<typeof calcularRequerimientoPago>["lineas"], ids: readonly number[]): number {
  let s = 0
  for (const id of ids) s += cantidadPeriodoRubro(lineas, id)
  return s
}

/** Horas-máquina teóricas agregadas por rol operativo (APU). */
export type HorasTeoricasMaquinariaAgregadas = {
  desazolveTrasvase: number
  desazolveSanAntonio: number
  desalojo: number
  tendido: number
  volumenDesazolveTrasvaseM3: number
  volumenDesazolveSanAntonioM3: number
  volumenDesalojoM3: number
  volumenTendidoM3: number
}

export function calcularHorasTeoricasAgregadasPlanilla(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero,
  mediciones?: MedicionRubroGuardada[]
): HorasTeoricasMaquinariaAgregadas {
  const { lineas } = calcularRequerimientoPago(rubros, config, periodo, planillaNumero, mediciones)

  const volumenDesazolveTrasvaseM3 = sumCantidadPeriodo(lineas, RUBROS_DESAZOLVE_TRASVASE)
  const volumenDesazolveSanAntonioM3 = sumCantidadPeriodo(lineas, RUBROS_DESAZOLVE_SAN_ANTONIO)
  const volumenDesalojoM3 = sumCantidadPeriodo(lineas, RUBROS_DESALOJO)
  const volumenTendidoM3 = sumCantidadPeriodo(lineas, RUBROS_TENDIDO)

  return {
    volumenDesazolveTrasvaseM3,
    volumenDesazolveSanAntonioM3,
    volumenDesalojoM3,
    volumenTendidoM3,
    desazolveTrasvase:
      volumenDesazolveTrasvaseM3 > 0
        ? volumenDesazolveTrasvaseM3 / RENDIMIENTO_APU_M3_H.desazolve_trasvase
        : 0,
    desazolveSanAntonio:
      volumenDesazolveSanAntonioM3 > 0
        ? volumenDesazolveSanAntonioM3 / RENDIMIENTO_APU_M3_H.desazolve_san_antonio
        : 0,
    desalojo: volumenDesalojoM3 > 0 ? volumenDesalojoM3 / RENDIMIENTO_APU_M3_H.desalojo : 0,
    tendido: volumenTendidoM3 > 0 ? volumenTendidoM3 / RENDIMIENTO_APU_M3_H.tendido : 0,
  }
}

function excavadorasEnEquipoMinimo(): EquipoMinimoArrendamiento[] {
  return EQUIPO_MINIMO_ARRENDAMIENTO.filter((e) => e.categoria === "desazolve")
}

function repartoEquitativo(totalHoras: number, cantidad: number): number {
  if (cantidad <= 0 || totalHoras <= 0) return 0
  return totalHoras / cantidad
}

/** Reparte horas teóricas APU entre filas de equipo mínimo con rendimiento. */
export function horasTeoricasPorEquipoMinimo(
  agregadas: HorasTeoricasMaquinariaAgregadas
): Map<string, number> {
  const map = new Map<string, number>()
  const exc = excavadorasEnEquipoMinimo()
  const horasExc =
    agregadas.desazolveTrasvase + agregadas.desazolveSanAntonio
  const porExc = repartoEquitativo(horasExc, exc.length)
  for (const e of exc) map.set(e.id, porExc)

  const volq = EQUIPO_MINIMO_ARRENDAMIENTO.find((e) => e.categoria === "desalojo")
  if (volq) map.set(volq.id, agregadas.desalojo)

  for (const e of EQUIPO_MINIMO_ARRENDAMIENTO.filter((e) => e.categoria === "tendido")) {
    map.set(e.id, agregadas.tendido)
  }

  return map
}
