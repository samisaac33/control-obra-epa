import {
  FECHA_INICIO_PLAZO_EJECUCION,
  FECHA_PAGO_ANTICIPO,
  PLAZO_CALENDARIO_DIAS,
  PORCENTAJE_ANTICIPO_CONTRATO,
  PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION,
} from "@/src/data/contrato-emergencia-severino-trasvase"
import { PRESUPUESTO_OFERTA_SIN_IVA_USD } from "@/src/data/planilla/presupuesto-desasolve-emergencia"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

export type ValoresPorDefectoPlanilla = {
  fecha_inicio_plazo: string
  plazo_dias: number
  dias_por_planilla: number
  porcentaje_avance_planilla_1: number
  observaciones: string
}

export function valoresPorDefectoPlanilla(proyectoId: string): ValoresPorDefectoPlanilla | null {
  if (proyectoId !== PROYECTO_DESASOLVE_CANALES) return null

  const montoAnticipo = (PRESUPUESTO_OFERTA_SIN_IVA_USD * PORCENTAJE_ANTICIPO_CONTRATO) / 100

  return {
    fecha_inicio_plazo: FECHA_INICIO_PLAZO_EJECUCION,
    plazo_dias: PLAZO_CALENDARIO_DIAS,
    dias_por_planilla: 30,
    porcentaje_avance_planilla_1: PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION,
    observaciones: `Anticipo ${PORCENTAJE_ANTICIPO_CONTRATO} % pagado el ${FECHA_PAGO_ANTICIPO} (viernes). Monto referencial sin IVA: USD ${montoAnticipo.toFixed(2)}.`,
  }
}
