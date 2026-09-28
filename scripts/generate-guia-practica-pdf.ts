import { mkdir } from "node:fs/promises"
import path from "node:path"

import { renderToFile } from "@react-pdf/renderer"
import React from "react"

import { GuiaPracticaSeverinoPdfDocument } from "../src/components/sicc/GuiaPracticaSeverinoPdfDocument"

async function main() {
  const outDir = path.join(process.cwd(), "public", "sicc")
  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, "guia-practica-ensayos-severino.pdf")

  await renderToFile(
    React.createElement(GuiaPracticaSeverinoPdfDocument, {}),
    outPath
  )

  console.log(`PDF generado: ${outPath}`)
}

main().catch((error) => {
  console.error("Error al generar PDF guía práctica:", error)
  process.exit(1)
})
