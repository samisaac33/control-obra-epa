import { notFound } from "next/navigation"

import { LibroObraClient } from "@/src/components/LibroObraClient"
import { PlanillaAuditoriaPeriodoClient } from "@/src/components/planilla/PlanillaAuditoriaPeriodoClient"
import { PlanillaInformeAvanceClient } from "@/src/components/planilla/PlanillaInformeAvanceClient"
import { PlanillaMemorandoDocument } from "@/src/components/planilla/PlanillaMemorandoDocument"
import { PlanillaReportesDiariosClient } from "@/src/components/planilla/PlanillaReportesDiariosClient"
import { PlanillaMaquinariaConsolidadoClient } from "@/src/components/planilla/PlanillaMaquinariaConsolidadoClient"
import { PlanillaRequerimientoPagoClient } from "@/src/components/planilla/PlanillaRequerimientoPagoClient"
import { documentoPlanillaPorId } from "@/src/data/planilla/documentos-catalog"
import { cargarLibroObraPeriodoPlanillaPorFrentes } from "@/src/lib/cargar-libro-obra-planilla"
import type { LibroObraPorFrente } from "@/src/lib/libro-obra-sintetico"
import { cargarContextoPlanilla } from "@/src/lib/planilla-server-context"
import { tipoDocumentoDesdeSlug } from "@/src/lib/planilla-documento-slug"
import { createClient } from "@/src/lib/supabase/server"

type PageProps = {
  params: Promise<{ proyectoId: string; numero: string; slug: string }>
}

export const dynamic = "force-dynamic"

export default async function PlanillaDocumentoPage({ params }: PageProps) {
  const { proyectoId, numero, slug } = await params
  const tipo = tipoDocumentoDesdeSlug(slug)
  if (!tipo) notFound()

  const doc = documentoPlanillaPorId(tipo)
  if (!doc || doc.estado !== "disponible") notFound()

  const { config, periodo, numero: planillaNumero } = await cargarContextoPlanilla(proyectoId, numero)

  switch (tipo) {
    case "libro_obra": {
      let porFrente: LibroObraPorFrente = {}
      let errorCarga: string | null = null
      try {
        const supabase = await createClient()
        porFrente = await cargarLibroObraPeriodoPlanillaPorFrentes(
          supabase,
          proyectoId,
          periodo,
          planillaNumero
        )
      } catch (err) {
        errorCarga = err instanceof Error ? err.message : "Error de carga"
      }
      return (
        <LibroObraClient
          porFrente={porFrente}
          generadoEn={new Date().toISOString()}
          errorCarga={errorCarga}
          defaultDesde={periodo.fecha_inicio}
          defaultHasta={periodo.fecha_fin}
          tituloDocumento={`Libro de obra — ${periodo.etiqueta}`}
          variant="planilla"
        />
      )
    }
    case "informe_avance":
      return <PlanillaInformeAvanceClient periodo={periodo} />
    case "memorando_presentacion":
      return <PlanillaMemorandoDocument periodo={periodo} />
    case "reporte_diario_cge":
      return <PlanillaReportesDiariosClient periodo={periodo} />
    case "auditoria_volumetrica":
      return <PlanillaAuditoriaPeriodoClient periodo={periodo} />
    case "requerimiento_pago":
      return (
        <PlanillaRequerimientoPagoClient
          config={config}
          periodo={periodo}
          planillaNumero={planillaNumero}
        />
      )
    case "maquinaria_consolidado":
      return (
        <PlanillaMaquinariaConsolidadoClient
          config={config}
          periodo={periodo}
          planillaNumero={planillaNumero}
        />
      )
    default:
      notFound()
  }
}
