import { numeroEtiquetaMapa, numeroTramoDesdeCodigo } from "@/src/lib/mapa-tramo-etiqueta"

const NOMBRE_TRAMO_40 = "San Antonio - Chone"

/** Columna canal/ubicación en informe completo (contrato desasolve). */
export function nombreCanalDesasolvePorCodigoTramo(codigoTramo: string): string {
  const numero = numeroTramoDesdeCodigo(codigoTramo)
  if (numero === 40) {
    return NOMBRE_TRAMO_40
  }
  if (numero != null) {
    return `Tramo #${numero}`
  }

  const etiqueta = numeroEtiquetaMapa(codigoTramo)
  if (etiqueta) {
    return `Tramo #${etiqueta}`
  }

  return codigoTramo.trim() || "—"
}