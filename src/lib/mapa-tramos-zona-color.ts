import type { EstadoTramo } from "@/src/data/tramos/types"
import { colorEstadoTramo } from "@/src/data/tramos/types"
import { numeroTramoDesdeCodigo } from "@/src/lib/mapa-tramo-etiqueta"

const ZONA_ALTA_MIN = 25

const COLOR_ESTADO_ZONA_25_33: Record<EstadoTramo, string> = {
  pendiente: "#ea580c",
  programado: "#c2410c",
  en_ejecucion: "#d97706",
  terminado: "#059669",
  suspendido: "#78716c",
}

export function tramoEnZonaAlta(codigoTramo: string | null | undefined): boolean {
  if (!codigoTramo) return false
  const n = numeroTramoDesdeCodigo(codigoTramo)
  return n !== null && n >= ZONA_ALTA_MIN
}

export function colorEstadoTramoEnMapa(
  estado: EstadoTramo,
  codigoTramo?: string | null
): string {
  if (tramoEnZonaAlta(codigoTramo)) {
    return COLOR_ESTADO_ZONA_25_33[estado] ?? "#78716c"
  }
  return colorEstadoTramo(estado)
}
