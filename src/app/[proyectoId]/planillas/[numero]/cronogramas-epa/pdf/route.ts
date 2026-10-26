import { proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { respuestaCronogramaEjecutadoVigenteDocumento } from "@/lib/planilla/servir-cronograma-ejecutado-documento"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ proyectoId: string; numero: string }>
}

/** Compatibilidad: enlace antiguo sirve el PDF oficial estático. */
export async function GET(_request: Request, context: RouteContext) {
  const { proyectoId } = await context.params

  if (!proyectoTieneModulo(proyectoId, "planillaPago")) {
    return new Response("No encontrado", { status: 404 })
  }

  return respuestaCronogramaEjecutadoVigenteDocumento()
}
