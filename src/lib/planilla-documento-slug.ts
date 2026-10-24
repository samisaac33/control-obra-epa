import type { TipoDocumentoPlanilla } from "@/src/data/planilla/types"

const SLUG_TO_ID: Record<string, TipoDocumentoPlanilla> = {
  "libro-obra": "libro_obra",
  "informe-avance": "informe_avance",
  memorando: "memorando_presentacion",
  "reportes-diarios": "reporte_diario_cge",
  auditoria: "auditoria_volumetrica",
}

export function tipoDocumentoDesdeSlug(slug: string): TipoDocumentoPlanilla | null {
  return SLUG_TO_ID[slug] ?? null
}

export function slugDesdeTipoDocumento(id: TipoDocumentoPlanilla): string {
  const entry = Object.entries(SLUG_TO_ID).find(([, v]) => v === id)
  return entry?.[0] ?? id
}
