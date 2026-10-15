import type { SupabaseClient } from "@supabase/supabase-js"

import type { CanalTramo } from "@/src/data/tramos/types"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

function puntoTieneFrenteParpadeo(punto: TramoPuntoAvance, tramo: CanalTramo): boolean {
  if (punto.frente_mapa) return true
  return Boolean(tramo.punto_frente_mapa_id && tramo.punto_frente_mapa_id === punto.id)
}

/** IDs de puntos con parpadeo de frente (nuevo modelo + legacy por tramo). */
export function idsPuntosFrenteParpadeo(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[]
): Set<string> {
  const tramosPorId = new Map(tramos.map((t) => [t.id, t]))
  const ids = new Set<string>()
  for (const p of puntos) {
    const tramo = tramosPorId.get(p.tramo_id)
    if (tramo && puntoTieneFrenteParpadeo(p, tramo)) {
      ids.add(p.id)
    }
  }
  return ids
}

/** Tramo con al menos un punto con frente parpadeante persistido. */
export function tramoTieneFrenteParpadeoEnMapa(
  tramo: CanalTramo,
  puntos: TramoPuntoAvance[]
): boolean {
  return puntos.some((p) => p.tramo_id === tramo.id && puntoTieneFrenteParpadeo(p, tramo))
}

/** @deprecated Usar idsPuntosFrenteParpadeo */
export function frenteParpadeoPorTramoDesdeTramos(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[]
): Record<string, string> {
  const ids = idsPuntosFrenteParpadeo(tramos, puntos)
  const out: Record<string, string> = {}
  for (const p of puntos) {
    if (!ids.has(p.id)) continue
    if (!out[p.tramo_id]) out[p.tramo_id] = p.id
  }
  return out
}

export async function actualizarFrenteParpadeoPunto(
  supabase: SupabaseClient,
  tramoId: string,
  puntoId: string,
  frenteMapa: boolean
): Promise<void> {
  const { error } = await supabase
    .from("tramo_puntos_avance")
    .update({ frente_mapa: frenteMapa })
    .eq("id", puntoId)

  if (error) throw new Error(error.message)

  if (!frenteMapa) {
    await supabase
      .from("canal_tramos")
      .update({ punto_frente_mapa_id: null })
      .eq("id", tramoId)
      .eq("punto_frente_mapa_id", puntoId)
  }
}
