import { notFound } from "next/navigation"

import { LibroObraClient } from "@/src/components/LibroObraClient"
import { PlanillaAuditoriaPeriodoClient } from "@/src/components/planilla/PlanillaAuditoriaPeriodoClient"
import { PlanillaInformeAvanceClient } from "@/src/components/planilla/PlanillaInformeAvanceClient"
import { PlanillaMemorandoDocument } from "@/src/components/planilla/PlanillaMemorandoDocument"
import { PlanillaReportesDiariosClient } from "@/src/components/planilla/PlanillaReportesDiariosClient"
import { documentoPlanillaPorId } from "@/src/data/planilla/documentos-catalog"
import { cargarEvidenciasLibroObra } from "@/src/lib/cargar-evidencias-libro-obra"
import { consolidarLibroObra } from "@/src/lib/libro-obra"
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

  const { periodo } = await cargarContextoPlanilla(proyectoId, numero)

  switch (tipo) {
    case "libro_obra": {
      let entradas: ReturnType<typeof consolidarLibroObra> = []
      let errorCarga: string | null = null
      try {
        const supabase = await createClient()
        const registros = await cargarEvidenciasLibroObra(supabase, proyectoId)
        entradas = consolidarLibroObra(registros)
      } catch (err) {
        errorCarga = err instanceof Error ? err.message : "Error de carga"
      }
      return (
        <LibroObraClient
          entradas={entradas}
          generadoEn={new Date().toISOString()}
          errorCarga={errorCarga}
          defaultDesde={periodo.fecha_inicio}
          defaultHasta={periodo.fecha_fin}
          tituloDocumento={`Libro de obra — ${periodo.etiqueta}`}
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
    default:
      notFound()
  }
}
