import {
  nombreArchivoRelojPublicoPdf,
  renderRelojPublicoPdfBuffer,
  type RelojPublicoPdfTipo,
} from "@/lib/infimas/reloj-publico-pdf/render-reloj-publico-pdf"
import { PERIODOS_RELOJ_PUBLICO } from "@/src/data/infimas/reloj-publico-portoviejo"

export const dynamic = "force-dynamic"

function esTipoValido(value: string | null): value is RelojPublicoPdfTipo {
  return value === "entrega" || value === "informe"
}

function esFechaIsoValida(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const periodoId = url.searchParams.get("periodo")
  const tipoParam = url.searchParams.get("tipo")
  const fechaParam = url.searchParams.get("fecha")

  if (!periodoId || !esTipoValido(tipoParam)) {
    return new Response("Parámetros inválidos", { status: 400 })
  }

  if (!PERIODOS_RELOJ_PUBLICO.some((p) => p.id === periodoId)) {
    return new Response("Periodo no encontrado", { status: 404 })
  }

  if (fechaParam && !esFechaIsoValida(fechaParam)) {
    return new Response("Fecha inválida", { status: 400 })
  }

  try {
    const buffer = await renderRelojPublicoPdfBuffer({
      periodoId,
      tipo: tipoParam,
      fechaIso: fechaParam,
    })

    if (!buffer) {
      return new Response("No se pudo generar el PDF", { status: 500 })
    }

    const filename = nombreArchivoRelojPublicoPdf(periodoId, tipoParam)

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error al generar PDF reloj público:", error)
    return new Response("Error al generar el PDF", { status: 500 })
  }
}
