import type { PlanillaNumero } from "@/src/data/planilla/types"
import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { prepararCronogramaEjecutadoEpaPdf } from "@/lib/planilla/cronograma-epa-pdf-servidor"
import { renderCronogramaEpaSoloPdfBuffer } from "@/lib/planilla/render-cronograma-epa-pdf"
import { nombreArchivoCronogramaEjecutadoEpaPdf } from "@/src/data/planilla/cronograma-ejecutado-documento"
import { createClient } from "@/src/lib/supabase/server"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ proyectoId: string; numero: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { proyectoId, numero } = await context.params

  if (!proyectoTieneModulo(proyectoId, "planillaPago")) {
    return new Response("No encontrado", { status: 404 })
  }

  const planillaNumero = Number(numero) as PlanillaNumero
  if (planillaNumero !== 1 && planillaNumero !== 2) {
    return new Response("Planilla inválida", { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { ejecutado, firmaContratista } = await prepararCronogramaEjecutadoEpaPdf(
      supabase,
      proyectoId,
      planillaNumero
    )
    const buffer = await renderCronogramaEpaSoloPdfBuffer(ejecutado, firmaContratista)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoCronogramaEjecutadoEpaPdf(planillaNumero)}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar PDF"
    return new Response(msg, { status: 500 })
  }
}
