import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { calcularCronogramaValoradoVigente } from "@/src/lib/planilla-cronograma-valorado-vigente"
import {
  nombreArchivoCronogramaValoradoPdf,
  renderCronogramaValoradoPdfBuffer,
} from "@/lib/planilla/render-cronograma-valorado-pdf"
import { createClient } from "@/src/lib/supabase/server"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ proyectoId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { proyectoId } = await context.params

  if (!proyectoTieneModulo(proyectoId, "planillaPago")) {
    return new Response("No encontrado", { status: 404 })
  }

  try {
    const supabase = await createClient()
    const config = await cargarPlanillaConfigProyecto(supabase, proyectoId)
    if (!config) {
      return new Response("Configure la planilla en /planillas", { status: 400 })
    }

    const rubros = presupuestoRubrosPorProyecto(proyectoId)
    const cronograma = calcularCronogramaValoradoVigente(rubros, config)
    const buffer = await renderCronogramaValoradoPdfBuffer(cronograma)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoCronogramaValoradoPdf()}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar PDF"
    return new Response(msg, { status: 500 })
  }
}
