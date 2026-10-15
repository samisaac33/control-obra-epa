import { mkdir } from "node:fs/promises"
import path from "node:path"

import { renderToFile } from "@react-pdf/renderer"
import React from "react"

import { RelojInformeActividadesPdfDocument } from "../src/components/infimas/reloj-publico/RelojInformeActividadesPdfDocument"
import { RelojOficioEntregaPdfDocument } from "../src/components/infimas/reloj-publico/RelojOficioEntregaPdfDocument"
import { RelojOficioNotificacionPdfDocument } from "../src/components/infimas/reloj-publico/RelojOficioNotificacionPdfDocument"
import {
  BUNDLES_RELOJ_PUBLICO,
  CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
  fechaCartaDocumento,
} from "../src/data/infimas/reloj-publico-portoviejo"
import type { RelojPublicoDocumento } from "../src/data/infimas/reloj-publico-types"

function archivoLocalDesdePublicUrl(archivoPdf: string): string {
  const rel = archivoPdf.replace(/^\/infimas\//, "")
  return path.join(process.cwd(), "public", "infimas", rel)
}

async function renderDocumento(
  doc: RelojPublicoDocumento,
  bundlePeriodo: (typeof BUNDLES_RELOJ_PUBLICO)[number]["periodo"]
) {
  const data = {
    contrato: CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
    periodo: bundlePeriodo,
    fechaCarta: fechaCartaDocumento(doc.tipo, bundlePeriodo),
  }

  const outPath = archivoLocalDesdePublicUrl(doc.archivoPdf)
  await mkdir(path.dirname(outPath), { recursive: true })

  switch (doc.tipo) {
    case "notificacion":
      await renderToFile(React.createElement(RelojOficioNotificacionPdfDocument, { data }), outPath)
      break
    case "entrega":
      await renderToFile(React.createElement(RelojOficioEntregaPdfDocument, { data }), outPath)
      break
    case "informe":
      await renderToFile(React.createElement(RelojInformeActividadesPdfDocument, { data }), outPath)
      break
  }

  console.log(`PDF generado: ${outPath}`)
}

export async function generateRelojPublicoPdfs() {
  for (const bundle of BUNDLES_RELOJ_PUBLICO) {
    for (const doc of bundle.documentos) {
      await renderDocumento(doc, bundle.periodo)
    }
  }
}

