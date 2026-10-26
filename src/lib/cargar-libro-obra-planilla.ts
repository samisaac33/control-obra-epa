import type { SupabaseClient } from "@supabase/supabase-js"

import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import { PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1 } from "@/src/data/contrato-emergencia-severino-trasvase"
import { valoresPorDefectoPlanilla } from "@/src/data/planilla/planilla-defaults-ejecucion"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { cargarEvidenciasLibroObra } from "@/src/lib/cargar-evidencias-libro-obra"
import { cargarEventosParalizacionProyecto } from "@/src/lib/cargar-eventos-paralizacion"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { cargarTicketsDesalojoProyecto } from "@/src/lib/cargar-tickets-desalojo"
import { consolidarLibroObraPeriodoPlanillaConsolidado } from "@/src/lib/libro-obra-sintetico"
import { cargarJornadasMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"
import type { LibroObraEntradaDia } from "@/src/lib/libro-obra"

function configPlanillaLibroObra(
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
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero
): Promise<LibroObraEntradaDia[]> {
  const [registrosFoto, jornadas, tickets, eventos, equipos, configDb] = await Promise.all([
    cargarEvidenciasLibroObra(supabase, proyectoId),
    cargarJornadasMaquinariaProyecto(supabase, proyectoId),
    cargarTicketsDesalojoProyecto(supabase, proyectoId, {
      desde: periodo.fecha_inicio,
      hasta: periodo.fecha_fin,
    }),
    cargarEventosParalizacionProyecto(supabase, proyectoId),
    cargarEquiposMaquinariaProyecto(supabase, proyectoId),
    cargarPlanillaConfigProyecto(supabase, proyectoId),
  ])

  const configBase = configPlanillaLibroObra(proyectoId, configDb)
  if (!configBase) return []

  const config =
    planillaNumero === 1
      ? {
          ...configBase,
          porcentaje_avance_planilla_1: PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1,
        }
      : configBase

  const rubros = presupuestoRubrosPorProyecto(proyectoId)

  return consolidarLibroObraPeriodoPlanillaConsolidado(
    proyectoId,
    periodo.fecha_inicio,
    periodo.fecha_fin,
    registrosFoto,
    jornadas,
    tickets,
    eventos,
    equipos,
    rubros,
    config,
    periodo,
    planillaNumero
  )
}
