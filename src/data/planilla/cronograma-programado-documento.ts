import { PORCENTAJE_CRONOGRAMA_PROGRAMADO_PLANILLA_1 } from "@/src/data/contrato-emergencia-severino-trasvase"

/** Avance del Excel oficial de cronograma valorado programado. */
export const AVANCE_PLANILLA_1_CRONOGRAMA_PROGRAMADO_PCT =
  PORCENTAJE_CRONOGRAMA_PROGRAMADO_PLANILLA_1

/** Excel fuente (51,63 %). */
export const CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH =
  "/documentos/planillas/cronograma-programado-5163.xlsx"

/** PDF registrado — conversión fiel del Excel. */
export const CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH =
  "/documentos/planillas/cronograma-valorado-programado-5163.pdf"

export const CRONOGRAMA_PROGRAMADO_PDF_MIME = "application/pdf"

export const CRONOGRAMA_PROGRAMADO_XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export function nombreArchivoCronogramaProgramadoPdf(): string {
  return "cronograma-valorado-programado-5163.pdf"
}

export function nombreArchivoCronogramaProgramadoXlsx(): string {
  return "cronograma-programado-5163.xlsx"
}
