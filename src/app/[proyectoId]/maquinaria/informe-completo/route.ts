import {
  nombreArchivoInformeDesasolveCompleto,
  renderInformeDesasolveCompletoPdfBuffer,
} from "@/lib/maquinaria/render-informe-desasolve-completo-pdf"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { cargarInformeDesasolveCompleto } from "@/src/lib/maquinaria/cargar-informe-desasolve-completo"
import { createClient } from "@/src/lib/supabase/server"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ proyectoId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { proyectoId } = await context.params

  if (proyectoId !== PROYECTO_DESASOLVE_CANALES) {
    return new Response("No encontrado", { status: 404 })
  }

  try {
    const supabase = await createClient()
    const payload = await cargarInformeDesasolveCompleto(supabase, proyectoId)
    const buffer = await renderInformeDesasolveCompletoPdfBuffer(payload)
    const filename = nombreArchivoInformeDesasolveCompleto(proyectoId)

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al generar el PDF"
    console.error("Error al generar informe completo desasolve:", error)
    const status = msg.includes("No hay registros") ? 404 : 500
    return new Response(msg, { status })
  }
}