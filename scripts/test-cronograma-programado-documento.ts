/**
 * npx tsx scripts/test-cronograma-programado-documento.ts
 */
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import path from "node:path"

import { PORCENTAJE_CRONOGRAMA_PROGRAMADO_PLANILLA_1 } from "../src/data/contrato-emergencia-severino-trasvase"
import {
  AVANCE_PLANILLA_1_CRONOGRAMA_PROGRAMADO_PCT,
  CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH,
  CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH,
} from "../src/data/planilla/cronograma-programado-documento"

assert.equal(AVANCE_PLANILLA_1_CRONOGRAMA_PROGRAMADO_PCT, 51.63)
assert.equal(PORCENTAJE_CRONOGRAMA_PROGRAMADO_PLANILLA_1, 51.63)

for (const rel of [CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH, CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH]) {
  const abs = path.join(process.cwd(), "public", rel.replace(/^\//, ""))
  assert.ok(existsSync(abs), `Falta asset: ${rel}`)
}

console.log("test-cronograma-programado-documento: OK")
