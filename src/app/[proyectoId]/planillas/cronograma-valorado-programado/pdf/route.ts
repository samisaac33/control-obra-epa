import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { respuestaCronogramaProgramadoPdfDocumento } from "@/lib/planilla/servir-cronograma-programado-documento"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ proyectoId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { proyectoId } = await context.params

  if (!proyectoTieneModulo(proyectoId, "planillaPago")) {
    return new Response("No encontrado", { status: 404 })
  }

  return respuestaCronogramaProgramadoPdfDocumento()
}
