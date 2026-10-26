/** Metadatos contractuales — Resolución EPA-EPA-2026-00134-RES */

export const RESOLUCION_EMERGENCIA = "EPA-EPA-2026-00134-RES"

export const MEMBRETE_EPA = "EMPRESA PÚBLICA DEL AGUA EPA EP"

export const TITULO_PROCEDIMIENTO_EMERGENCIA =
  `PROCEDIMIENTO DE EMERGENCIA - RESOLUCIÓN Nro. ${RESOLUCION_EMERGENCIA}`

export const OBJETO_CONTRATO =
  "MANTENIMIENTO DE LA SUBESTACIÓN ELÉCTRICA SEVERINO Y CANALES DEL TRASVASE MANABÍ"

export const WATERMARK_PROYECTO_LINEA = `PROYECTO: EMERGENCIA SEVERINO Y TRASVASE (${RESOLUCION_EMERGENCIA})`

export const RADIO_DESALOJO_MAX_KM = 5.0

export const PLAZO_CALENDARIO_DIAS = 60

/** Inicio del plazo contractual (autorización de obra). */
export const FECHA_INICIO_PLAZO_EJECUCION = "2026-10-26"

/** Anticipo del 35 % devengado antes del inicio de obra. */
export const FECHA_PAGO_ANTICIPO = "2026-10-23"

export const PORCENTAJE_ANTICIPO_CONTRATO = 35

/** Excel / PDF programado de referencia (baseline fiscalización). */
export const PORCENTAJE_CRONOGRAMA_PROGRAMADO_PLANILLA_1 = 51.63

/** Cronograma ejecutado EPA y reparto valorado vigente calculado. */
export const PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1 = 61.34

/** Avance acumulado Planilla 1 (medición, plan maestro, defaults). */
export const PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION = PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1

/** Reparto volumétrico programático del libro de obra EPA — Planilla 1. */
export const PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1 = PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1

export const CAPACIDAD_VOLQUETA_M3_DEFAULT = 8.0

/** Rendimiento nominal contractual m³/h por tipo de excavadora (referencia planillaje). */
export const RENDIMIENTO_NOMINAL_M3_POR_H: Record<string, number> = {
  excavadora_brazo_corto: 45,
  excavadora_brazo_largo: 55,
  volqueta: 0,
  tractor_oruga: 0,
  motoniveladora: 0,
}

export const SECTORES_FRENTE = [
  "Canales Menores Trasvase Manabí",
  "Canal 2 San Antonio By Pass-Cativo en Chone",
  "Presa El Ceibal",
  "San Antonio By Pass-Cativo",
] as const
