import type { SupabaseClient } from "@supabase/supabase-js"

import type { CanalTramo } from "@/src/data/tramos/types"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

/** Tramo con frente parpadeante persistido y punto válido entre los cargados. */
export function tramoTieneFrenteParpadeoEnMapa(
  tramo: CanalTramo,
  puntos: TramoPuntoAvance[]
): boolean {
  const puntoId = tramo.punto_frente_mapa_id
  if (!puntoId) return false
  return puntos.some((p) => p.tramo_id === tramo.id && p.id === puntoId)
}

/** Mapa tramoId → puntoId con frente parpadeante, validado contra puntos cargados. */
export function frenteParpadeoPorTramoDesdeTramos(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[]
): Record<string, string> {
  const puntosPorTramo = new Map<string, Set<string>>()
  for (const p of puntos) {
    let set = puntosPorTramo.get(p.tramo_id)
    if (!set) {
      set = new Set()
      puntosPorTramo.set(p.tramo_id, set)
    }
    set.add(p.id)
  }

  const out: Record<string, string> = {}
  for (const tramo of tramos) {
    const puntoId = tramo.punto_frente_mapa_id
    if (!puntoId) continue
    const validos = puntosPorTramo.get(tramo.id)
    if (validos?.has(puntoId)) {
      out[tramo.id] = puntoId
    }
  }
  return out
}

export async function actualizarFrenteParpadeoTramo(
  supabase: SupabaseClient,
  tramoId: string,
  puntoId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("canal_tramos")
    .update({ punto_frente_mapa_id: puntoId })
    .eq("id", tramoId)

  if (error) throw new Error(error.message)
}
