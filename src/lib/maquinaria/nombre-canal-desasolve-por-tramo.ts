import { TRAMOS_DESAZOLVE_VAE } from "@/src/data/planilla/canales-desazolve-tramos-vae"
import { numeroEtiquetaMapa, numeroTramoDesdeCodigo } from "@/src/lib/mapa-tramo-etiqueta"

const ETIQUETA_CANAL_PUNTOS_LEVANTADOS = "puntos levantados"

/**
 * Etiqueta de canal/ubicación para informes: el campo `canal` en BD suele ser
 * «Puntos levantados» en tramos levantados en campo; para 1…N se usa la tabla VAE.
 */
export function nombreCanalDesasolvePorCodigoTramo(
  codigoTramo: string,
  canalEnBaseDeDatos?: string | null
): string {
  const numero = numeroTramoDesdeCodigo(codigoTramo)
  if (numero != null && numero >= 1 && numero <= TRAMOS_DESAZOLVE_VAE.length) {
    return TRAMOS_DESAZOLVE_VAE[numero - 1]!.nombre
  }

  if (numero === 40) {
    return "San Antonio - Chone"
  }

  const canalBd = canalEnBaseDeDatos?.trim()
  if (canalBd && canalBd.toLowerCase() !== ETIQUETA_CANAL_PUNTOS_LEVANTADOS) {
    return canalBd
  }

  const etiqueta = numeroEtiquetaMapa(codigoTramo)
  if (etiqueta) return `Tramo ${etiqueta}`

  return codigoTramo.trim() || "—"
}