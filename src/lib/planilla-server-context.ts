import { notFound } from "next/navigation"

import type { PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { periodoPorNumero } from "@/src/lib/planilla-calculo"
import { createClient } from "@/src/lib/supabase/server"
import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"

export type PlanillaServerContext = {
  config: ProyectoPlanillaConfig
  periodo: PlanillaPeriodo
  numero: 1 | 2
}

export async function cargarContextoPlanilla(
  proyectoId: string,
  numeroParam: string
): Promise<PlanillaServerContext> {
  if (!proyectoTieneModulo(proyectoId, "planillaPago")) {
    notFound()
  }

  const numero = numeroParam === "1" ? 1 : numeroParam === "2" ? 2 : null
  if (!numero) notFound()

  const supabase = await createClient()
  const config = await cargarPlanillaConfigProyecto(supabase, proyectoId)
  if (!config) notFound()

  const periodo = periodoPorNumero(config, numero)
  if (!periodo) notFound()

  return { config, periodo, numero }
}
