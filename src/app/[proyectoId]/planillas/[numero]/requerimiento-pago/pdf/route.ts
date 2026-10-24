import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import { getProyecto, proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { cargarMedicionesRubrosPlanilla } from "@/src/lib/cargar-planilla-medicion-rubros"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { periodoPorNumero } from "@/src/lib/planilla-calculo"
import { calcularRequerimientoPago } from "@/src/lib/planilla-requerimiento-pago"
import {
  nombreArchivoRequerimientoPagoPdf,
  renderRequerimientoPagoPdfBuffer,
} from "@/lib/planilla/render-requerimiento-pago-pdf"
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

  const planillaNumero = numero === "1" ? 1 : numero === "2" ? 2 : null
  if (!planillaNumero) {
    return new Response("Planilla inválida", { status: 400 })
  }

  try {
    const supabase = await createClient()
    const config = await cargarPlanillaConfigProyecto(supabase, proyectoId)
    if (!config) {
      return new Response("Configure la planilla en /planillas", { status: 400 })
    }

    const periodo = periodoPorNumero(config, planillaNumero)
    if (!periodo) {
      return new Response("Periodo no calculado", { status: 400 })
    }

    const rubros = presupuestoRubrosPorProyecto(proyectoId)
    const mediciones = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, planillaNumero)
    const resumen = calcularRequerimientoPago(
      rubros,
      config,
      periodo,
      planillaNumero,
      mediciones
    )

    const proyecto = getProyecto(proyectoId)
    const buffer = await renderRequerimientoPagoPdfBuffer({
      proyectoNombre: proyecto.nombreObra,
      numeroContrato: proyecto.numeroContrato,
      resumen,
      generadoEnIso: new Date().toISOString(),
    })

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoRequerimientoPagoPdf(planillaNumero)}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar PDF"
    return new Response(msg, { status: 500 })
  }
}
