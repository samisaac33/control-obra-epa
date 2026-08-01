import {
  PERIODO_MAQUINARIA,
  REGISTRO_MAQUINARIA,
  type RegistroDia,
} from "@/src/data/registro-maquinaria"
import { formatearFechaCorta } from "@/src/lib/maquinaria-resumen"

export type RangoMaquinaria = {
  inicio: string
  fin: string
}

export function resolverRangoMaquinaria(desde?: string, hasta?: string): RangoMaquinaria {
  return {
    inicio: desde || PERIODO_MAQUINARIA.inicio,
    fin: hasta || PERIODO_MAQUINARIA.fin,
  }
}

export function filtrarRegistroMaquinaria(
  dias: RegistroDia[] = REGISTRO_MAQUINARIA,
  desde?: string,
  hasta?: string
): RegistroDia[] {
  return dias.filter((dia) => {
    if (desde && dia.fecha < desde) return false
    if (hasta && dia.fecha > hasta) return false
    return true
  })
}

export function etiquetaRangoMaquinaria(dias: RegistroDia[]): string {
  if (dias.length === 0) return "Sin registros"

  const fechas = [...dias].map((dia) => dia.fecha).sort()
  const primera = fechas[0]
  const ultima = fechas[fechas.length - 1]

  if (primera === ultima) return formatearFechaCorta(primera)

  return `${formatearFechaCorta(primera)} — ${formatearFechaCorta(ultima)}`
}

export function rangoMaquinariaInvalido(desde: string, hasta: string): boolean {
  if (!desde || !hasta) return false
  return desde > hasta
}

export function contarRegistrosEquipo(dias: RegistroDia[]): number {
  return dias.reduce((total, dia) => total + dia.registros.length, 0)
}
