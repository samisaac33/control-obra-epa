import type { SupabaseClient } from "@supabase/supabase-js"

import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import {
  lineaFirmaPersonal,
  superintendenteObra,
} from "@/src/data/planilla/personal-tecnico-contratista"
import type { PlanillaNumero } from "@/src/data/planilla/types"
import { getProyecto } from "@/src/data/proyectos/catalog"
import { cargarMedicionesRubrosPlanilla } from "@/src/lib/cargar-planilla-medicion-rubros"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { calcularCronogramaEjecutadoEpa, type ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

import { configCronogramaEjecutadoEpa } from "@/lib/planilla/config-cronograma-planilla"

export type CronogramaEpaPdfServidor = {
  ejecutado: ResumenCronogramaEpa
  firmaContratista?: string
}

export async function prepararCronogramaEjecutadoEpaPdf(
  supabase: SupabaseClient,
  proyectoId: string,
  planillaNumero: PlanillaNumero
): Promise<CronogramaEpaPdfServidor> {
  const config = await cargarPlanillaConfigProyecto(supabase, proyectoId)
  if (!config) {
    throw new Error("Configure la planilla en /planillas")
  }

  const configEjecutado = configCronogramaEjecutadoEpa(config, planillaNumero)
  const rubros = presupuestoRubrosPorProyecto(proyectoId)
  const proyecto = getProyecto(proyectoId)

  const med1 = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, 1)
  const med2 =
    planillaNumero >= 2
      ? await cargarMedicionesRubrosPlanilla(supabase, proyectoId, 2)
      : []

  const ejecutado = calcularCronogramaEjecutadoEpa(
    rubros,
    configEjecutado,
    proyecto.numeroContrato,
    planillaNumero,
    med1.length > 0 ? med1 : undefined,
    med2.length > 0 ? med2 : undefined
  )

  const superintendente = superintendenteObra(proyectoId)
  const firmaContratista = superintendente
    ? lineaFirmaPersonal(superintendente, "Superintendente de Obra")
    : undefined

  return { ejecutado, firmaContratista }
}
