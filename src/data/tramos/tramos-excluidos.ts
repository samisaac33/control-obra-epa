import { numeroTramoDesdeCodigo } from "@/src/lib/mapa-tramo-etiqueta"

/** Tramos retirados del mapa y de importaciones KMZ (proyecto desasolve-canales). */
export const NUMEROS_TRAMO_EXCLUIDOS_DESASOLVE = [4, 21] as const

export function esTramoExcluidoDesasolve(codigo: string): boolean {
  const n = numeroTramoDesdeCodigo(codigo)
  if (n === null) return false
  return (NUMEROS_TRAMO_EXCLUIDOS_DESASOLVE as readonly number[]).includes(n)
}
