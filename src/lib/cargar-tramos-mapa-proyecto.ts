import type { SupabaseClient } from "@supabase/supabase-js"

import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { esTramoExcluidoDesasolve } from "@/src/data/tramos/tramos-excluidos"
import type { CanalTramo } from "@/src/data/tramos/types"
import { normalizarTramo } from "@/src/lib/canal-tramos-normalize"
import { cargarPuntosAvancePorProyecto } from "@/src/lib/tramo-avance-coordenadas"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

export type TramosMapaProyecto = {
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
}

export async function cargarTramosMapaProyecto(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<TramosMapaProyecto> {
  const [{ data: tramosData, error: tramosError }, puntosAvance] = await Promise.all([
    supabase
      .from("canal_tramos")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("codigo", { ascending: true }),
    cargarPuntosAvancePorProyecto(supabase, proyectoId),
  ])

  if (tramosError) throw new Error(tramosError.message)

  const tramos = (tramosData ?? [])
    .map((row) => normalizarTramo(row as Record<string, unknown>))
    .filter(
      (t) =>
        proyectoId !== PROYECTO_DESASOLVE_CANALES || !esTramoExcluidoDesasolve(t.codigo)
    )

  return { tramos, puntosAvance }
}
