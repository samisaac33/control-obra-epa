import {
  ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO,
  INFORME_CRUCITA_LEOPOLDO_CEDENO,
} from "@/src/data/infimas/crucita-leopoldo-cedeno"
import {
  ARCHIVO_PDF_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
  INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
} from "@/src/data/infimas/crucita-leopoldo-cedeno-garantia"
import type { InfimaDocumentoCatalogo, InfimaInformeData } from "@/src/data/infimas/types"

export type InfimaDocumento = InfimaDocumentoCatalogo & {
  informe: InfimaInformeData
}

export const DOCUMENTOS_INFIMAS: InfimaDocumento[] = [
  {
    id: "crucita-leopoldo-cedeno",
    slug: "crucita-leopoldo-cedeno",
    titulo: INFORME_CRUCITA_LEOPOLDO_CEDENO.titulo,
    ordenCompra: "IC-EPA EP-052-2026",
    fecha: INFORME_CRUCITA_LEOPOLDO_CEDENO.fecha,
    archivoPdf: `/infimas/${ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO}`,
    descripcion:
      "Informe técnico de finalización de obra y recepción definitiva — Compuerta Leopoldo Cedeño, Crucita.",
    informe: INFORME_CRUCITA_LEOPOLDO_CEDENO,
  },
  {
    id: "crucita-leopoldo-cedeno-garantia",
    slug: "crucita-leopoldo-cedeno-garantia",
    titulo: INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO.titulo,
    ordenCompra: "IC-EPA EP-052-2026",
    fecha: INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO.fecha,
    archivoPdf: `/infimas/${ARCHIVO_PDF_GARANTIA_CRUCITA_LEOPOLDO_CEDENO}`,
    descripcion:
      "Garantía técnica de 1 año sobre materiales y mano de obra — Compuerta Leopoldo Cedeño, Crucita.",
    informe: INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
  },
]

export function obtenerDocumentoInfima(slug: string): InfimaDocumento | undefined {
  return DOCUMENTOS_INFIMAS.find((doc) => doc.slug === slug)
}
