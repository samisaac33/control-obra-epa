import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"

import {
  MaquinariaInformeJimmyEquiposPdfDocument,
  type MaquinariaInformeJimmyEquiposPdfData,
} from "@/src/components/maquinaria/MaquinariaInformeJimmyEquiposPdfDocument"
import { PROYECTO_EMERGENCIA_MANABI } from "@/src/data/proyectos/catalog"

export async function renderInformeJimmyEquiposPdfBuffer(
  data: MaquinariaInformeJimmyEquiposPdfData
): Promise<Buffer> {
  const element = React.createElement(MaquinariaInformeJimmyEquiposPdfDocument, { data })
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
  return Buffer.from(buffer)
}

export function nombreArchivoInformeJimmyEquipos(proyectoId: string): string {
  const slug = proyectoId === PROYECTO_EMERGENCIA_MANABI ? "emergencia-manabi" : proyectoId
  return `informe-jimmy-equipos-por-frente-${slug}.pdf`
}
