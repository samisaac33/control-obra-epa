/**
 * npx tsx scripts/test-cronograma-ejecutado-formato.ts
 */
import assert from "node:assert/strict"

import {
  formatearCantidadCeldaCronogramaEpa,
  formatearUsdCeldaCronogramaEpa,
} from "../src/lib/planilla-cronograma-valorado-formato"

const ejecutado = "CRONOGRAMA EJECUTADO"
const programado = "CRONOGRAMA VALORADO PROGRAMADO"

assert.match(formatearCantidadCeldaCronogramaEpa(ejecutado, 1.2), /^1,20000$/)
assert.match(formatearUsdCeldaCronogramaEpa(ejecutado, 3.4), /^\$ 3,40000$/)
assert.match(formatearCantidadCeldaCronogramaEpa(programado, 1.2), /^1,20$/)
assert.match(formatearUsdCeldaCronogramaEpa(programado, 3.4), /^\$ 3,40$/)

console.log("test-cronograma-ejecutado-formato: OK")
