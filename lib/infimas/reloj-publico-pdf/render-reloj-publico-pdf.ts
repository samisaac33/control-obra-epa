import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"

import { RelojInformeActividadesPdfDocument } from "@/src/components/infimas/reloj-publico/RelojInformeActividadesPdfDocument"
import { RelojOficioEntregaPdfDocument } from "@/src/components/infimas/reloj-publico/RelojOficioEntregaPdfDocument"
import {
  CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
  fechaCartaDocumento,
  PERIODOS_RELOJ_PUBLICO,
} from "@/src/data/infimas/reloj-publico-portoviejo"
import type { RelojPublicoDocumentoTipo } from "@/src/data/infimas/reloj-publico-types"
import { formatearFechaCarta } from "@/src/lib/reloj-publico-periodos"

export type RelojPublicoPdfTipo = Extract<RelojPublicoDocumentoTipo, "entrega" | "informe">

export function resolverFechaCartaEmision(
  tipo: RelojPublicoPdfTipo,
  periodoId: string,
  fechaIso?: string | null
): string | null {
  const periodo = PERIODOS_RELOJ_PUBLICO.find((p) => p.id === periodoId)
  if (!periodo) return null

  if (fechaIso) {
    return formatearFechaCarta(fechaIso, CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.ciudad)
  }

  return fechaCartaDocumento(tipo, periodo)
}

export async function renderRelojPublicoPdfBuffer(params: {
  periodoId: string
  tipo: RelojPublicoPdfTipo
  fechaIso?: string | null
}): Promise<Buffer | null> {
  const periodo = PERIODOS_RELOJ_PUBLICO.find((p) => p.id === params.periodoId)
  if (!periodo) return null

  const fechaCarta = resolverFechaCartaEmision(params.tipo, params.periodoId, params.fechaIso)
  if (!fechaCarta) return null

  const data = {
    contrato: CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
    periodo,
    fechaCarta,
  }

  const element =
    params.tipo === "entrega"
      ? React.createElement(RelojOficioEntregaPdfDocument, { data })
      : React.createElement(RelojInformeActividadesPdfDocument, { data })

  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
  return Buffer.from(buffer)
}

export function nombreArchivoRelojPublicoPdf(periodoId: string, tipo: RelojPublicoPdfTipo): string {
  const base = tipo === "entrega" ? "oficio-entrega" : "informe-actividades"
  return `${base}-${periodoId}.pdf`
}
