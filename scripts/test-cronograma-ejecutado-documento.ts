/**
 * npx tsx scripts/test-cronograma-ejecutado-documento.ts
 */
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import path from "node:path"

import { PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1 } from "../src/data/contrato-emergencia-severino-trasvase"
import {
  AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT,
  CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH,
} from "../src/data/planilla/cronograma-ejecutado-documento"

assert.equal(AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT, 51.63)
assert.equal(PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1, 61.34)

const abs = path.join(process.cwd(), "public", CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH.replace(/^\//, ""))
assert.ok(existsSync(abs), `Falta PDF oficial: ${CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH}`)

console.log("test-cronograma-ejecutado-documento: OK")
