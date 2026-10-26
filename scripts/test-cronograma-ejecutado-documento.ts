/**
 * npx tsx scripts/test-cronograma-ejecutado-documento.ts
 */
import assert from "node:assert/strict"

import {
  PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1,
  PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1,
  PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION,
} from "../src/data/contrato-emergencia-severino-trasvase"
import { AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT } from "../src/data/planilla/cronograma-ejecutado-documento"

assert.equal(AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT, 61.33)
assert.equal(PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1, 61.33)
assert.equal(PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1, 61.33)
assert.equal(PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION, 61.33)

console.log("test-cronograma-ejecutado-documento: OK")
