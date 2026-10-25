import type { SupabaseClient } from "@supabase/supabase-js"

import { cargarEvidenciasLibroObra } from "@/src/lib/cargar-evidencias-libro-obra"
import { cargarEventosParalizacionProyecto } from "@/src/lib/cargar-eventos-paralizacion"
import { cargarTicketsDesalojoProyecto } from "@/src/lib/cargar-tickets-desalojo"
import { consolidarLibroObraPeriodoPlanilla } from "@/src/lib/libro-obra-sintetico"
import { cargarJornadasMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"
import type { LibroObraEntradaDia } from "@/src/lib/libro-obra"

export async function cargarLibroObraPeriodoPlanilla(
  supabase: SupabaseClient,
  proyectoId: string,
  desde: string,
  hasta: string
): Promise<LibroObraEntradaDia[]> {
  const [registrosFoto, jornadas, tickets, eventos, equipos] = await Promise.all([
    cargarEvidenciasLibroObra(supabase, proyectoId),
    cargarJornadasMaquinariaProyecto(supabase, proyectoId),
    cargarTicketsDesalojoProyecto(supabase, proyectoId, { desde, hasta }),
    cargarEventosParalizacionProyecto(supabase, proyectoId),
    cargarEquiposMaquinariaProyecto(supabase, proyectoId),
  ])

  return consolidarLibroObraPeriodoPlanilla(
    desde,
    hasta,
    registrosFoto,
    jornadas,
    tickets,
    eventos,
    equipos
  )
}
