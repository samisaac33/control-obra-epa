import {
  nombreArchivoInformeConsolidadoMaquinaria,
  renderInformeConsolidadoMaquinariaPdfBuffer,
} from "@/lib/maquinaria/render-informe-consolidado-pdf"
import {
  getPeriodoMaquinaria,
  getRegistroMaquinaria,
} from "@/src/data/registro-maquinaria"
import { PROYECTO_EMERGENCIA_MANABI, getProyecto } from "@/src/data/proyectos/catalog"
import {
  filtrarRegistroMaquinaria,
  rangoMaquinariaInvalido,
  resolverRangoMaquinaria,
} from "@/src/lib/maquinaria-filtro"
import { construirInformeConsolidadoMaquinaria } from "@/src/lib/maquinaria-informe-consolidado"
import { formatearFechaCorta } from "@/src/lib/maquinaria-resumen"

export const dynamic = "force-dynamic"

function esFechaIsoValida(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

type RouteContext = {
  params: Promise<{ proyectoId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { proyectoId } = await context.params

  if (proyectoId !== PROYECTO_EMERGENCIA_MANABI) {
    return new Response("No encontrado", { status: 404 })
  }

  const url = new URL(request.url)
  const desdeParam = url.searchParams.get("desde") ?? undefined
  const hastaParam = url.searchParams.get("hasta") ?? undefined

  if (desdeParam && !esFechaIsoValida(desdeParam)) {
    return new Response("Fecha «desde» inválida", { status: 400 })
  }
  if (hastaParam && !esFechaIsoValida(hastaParam)) {
    return new Response("Fecha «hasta» inválida", { status: 400 })
  }
  if (rangoMaquinariaInvalido(desdeParam ?? "", hastaParam ?? "")) {
    return new Response("La fecha «desde» no puede ser posterior a «hasta»", { status: 400 })
  }

  const registros = getRegistroMaquinaria(proyectoId)
  const diasFiltrados = filtrarRegistroMaquinaria(registros, desdeParam, hastaParam)
  const periodo = getPeriodoMaquinaria(proyectoId)
  const rango = resolverRangoMaquinaria(desdeParam, hastaParam)

  const rangoEtiqueta =
    !desdeParam && !hastaParam
      ? periodo.etiqueta
      : `${formatearFechaCorta(rango.inicio)} — ${formatearFechaCorta(rango.fin)}`

  if (diasFiltrados.length === 0) {
    return new Response("No hay registros en el período indicado", { status: 404 })
  }

  const informe = construirInformeConsolidadoMaquinaria(diasFiltrados)
  if (informe.filas.length === 0) {
    return new Response("No hay actividad de maquinaria ni viajes en el período indicado", {
      status: 404,
    })
  }

  const proyecto = getProyecto(proyectoId)
  const generadoEnIso = new Date().toISOString()

  try {
    const buffer = await renderInformeConsolidadoMaquinariaPdfBuffer({
      proyecto,
      rangoEtiqueta,
      generadoEnIso,
      informe,
    })

    const filename = nombreArchivoInformeConsolidadoMaquinaria(proyectoId)

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error al generar PDF informe consolidado maquinaria:", error)
    return new Response("Error al generar el PDF", { status: 500 })
  }
}
