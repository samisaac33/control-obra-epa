import { cargarDailyReportCgeData } from "@/lib/auditoria/cargar-daily-report-cge-data"
import {
  nombreArchivoReporteDiarioCge,
  renderDailyReportCgePdfBuffer,
} from "@/lib/auditoria/render-daily-report-cge-pdf"
import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { createClient } from "@/src/lib/supabase/server"

export const dynamic = "force-dynamic"

function esFechaIsoValida(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

type RouteContext = {
  params: Promise<{ proyectoId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { proyectoId } = await context.params

  if (!proyectoTieneModulo(proyectoId, "reporteDiario")) {
    return new Response("No encontrado", { status: 404 })
  }

  const url = new URL(request.url)
  const fecha = url.searchParams.get("fecha") ?? new Date().toISOString().slice(0, 10)
  const clima = url.searchParams.get("clima") ?? undefined

  if (!esFechaIsoValida(fecha)) {
    return new Response("Fecha inválida", { status: 400 })
  }

  try {
    const supabase = await createClient()
    const data = await cargarDailyReportCgeData(supabase, proyectoId, fecha, clima)
    const buffer = await renderDailyReportCgePdfBuffer(data)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoReporteDiarioCge(fecha)}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar PDF"
    return new Response(msg, { status: 500 })
  }
}
