import { notFound } from "next/navigation"

import { PlanillaPlanMaestroClient } from "@/src/components/planilla/PlanillaPlanMaestroClient"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { createClient } from "@/src/lib/supabase/server"
import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"

type PageProps = {
  params: Promise<{ proyectoId: string }>
}

export const dynamic = "force-dynamic"

export default async function PlanMaestroPlanillasPage({ params }: PageProps) {
  const { proyectoId } = await params
  if (!proyectoTieneModulo(proyectoId, "planillaPago")) notFound()

  const supabase = await createClient()
  const config = await cargarPlanillaConfigProyecto(supabase, proyectoId)
  if (!config) notFound()

  return <PlanillaPlanMaestroClient config={config} />
}
