import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import {
  lineaFirmaPersonal,
  superintendenteObra,
} from "@/src/data/planilla/personal-tecnico-contratista"
import type { PlanillaNumero } from "@/src/data/planilla/types"
import { getProyecto, proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { cargarMedicionesRubrosPlanilla } from "@/src/lib/cargar-planilla-medicion-rubros"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import {
  calcularCronogramaEjecutadoEpa,
  calcularCronogramaValoradoProgramadoEpa,
} from "@/src/lib/planilla-cronograma-epa"
import { cargarContextoPlanilla } from "@/src/lib/planilla-server-context"
import {
  nombreArchivoCronogramasEpaPdf,
  renderCronogramasEpaPdfBuffer,
} from "@/lib/planilla/render-cronograma-epa-pdf"
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
    const config = await cargarPlanillaConfigProyecto(supabase, proyectoId)
    if (!config) {
      return new Response("Configure la planilla en /planillas", { status: 400 })
    }

    await cargarContextoPlanilla(proyectoId, numero)

    const rubros = presupuestoRubrosPorProyecto(proyectoId)
    const proyecto = getProyecto(proyectoId)
    const med1 = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, 1)
    const med2 =
      planillaNumero >= 2
        ? await cargarMedicionesRubrosPlanilla(supabase, proyectoId, 2)
        : []

    const programado = calcularCronogramaValoradoProgramadoEpa(
      rubros,
      config,
      proyecto.numeroContrato
    )
    const ejecutado = calcularCronogramaEjecutadoEpa(
      rubros,
      config,
      proyecto.numeroContrato,
      planillaNumero,
      med1.length > 0 ? med1 : undefined,
      med2.length > 0 ? med2 : undefined
    )

    const superintendente = superintendenteObra(proyectoId)
    const firmaContratista = superintendente
      ? lineaFirmaPersonal(superintendente, "Superintendente de Obra")
      : undefined

    const buffer = await renderCronogramasEpaPdfBuffer(programado, ejecutado, firmaContratista)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoCronogramasEpaPdf(planillaNumero)}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar PDF"
    return new Response(msg, { status: 500 })
  }
}
