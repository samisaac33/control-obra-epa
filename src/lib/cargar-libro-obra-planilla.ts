import type { SupabaseClient } from "@supabase/supabase-js"

import { valoresPorDefectoPlanilla } from "@/src/data/planilla/planilla-defaults-ejecucion"
import { diasPlanMaestroEjecucion } from "@/src/data/planilla/plan-maestro-ejecucion-desasolve"
import type { ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { cargarEvidenciasLibroObra } from "@/src/lib/cargar-evidencias-libro-obra"
import { cargarEventosParalizacionProyecto } from "@/src/lib/cargar-eventos-paralizacion"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { cargarTicketsDesalojoProyecto } from "@/src/lib/cargar-tickets-desalojo"
import { consolidarLibroObraPeriodoPlanilla } from "@/src/lib/libro-obra-sintetico"
import { cargarJornadasMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"
import type { LibroObraEntradaDia } from "@/src/lib/libro-obra"

function configPlanMaestroLibroObra(
  proyectoId: string,
  configDb: ProyectoPlanillaConfig | null
): ProyectoPlanillaConfig | null {
  if (configDb) return configDb
  const defs = valoresPorDefectoPlanilla(proyectoId)
  if (!defs) return null
  const now = new Date().toISOString()
  return {
    proyecto_id: proyectoId,
    fecha_inicio_plazo: defs.fecha_inicio_plazo,
    plazo_dias: defs.plazo_dias,
    dias_por_planilla: defs.dias_por_planilla,
    porcentaje_avance_planilla_1: defs.porcentaje_avance_planilla_1,
    observaciones: defs.observaciones,
    registrado_por: null,
    created_at: now,
    updated_at: now,
  }
}

export async function cargarLibroObraPeriodoPlanilla(
  supabase: SupabaseClient,
  proyectoId: string,
  desde: string,
  hasta: string
): Promise<LibroObraEntradaDia[]> {
  const [registrosFoto, jornadas, tickets, eventos, equipos, configDb] = await Promise.all([
    cargarEvidenciasLibroObra(supabase, proyectoId),
    cargarJornadasMaquinariaProyecto(supabase, proyectoId),
    cargarTicketsDesalojoProyecto(supabase, proyectoId, { desde, hasta }),
    cargarEventosParalizacionProyecto(supabase, proyectoId),
    cargarEquiposMaquinariaProyecto(supabase, proyectoId),
    cargarPlanillaConfigProyecto(supabase, proyectoId),
  ])

  const configPlan = configPlanMaestroLibroObra(proyectoId, configDb)
  const planPorFecha = configPlan
    ? new Map(diasPlanMaestroEjecucion(configPlan).map((d) => [d.fecha, d]))
    : undefined

  return consolidarLibroObraPeriodoPlanilla(
    desde,
    hasta,
    registrosFoto,
    jornadas,
    tickets,
    eventos,
    equipos,
    planPorFecha
  )
}
