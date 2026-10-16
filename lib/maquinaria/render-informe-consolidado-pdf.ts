import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"

import {
  MaquinariaInformeConsolidadoPdfDocument,
  type MaquinariaInformeConsolidadoPdfData,
} from "@/src/components/maquinaria/MaquinariaInformeConsolidadoPdfDocument"
import { PROYECTO_EMERGENCIA_MANABI } from "@/src/data/proyectos/catalog"

export async function renderInformeConsolidadoMaquinariaPdfBuffer(
  data: MaquinariaInformeConsolidadoPdfData
): Promise<Buffer> {
  const element = React.createElement(MaquinariaInformeConsolidadoPdfDocument, { data })
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
  return Buffer.from(buffer)
}

export function nombreArchivoInformeConsolidadoMaquinaria(proyectoId: string): string {
  const slug = proyectoId === PROYECTO_EMERGENCIA_MANABI ? "emergencia-manabi" : proyectoId
  return `informe-consolidado-maquinaria-${slug}.pdf`
}
