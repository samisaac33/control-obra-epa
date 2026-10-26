/**
 * Convierte el Excel programado a PDF (LibreOffice).
 * npx tsx scripts/export-cronograma-programado-pdf.ts
 */
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"

import {
  CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH,
  CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH,
} from "../src/data/planilla/cronograma-programado-documento"

const publicDir = path.join(process.cwd(), "public")
const xlsxRel = CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH.replace(/^\//, "")
const xlsxPath = path.join(publicDir, xlsxRel)

if (!existsSync(xlsxPath)) {
  console.error(`Falta Excel: ${xlsxPath}`)
  process.exit(1)
}

const outDir = path.dirname(xlsxPath)
execSync(`soffice --headless --convert-to pdf --outdir "${outDir}" "${xlsxPath}"`, {
  stdio: "inherit",
})

const generated = path.join(outDir, "cronograma-programado-5163.pdf")
const targetRel = CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH.replace(/^\//, "")
const target = path.join(publicDir, targetRel)

if (!existsSync(generated)) {
  console.error("LibreOffice no generó el PDF esperado.")
  process.exit(1)
}

if (generated !== target) {
  execSync(`cp "${generated}" "${target}"`)
}

console.log(`OK: ${target}`)
