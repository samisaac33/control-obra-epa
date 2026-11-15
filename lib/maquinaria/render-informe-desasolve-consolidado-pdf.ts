import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"

import {
  MaquinariaInformeDesasolveConsolidadoPdfDocument,
} from "@/src/components/maquinaria/MaquinariaInformeDesasolveConsolidadoPdfDocument"
import type { InformeDesasolveConsolidadoPayload } from "@/src/lib/maquinaria/cargar-informe-desasolve-consolidado"

export async function renderInformeDesasolveConsolidadoPdfBuffer(
  data: InformeDesasolveConsolidadoPayload
): Promise<Buffer> {
  const element = React.createElement(MaquinariaInformeDesasolveConsolidadoPdfDocument, { data })
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
  return Buffer.from(buffer)
}

export function nombreArchivoInformeDesasolveConsolidado(proyectoId: string): string {
  return `informe-consolidado-maquinaria-${proyectoId}.pdf`
}