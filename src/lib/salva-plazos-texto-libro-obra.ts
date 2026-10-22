import {
  etiquetaTipoParalizacion,
  type TipoEventoParalizacion,
} from "@/src/data/auditoria/types"
import {
  MEMBRETE_EPA,
  OBJETO_CONTRATO,
  RESOLUCION_EMERGENCIA,
} from "@/src/data/contrato-emergencia-severino-trasvase"

export type GenerarTextoParalizacionInput = {
  tipo_evento: TipoEventoParalizacion
  fecha_inicio: string
  fecha_fin: string | null
  horas_perdidas: number | null
  descripcion: string | null
  sector_nombre?: string
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generarTextoLibroObraParalizacion(input: GenerarTextoParalizacionInput): string {
  const frente = input.sector_nombre?.trim() || "frente de trabajo en ejecución"
  const evento = etiquetaTipoParalizacion(input.tipo_evento)
  const inicio = formatearFechaHora(input.fecha_inicio)
  const fin = input.fecha_fin ? formatearFechaHora(input.fecha_fin) : "en curso al cierre del registro"
  const horas =
    input.horas_perdidas != null
      ? `${input.horas_perdidas.toFixed(2)} horas`
      : "tiempo en evaluación técnica"

  const detalle = input.descripcion?.trim()
    ? `\n\nDetalle técnico: ${input.descripcion.trim()}`
    : ""

  return [
    "ASIENTO PARA LIBRO DE OBRA — SUSPENSIÓN / FUERZA MAYOR",
    "═".repeat(72),
    `${MEMBRETE_EPA}`,
    `Contrato de emergencia: ${RESOLUCION_EMERGENCIA}`,
    `Objeto: ${OBJETO_CONTRATO}`,
    "",
    `En aplicación del Art. 30 del Código Civil de la República del Ecuador (hecho imposible de la prestación por causa no imputable al deudor) y del Art. 1.1 del pliego contractual (condiciones de emergencia y continuidad operativa), se deja constancia de la suspensión de actividades en el ${frente}.`,
    "",
    `Hecho registrado: ${evento}.`,
    `Periodo: desde ${inicio} hasta ${fin}.`,
    `Tiempo no productivo estimado: ${horas}.`,
    "",
    "La paralización impide el avance físico programado de desazolve, transporte y desalojo dentro del radio contractual, sin perjuicio de las medidas de seguridad adoptadas en sitio.",
    "Se solicita reconocer el tiempo como día no laborable / ampliación de plazo conforme procedimiento de emergencia, sujeto a verificación del Administrador del Contrato y del Fiscalizador de Obra (EPA EP).",
    detalle,
    "",
    "Registro generado desde el sistema de trazabilidad antiglosa — Control de Obra EPA.",
  ].join("\n")
}
